# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
Main conftest.py with Appium 2 standalone server support
"""
import pytest
from pytest_bdd import when, given, then, parsers
import yaml
import pathlib
import sys
import logging
import atexit
import os
import subprocess
from pathlib import Path
from typing import List, Optional, Dict
# Configure logging early (before other imports that might use logger)
logging.basicConfig(level=logging.WARNING, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Appium imports
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.options.ios import XCUITestOptions

# Add utils to path
IMPORT_PATH = Path(".").absolute()
sys.path.append(str(IMPORT_PATH))

from utils.grid_manager import AppiumGridManager
from utils.page_helpers.base import PageHelperManager
from utils.debug_helper import DebugHelper
from utils.device_detector import MobileDeviceDetector
from utils.api_user_helper import ApiUserHelper
from utils.registered_user_resolver import (
    load_deployment_config,
    load_registered_users,
    resolve_registered_user_password,
)

try:
    from utils.pytest_report_plugin import PytestReportPlugin
    REPORT_PLUGIN_AVAILABLE = True
except ImportError:
    REPORT_PLUGIN_AVAILABLE = False
    logger.debug("Report plugin not available")


# Disable verbose logging for various components
logging.getLogger('pytest_html').setLevel(logging.ERROR)
logging.getLogger('py.warnings').setLevel(logging.ERROR)
logging.getLogger('urllib3').setLevel(logging.ERROR)
logging.getLogger('selenium').setLevel(logging.ERROR)
logging.getLogger('appium').setLevel(logging.ERROR)
logging.getLogger('utils.debug_helper').setLevel(logging.ERROR)
logging.getLogger('utils.grid_manager').setLevel(logging.ERROR)

# Only show critical errors and test results
logging.getLogger('conftest').setLevel(logging.ERROR)
logging.getLogger('test_login').setLevel(logging.ERROR)
logging.getLogger('test_signup').setLevel(logging.ERROR)

# Global instances
grid_manager: Optional[AppiumGridManager] = None
debug_helper: Optional[DebugHelper] = None


def _repo_root() -> Path:
    return Path(__file__).resolve().parent


def _deployment_config_path() -> Path:
    return _repo_root() / "config" / "deployment.yaml"


def _save_registered_users(config: dict, deployment: str, users: List[Dict[str, str]]) -> None:
    config.setdefault(deployment, {})
    config[deployment]["registered_users"] = users
    config_path = _deployment_config_path()
    with open(config_path, "w") as f:
        yaml.safe_dump(config, f, default_flow_style=False)
    logger.info("Saved %s registered users to %s", len(users), config_path)


def _load_deployment_config(deployment: str) -> dict:
    config = load_deployment_config(deployment)
    logger.info("Loaded deployment config for '%s' from %s", deployment, _deployment_config_path())
    return config


@pytest.fixture(scope="session")
def api_user_factory(pytestconfig):
    deployment = pytestconfig.getoption("--deployment")
    config = _load_deployment_config(deployment)
    env_config = config.get(deployment, {})
    base_uri = env_config.get("uri")
    password = env_config.get("password", "Welcome01")
    if not base_uri:
        raise ValueError(f"Missing 'uri' for deployment '{deployment}' in config/deployment.yaml")
    helper = ApiUserHelper(base_uri)
    users = load_registered_users(config, deployment)
    logger.info("Loaded %s registered users for '%s'", len(users), deployment)

    def create_users(count: int = 1, user_password: Optional[str] = None):
        nonlocal users, config
        config = _load_deployment_config(deployment)
        users = load_registered_users(config, deployment)
        logger.info("Creating %s registered user(s) via API for '%s'", count, deployment)
        for _ in range(count):
            created = helper.create_and_confirm_user(user_password or password)
            users.append(created)
        _save_registered_users(config, deployment, users)
        return users if count > 1 else users[-1]

    return create_users


@pytest.fixture(scope="session")
def registered_user_resolver(pytestconfig, api_user_factory):
    def resolve(user_token: str, password: Optional[str] = None) -> str:
        deployment = pytestconfig.getoption("--deployment")
        config = _load_deployment_config(deployment)
        if user_token.startswith("registered user"):
            parts = user_token.split()
            index = int(parts[-1]) if len(parts) > 2 and parts[-1].isdigit() else 1
            index = max(1, index)
            users = load_registered_users(config, deployment)
            logger.info(
                "Resolving %s for '%s': have %s registered user(s)",
                user_token,
                deployment,
                len(users),
            )
            if len(users) < index:
                missing = index - len(users)
                created = api_user_factory(count=missing, user_password=password)
                if isinstance(created, dict):
                    logger.info("Resolved %s via API creation", user_token)
                    return created["email"]
                users = created
                if len(users) < index:
                    users = load_registered_users(config, deployment)
            if len(users) < index:
                raise IndexError(
                    f"Registered users not available for '{user_token}' in deployment '{deployment}'"
                )
            logger.info("Resolved %s from deployment config", user_token)
            return users[index - 1]["email"]
        if user_token == "registered user":
            return resolve("registered user 1", password)
        return user_token
    return resolve


@pytest.fixture(scope="session")
def registered_user_password_resolver(pytestconfig):
    def resolve(user_token: str) -> str:
        deployment = pytestconfig.getoption("--deployment")
        return resolve_registered_user_password(user_token, deployment)
    return resolve


@when(parsers.parse('user login with "{email}" and "{password}"'))
@given(parsers.parse('user login with "{email}" and "{password}"'))
def login_with_credentials(
    helper,
    email,
    password,
    registered_user_resolver,
    registered_user_password_resolver,
):
    email = registered_user_resolver(email)
    resolved_password = registered_user_password_resolver(password)
    helper.login.perform_login(email, resolved_password)
    helper.login.last_login_email = email


@given("the app is launched")
def app_launched(helper):
    assert helper.driver is not None

@given("user should land on the home screen")
@then("user should land on the home screen")
def land_on_home_page(helper):
    assert helper.home.check_screen_displayed(), "Should be on home screen"

@given("user should be on login screen")
def given_login_screen(helper):
    """Ensure app is on login screen. If user is logged in (e.g. iOS persists session), logout first."""
    helper.login.ensure_login_screen()


@then("user should be on login screen")
def then_login_screen(helper):
    """Assert login screen is displayed"""
    assert helper.login.check_screen_displayed(timeout=7), "Login screen is not displayed"


def _get_model_index_based_port(model: str, base_port: int = 4444, port_increment: int = 1000) -> int:
    """Assign port based on model's index in mobiles.yaml configuration"""
    try:
        # Load mobiles configuration
        config_path = Path("config/mobiles.yaml")
        if not config_path.exists():
            logger.warning("mobiles.yaml not found, using default port")
            return base_port
            
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
            
        mobiles = config.get('mobiles', {})
        if not mobiles:
            logger.warning("No mobiles found in config, using default port")
            return base_port
            
        # Get ordered list of model names (preserves YAML order)
        model_names = list(mobiles.keys())
        
        # Find index of the requested model
        if model in model_names:
            model_index = model_names.index(model)
            assigned_port = base_port + (model_index * port_increment)
            logger.info(f"📋 Model '{model}' found at index {model_index} in mobiles.yaml")
            logger.info(f"🔧 Assigned port range starting from {assigned_port}")
            return assigned_port
        else:
            # Model not in config - assign based on hash to be consistent
            import hashlib
            hash_value = int(hashlib.md5(model.encode()).hexdigest()[:4], 16)
            model_index = len(model_names) + (hash_value % 10)  # Add to end with some spread
            assigned_port = base_port + (model_index * port_increment)
            logger.warning(f"⚠️  Model '{model}' not found in mobiles.yaml")
            logger.info(f"🔧 Auto-assigned index {model_index}, port range starting from {assigned_port}")
            return assigned_port
            
    except Exception as e:
        logger.error(f"Error reading mobiles.yaml: {e}")
        return base_port

def pytest_addoption(parser):
    """Add custom command line options"""
    parser.addoption("--model", action="store", help="Device model (e.g., SM-M315F) or comma-separated models")
    parser.addoption("--chip", action="store", help="ESP chip types (e.g., esp32,esp32s2)")
    parser.addoption("--base-port", action="store", default=4444, type=int, help="Base port for Appium servers")
    parser.addoption("--start-servers", action="store_true", default=True, help="Auto-start Appium servers")
    parser.addoption("--debug-dir", action="store", default="debug", help="Debug artifacts directory")
    parser.addoption("--enable-recording", action="store_true", default=True, help="Enable automatic screen recording")
    parser.addoption("--install-app", action="store", default="y", help="Install app before tests (y/n)")
    parser.addoption("--deployment", action="store", default="production", help="Deployment name in config/deployment.yaml")


def pytest_configure(config):
    """Configure pytest with Appium servers"""
    global grid_manager, debug_helper
    
    debug_dir = config.getoption("--debug-dir")
    debug_helper = DebugHelper(debug_dir)
    
    # Initialize report plugin if available
    if REPORT_PLUGIN_AVAILABLE:
        try:
            plugin = PytestReportPlugin()
            config.pluginmanager.register(plugin, "pytest_report_plugin")
            logger.info("Report plugin registered")
        except Exception as e:
            logger.warning(f"Failed to register report plugin: {e}")
    
    # Device detection and verification (always enabled)
    detector = MobileDeviceDetector()
    
    # Verify specified models are available (default behavior)
    models = config.getoption("--model")
    if models:
        model_list = [m.strip() for m in models.split(",")]
        for model in model_list:
            # Sync when model not in mobiles.yaml (e.g. newly connected Pixel, new device)
            mobiles_config = detector.load_config()
            if model not in mobiles_config:
                logger.info(f"Model '{model}' not in mobiles.yaml, syncing from connected devices...")
                detector.sync_configuration()
                mobiles_config = detector.load_config()
            
            if model not in mobiles_config:
                available_models = detector.list_available_models()
                if available_models:
                    logger.error(f"Model '{model}' not found. Available: {', '.join(available_models)}")
                else:
                    logger.error(f"Model '{model}' not found. No devices connected. Connect device and run again.")
                raise ValueError(f"Model '{model}' not in config. Run with a connected device to auto-sync.")
            
            available, device_info = detector.verify_model_available(model)
            if not available:
                logger.warning(f"Model '{model}' is in config but not currently connected")
            else:
                logger.info(f"Model '{model}' is available ({device_info.platform} {device_info.version})")
    
    if config.getoption("--start-servers"):
        base_port_from_cli = config.getoption("--base-port")
        
        if models and base_port_from_cli == 4444:
            first_model = models.split(",")[0].strip()
            auto_base_port = _get_model_index_based_port(first_model, base_port_from_cli)
            base_port = auto_base_port
        else:
            base_port = base_port_from_cli
            
        grid_manager = AppiumGridManager(base_port=base_port, debug_dir=debug_dir)
        
        # Start servers for specified models
        if models:
            model_list = [m.strip() for m in models.split(",")]
            for model in model_list:
                logger.info(f"Starting Appium server for {model}")
                grid_manager.start_server(model)
    
    # Register cleanup
    atexit.register(cleanup_servers)
    
    # Register custom markers
    config.addinivalue_line("markers", "multiple_devices: mark test to run on multiple devices")
    config.addinivalue_line("markers", "sanity: mark test as sanity test")
    config.addinivalue_line("markers", "smoke: mark test as smoke test")
    config.addinivalue_line("markers", "regression: mark test as regression test")
    config.addinivalue_line("markers", "login: mark test as login-related")
    config.addinivalue_line("markers", "ui: mark test as UI validation test")
    config.addinivalue_line("markers", "negative: mark test as negative test case")
    config.addinivalue_line("markers", "navigation: mark test as navigation test")
    config.addinivalue_line("markers", "bdd: mark test as BDD scenario test")

def pytest_unconfigure(config):
    """Cleanup when pytest exits"""
    cleanup_servers()

def cleanup_servers():
    """Clean up Appium servers"""
    global grid_manager
    if grid_manager:
        try:
            grid_manager.cleanup()
        except Exception:
            pass  # Suppress cleanup errors

@pytest.fixture(scope="session")
def appium_grid():
    """Provide grid manager instance"""
    global grid_manager
    if not grid_manager:
        grid_manager = AppiumGridManager()
    return grid_manager

def _uninstall_android_app(adb_path: str, udid: Optional[str], package: str, model: str) -> bool:
    """
    Uninstall Android app using ADB.
    
    Args:
        adb_path: Path to ADB executable
        udid: Device UDID (optional)
        package: App package name
        model: Device model name for logging
        
    Returns:
        True if app was uninstalled or not found, False on error
    """
    try:
        adb_cmd = [adb_path]
        if udid:
            adb_cmd.extend(["-s", udid])
        
        check_cmd = adb_cmd + ["shell", "pm", "list", "packages", package]
        result = subprocess.run(check_cmd, capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0 and package in result.stdout:
            logger.info(f"App {package} is installed on {model}, uninstalling...")
            uninstall_cmd = adb_cmd + ["uninstall", package]
            uninstall_result = subprocess.run(uninstall_cmd, capture_output=True, text=True, timeout=30)
            
            if uninstall_result.returncode == 0:
                logger.info(f"Successfully uninstalled {package} from {model}")
                return True
            else:
                logger.warning(f"Failed to uninstall {package}: {uninstall_result.stderr}")
                return False
        else:
            logger.info(f"App {package} is not installed on {model}")
            return True
            
    except subprocess.TimeoutExpired:
        logger.error(f"Uninstall timeout for {package} on {model}")
        return False
    except Exception as e:
        logger.error(f"Error uninstalling {package} from {model}: {e}")
        return False


def _install_android_app(adb_path: str, udid: Optional[str], apk_path: str, package: str, model: str) -> bool:
    """
    Install Android app using ADB.
    
    Args:
        adb_path: Path to ADB executable
        udid: Device UDID (optional)
        apk_path: Path to APK file
        package: App package name
        model: Device model name for logging
        
    Returns:
        True if installation successful, False otherwise
    """
    try:
        if not os.path.exists(apk_path):
            logger.error(f"APK file not found: {apk_path}")
            return False
        
        # Build ADB command
        adb_cmd = [adb_path]
        if udid:
            adb_cmd.extend(["-s", udid])
        
        # Install APK with replace flag
        logger.info(f"Installing {package} on {model} from {apk_path}")
        install_cmd = adb_cmd + ["install", "-r", apk_path]
        install_result = subprocess.run(install_cmd, capture_output=True, text=True, timeout=120)
        
        if install_result.returncode == 0:
            logger.info(f"Successfully installed {package} on {model}")
            return True
        else:
            logger.error(f"Failed to install {package}: {install_result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error(f"Install timeout for {package} on {model}")
        return False
    except Exception as e:
        logger.error(f"Error installing {package} on {model}: {e}")
        return False


def _uninstall_ios_app(udid: Optional[str], bundle_id: str, model: str) -> bool:
    """
    Uninstall iOS app using ideviceinstaller.
    
    Args:
        udid: Device UDID (optional)
        bundle_id: App bundle ID
        model: Device model name for logging
        
    Returns:
        True if app was uninstalled or not found, False on error
    """
    try:
        # Build ideviceinstaller command
        idevice_cmd = ["ideviceinstaller"]
        if udid:
            idevice_cmd.extend(["-u", udid])
        
        # Check if app is installed
        list_cmd = idevice_cmd + ["-l"]
        result = subprocess.run(list_cmd, capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0 and bundle_id in result.stdout:
            logger.info(f"App {bundle_id} is installed on {model}, uninstalling...")
            uninstall_cmd = idevice_cmd + ["-U", bundle_id]
            uninstall_result = subprocess.run(uninstall_cmd, capture_output=True, text=True, timeout=60)
            
            if uninstall_result.returncode == 0:
                logger.info(f"Successfully uninstalled {bundle_id} from {model}")
                return True
            else:
                logger.warning(f"Failed to uninstall {bundle_id}: {uninstall_result.stderr}")
                return False
        else:
            logger.info(f"App {bundle_id} is not installed on {model}")
            return True  # Not installed is considered success
            
    except FileNotFoundError:
        logger.error("ideviceinstaller not found. Install libimobiledevice: brew install libimobiledevice")
        return False
    except subprocess.TimeoutExpired:
        logger.error(f"Uninstall timeout for {bundle_id} on {model}")
        return False
    except Exception as e:
        logger.error(f"Error uninstalling {bundle_id} from {model}: {e}")
        return False


def _install_ios_app(udid: Optional[str], ipa_path: str, bundle_id: str, model: str) -> bool:
    """
    Install iOS app using ideviceinstaller.
    
    Args:
        udid: Device UDID (optional)
        ipa_path: Path to IPA file
        bundle_id: App bundle ID
        model: Device model name for logging
        
    Returns:
        True if installation successful, False otherwise
    """
    try:
        if not os.path.exists(ipa_path):
            logger.error(f"IPA file not found: {ipa_path}")
            return False
        
        # Build ideviceinstaller command
        idevice_cmd = ["ideviceinstaller"]
        if udid:
            idevice_cmd.extend(["-u", udid])
        
        # Install IPA
        logger.info(f"Installing {bundle_id} on {model} from {ipa_path}")
        install_cmd = idevice_cmd + ["-i", ipa_path]
        install_result = subprocess.run(install_cmd, capture_output=True, text=True, timeout=120)
        
        if install_result.returncode == 0:
            logger.info(f"Successfully installed {bundle_id} on {model}")
            return True
        else:
            logger.error(f"Failed to install {bundle_id}: {install_result.stderr}")
            return False
            
    except FileNotFoundError:
        logger.error("ideviceinstaller not found. Install libimobiledevice: brew install libimobiledevice")
        return False
    except subprocess.TimeoutExpired:
        logger.error(f"Install timeout for {bundle_id} on {model}")
        return False
    except Exception as e:
        logger.error(f"Error installing {bundle_id} on {model}: {e}")
        return False


@pytest.fixture(scope="session")
def app_installer(request):
    """
    Session-scoped fixture to install app once per test session.
    Installation is controlled via --install-app command line argument.
    Uses ADB directly for Android and ideviceinstaller for iOS (no Appium needed).
    """

    # Check if app installation is enabled via command line argument
    install_app = request.config.getoption("--install-app", "y")
    if install_app.lower() != "y":
        logger.info("App installation is disabled (use --install-app=y to enable)")
        yield
        return

    models = request.config.getoption("--model")
    if not models:
        yield
        return

    # Get the first model for this session
    model = models.split(",")[0].strip()
        
    # Load config to get app paths and device info
    config_path = Path("config")
    app_config_path = config_path / "app.yaml"
    mobiles_config_path = config_path / "mobiles.yaml"
    
    try:
        with open(app_config_path, 'r') as f:
            app_config = yaml.safe_load(f) or {}
        with open(mobiles_config_path, 'r') as f:
            mobiles_config = yaml.safe_load(f) or {}
    except Exception as e:
        logger.error(f"Failed to load config files: {e}")
        yield
        return
    
    rainmaker_home_config = app_config.get("rainmaker-home", {})
    device_config = mobiles_config.get("mobiles", {}).get(model, {})
    platform = device_config.get("platform", "Android").lower()
    udid = device_config.get("udid")
    repo_root = Path(__file__).resolve().parent
    
    try:
        if platform == "android":
            android_path = rainmaker_home_config.get("android_path")
            adb_path = rainmaker_home_config.get("adb_path") or (
                f"{android_path.rstrip('/')}/platform-tools/adb" if android_path else "adb"
            )
            apk_path = rainmaker_home_config.get("apk_path")
            package = rainmaker_home_config.get("package")
            if apk_path:
                apk_path = str((repo_root / apk_path).resolve()) if not os.path.isabs(apk_path) else apk_path
            
            # Uninstall first if exists, then install
            _uninstall_android_app(adb_path, udid, package, model)
            if not apk_path:
                pytest.fail("APK path not set in config/app.yaml")
            if not _install_android_app(adb_path, udid, apk_path, package, model):
                logger.error(f"Failed to install Android app on {model}")
                
        elif platform == "ios":
            ipa_path = rainmaker_home_config.get("ipa_path")
            bundle_id = rainmaker_home_config.get("bundle_id")
            if ipa_path:
                ipa_path = str(Path(ipa_path).expanduser().resolve())
            
            # Uninstall first if exists, then install
            _uninstall_ios_app(udid, bundle_id, model)
            if not ipa_path:
                pytest.fail("IPA path not set in config/app.yaml")
            if not _install_ios_app(udid, ipa_path, bundle_id, model):
                logger.error(f"Failed to install iOS app on {model}")
        else:
            logger.warning(f"Unsupported platform: {platform}")
            yield
            return
            
    except Exception as e:
        logger.error(f"Error during app installation for {model}: {e}")
    
    yield 

@pytest.fixture(scope="function")
def driver(request, appium_grid, app_installer):
    """Single driver fixture optimized for parallel execution"""
    
    models = request.config.getoption("--model")
    
    if not models:
        pytest.skip("No device model specified. Use --model option.")
    
    # Get the first model for this test session
    model = models.split(",")[0].strip()
    
    # Ensure server is running for this model
    if not appium_grid.start_server(model):
        pytest.skip(f"Failed to start Appium server for {model}")
    
    # Get the server URL for this model
    try:
        server_url = appium_grid.get_server_url(model)
    except ValueError as e:
        pytest.skip(f"No server URL for {model}: {e}")
    
    # Build capabilities and create appropriate options object
    capabilities = appium_grid.get_capabilities_for_model(model)
    platform = capabilities.get("platformName", "Android").lower()
    
    driver_instance = None
    try:
        # Create appropriate options object based on platform
        if platform == "android":
            options = UiAutomator2Options()
            for key, value in capabilities.items():
                if hasattr(options, key.replace('_', '')):  # Handle snake_case to camelCase
                    setattr(options, key.replace('_', ''), value)
                else:
                    options.set_capability(key, value)
        elif platform == "ios":
            options = XCUITestOptions()
            for key, value in capabilities.items():
                if hasattr(options, key.replace('_', '')):  # Handle snake_case to camelCase
                    setattr(options, key.replace('_', ''), value)
                else:
                    options.set_capability(key, value)
        else:
            pytest.skip(f"Unsupported platform: {platform}")
        
        driver_instance = webdriver.Remote(server_url, options=options)
        try:
            if platform == "android":
                driver_instance.update_settings({"waitForIdleTimeout": 200})
                logger.info("Android: waitForIdleTimeout=200")
            elif platform == "ios":
                driver_instance.update_settings({"animationCoolOffTimeout": 0})
                logger.info("iOS: animationCoolOffTimeout=0")
        except Exception as e:
            logger.warning(f"Failed to update driver settings: {e}")
        
        driver_instance._test_info = {
            "model": model,
            "platform": platform,
            "capabilities": capabilities,
            "server_url": server_url
        }
        
        yield driver_instance
        
    except Exception as e:
        pytest.skip(f"Failed to create driver for {model}: {e}")
    
    finally:
        # Cleanup driver
        if driver_instance:
            try:
                driver_instance.quit()
            except Exception:
                pass  # Ignore cleanup errors

def _expected_app_version_display() -> str:
    """Expected app version string as shown in UI (e.g. 'Version 3.5.0'). Loads .env"""
    repo = _repo_root()
    env_path = repo.parent / ".env"
    
    if env_path.exists():
        try:
            with open(env_path) as f:
                for line in f:
                    if line.strip().startswith("APP_VERSION="):
                        v = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if v:
                            return f"Version {v}"
        except Exception:
            logger.warning(f"Error loading .env file: {e}")
    return "Version N/A"


@pytest.fixture(scope="session")
def expected_app_version():
    """Expected app version string for UI validation (perfect match)."""
    return _expected_app_version_display()


@pytest.fixture(scope="function")
def helper(driver):
    """Page helper manager fixture providing access to all page helpers"""
    if not driver:
        pytest.skip("No driver available")
    return PageHelperManager(driver)

# Autouse fixtures for automatic screen recording
@pytest.fixture(autouse=True)
def auto_screen_recording(request, driver):
    """Automatically start screen recording for each test"""
    global debug_helper
    
    # Skip if no driver or recording disabled
    if not driver or not debug_helper or not request.config.getoption("--enable-recording"):
        yield
        return
    
    test_name = request.node.name
    model = driver._test_info.get('model', 'unknown')
    
    # Start recording
    recording_id = debug_helper.start_screen_recording(driver, test_name)
    
    # Store recording info for cleanup
    if recording_id:
        setattr(request.node, '_recording_id', recording_id)
        logger.info(f"Started automatic recording for {test_name} on {model}")
    
    yield  # Test runs here

@pytest.fixture(scope="function")
def esp_device_config(request):
    """Provide ESP device configuration based on model and chip"""
    models = request.config.getoption("--model")
    chip = request.config.getoption("--chip")
    
    if not models or not chip:
        return {}
    
    model = models.split(",")[0].strip()
    
    if not grid_manager:
        return {}
        
    esp_config = grid_manager.esp_devices_config
    
    if model in esp_config:
        device_esp_config = esp_config[model]
        chips = [c.strip() for c in chip.split(",")]
        
        result = {}
        for chip_type in chips:
            if chip_type in device_esp_config:
                result[chip_type] = device_esp_config[chip_type]
        
        return result
    
    return {}

@pytest.fixture(scope="function")
def config(request):
    """Provide test configuration data from YAML files"""
    import yaml
    from pathlib import Path
    
    # Get the test function name
    test_name = request.node.name
    
    # Try to find corresponding YAML file in the same directory as the test
    test_file_path = Path(request.fspath)
    test_dir = test_file_path.parent
    
    # Look for test_data.yaml in the test directory
    yaml_file = test_dir / "test_data.yaml"
    
    if yaml_file.exists():
        try:
            with open(yaml_file, 'r') as f:
                data = yaml.safe_load(f)
            
            # Return data for the specific test if it exists
            if test_name in data:
                return data[test_name]
            
            # Return the entire data if no specific test data found
            return data
        except Exception as e:
            logger.warning(f"Error loading test data from {yaml_file}: {e}")
            return {}
    
    # Return empty dict if no YAML file found
    logger.warning(f"No test_data.yaml found in {test_dir}")
    return {}

# Test execution hooks with automatic debug capabilities
@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Generate test report with automatic debug artifacts on failure"""
    global debug_helper
    
    outcome = yield
    report = outcome.get_result()
    
    # Handle test failure - automatically capture debug artifacts
    if call.when == "call" and report.outcome == "failed" and debug_helper:
        if hasattr(item, 'funcargs'):
            # Single driver tests
            if 'driver' in item.funcargs and item.funcargs['driver']:
                driver = item.funcargs['driver']
                test_name = item.name
                recording_id = getattr(item, '_recording_id', None)
                
                # Get run_id and artifact_host from report plugin if available
                run_id = None
                artifact_host = None
                if REPORT_PLUGIN_AVAILABLE:
                    try:
                        plugin = item.config.pluginmanager.get_plugin("pytest_report_plugin")
                        if plugin:
                            if hasattr(plugin, 'run_id'):
                                run_id = plugin.run_id
                            if hasattr(plugin, 'artifact_host') and plugin.artifact_host:
                                artifact_host = plugin.artifact_host
                                # Update debug_helper's artifact_host to use the plugin's instance
                                if debug_helper and hasattr(debug_helper, '_artifact_host'):
                                    debug_helper._artifact_host = artifact_host
                                    debug_helper.use_artifact_host = True
                    except Exception as e:
                        logger.warning(f"Error getting run_id / artifact_host from pytest_report_plugin: {e}")
                
                artifacts = debug_helper.capture_all_artifacts(driver, test_name, recording_id, run_id)
                
                # Add artifacts to report for HTML display
                if artifacts.get('screenshot_b64'):
                    report.screenshot_b64 = artifacts['screenshot_b64']
                
                if artifacts.get('video'):
                    report.video_path = artifacts['video']
                
                if artifacts:
                    report.debug_artifacts = artifacts
                    logger.info(f"Debug artifacts captured for {test_name}: {list(artifacts.keys())}")
                
                if hasattr(report, 'sections'):
                    # Store sections for later extraction
                    report._test_sections = report.sections
    
    # Store device info for HTML report
    if hasattr(item, 'funcargs'):
        if 'driver' in item.funcargs and item.funcargs['driver']:
            driver = item.funcargs['driver']
            report._device_info = driver._test_info


@pytest.hookimpl(optionalhook=True)
def pytest_html_results_table_header(cells):
    """Add custom columns to HTML report"""
    cells.insert(2, '<th class="sortable" data-column-type="text">Device</th>')
    cells.insert(3, '<th class="sortable" data-column-type="text">Platform</th>')
    cells.append('<th class="sortable" data-column-type="text">Screenshot</th>')
    cells.append('<th class="sortable" data-column-type="text">Video</th>')

@pytest.hookimpl(optionalhook=True)
def pytest_html_results_table_row(report, cells):
    """Add custom data to HTML report rows"""
    device_info = getattr(report, '_device_info', {'model': 'N/A', 'platform': 'N/A'})
    cells.insert(2, f'<td>{device_info.get("model", "N/A")}</td>')
    cells.insert(3, f'<td>{device_info.get("platform", "N/A")}</td>')
    
    # Add screenshot
    if hasattr(report, 'screenshot_b64'):
        screenshot_html = f'<img src="data:image/png;base64,{report.screenshot_b64}" alt="screenshot" style="width:200px;height:auto;" onclick="window.open(this.src)">'
        cells.append(f'<td>{screenshot_html}</td>')
    else:
        cells.append('<td>N/A</td>')
    
    # Add video link
    if hasattr(report, 'video_path'):
        video_name = os.path.basename(report.video_path)
        video_html = f'<a href="{report.video_path}" target="_blank">{video_name}</a>'
        cells.append(f'<td>{video_html}</td>')
    else:
        cells.append('<td>N/A</td>') 

# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

import time
import logging
from pathlib import Path
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from utils.locator_loader import LocatorLoader

logger = logging.getLogger(__name__)

class BasePage:
    def __init__(self, driver, page_helper_manager=None, default_timeout=5):
        self.driver = driver
        self.default_timeout = default_timeout
        self.page_helper_manager = page_helper_manager
        
        # Determine platform from capabilities
        caps = driver.capabilities
        self.platform = caps.get('platformName', 'Android').lower()
        
        # Initialize locator loader
        self.locator_loader = LocatorLoader()
        
        # Auto-generate page name from class name
        import re
        class_name = self.__class__.__name__
        # Insert underscore before uppercase letters that follow lowercase letters
        snake_case = re.sub(r'(?<!^)(?=[A-Z])', '_', class_name).lower()
        self.page_name = snake_case

    @staticmethod
    def get_locator(locator_type):
        """Convert string locator type to Appium/Selenium locator constant"""
        locator_map = {
            "id": AppiumBy.ID,
            "xpath": AppiumBy.XPATH,
            "accessibility_id": AppiumBy.ACCESSIBILITY_ID,
            "class_name": AppiumBy.CLASS_NAME,
            "name": AppiumBy.NAME,
            "tag_name": AppiumBy.TAG_NAME,
            "link_text": AppiumBy.LINK_TEXT,
            "partial_link_text": AppiumBy.PARTIAL_LINK_TEXT,
            "css_selector": AppiumBy.CSS_SELECTOR,
            "android_uiautomator": AppiumBy.ANDROID_UIAUTOMATOR,
            "ios_predicate": AppiumBy.IOS_PREDICATE,
            "ios_class_chain": AppiumBy.IOS_CLASS_CHAIN,
            "css": By.CSS_SELECTOR,
            "tag": By.TAG_NAME
        }
        
        locator_key = str(locator_type).lower().strip()
        locator = locator_map.get(locator_key)
        
        if locator is None:
            raise ValueError(f"Unsupported locator type: '{locator_type}'. "
                           f"Supported types: {list(locator_map.keys())}")
        
        return locator
    
    def get_element_locator(self, locator_name: str):
        """Get locator from JSON file and parse it"""
        locator_data = self.locator_loader.get_locator(self.page_name, locator_name)
        
        if not locator_data:
            raise ValueError(f"Locator '{locator_name}' not found in {self.page_name} page")
        
        locator_type = locator_data.get("by")
        locator_value = locator_data.get("value")
        
        if not locator_type or not locator_value:
            raise ValueError(f"Invalid locator structure for '{locator_name}'. Expected 'by' and 'value' keys.")
        
        return self.get_locator(locator_type), locator_value

    def find_clickable(self, locator_name_or_type, value=None, timeout=None, poll=0.5):
        """Find clickable element"""
        timeout = timeout or self.default_timeout
        
        if value is None:
            # Using JSON locator name
            by, locator_value = self.get_element_locator(locator_name_or_type)
        else:
            # Traditional usage with locator type
            by = self.get_locator(locator_name_or_type)
            locator_value = value
        
        try:
            return WebDriverWait(self.driver, timeout, poll_frequency=poll).until(
                EC.element_to_be_clickable((by, locator_value))
            )
        except TimeoutException:
            raise NoSuchElementException(f"Clickable element not found: {by}='{locator_value}' within {timeout}s")

    def click(self, locator_name_or_type, value=None, timeout=None, poll=0.5):
        """Click element with wait"""
        element = self.find_clickable(locator_name_or_type, value, timeout, poll=poll)
        element.click()
        return element

    def send_keys(self, locator_name_or_type, value_or_text, text=None, clear_first=False, timeout=None, poll=0.5):
        """Send keys to element"""
        if text is None:
            # Using JSON locator name
            element = self.find_clickable(locator_name_or_type, None, timeout, poll=poll)
            text = value_or_text
        else:
            # Traditional usage
            element = self.find_clickable(locator_name_or_type, value_or_text, timeout, poll=poll)
        
        if clear_first:
            element.clear()
        element.send_keys(text)
        return element


    def clear(self, locator_name_or_type, value=None, timeout=None, poll=0.5):
        """Clear element text"""
        element = self.find_visible(locator_name_or_type, value=value, timeout=timeout or self.default_timeout, poll=poll)
        if not element:
            raise NoSuchElementException(f"Visible element not found for clear: {locator_name_or_type}")
        element.clear()
        return element

    def is_enabled(self, locator_name_or_type, value=None, timeout=None, poll=0.5):
        """Check if element is enabled"""
        try:
            element = self.find_visible(locator_name_or_type, value=value, timeout=timeout or self.default_timeout, poll=poll)
            return element.is_enabled() if element else False
        except Exception:
            return False

    def find_visible(self, locator_name_or_type, value=None, timeout=2, poll=0.5):
        """Return visible element or None (quick check)"""
        try:
            if value is None:
                by, locator_value = self.get_element_locator(locator_name_or_type)
            else:
                by = self.get_locator(locator_name_or_type)
                locator_value = value

            return WebDriverWait(self.driver, timeout, poll_frequency=poll).until(
                EC.visibility_of_element_located((by, locator_value))
            )
        except TimeoutException:
            return None

    def is_visible(self, locator_name_or_type, value=None, timeout=2, poll=0.5):
        """Check if element is visible (quick check)"""
        return self.find_visible(locator_name_or_type, value=value, timeout=timeout, poll=poll) is not None

    def get_text(self, locator_name_or_type=None, value=None, timeout=None, poll=0.25, element=None):
        """Get element text"""
        if element is not None:
            return element.text
        element = self.find_visible(locator_name_or_type, value=value, timeout=timeout or self.default_timeout, poll=poll)
        if not element:
            raise NoSuchElementException(f"Visible element not found for get_text: {locator_name_or_type}")
        return element.text

    def get_error_message(self):
        """Get error message displayed on screen"""
        element = self.find_visible("error_message", timeout=2)
        if element:
            return element.text
        return None

    def wait_for_element_to_disappear(self, locator_name_or_type, value=None, timeout=None, poll=0.5):
        """Wait for element to disappear"""
        timeout = timeout or self.default_timeout
        
        if value is None:
            by, locator_value = self.get_element_locator(locator_name_or_type)
        else:
            by = self.get_locator(locator_name_or_type)
            locator_value = value
        
        try:
            WebDriverWait(self.driver, timeout, poll_frequency=poll).until_not(
                EC.presence_of_element_located((by, locator_value))
            )
            return True
        except TimeoutException:
            return False

    def wait_and_click(self, locator_name_or_type, value=None, timeout=None, poll=0.5):
        """Wait for element and click with retry logic"""
        timeout = timeout or self.default_timeout
        
        for attempt in range(3):
            try:
                element = self.find_clickable(locator_name_or_type, value, timeout, poll=poll)
                element.click()
                return element
            except Exception as e:
                if attempt == 2:  # Last attempt
                    raise e
                time.sleep(1)

    # Helper methods to access other pages through page_helper_manager
    def get_other_page_helper(self, page_name: str):
        """
        Get another page helper instance
        Usage: self.get_other_page_helper('consent') -> returns Consent page instance
        """
        if not self.page_helper_manager:
            raise ValueError("No page_helper_manager available. Cannot access other page helpers.")
        
        return getattr(self.page_helper_manager, page_name)
    
    def use_locator_from_other_page(self, page_name: str, locator_name: str):
        """
        Get locator from another page's JSON file
        Usage: self.use_locator_from_other_page('consent', 'proceed_button')
        """
        locator_data = self.locator_loader.get_locator(page_name, locator_name)
        if not locator_data:
            raise ValueError(f"Locator '{locator_name}' not found in {page_name} page")
        
        locator_type = locator_data.get("by")
        locator_value = locator_data.get("value")
        
        if not locator_type or not locator_value:
            raise ValueError(f"Invalid locator structure for '{locator_name}' in {page_name}. Expected 'by' and 'value' keys.")
        
        return self.get_locator(locator_type), locator_value
    
    def get_locator_text(self, locator_name: str) -> str:
        """Get expected text for a locator from JSON file"""
        locator_data = self.locator_loader.get_locator(self.page_name, locator_name)
        
        if not locator_data:
            raise ValueError(f"Locator '{locator_name}' not found in {self.page_name} page")
        
        return locator_data.get("text", f"Text for {locator_name}")
    
    def check_screen_displayed(self, timeout=10, poll=0.25):
        """
        Generic screen detection method that checks for title element with expected text
        
        This method can be overridden by specific page helpers for custom logic.
        By default, it looks for a 'title' element and compares its text
        with the expected text from the JSON locator file.
        """
        try:
            expected_text = self.get_locator_text("title")
            by, locator_value = self.get_element_locator("title")
            last_seen_text = None
            def _title_matches(driver):
                nonlocal last_seen_text
                try:
                    element = driver.find_element(by, locator_value)
                    if not element.is_displayed():
                        return False
                    last_seen_text = element.text
                    return last_seen_text == expected_text
                except Exception:
                    return False

            WebDriverWait(self.driver, timeout, poll_frequency=poll).until(_title_matches)
            logger.info(f"Screen detected: {self.page_name} - '{expected_text}'")
            return True
        except TimeoutException:
            if last_seen_text is None:
                logger.warning(f"Screen detection timeout after {timeout}s - Expected: '{expected_text}'")
            else:
                logger.warning(
                    "Screen detection timeout after %ss - Expected: '%s', Last seen: '%s'",
                    timeout,
                    expected_text,
                    last_seen_text,
                )
            return False
        except Exception as e:
            logger.warning(f"Screen detection failed: {e}")
            return False
    
    def hide_keyboard_if_visible(self):
        """Hide keyboard if visible (useful for iOS and Android)"""
        try:
            platform = getattr(self.driver, '_test_info', {}).get('platform', 'android')
            
            if platform.lower() == 'ios':
                # iOS: hide_keyboard is unreliable; try multiple strategies
                for key in ["Return", "Done", "Go"]:
                    try:
                        self.driver.hide_keyboard(strategy="pressKey", key=key)
                        logger.info(f"iOS keyboard hidden via pressKey" + (f" key={key}" if key else ""))
                        return True
                    except Exception:
                        continue
                # Fallback: tap in content area (upper quarter, below status bar)
                try:
                    size = self.driver.get_window_size()
                    x, y = size["width"] // 2, int(size["height"] * 0.25)
                    self.driver.tap([(x, y)])
                    logger.info("iOS keyboard hidden via tap in content area")
                except Exception:
                    logger.warning("iOS keyboard hide failed with all strategies")
                
            elif platform.lower() == 'android':
                # Android keyboard hiding methods
                try:
                    # Method 1: Hide keyboard using Appium method
                    self.driver.hide_keyboard()
                    logger.info("Android keyboard hidden via hide_keyboard")
                except Exception:
                    try:
                        # Method 2: Press back button to dismiss keyboard
                        self.driver.press_keycode(4)  # Back button
                        logger.info("Android keyboard hidden via back button")
                    except Exception:
                        logger.warning("Android keyboard hide failed with hide_keyboard and back button")
            
            return True
        except Exception as e:
            logger.warning(f"Failed to hide keyboard: {e}")
            return False
    
    def get_toast_title_and_message(self, timeout=2, poll=0.25, require_message=True):
        """Read toast title and message using standard testIDs (toast_title, toast_message)."""
        title = None
        message = None
        by = AppiumBy.ID
        title_locator = "toast_title"
        message_locator = "toast_message"

        def _read_toast(driver):
            nonlocal title, message
            try:
                title_element = driver.find_element(by, title_locator)
                title = title_element.text
                message = None
                try:
                    message_element = driver.find_element(by, message_locator)
                    message = message_element.text
                except Exception:
                    message = None
                return message is not None if require_message else True
            except Exception:
                return False

        try:
            WebDriverWait(self.driver, timeout, poll_frequency=poll).until(_read_toast)
        except TimeoutException:
            logger.warning("Toast element not found")
            return None, None
        return title, message


class PageHelperManager:
    """
    Manages page helper instances and their dependencies
    
    - Example: page.provisioning -> looks for utils.page_helpers.provisioning.Provisioning class
    """
    
    def __init__(self, driver):
        self.driver = driver
        self._page_helpers = {}
        
    def get_page_helper(self, page_class):
        """Get or create page helper instance"""
        page_name = page_class.__name__
        
        if page_name not in self._page_helpers:
            self._page_helpers[page_name] = page_class(self.driver, page_helper_manager=self)
        
        return self._page_helpers[page_name]
    
    def __getattr__(self, name):
        """
        Dynamic page helper access - converts page name to class and returns instance
        
        How it works:
        1. page.provisioning -> name = 'provisioning'
        2. Converts to class name: 'Provisioning'
        3. Imports utils.page_helpers.provisioning.Provisioning
        4. Returns cached instance or creates new one
        """
        # Convert snake_case to PascalCase for class names
        class_name = ''.join(word.capitalize() for word in name.split('_'))
        
        # Try to import the page class dynamically
        try:
            module = __import__(f'utils.page_helpers.{name}', fromlist=[class_name])
            page_class = getattr(module, class_name)
            return self.get_page_helper(page_class)
        except (ImportError, AttributeError):
            raise AttributeError(f"Page helper '{name}' not found. Make sure utils/page_helpers/{name}.py exists with class {class_name}")

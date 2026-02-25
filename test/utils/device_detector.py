# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
Mobile Device Detection and Configuration Management

Detects connected devices (Android via adb getprop, iOS via ideviceinfo) and manages
config/mobiles.yaml. Supports Samsung, Pixel, and other Android OEMs. When devices are
reconnected or OS is updated, version/udid/platform_version are updated in the config.
"""

import subprocess
import yaml
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class DeviceInfo:
    """Device information container"""
    model: str
    udid: str
    platform: str
    version: str = "Unknown"
    brand: str = "Unknown"
    device_name: str = ""
    platform_version: str = ""
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for YAML serialization"""
        result = {
            'model': self.model,
            'platform': self.platform,
            'udid': self.udid
        }
        
        if self.platform.lower() == 'android':
            result.update({
                'brand': self.brand,
                'version': self.version
            })
        elif self.platform.lower() == 'ios':
            result.update({
                'device_name': self.device_name or self.model,
                'platform_version': self.platform_version or self.version
            })
            
        return result

class MobileDeviceDetector:
    """Detects connected mobile devices and manages configuration"""
    
    def __init__(self, config_path: str = "config/mobiles.yaml"):
        self.config_path = Path(config_path)
        self.ensure_config_dir()
        
    def ensure_config_dir(self):
        """Ensure config directory exists"""
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        
    def detect_android_devices(self) -> List[DeviceInfo]:
        """Detect Android devices using ADB"""
        devices = []
        
        try:
            # Get list of connected devices
            result = subprocess.run(['adb', 'devices'], 
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode != 0:
                logger.warning("ADB not available or no devices connected")
                return devices
                
            # Parse device list
            lines = result.stdout.strip().split('\n')[1:]  # Skip header
            for line in lines:
                if '\tdevice' in line:
                    udid = line.split('\t')[0]
                    device_info = self._get_android_device_info(udid)
                    if device_info:
                        devices.append(device_info)
                        
        except subprocess.TimeoutExpired:
            logger.error("ADB command timed out")
        except FileNotFoundError:
            logger.warning("ADB not found in PATH")
        except Exception as e:
            logger.error(f"Error detecting Android devices: {e}")
            
        return devices
    
    def _get_android_device_info(self, udid: str) -> Optional[DeviceInfo]:
        """Get detailed info for Android device"""
        try:
            # Get device properties
            props = {}
            prop_commands = {
                'model': 'ro.product.model',
                'brand': 'ro.product.brand', 
                'version': 'ro.build.version.release'
            }
            
            for key, prop in prop_commands.items():
                result = subprocess.run(
                    ['adb', '-s', udid, 'shell', 'getprop', prop],
                    capture_output=True, text=True, timeout=5
                )
                if result.returncode == 0:
                    props[key] = result.stdout.strip()
                    
            # Create device info
            if 'model' in props:
                return DeviceInfo(
                    model=props.get('model', 'Unknown'),
                    udid=udid,
                    platform='Android',
                    version=props.get('version', 'Unknown'),
                    brand=props.get('brand', 'Unknown').lower()
                )
                
        except Exception as e:
            logger.error(f"Error getting Android device info for {udid}: {e}")
            
        return None
    
    def detect_ios_devices(self) -> List[DeviceInfo]:
        """Detect iOS devices using idevice_id and ideviceinfo"""
        devices = []
        
        try:
            # Use idevice_id to list connected iOS devices
            result = subprocess.run(
                ['idevice_id', '-l'],
                capture_output=True, text=True, timeout=10
            )
            
            if result.returncode == 0:
                udids = result.stdout.strip().split('\n')
                for udid in udids:
                    if udid.strip():
                        device_info = self._get_ios_device_info(udid.strip())
                        if device_info:
                            devices.append(device_info)
                            
        except subprocess.TimeoutExpired:
            logger.error("iOS detection command timed out")
        except FileNotFoundError:
            logger.warning("idevice_id not found - install libimobiledevice for iOS support")
        except Exception as e:
            logger.error(f"Error detecting iOS devices: {e}")
            
        return devices
    
    def _get_ios_device_info(self, udid: str) -> Optional[DeviceInfo]:
        """Get detailed info for iOS device using ideviceinfo"""
        try:
            # Get DeviceName
            result_name = subprocess.run(
                ['ideviceinfo', '-u', udid, '-k', 'DeviceName'],
                capture_output=True, text=True, timeout=10
            )
            device_name = result_name.stdout.strip() if result_name.returncode == 0 else "Unknown iOS Device"
            
            # Get ProductVersion
            result_version = subprocess.run(
                ['ideviceinfo', '-u', udid, '-k', 'ProductVersion'],
                capture_output=True, text=True, timeout=10
            )
            version = result_version.stdout.strip() if result_version.returncode == 0 else "Unknown"

            if result_name.returncode == 0 or result_version.returncode == 0:
                return DeviceInfo(
                    model=device_name,
                    udid=udid,
                    platform='iOS',
                    version=version,
                    device_name=device_name,
                    platform_version=version
                )
            else:
                # Fallback: try simpler approach
                result = subprocess.run(
                    ['ideviceinfo', '-u', udid, '-s'],
                    capture_output=True, text=True, timeout=5
                )
                if result.returncode == 0:
                    # Parse key-value pairs
                    info = {}
                    for line in result.stdout.split('\n'):
                        if ':' in line:
                            key, value = line.split(':', 1)
                            info[key.strip()] = value.strip()
                    
                    device_name = info.get('DeviceName', info.get('ProductType', 'Unknown iOS Device'))
                    version = info.get('ProductVersion', 'Unknown')
                    
                    return DeviceInfo(
                        model=device_name,
                        udid=udid,
                        platform='iOS',
                        version=version,
                        device_name=device_name,
                        platform_version=version
                    )
                    
        except Exception as e:
            logger.error(f"Error getting iOS device info for {udid}: {e}")
            
        return None
    
    def detect_all_devices(self) -> List[DeviceInfo]:
        """Detect all connected devices (Android + iOS)"""
        all_devices = []
        all_devices.extend(self.detect_android_devices())
        all_devices.extend(self.detect_ios_devices())
        
        logger.info(f"Detected {len(all_devices)} connected devices")
        return all_devices
    
    def load_config(self) -> Dict:
        """Load existing mobiles.yaml configuration"""
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r') as f:
                    config = yaml.safe_load(f) or {}
                    return config.get('mobiles', {})
            except Exception as e:
                logger.error(f"Error loading config: {e}")
        return {}
    
    def save_config(self, config: Dict):
        """Save configuration to mobiles.yaml"""
        try:
            with open(self.config_path, 'w') as f:
                yaml.dump({'mobiles': config}, f, default_flow_style=False, indent=2)
            logger.info(f"Configuration saved to {self.config_path}")
        except Exception as e:
            logger.error(f"Error saving config: {e}")
    
    def update_config_with_devices(self, devices: List[DeviceInfo]) -> Dict:
        """Update configuration with detected devices"""
        config = self.load_config()
        updated = False
        
        for device in devices:
            if device.model not in config:
                # Add new device
                config[device.model] = device.to_dict()
                updated = True
                logger.info(f"Added new device: {device.model} ({device.platform})")
            else:
                # Update existing device if needed
                existing = config[device.model]
                new_config = device.to_dict()
                
                # Check if update is needed
                if existing != new_config:
                    config[device.model] = new_config
                    updated = True
                    logger.info(f"Updated device config: {device.model}")
        
        if updated:
            self.save_config(config)
        
        return config
    
    def verify_model_available(self, model: str) -> Tuple[bool, Optional[DeviceInfo]]:
        """Verify if specified model is available and return its info"""
        devices = self.detect_all_devices()
        
        for device in devices:
            if device.model == model:
                return True, device
        
        return False, None
    
    def get_model_config(self, model: str) -> Optional[Dict]:
        """Get configuration for specific model"""
        config = self.load_config()
        return config.get(model)
    
    def list_available_models(self) -> List[str]:
        """List all available device models"""
        devices = self.detect_all_devices()
        return [device.model for device in devices]
    
    def sync_configuration(self) -> Dict:
        """Synchronize configuration with connected devices"""
        logger.info("Synchronizing device configuration...")
        devices = self.detect_all_devices()
        config = self.update_config_with_devices(devices)
        
        # Log summary
        logger.info("=== Device Detection Summary ===")
        for device in devices:
            logger.info(f"Found device: {device.model} ({device.platform} {device.version}) - {device.udid}")
        
        return config

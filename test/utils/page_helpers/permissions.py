# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
OS Permission Handler for Android/iOS Multi-Brand Support
Handles various system permissions across different OS versions and manufacturers
"""
import time
import logging
from .base import BasePage
from selenium.common.exceptions import TimeoutException, NoSuchElementException

logger = logging.getLogger(__name__)

class Permissions(BasePage):
    """
    Unified permission handler for Android and iOS across multiple brands and OS versions
    
    Supported permissions:
    - Camera
    - Location/GPS
    - Bluetooth
    - Microphone
    - Contacts
    - Storage/Files
    - Phone
    - SMS
    - Notifications
    - Nearby devices (Android 12+)
    - Background app refresh (iOS)
    """
    
    def __init__(self, driver, page_helper_manager=None):
        super().__init__(driver, page_helper_manager)
        
        # Get device info
        caps = driver.capabilities
        self.device_model = caps.get('deviceName', 'Unknown')
        self.os_version = caps.get('platformVersion', 'Unknown')
        self.manufacturer = self._detect_manufacturer()
        
        logger.info(f"Permission handler initialized for {self.platform} {self.os_version} - {self.manufacturer} {self.device_model}")
    
    def _click_by_key(self, locator_key: str, timeout: int = 2) -> bool:
        """Click using a locator key from locators/<platform>/permissions.json"""
        try:
            self.click(locator_key, None, timeout)
            return True
        except Exception:
            return False

    def _visible_by_key(self, locator_key: str, timeout: int = 2) -> bool:
        """Check visibility using a locator key from locators/<platform>/permissions.json"""
        try:
            return self.find_visible(locator_key, None, timeout) is not None
        except Exception:
            return False
    
    def _detect_manufacturer(self):
        """Detect device manufacturer from model or capabilities"""
        model = self.device_model.lower()
        
        android_brands = {
            'samsung': ['sm-', 'galaxy', 'samsung'],
            'xiaomi': ['mi ', 'redmi', 'poco'],
            'huawei': ['huawei', 'honor', 'mate', 'p30', 'p40'],
            'oppo': ['oppo', 'cph', 'realme'],
            'vivo': ['vivo', 'v20', 'y20'],
            'oneplus': ['oneplus', 'op', 'nord'],
            'google': ['pixel', 'nexus'],
            'motorola': ['moto', 'motorola'],
            'nokia': ['nokia', 'ta-']
        }
        
        if self.platform == 'ios':
            return 'apple'
        
        for brand, identifiers in android_brands.items():
            if any(identifier in model for identifier in identifiers):
                return brand
        
        return 'generic'
    
    def handle_camera_permission(self, action='allow', timeout=5):
        """Handle camera permission dialog"""
        return self._handle_permission('camera', action, timeout)
    
    def handle_location_permission(self, action='allow', precision='precise', timeout=5):
        """
        Handle location permission dialog
        
        Args:
            action: 'allow', 'deny', 'while_using', 'always'
            precision: 'precise', 'approximate' (iOS 14+)
        """
        return self._handle_permission('location', action, timeout, precision=precision)
    
    def handle_bluetooth_permission(self, action='allow', timeout=5):
        """Handle Bluetooth permission dialog"""
        return self._handle_permission('bluetooth', action, timeout)
    
    def handle_microphone_permission(self, action='allow', timeout=5):
        """Handle microphone permission dialog"""
        return self._handle_permission('microphone', action, timeout)
    
    def handle_contacts_permission(self, action='allow', timeout=5):
        """Handle contacts permission dialog"""
        return self._handle_permission('contacts', action, timeout)
    
    def handle_storage_permission(self, action='allow', timeout=5):
        """Handle storage/files permission dialog"""
        return self._handle_permission('storage', action, timeout)
    
    def handle_notification_permission(self, action='allow', timeout=5):
        """Handle notification permission dialog"""
        return self._handle_permission('notification', action, timeout)
    
    def handle_nearby_devices_permission(self, action='allow', timeout=5):
        """Handle nearby devices permission (Android 12+)"""
        if self.platform != 'android':
            logger.warning("Nearby devices permission is Android-specific")
            return False
        return self._handle_permission('nearby_devices', action, timeout)
    
    def handle_all_permissions(self, action='allow', timeout=30):
        """
        Handle multiple permission dialogs in sequence
        Useful for app first launch when multiple permissions are requested
        """
        permissions_handled = []
        start_time = time.time()
        
        permission_types = ['camera', 'location', 'microphone', 'contacts', 'storage', 'notification', 'bluetooth']
        if self.platform == 'android':
            permission_types.append('nearby_devices')
        
        while time.time() - start_time < timeout:
            permission_found = False
            
            for perm_type in permission_types:
                if self._is_permission_dialog_visible(perm_type):
                    logger.info(f"Handling {perm_type} permission dialog")
                    if self._handle_permission(perm_type, action, 3):
                        permissions_handled.append(perm_type)
                        permission_found = True
                        time.sleep(1)  # Wait between permissions
                        break
            
            if not permission_found:
                # Check for generic permission dialogs
                if self._handle_generic_permission_dialog(action):
                    permissions_handled.append('generic')
                    permission_found = True
                    time.sleep(1)
            
            if not permission_found:
                break
        
        logger.info(f"Permissions handled: {permissions_handled}")
        return permissions_handled
    
    def _handle_permission(self, permission_type, action, timeout, **kwargs):
        """Core permission handling logic"""
        try:
            if self.platform == 'ios':
                return self._handle_ios_permission(permission_type, action, timeout, **kwargs)
            else:
                return self._handle_android_permission(permission_type, action, timeout, **kwargs)
        except Exception as e:
            logger.error(f"Error handling {permission_type} permission: {e}")
            return False
    
    def _handle_ios_permission(self, permission_type, action, timeout, **kwargs):
        """Handle iOS permission dialogs"""
        button_text = self._get_ios_permission_button_text(permission_type, action, **kwargs)

        # Try JSON keys from locators/ios/permissions.json
        if action == 'deny':
            key_order = ['dont_allow_button', 'generic_deny']
        elif action == 'while_using':
            key_order = ['allow_while_using', 'allow_button', 'generic_allow']
        elif action == 'allow':
            key_order = ['allow_button', 'always_allow', 'generic_allow']
        else:
            key_order = ['allow_button', 'generic_allow']

        for key in key_order:
            if self._click_by_key(key, timeout):
                logger.info(f"iOS {permission_type} permission {action} - clicked via key '{key}'")
                return True

        # Fallback: dynamic text-based selectors
        locators = [
            ('accessibility_id', button_text),
            ('xpath', f"//XCUIElementTypeButton[@name='{button_text}']"),
            ('xpath', f"//XCUIElementTypeButton[contains(@name, '{button_text}')]"),
            ('name', button_text)
        ]
        for by_type, value in locators:
            try:
                element = self.find_visible(by_type, value, timeout=2)
                if element:
                    element.click()
                    logger.info(f"iOS {permission_type} permission {action} - clicked '{button_text}' (fallback)")
                    return True
            except Exception:
                continue

        logger.warning(f"iOS {permission_type} permission dialog not found or could not be handled")
        return False
    
    def _handle_android_permission(self, permission_type, action, timeout, **kwargs):
        """Handle Android permission dialogs using JSON locators first, then fallback to text"""
        button_text = self._get_android_permission_button_text(permission_type, action)

        # Brand-aware JSON keys
        brand_allow_key = brand_deny_key = None
        if self.manufacturer == 'samsung':
            brand_allow_key = 'samsung_allow'
            brand_deny_key = 'samsung_deny'
        elif self.manufacturer == 'xiaomi':
            brand_allow_key = 'xiaomi_allow'
            brand_deny_key = 'xiaomi_deny'

        if action == 'deny':
            key_order = [brand_deny_key, 'deny_button', 'generic_deny']
        elif action == 'while_using':
            key_order = [brand_allow_key, 'while_using_button', 'allow_button', 'generic_allow']
        else:
            key_order = [brand_allow_key, 'allow_button', 'generic_allow']

        key_order = [k for k in key_order if k]
        for key in key_order:
            if self._click_by_key(key, timeout):
                logger.info(f"Android {permission_type} permission {action} - clicked via key '{key}'")
                return True

        # Fallback: dynamic text-based selectors
        locators = [
            ('xpath', f"//android.widget.Button[contains(@text, '{button_text}')]"),
            ('xpath', f"//android.widget.Button[@text='{button_text}']")
        ]
        for by_type, value in locators:
            try:
                element = self.find_visible(by_type, value, timeout=2)
                if element:
                    element.click()
                    logger.info(f"Android {permission_type} permission {action} - clicked '{button_text}' (fallback)")
                    return True
            except Exception:
                continue

        logger.warning(f"Android {permission_type} permission dialog not found or could not be handled")
        return False
    
    def _get_ios_permission_button_text(self, permission_type, action, **kwargs):
        """Get iOS permission button text based on action"""
        if action == 'allow':
            if permission_type == 'location':
                precision = kwargs.get('precision', 'precise')
                if precision == 'precise':
                    return 'Allow While Using App'
                else:
                    return 'Allow Once'
            return 'Allow'
        elif action == 'deny':
            return "Don't Allow"
        elif action == 'while_using':
            return 'Allow While Using App'
        else:
            return 'Allow'
    
    def _get_android_permission_button_text(self, permission_type, action):
        """Get Android permission button text based on action"""
        if action == 'allow':
            return 'Allow'
        elif action == 'deny':
            return 'Deny'
        elif action == 'while_using':
            return 'While using the app'
        else:
            return 'Allow'
    
    def _is_permission_dialog_visible(self, permission_type, timeout=2):
        """Check if a specific permission dialog is visible"""
        # Generic permission dialog indicators
        indicators = [
            ('xpath', "//android.widget.TextView[contains(@text, 'permission')]"),
            ('xpath', "//XCUIElementTypeAlert"),
            ('id', 'com.android.permissioncontroller:id/permission_message'),
            ('accessibility_id', 'permission_alert')
        ]
        
        for by_type, value in indicators:
            try:
                if self.find_visible(by_type, value, timeout=timeout):
                    return True
            except:
                continue
        
        return False
    
    def _handle_generic_permission_dialog(self, action, timeout=3):
        """Handle generic permission dialogs when specific type detection fails"""
        button_texts = ['Allow', 'OK', 'Continue', 'Accept'] if action == 'allow' else ['Deny', 'Cancel', 'Not now']
        
        for button_text in button_texts:
            locators = [
                ('xpath', f"//android.widget.Button[@text='{button_text}']"),
                ('xpath', f"//XCUIElementTypeButton[@name='{button_text}']"),
                ('accessibility_id', button_text)
            ]
            
            for by_type, value in locators:
                try:
                    element = self.find_visible(by_type, value, timeout=1)
                    if element:
                        element.click()
                        logger.info(f"Generic permission dialog handled - clicked '{button_text}'")
                        return True
                except:
                    continue
        
        return False
    
    def dismiss_system_dialogs(self, timeout=10):
        """Dismiss any system dialogs (updates, battery optimization, etc.)"""
        system_dismiss_buttons = [
            'Not now', 'Later', 'Skip', 'Cancel', 'Dismiss', 'Close',
            'Maybe later', 'Ask me later', 'No thanks', 'Continue without updating'
        ]
        
        for button_text in system_dismiss_buttons:
            try:
                element = self.find_visible('xpath', f"//*[@text='{button_text}' or @name='{button_text}']", timeout=2)
                if element:
                    element.click()
                    logger.info(f"Dismissed system dialog with '{button_text}'")
                    return True
            except:
                continue
        
        return False

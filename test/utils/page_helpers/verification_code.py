# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
Verification Code Page Helper
"""
import logging
import time
from .base import BasePage
from utils.mailosaur_helper import get_verification_code
from utils.registered_user_resolver import resolve_registered_user_email

logger = logging.getLogger(__name__)

class VerificationCode(BasePage):
    def __init__(self, driver, page_helper_manager=None):
        super().__init__(driver, page_helper_manager)
    
    def check_screen_displayed(self, timeout=10):
        """
        Check if verification code screen is displayed
        """
        try:
            return super().check_screen_displayed(timeout)
        except Exception as e:
            logger.warning(f"Verification code screen not displayed: {e}")
            return False
    
    def is_verify_button_enabled(self):
        """Check if verify button is enabled"""
        try:
            return self.is_enabled("verify_button")
        except Exception:
            return False
    
    def get_title_text(self):
        """Get the title text of the verification screen"""
        try:
            return self.get_text("title_text")
        except Exception:
            return None
    
    def get_subtitle_text(self):
        """Get the subtitle text with email information"""
        try:
            return self.get_text("subtitle_text")
        except Exception:
            return None
    
    def get_current_code_value(self):
        """Get the current value in the verification code input"""
        try:
            return self.get_attribute_value("verification_code_input", "text") or \
                   self.get_attribute_value("verification_code_input", "value")
        except Exception:
            return ""
    
    def clear_verification_code(self):
        """Clear the verification code input"""
        logger.info("Clearing verification code input")
        self.clear("verification_code_input")
        return self

    def enter_verification_code(self, code: str):
        """Enter verification code"""
        logger.info(f"Entering verification code: {code}")
        
        if not self.check_screen_displayed():
            raise Exception("Not on verification code screen")
        
        # Clear any existing code and enter new one
        self.clear_verification_code()
        self.send_keys("verification_code_input", code)
        
        self.hide_keyboard_if_visible()
        
        return self
    
    def verify_code(self, code: str, email: str = None, wait_for_completion=True):
        """Complete verification flow with code"""
        logger.info(f"Performing verification with code: {code}")
        
        if code == "correct":
            try:
                # Resolve email for registered user tokens or signup flow
                if email and email.startswith("registered user"):
                    email = resolve_registered_user_email(email)
                if not email:
                    signup_helper = self.get_other_page_helper('signup') if self.page_helper_manager else None
                    email = getattr(signup_helper, 'generated_email', None) if signup_helper else None
                
                if not email:
                    raise Exception("No email address provided for verification code retrieval")
                
                logger.info(f"Retrieving verification code for email: {email}")
                code = get_verification_code(email)
                logger.info(f"Retrieved verification code: {code}")
                
            except Exception as e:
                logger.error(f"Failed to get verification code: {e}")
                raise Exception(f"Failed to retrieve correct verification code: {str(e)}")
        
        self.enter_verification_code(code)
        
        return self


    def go_back(self):
        """Go back to previous screen"""
        logger.info("Going back to previous screen")
        self.click("back_button")
        return self
    
    def validate_screen_elements(self):
        """Validate all expected elements are present on verification code screen"""
        logger.info("Validating verification code screen elements")
        
        required_elements = [
            "back_button",
            "title_text",
            "subtitle_text",
            "verification_code_input",
            "verify_button",
            "resend_code_button"
        ]
        
        missing_elements = []
        for element in required_elements:
            if not self.is_visible(element, timeout=5):
                missing_elements.append(element)
        
        if missing_elements:
            raise Exception(f"Missing verification code screen elements: {missing_elements}")
        
        logger.info("All verification code screen elements validated successfully")
        return True

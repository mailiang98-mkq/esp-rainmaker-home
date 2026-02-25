# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
Home Page Helper
"""
import logging
import time
from .base import BasePage
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

logger = logging.getLogger(__name__)

class Home(BasePage):
    def __init__(self, driver, page_helper_manager=None):
        super().__init__(driver, page_helper_manager)
    
    def handle_nickname_popup(self, action: str = "skip", nickname: str = None):
        """
        Handle the nickname pop-up that appears after signup.
        
        Args:
            action: Action to perform on the pop-up ("skip" or "add")
            nickname: Nickname to add if action is "add"
        Returns:
            self
        """
        logger.info(f"Attempting to handle nickname pop-up with action: {action} and nickname: {nickname}")
    
        if action == "skip":
            element = self.find_visible("nickname_skip_button", timeout=5)
            if element:
                element.click()
                logger.info("Clicked nickname skip button")
            else:
                logger.warning("Nickname skip button not found")
        elif action == "add":
            self.send_keys("nickname_input", nickname, timeout=5)
            self.click("nickname_add_button", timeout=2)
        else:
            raise ValueError(f"Invalid action: {action}")
        return self

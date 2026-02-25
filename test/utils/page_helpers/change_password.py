# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
Change Password Page Helper
"""
import logging
from .base import BasePage

logger = logging.getLogger(__name__)


class ChangePassword(BasePage):
    def __init__(self, driver, page_helper_manager=None):
        super().__init__(driver, page_helper_manager)

    def check_screen_displayed(self, timeout=10):
        """Check if change password screen is displayed"""
        try:
            return super().check_screen_displayed(timeout)
        except Exception as e:
            logger.warning(f"Change password screen not displayed: {e}")
            return False

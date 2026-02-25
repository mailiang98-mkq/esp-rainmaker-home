# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
Account Security Page Helper
"""
import logging
from .base import BasePage

logger = logging.getLogger(__name__)


class AccountSecurity(BasePage):
    def __init__(self, driver, page_helper_manager=None):
        super().__init__(driver, page_helper_manager)

    def check_screen_displayed(self, timeout=10):
        """Check if account security screen is displayed"""
        try:
            return super().check_screen_displayed(timeout)
        except Exception as e:
            logger.warning(f"Account security screen not displayed: {e}")
            return False

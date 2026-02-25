# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
Delete Account Page Helper
"""
import logging
from .base import BasePage

logger = logging.getLogger(__name__)


class DeleteAccount(BasePage):
    def __init__(self, driver, page_helper_manager=None):
        super().__init__(driver, page_helper_manager)

    def check_screen_displayed(self, timeout=10):
        try:
            return super().check_screen_displayed(timeout)
        except Exception as e:
            logger.warning(f"Delete account screen not displayed: {e}")
            return False

# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

import pytest
import logging
from pytest_bdd import scenarios, given, when, then, parsers

logger = logging.getLogger(__name__)
pytestmark = pytest.mark.regression

scenarios('logout.feature')



@given(parsers.parse('user is on user profile screen for "{login_user}"'))
def on_user_profile_screen(helper, login_user, registered_user_resolver, registered_user_password_resolver):
    email = registered_user_resolver(login_user)
    password = registered_user_password_resolver(f"{login_user} password")
    helper.login.perform_login(email, password)
    assert helper.home.check_screen_displayed(timeout=10), "Home screen is not displayed"
    helper.home.click("user_button")
    assert helper.user.check_screen_displayed(timeout=10), "User profile screen is not displayed"


@when("user confirms logout")
def confirm_logout(helper):
    helper.user.perform_logout()


@when("user cancels logout")
def cancel_logout(helper):
    helper.user.click("logout_button")
    helper.user.click("alert_cancel_button")


@then("user should remain on user profile screen")
def should_remain_on_user_profile(helper):
    assert helper.user.check_screen_displayed(timeout=10), "User profile screen is not displayed"

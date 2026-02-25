# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
Minimal API helper for user signup/confirmation.
"""
import logging
import requests

from utils.mailosaur_helper import get_verification_code, generate_email

logger = logging.getLogger(__name__)

# API path and payload keys
_API_PATH_USER = "/user2"
_API_KEY_USER_NAME = "user_name"
_API_KEY_PASSWORD = "password"
_API_KEY_VERIFICATION_CODE = "verification_code"
_HTTP_CONTENT_TYPE = "application/json"


class ApiUserHelper:
    def __init__(self, base_uri: str):
        self.base_uri = base_uri.rstrip("/")
        self.headers = {"content-type": _HTTP_CONTENT_TYPE}

    def create_user(self, email: str, password: str) -> None:
        uri = f"{self.base_uri}{_API_PATH_USER}"
        body = {_API_KEY_USER_NAME: email, _API_KEY_PASSWORD: password}
        response = requests.post(uri, json=body, headers=self.headers, verify=False)
        if response.status_code != 201:
            raise Exception(f"API signup failed: {response.status_code} {response.text}")

    def confirm_user(self, email: str) -> None:
        code = get_verification_code(email)
        uri = f"{self.base_uri}{_API_PATH_USER}"
        body = {_API_KEY_USER_NAME: email, _API_KEY_VERIFICATION_CODE: code}
        response = requests.post(uri, json=body, headers=self.headers, verify=False)
        if response.status_code != 201:
            raise Exception(f"API confirm failed: {response.status_code} {response.text}")

    def create_and_confirm_user(self, password: str) -> dict:
        email = generate_email()
        self.create_user(email, password)
        self.confirm_user(email)
        return {"email": email, "password": password}

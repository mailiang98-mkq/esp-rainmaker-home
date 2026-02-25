# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import yaml


def _deployment_config_path() -> Path:
    return Path(__file__).resolve().parents[1] / "config" / "deployment.yaml"


def load_deployment_config(deployment: str) -> Dict:
    config_path = _deployment_config_path()
    if not config_path.exists():
        raise FileNotFoundError(f"{config_path} not found")
    with open(config_path, "r") as f:
        config = yaml.safe_load(f) or {}
    if deployment not in config:
        raise KeyError(f"Deployment '{deployment}' not found in {config_path}")
    return config


def load_registered_users(config: Dict, deployment: str) -> List[Dict[str, str]]:
    env_config = config.get(deployment, {})
    return env_config.get("registered_users", []) or []


def resolve_registered_user_email(user_token: str, deployment: Optional[str] = None) -> str:
    if not user_token.startswith("registered user"):
        return user_token
    deployment = (
        deployment
        or os.getenv("ESP_DEPLOYMENT")
        or os.getenv("PYTEST_DEPLOYMENT")
        or os.getenv("DEPLOYMENT")
        or "production"
    )
    config = load_deployment_config(deployment)
    users = load_registered_users(config, deployment)
    parts = user_token.split()
    index = int(parts[-1]) if len(parts) > 2 and parts[-1].isdigit() else 1
    index = max(1, index)
    if len(users) < index:
        raise IndexError(
            f"Registered user '{user_token}' not found for deployment '{deployment}'"
        )
    return users[index - 1]["email"]


def resolve_registered_user_password(user_token: str, deployment: Optional[str] = None) -> str:
    if not user_token.startswith("registered user"):
        return user_token
    deployment = (
        deployment
        or os.getenv("ESP_DEPLOYMENT")
        or os.getenv("PYTEST_DEPLOYMENT")
        or os.getenv("DEPLOYMENT")
        or "production"
    )
    config = load_deployment_config(deployment)
    env_config = config.get(deployment, {})
    default_password = env_config.get("password", "Welcome01")
    users = load_registered_users(config, deployment)
    parts = user_token.split()
    if parts[-1] != "password":
        return user_token
    index = int(parts[-2]) if len(parts) > 3 and parts[-2].isdigit() else 1
    index = max(1, index)
    if len(users) < index:
        return default_password
    return users[index - 1].get("password") or default_password


def update_registered_user_password(
    email: str,
    new_password: str,
    deployment: Optional[str] = None,
) -> Tuple[bool, str]:
    deployment = (
        deployment
        or os.getenv("ESP_DEPLOYMENT")
        or os.getenv("PYTEST_DEPLOYMENT")
        or os.getenv("DEPLOYMENT")
        or "production"
    )
    config = load_deployment_config(deployment)
    users = load_registered_users(config, deployment)
    for user in users:
        if user.get("email") == email:
            user["password"] = new_password
            config.setdefault(deployment, {})
            config[deployment]["registered_users"] = users
            config_path = _deployment_config_path()
            with open(config_path, "w") as f:
                yaml.safe_dump(config, f, default_flow_style=False)
            print(f"Updated registered user password for email: {email} with new password: {new_password}")
            return True, deployment
    print(f"Failed to update registered user password for email: {email}")
    return False, deployment

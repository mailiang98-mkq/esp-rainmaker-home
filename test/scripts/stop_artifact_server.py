# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

#!/usr/bin/env python3
"""
Stop the artifact hosting server
"""
import sys
import socket
import requests
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import yaml

def load_config():
    """Load configuration from YAML file"""
    config_path = project_root / "config" / "report_config.yaml"
    try:
        with open(config_path, 'r') as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        print(f"Error loading config: {e}")
        return {}

def check_server_running(port):
    """Check if server is running on the port"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        return result == 0
    except:
        return False

def main():
    """Stop the artifact hosting server"""
    config = load_config()
    hosting_config = config.get('local_hosting', {})
    port = hosting_config.get('http_server_port', 8000)
    
    if not check_server_running(port):
        print(f"Server is not running on port {port}")
        return
    
    print(f"Server is running on port {port}")
    print("Note: The standalone server runs as a background process.")
    print("To stop it, use: pkill -f start_artifact_server.py")
    print("Or find the process: ps aux | grep start_artifact_server.py")

if __name__ == "__main__":
    main()

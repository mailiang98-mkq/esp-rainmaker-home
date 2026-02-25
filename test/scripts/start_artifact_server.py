# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

#!/usr/bin/env python3
"""
Standalone artifact hosting server
Run this script to start the artifact server as a background service
"""
import sys
import os
import signal
import logging
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from utils.artifact_host import ArtifactHost
import yaml

# Configure logging - write to both console and log file
log_file = Path.home() / "esp-auto-reports" / "artifact-server.log"
log_file.parent.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file, mode='a'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)
logger.info(f"Logging to: {log_file}")

def load_config():
    """Load configuration from YAML file"""
    config_path = project_root / "config" / "report_config.yaml"
    try:
        with open(config_path, 'r') as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        logger.error(f"Error loading config: {e}")
        return {}

artifact_host = None

def signal_handler(sig, frame):
    """Handle shutdown signals"""
    logger.info("Received shutdown signal, stopping server...")
    global artifact_host
    if artifact_host:
        artifact_host.stop_server()
    sys.exit(0)

def main():
    """Start the artifact hosting server"""
    global artifact_host
    
    config = load_config()
    hosting_config = config.get('local_hosting', {})
    
    artifacts_dir = hosting_config.get('artifacts_dir', 'reports/artifacts')
    port = hosting_config.get('http_server_port', 8000)
    base_url = hosting_config.get('base_url', f'http://127.0.0.1:{port}')
    
    # Get network IP for display
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        network_ip = s.getsockname()[0]
        s.close()
    except:
        network_ip = "N/A"
    
    logger.info("=" * 60)
    logger.info("ESP Auto Artifact Hosting Server")
    logger.info("=" * 60)
    logger.info(f"Artifacts directory: {artifacts_dir}")
    logger.info(f"Port: {port}")
    logger.info(f"Local access: http://127.0.0.1:{port}")
    if network_ip != "N/A":
        logger.info(f"Network IP access: http://{network_ip}:{port}")
        logger.info(f"mDNS access: {base_url}")
        logger.info("")
        logger.info("NOTE: If unable to access from other machines:")
        logger.info("  1. Check macOS Firewall: System Settings > Network > Firewall")
        logger.info("  2. Allow incoming connections for Python")
        logger.info("  3. Try using network IP instead of .local if mDNS not working")
    else:
        logger.info(f"Base URL (config): {base_url}")
    logger.info("=" * 60)
    
    # Check if server is already running
    temp_host = ArtifactHost(artifacts_dir=artifacts_dir, port=port, base_url=base_url)
    if temp_host.is_server_running():
        logger.warning(f"Server is already running on port {port}")
        logger.info(f"Current server base path: {temp_host.server_base_path.resolve()}")
        logger.info(f"Expected artifacts dir: {temp_host.artifacts_dir.resolve()}")
        logger.info(f"Access artifacts at: {base_url}")
        logger.warning("If you're experiencing 404 errors, the server may need to be restarted")
        logger.warning("Stop the server and restart it to use the updated configuration")
        return
    
    # Create artifact host
    artifact_host = ArtifactHost(
        artifacts_dir=artifacts_dir,
        port=port,
        base_url=base_url
    )
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start server
    if artifact_host.start_server():
        logger.info("Server started successfully!")
        actual_base_url = artifact_host.base_url
        logger.info(f"Access artifacts at: {actual_base_url}")
        logger.info("Press Ctrl+C to stop the server")
        
        # Keep server running
        try:
            # Wait for the server thread (non-daemon, so it keeps running)
            artifact_host.server_thread.join()
        except KeyboardInterrupt:
            logger.info("Shutting down server...")
            artifact_host.stop_server()
    else:
        logger.error("Failed to start server")
        sys.exit(1)

if __name__ == "__main__":
    main()

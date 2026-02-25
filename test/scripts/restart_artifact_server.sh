# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

#!/bin/bash
# Restart the macOS artifact server service

SERVICE_LABEL="com.espressif.artifact-server"

echo "Stopping artifact server service..."
launchctl unload ~/Library/LaunchAgents/${SERVICE_LABEL}.plist 2>/dev/null || true
launchctl remove ${SERVICE_LABEL} 2>/dev/null || true

# Wait a moment for the service to stop
sleep 2

echo "Starting artifact server service..."
launchctl load ~/Library/LaunchAgents/${SERVICE_LABEL}.plist

# Wait a moment for the service to start
sleep 2

echo "Checking service status..."
launchctl list | grep ${SERVICE_LABEL} || echo "Service not found in list"

echo ""
echo "Service restarted. Logs are available at:"
echo "  - Standard output: /tmp/artifact-server.log"
echo "  - Standard error: /tmp/artifact-server.error.log"
echo "  - Application logs: ~/esp-auto-reports/artifact-server.log"
echo ""
echo "To view logs in real-time:"
echo "  tail -f /tmp/artifact-server.log"
echo "  tail -f ~/esp-auto-reports/artifact-server.log"

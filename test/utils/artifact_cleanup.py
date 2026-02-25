# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
Artifact cleanup utility - removes artifacts older than specified days
"""
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)


def cleanup_old_artifacts(artifacts_dir: str, reports_dir: str, days: int = 15):
    """
    Remove artifacts and reports older than specified days
    
    Args:
        artifacts_dir: Path to artifacts directory
        reports_dir: Path to reports directory
        days: Number of days to keep artifacts (default: 15)
    """
    artifacts_path = Path(artifacts_dir).expanduser().resolve()
    reports_path = Path(reports_dir).expanduser().resolve()
    
    if not artifacts_path.exists() and not reports_path.exists():
        logger.debug("No artifacts or reports directories found for cleanup")
        return
    
    cutoff_date = datetime.now() - timedelta(days=days)
    deleted_artifacts = 0
    deleted_reports = 0
    deleted_size = 0
    
    # Cleanup artifacts directory
    if artifacts_path.exists():
        for item in artifacts_path.rglob('*'):
            if item.is_file():
                try:
                    # Get file modification time
                    mtime = datetime.fromtimestamp(item.stat().st_mtime)
                    if mtime < cutoff_date:
                        size = item.stat().st_size
                        item.unlink()
                        deleted_artifacts += 1
                        deleted_size += size
                        logger.debug(f"Deleted old artifact: {item}")
                except Exception as e:
                    logger.warning(f"Error deleting artifact {item}: {e}")
        
        # Remove empty directories
        for item in sorted(artifacts_path.rglob('*'), reverse=True):
            if item.is_dir():
                try:
                    if not any(item.iterdir()):
                        item.rmdir()
                        logger.debug(f"Removed empty directory: {item}")
                except Exception as e:
                    logger.debug(f"Could not remove directory {item}: {e}")
    
    # Cleanup reports directory
    if reports_path.exists():
        for item in reports_path.iterdir():
            if item.is_file():
                try:
                    mtime = datetime.fromtimestamp(item.stat().st_mtime)
                    if mtime < cutoff_date:
                        size = item.stat().st_size
                        item.unlink()
                        deleted_reports += 1
                        deleted_size += size
                        logger.debug(f"Deleted old report: {item}")
                except Exception as e:
                    logger.warning(f"Error deleting report {item}: {e}")
    
    if deleted_artifacts > 0 or deleted_reports > 0:
        size_mb = deleted_size / (1024 * 1024)
        logger.info(f"Cleanup completed: {deleted_artifacts} artifacts, {deleted_reports} reports, "
                   f"{size_mb:.2f} MB freed (older than {days} days)")
    else:
        logger.debug(f"No artifacts older than {days} days found for cleanup")


def get_external_reports_path() -> Path:
    """
    Get path to external reports directory (outside repo)
    Default: ~/esp-auto-reports
    """
    home = Path.home()
    external_path = home / "esp-auto-reports"
    external_path.mkdir(parents=True, exist_ok=True)
    return external_path

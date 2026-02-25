# SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
#
# SPDX-License-Identifier: Apache-2.0
#

"""
Locator loader for locator files
"""
import json
import logging
from pathlib import Path
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class LocatorLoader:
    def __init__(self, locators_path: str = "locators"):
        self.locators_path = Path(locators_path)
        self._cache = {}
    
    def get_locators(self, page_name: str) -> Dict[str, str]:
        """
        Load locators for specific page
        
        Args:
            page_name: Name of the page (e.g., 'consent', 'provisioning')
            
        Returns:
            Dictionary of locator_name: locator_value
        """
        cache_key = f"{page_name}"
        
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # Try multiple naming conventions
        possible_names = [
            page_name,  # e.g., "verification_code"
            page_name.replace('_', ''),  # e.g., "verificationcode"
            page_name.replace('_', '-'),  # e.g., "verification-code"
        ]
        
        locator_file = None
        for name in possible_names:
            candidate_file = self.locators_path / f"{name}.json"
            if candidate_file.exists():
                locator_file = candidate_file
                break
        
        if not locator_file:
            logger.warning(f"Locator file not found for {page_name}. Tried: {possible_names}")
            return {}
        
        try:
            with open(locator_file, 'r') as f:
                locators = json.load(f)
                self._cache[cache_key] = locators
                logger.debug(f"Loaded locators from {locator_file}")
                return locators
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in locator file {locator_file}: {e}")
            return {}
        except Exception as e:
            logger.error(f"Error loading locators from {locator_file}: {e}")
            return {}
    
    def get_locator(self, page_name: str, locator_name: str) -> Optional[Dict]:
        """
        Get a specific locator object
        
        Args:
            page_name: Name of the page
            locator_name: Name of the specific locator
            
        Returns:
            Locator dict with 'by', 'value', and 'text' keys or None if not found
        """
        locators = self.get_locators(page_name)
        locator_data = locators.get(locator_name)
        
        if locator_data is None:
            return None
        return locator_data if isinstance(locator_data, dict) else None

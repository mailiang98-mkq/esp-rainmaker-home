/*
 * SPDX-FileCopyrightText: 2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import Constants from 'expo-constants';
import asyncStorageAdapter from "@/adaptors/implementations/ESPAsyncStorage";
import { provisionAdapter } from "@/adaptors/implementations/ESPProvAdapter";
import { EspLocalDiscoveryAdapter } from "@/adaptors/implementations/ESPDiscoveryAdapter";
import ESPLocalControlAdapter from "@/adaptors/implementations/ESPLocalControlAdapter";
import { ESPNotificationAdapter } from "@/adaptors/implementations/ESPNotificationAdapter";
import { espOauthAdapter } from "@/adaptors/implementations/ESPOauthAdapter";
import ESPAppUtilityAdapter from "./adaptors/implementations/ESPAppUtilityAdapter";
import { matterAdapter } from "@/adaptors/implementations/ESPMatterAdapter";

// Get environment variables from Expo Constants
const {
  baseUrl = 'https://api.rainmaker.espressif.com',
  authUrl = 'https://3pauth.rainmaker.espressif.com',
  version = 'v1',
  clientId = '1h7ujqjs8140n17v0ahb4n51m2',
  redirectUrl = 'rainmaker://com.espressif.novahome/success',
  enableCdfAutoSync = false,
  oauthEnabled = false,
  matterVendorId = '0x131B',
} = Constants.expoConfig?.extra || {};

// Function to get SDK configuration based on OAuth enabled status
function getConfig() {
  const baseConfig = {
    baseUrl,
    version,
    customStorageAdapter: asyncStorageAdapter,
    localDiscoveryAdapter: EspLocalDiscoveryAdapter,
    localControlAdapter: ESPLocalControlAdapter,
    provisionAdapter: provisionAdapter,
    notificationAdapter: ESPNotificationAdapter,
    oauthAdapter: espOauthAdapter,
    appUtilityAdapter: ESPAppUtilityAdapter,
  };

  // Only include OAuth-related variables if OAuth is enabled
  if (oauthEnabled) {
    return {
      ...baseConfig,
      authUrl,
      clientId,
      redirectUrl,
    };
  }

  return baseConfig;
}

export const SDKConfig = getConfig();

export const CDFConfig = {
  autoSync: enableCdfAutoSync
};

export const matterSDKConfig = {
  ...SDKConfig,
  matterAdapter: matterAdapter,
  matterVendorId: matterVendorId,
};
/*
 * SPDX-FileCopyrightText: 2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import Constants from "expo-constants";
import asyncStorageAdapter from "@native-adaptors/implementations/ESPAsyncStorage";
import { runtimeConfigManager, type SDKConfig } from "@config/runtime.config";
import { provisionAdapter } from "@native-adaptors/implementations/ESPProvAdapter";
import { EspLocalDiscoveryAdapter } from "@native-adaptors/implementations/ESPDiscoveryAdapter";
import ESPLocalControlAdapter from "@native-adaptors/implementations/ESPLocalControlAdapter";
import { ESPNotificationAdapter } from "@native-adaptors/implementations/ESPNotificationAdapter";
import { espOauthAdapter } from "@native-adaptors/implementations/ESPOauthAdapter";
import ESPAppUtilityAdapter from "@native-adaptors/implementations/ESPAppUtilityAdapter";
import { matterAdapter } from "@native-adaptors/implementations/ESPMatterAdapter";
import { ESPRMBaseConfig } from "@espressif/rainmaker-base-sdk";

// Get environment variables from Expo Constants
const extra = Constants.expoConfig?.extra || {};

const {
  rmSdk = {} as Record<string, string>,
  matterSdk = {} as Record<string, string>,
  activeSdk,
  features = {} as Record<string, any>,
} = extra;

// ─── RM SDK Config ────────────────────────────────────────────────────────────

const thirdPartyAuthEnabled = features.enableThirdPartyAuth ?? false;

export function getRMSDKConfig(): ESPRMBaseConfig {
  const override = (
    runtimeConfigManager.activeSdk === "rainmaker-base-sdk" ? runtimeConfigManager.config : null
  ) as SDKConfig | null;

  const base = {
    baseUrl: override?.baseUrl ?? rmSdk.baseUrl ?? "https://api.rainmaker.espressif.com",
    version: override?.version ?? rmSdk.version ?? "v1",
    customStorageAdapter: asyncStorageAdapter,
    localDiscoveryAdapter: EspLocalDiscoveryAdapter,
    localControlAdapter: ESPLocalControlAdapter,
    provisionAdapter: provisionAdapter,
    notificationAdapter: ESPNotificationAdapter,
    oauthAdapter: espOauthAdapter,
    appUtilityAdapter: ESPAppUtilityAdapter,
  };

  return thirdPartyAuthEnabled
    ? {
      ...base,
      authUrl: override?.authUrl ?? rmSdk.authUrl,
      clientId: override?.clientId ?? rmSdk.clientId,
      redirectUrl: override?.redirectUrl ?? rmSdk.redirectUrl,
    }
    : base;
}

// ─── Active SDK ───────────────────────────────────────────────────────────────

export const ActiveSDK = (activeSdk || 'rainmaker-base-sdk')

// ─── CDF Config ───────────────────────────────────────────────────────────────

export const CDFConfig = {
  autoSync: features.enableCdfAutoSync ?? false,
};

// ─── Matter SDK Config ────────────────────────────────────────────────────────

export function getMatterSDKConfig() {
  return {
    ...getRMSDKConfig(),
    matterAdapter: matterAdapter,
    matterVendorId: matterSdk.vendorId ?? "0x131B",
  };
}

// ─── SDK Feature Map (Level 2) ────────────────────────────────────────────────
//
// Defines which features each SDK adaptor supports.
// This is the technical truth — UI consumes this via config/features.config.ts.
// Add a new SDK entry here when a new adaptor is registered.

export const SDK_FEATURE_MAP: Record<string, Record<string, boolean>> = {
  'rainmaker-base-sdk': {
    // All features fully supported
    scenes: true, schedules: true, automations: true, localControl: true,
    notifications: true, groupSharing: true, ota: true,
    // API-only / env-controlled — always true at SDK level
    aiAgent: true, thirdPartyAuth: true, voiceAssistants: true,
  },
  'rainmaker-matter-sdk': {
    scenes: true, schedules: true, automations: true, localControl: true,
    notifications: true, groupSharing: true, ota: true,
    aiAgent: true, thirdPartyAuth: true, voiceAssistants: true,
    matterCommissioning: true,
  },
};

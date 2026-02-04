/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Storage keys for runtime config. Kept in separate file to avoid circular
 * dependency between runtimeConfig and ESPAsyncStorage.
 */
export const RUNTIME_CONFIG_STORAGE_KEYS = {
  SDK: "@esp_runtime_sdk",
  CONFIG: "@esp_runtime_config",
} as const;

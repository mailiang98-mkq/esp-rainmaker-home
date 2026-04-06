/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TFunction } from "i18next";
import { tokens } from "@shared/theme/tokens";

/**
 * Create a unique key for a network
 */
export const createNetworkKey = (
  ssid: string,
  rssi: number,
  index: number
): string => {
  return `${ssid}-${rssi}-${index}`;
};

/**
 * Get signal strength information
 */
export const getSignalStrength = (
  rssi: number,
  t: TFunction
): { text: string; color: string; strength: number } => {
  if (rssi >= -50)
    return {
      text: t("device.wifi.signalStrength.excellent"),
      color: tokens.colors.green,
      strength: 4,
    };
  if (rssi >= -60)
    return {
      text: t("device.wifi.signalStrength.good"),
      color: tokens.colors.green,
      strength: 3,
    };
  if (rssi >= -70)
    return {
      text: t("device.wifi.signalStrength.fair"),
      color: tokens.colors.green,
      strength: 2,
    };
  return {
    text: t("device.wifi.signalStrength.weak"),
    color: tokens.colors.green,
    strength: 1,
  };
};

/**
 * Calculate opacity from signal strength
 */
export const getOpacityFromStrength = (strength: number): number => {
  return 0.65 + (strength - 1) * 0.117;
};

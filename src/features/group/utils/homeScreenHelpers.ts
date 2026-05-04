/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TFunction } from "i18next";
import type { RoomTab, DeviceTypeFilterTab } from "@src/types/global";
import { extractDeviceType, findDeviceConfig } from "@shared/utils/device";
import { ALL_DEVICES_TAB_ID, FILTER_ALL, FILTER_OTHER } from "./constants";

/**
 * Returns default home tabs (e.g. "All Devices").
 * Pure; no side effects.
 */
export function getDefaultHomeTabs(t: TFunction): RoomTab[] {
  return [{ label: t("group.home.commonTab"), id: ALL_DEVICES_TAB_ID }];
}

/**
 * Resolves the lowercase category key for a device type string.
 * Returns the config label (e.g. `"lighting"`, `"switch"`) or `"other"` when
 * no matching config exists.
 */
export function getDeviceType(rawDeviceType: string | undefined): string {
  if (!rawDeviceType) return FILTER_OTHER;
  const config = findDeviceConfig(extractDeviceType(rawDeviceType));
  return config ? config.label.toLowerCase() : FILTER_OTHER;
}

/** Key + display label pair for a device category. */
export interface DeviceCategoryInfo {
  key: string;
  label: string;
}

/**
 * Returns the category key **and** display label for a device type.
 * Falls back to `{ key: "other", label: fallbackLabel }` when no config matches.
 */
export function getDeviceCategoryInfo(
  rawDeviceType: string | undefined,
  fallbackLabel: string
): DeviceCategoryInfo {
  if (!rawDeviceType) return { key: FILTER_OTHER, label: fallbackLabel };
  const config = findDeviceConfig(extractDeviceType(rawDeviceType));
  if (!config) return { key: FILTER_OTHER, label: fallbackLabel };
  return {
    key: config.label.toLowerCase(),
    label: config.groupLabel || config.label,
  };
}

/**
 * Derives unique device-type filter tabs from a list of room devices.
 * Returns an empty array when fewer than 2 categories exist.
 */
export function buildDeviceFilterTabs(
  roomDevices: { type?: string }[],
  allLabel: string,
  otherLabel: string
): DeviceTypeFilterTab[] {
  const categorySet = new Map<string, string>();

  for (const device of roomDevices) {
    const { key, label } = getDeviceCategoryInfo(device.type, otherLabel);
    if (!categorySet.has(key)) {
      categorySet.set(key, label);
    }
  }

  const result: DeviceTypeFilterTab[] = [{ id: FILTER_ALL, label: allLabel }];

  categorySet.forEach((label, key) => {
    result.push({ id: key, label });
  });

  return result.length <= 1 ? [] : result;
}

/**
 * Tests whether a single device matches the given filter key.
 * `"all"` matches everything.
 */
export function compareDeviceType(
  rawDeviceType: string | undefined,
  filter: string
): boolean {
  if (filter === FILTER_ALL) return true;
  return getDeviceType(rawDeviceType) === filter;
}

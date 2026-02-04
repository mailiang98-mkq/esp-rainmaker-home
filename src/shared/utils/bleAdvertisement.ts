/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/** Manufacturing data: device type (matches firmware MFG_DATA_DEVICE_TYPE_*) */
export const MFG_DATA_DEVICE_TYPE_LIGHT = 0x0005;
export const MFG_DATA_DEVICE_TYPE_SWITCH = 0x0080;
export const MFG_DATA_DEVICE_TYPE_USER_AUTH = 0x0101;
export const MFG_DATA_DEVICE_TYPE_MATTER_CONTROLLER = 0xfff1;

/** Manufacturing data: subtype (matches firmware MFG_DATA_DEVICE_SUBTYPE_*) */
export const MFG_DATA_DEVICE_SUBTYPE_LIGHT = 0x01;
export const MFG_DATA_DEVICE_SUBTYPE_SWITCH = 0x01;
export const MFG_DATA_DEVICE_SUBTYPE_AI_AGENT = 0x01;
export const MFG_DATA_DEVICE_SUBTYPE_MATTER_CONTROLLER = 0x01;

export type BleAdvertisedDeviceKind =
  | "light"
  | "switch"
  | "ai_agent"
  | "matter_controller"
  | "unknown";

export interface ParsedBleManufacturerAdvertisement {
  deviceType: number;
  deviceSubtype: number;
  /** Android: payload starts at 0; iOS: 2-byte manufacturer ID prefix → field offset 2 */
  layoutOffset: 0 | 2;
  /** Resolved product kind (parser returns null when no known type/subtype match). */
  kind: Exclude<BleAdvertisedDeviceKind, "unknown">;
}

function readManufacturerPayload(advertisementData: unknown): number[] | null {
  const raw = (advertisementData as { kCBAdvDataManufacturerData?: unknown } | null)
    ?.kCBAdvDataManufacturerData;
  if (!raw || !Array.isArray(raw)) {
    return null;
  }
  return raw.map((b) => Number(b) & 0xff);
}

function resolveBleDeviceKind(deviceType: number, deviceSubtype: number): BleAdvertisedDeviceKind {
  if (
    deviceType === MFG_DATA_DEVICE_TYPE_LIGHT &&
    deviceSubtype === MFG_DATA_DEVICE_SUBTYPE_LIGHT
  ) {
    return "light";
  }
  if (
    deviceType === MFG_DATA_DEVICE_TYPE_SWITCH &&
    deviceSubtype === MFG_DATA_DEVICE_SUBTYPE_SWITCH
  ) {
    return "switch";
  }
  if (
    deviceType === MFG_DATA_DEVICE_TYPE_USER_AUTH &&
    deviceSubtype === MFG_DATA_DEVICE_SUBTYPE_AI_AGENT
  ) {
    return "ai_agent";
  }
  if (
    deviceType === MFG_DATA_DEVICE_TYPE_MATTER_CONTROLLER &&
    deviceSubtype === MFG_DATA_DEVICE_SUBTYPE_MATTER_CONTROLLER
  ) {
    return "matter_controller";
  }
  return "unknown";
}

/**
 * Parses ESP manufacturing fields from BLE advertisement data.
 * Tries Android layout (offset 0) then iOS layout (offset 2, after manufacturer ID).
 */
export function parseBleManufacturerAdvertisement(
  advertisementData: unknown
): ParsedBleManufacturerAdvertisement | null {
  const mfgData = readManufacturerPayload(advertisementData);
  if (!mfgData) {
    return null;
  }

  for (const layoutOffset of [0, 2] as const) {
    if (mfgData.length < layoutOffset + 9) {
      continue;
    }
    const deviceType =
      ((mfgData[layoutOffset + 6] ?? 0) << 8) | (mfgData[layoutOffset + 7] ?? 0);
    const deviceSubtype = mfgData[layoutOffset + 8] ?? 0;
    const kind = resolveBleDeviceKind(deviceType, deviceSubtype);
    if (kind !== "unknown") {
      return { deviceType, deviceSubtype, layoutOffset, kind };
    }
  }

  return null;
}

const DEFAULT_PROVISION_ICON = "light-1";

const BLE_KIND_TO_ICON: Record<Exclude<BleAdvertisedDeviceKind, "unknown">, string> = {
  light: "light-1",
  switch: "switch",
  ai_agent: "ai-assistant",
  matter_controller: DEFAULT_PROVISION_ICON,
};

/**
 * Icon base name for `deviceImages` in `device.ts` (e.g. suffixed with `-online` in list cards).
 */
export function getProvisionBleIconName(advertisementData: unknown): string {
  const parsed = parseBleManufacturerAdvertisement(advertisementData);
  if (!parsed) {
    return DEFAULT_PROVISION_ICON;
  }
  return BLE_KIND_TO_ICON[parsed.kind];
}

export function isAIAgentFromAdvertisement(advertisementData: unknown): boolean {
  return parseBleManufacturerAdvertisement(advertisementData)?.kind === "ai_agent";
}

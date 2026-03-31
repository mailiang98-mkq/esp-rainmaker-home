/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * RMNG BLE manufacturer advertisement layout matches RainMaker base SDK
 * `SearchESPBLEDevices` (product signature at offset 0 or 2, 16-bit customer id at off+4 / off+5),
 * but uses the 4-byte ASCII "RMNG" signature instead of "Nov".
 *
 * @see node_modules/@espressif/rainmaker-base-sdk/dist/esm/methods/ESPRMUser/SearchESPBLEDevices.js
 */

/** ASCII "RMNG" — RMNG product line signature in manufacturer data */
export const RMNG_BLE_SIGNATURE_BYTES: readonly [number, number, number, number] = [
  0x52, 0x4d, 0x4e, 0x47,
];

function readManufacturerBytes(advertisementData: unknown): number[] | null {
  const raw = (advertisementData as { kCBAdvDataManufacturerData?: unknown } | null)
    ?.kCBAdvDataManufacturerData;
  if (!raw || !Array.isArray(raw)) {
    return null;
  }
  return raw.map((b) => Number(b) & 0xff);
}

function matchesRmngSignatureAt(dataArray: number[], offset: 0 | 2): boolean {
  const sig = RMNG_BLE_SIGNATURE_BYTES;
  if (dataArray.length < offset + sig.length) {
    return false;
  }
  return sig.every((byte, i) => dataArray[offset + i] === byte);
}

function signatureOffsetRmng(dataArray: number[]): 0 | 2 | -1 {
  if (matchesRmngSignatureAt(dataArray, 0)) {
    return 0;
  }
  if (matchesRmngSignatureAt(dataArray, 2)) {
    return 2;
  }
  return -1;
}

/**
 * Reads the 16-bit customer id from RMNG-formatted manufacturer data, or null if not present.
 */
export function getRmngManufacturerCustomerId(
  advertisementData: unknown
): number | null {
  const dataArray = readManufacturerBytes(advertisementData);
  if (!dataArray || dataArray.length < 10) {
    return null;
  }
  const off = signatureOffsetRmng(dataArray);
  if (off < 0 || dataArray.length < off + 10) {
    return null;
  }
  return ((dataArray[off + 4] ?? 0) << 8) | (dataArray[off + 5] ?? 0);
}

export function isRmngBleDeviceForCustomer(
  advertisementData: unknown,
  customerId: number
): boolean {
  const cid = getRmngManufacturerCustomerId(advertisementData);
  return cid !== null && cid === customerId;
}

/**
 * Filters provision scan results to RMNG-signed BLE advertisements with the given customer id.
 */
export function filterEspProvisionDevicesByRmngCustomerId<
  T extends { advertisementData?: unknown },
>(devices: readonly T[], customerId: number): T[] {
  return devices.filter((d) =>
    isRmngBleDeviceForCustomer(d.advertisementData, customerId)
  );
}

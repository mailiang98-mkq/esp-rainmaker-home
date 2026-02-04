/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/** Payload key for parsed event data (SDK contract). */
export const KEY_EVENT_DATA_PAYLOAD = "event_data_payload";

/** Payload key for raw JSON string (Android bridge fallback). */
export const KEY_EVENT_DATA_PAYLOAD_RAW = "event_data_payload_raw";

/**
 * Normalizes notification data so the SDK's transformNotificationData can read it.
 * Pure transformation only; no side effects or store access.
 *
 * Android bridge may not serialize nested maps; native sends event_data_payload_raw
 * (JSON string) as fallback. This helper ensures event_data_payload is always an object.
 *
 * @param data - Raw notification payload from native (event_data_payload may be string or object)
 * @returns Normalized payload with event_data_payload as object for SDK consumption
 */
export function normalizeNotificationPayload(
  data: Record<string, unknown>
): Record<string, unknown> {
  const raw = data[KEY_EVENT_DATA_PAYLOAD_RAW];
  const payload = data[KEY_EVENT_DATA_PAYLOAD];
  const parseSource =
    typeof raw === "string" ? raw : typeof payload === "string" ? payload : null;

  if (parseSource) {
    try {
      const parsed = JSON.parse(parseSource) as Record<string, unknown>;
      const { [KEY_EVENT_DATA_PAYLOAD_RAW]: _, ...rest } = data;
      return { ...rest, [KEY_EVENT_DATA_PAYLOAD]: parsed };
    } catch {
      return data;
    }
  }

  return data;
}

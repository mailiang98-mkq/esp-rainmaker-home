/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TFunction } from "i18next";
import type { RoomType } from "@src/types/global";

const PREDEFINED_ROOM_KEYS = [
  "bedroom",
  "livingRoom",
  "readingRoom",
  "frontYard",
  "backYard",
  "familyRoom",
  "diningRoom",
  "basement",
  "lounge",
  "christmasLights",
  "outdoorLights",
  "kitchen",
  "toilet",
] as const;

/**
 * Returns predefined room options with translated labels.
 * Pure; no side effects.
 */
export function getPredefinedRoomOptions(t: TFunction): RoomType[] {
  return PREDEFINED_ROOM_KEYS.map((key) => ({
    key,
    label: t("group.customizeRoomName.roomNames." + key),
  }));
}

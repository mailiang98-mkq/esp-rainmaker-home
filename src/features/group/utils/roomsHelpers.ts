/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ESPCDFGroup } from "@store";
import {
  isDeviceTypeSubgroup,
  isRoomSubgroup,
} from "@features/group/utils/controlGroupHelpers";

/**
 * Returns rooms deduplicated by id (first occurrence kept).
 * Pure; no side effects.
 */
export function getUniqueRooms(rooms: ESPCDFGroup[]): ESPCDFGroup[] {
  return rooms.reduce((acc, room) => {
    if (!acc.find((existing) => existing.id === room.id)) {
      acc.push(room);
    }
    return acc;
  }, [] as ESPCDFGroup[]);
}

/**
 * Room-style subgroups only (excludes device-type groups).
 */
export function getRoomSubGroups(subGroups: ESPCDFGroup[]): ESPCDFGroup[] {
  return getUniqueRooms(subGroups.filter(isRoomSubgroup));
}

/**
 * Device-type subgroups only.
 */
export function getDeviceGroupSubGroups(subGroups: ESPCDFGroup[]): ESPCDFGroup[] {
  return getUniqueRooms(subGroups.filter(isDeviceTypeSubgroup));
}

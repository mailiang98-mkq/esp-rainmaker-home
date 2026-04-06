/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ESPCDFGroup } from "@store";

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

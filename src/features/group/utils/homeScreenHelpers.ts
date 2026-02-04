/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TFunction } from "i18next";
import type { RoomTab } from "@src/types/global";

/**
 * Returns default home tabs (e.g. "Common" for all devices).
 * Pure; no side effects.
 */
export function getDefaultHomeTabs(t: TFunction): RoomTab[] {
  return [{ label: t("group.home.commonTab"), id: "common" }];
}

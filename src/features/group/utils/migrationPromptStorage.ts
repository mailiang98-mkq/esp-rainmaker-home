/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ESPCDFUser, ESPCDFUserCustomDataRequest } from "@store";
import { USER_PERMISSION } from "@shared/utils/constants";

/** Top-level user custom data key for rainmaker-home-app (rainmaker-base-sdk). Nested keys live under its value. */
export const RAINMAKER_HOME_APP_CUSTOM_DATA_KEY = "rainmaker-home-app";

/** Key under rainmaker-home-app for migration prompt read state */
export const MIGRATION_PROMPT_CUSTOM_DATA_KEY = "hasReadMigrationPrompt";

export interface RainMakerUserState {
  isRainMaker: boolean;
  hasReadMigrationPrompt: boolean;
}

const DEFAULT_RAINMAKER_STATE: RainMakerUserState = {
  isRainMaker: true,
  hasReadMigrationPrompt: false,
};

/**
 * Reads the RainMaker user state from the user's custom data (rainmaker-base-sdk adaptor).
 * State is read from customData[rainmaker-home-app].value.hasReadMigrationPrompt.
 * Returns default state when user is null or custom data is not yet loaded.
 */
export function getRainMakerUserState(
  user: ESPCDFUser | null
): RainMakerUserState {
  if (!user?.customData) {
    return DEFAULT_RAINMAKER_STATE;
  }
  const appData = user.customData[RAINMAKER_HOME_APP_CUSTOM_DATA_KEY]?.value as Record<string, unknown> | undefined;
  const hasReadMigrationPrompt = appData?.[MIGRATION_PROMPT_CUSTOM_DATA_KEY] === true;
  return {
    ...DEFAULT_RAINMAKER_STATE,
    hasReadMigrationPrompt,
  };
}

/**
 * Persists RainMaker user state to the user's custom data (rainmaker-base-sdk adaptor).
 * Stored under customData[rainmaker-home-app].value; merges with existing keys under that object.
 */
export async function setRainMakerUserState(
  user: ESPCDFUser,
  state: Partial<RainMakerUserState>
): Promise<void> {
  if (state.hasReadMigrationPrompt === undefined) return;

  const existing = (user.customData?.[RAINMAKER_HOME_APP_CUSTOM_DATA_KEY]?.value ?? {}) as Record<string, unknown>;
  const nextAppData = {
    ...existing,
    [MIGRATION_PROMPT_CUSTOM_DATA_KEY]: state.hasReadMigrationPrompt,
  };

  const updatePayload: ESPCDFUserCustomDataRequest = {
    [RAINMAKER_HOME_APP_CUSTOM_DATA_KEY]: {
      value: nextAppData,
      perms: [
        { read: [USER_PERMISSION] },
        { write: [USER_PERMISSION] },
      ],
    },
  };
  await user.setCustomData(updatePayload);
}

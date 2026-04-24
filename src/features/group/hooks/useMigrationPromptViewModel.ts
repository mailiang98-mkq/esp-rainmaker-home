/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from "react";
import type { ESPCDF, ESPCDFUser } from "@store";
import { ESPRMBaseAdaptorIdentifier } from "@config/sdk.identifiers";
import {
  getRainMakerUserState,
  setRainMakerUserState,
} from "@features/group/utils/migrationPromptStorage";

export interface UseMigrationPromptViewModelParams {
  store: ESPCDF | undefined;
  unifiedUser: ESPCDFUser | null | undefined;
}

export interface UseMigrationPromptViewModelResult {
  showMigrationPrompt: boolean;
  handleMigrationPromptUnderstood: () => Promise<void>;
}

/**
 * View model hook for the migration prompt on the Home screen.
 * Shows the prompt once per user when logged in with the ESPRM base adaptor,
 * until the user acknowledges it (state persisted in user custom data).
 */
export function useMigrationPromptViewModel({
  store,
  unifiedUser,
}: UseMigrationPromptViewModelParams): UseMigrationPromptViewModelResult {
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);

  useEffect(() => {
    const activeAdaptor = store?.sdkAdaptorRegistry.getActiveAdaptor();
    if (activeAdaptor?._identifier !== ESPRMBaseAdaptorIdentifier) return;
    if (!unifiedUser) return;

    const state = getRainMakerUserState(unifiedUser);
    if (!state.hasReadMigrationPrompt) {
      setShowMigrationPrompt(true);
    }
  }, [unifiedUser, store?.sdkAdaptorRegistry]);

  const handleMigrationPromptUnderstood = useCallback(async () => {
    if (unifiedUser) {
      await setRainMakerUserState(unifiedUser, { hasReadMigrationPrompt: true });
    }
    setShowMigrationPrompt(false);
  }, [unifiedUser]);

  return {
    showMigrationPrompt,
    handleMigrationPromptUnderstood,
  };
}

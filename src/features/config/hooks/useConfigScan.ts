/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useContext, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import { runtimeConfigManager } from "@config/runtime.config";
import { cdfBootstrap } from "@integrations";
import type { SDKConfig } from "@config/runtime.config";
import asyncStorageAdapter from "@native-adaptors/implementations/ESPAsyncStorage";
import { AppRestartContext } from "@context/appRestart.context";
import { resolveConfigFromScan } from "@features/config/utils/configScan";
import type { ConfigScanPhase } from "@src/types/global";

export interface UseConfigScanReturn {
  phase: ConfigScanPhase;
  errorMessage: string;
  showScanner: boolean;
  setShowScanner: (show: boolean) => void;
  permission: { granted: boolean } | null;
  requestPermission: () => void;
  handleScan: (scannedValue: string) => Promise<void>;
  handleRetry: () => void;
  handleUpdateConfig: () => void;
  handleCancel: () => void;
  handleBackFromScanner: () => void;
}

/**
 * Hook for config scan flow: state and handlers.
 * Single responsibility: manage scan lifecycle.
 */
export function useConfigScan(): UseConfigScanReturn {
  const router = useRouter();
  const { restartApp } = useContext(AppRestartContext);
  const [permission, requestPermission] = useCameraPermissions();

  const [phase, setPhase] = useState<ConfigScanPhase>("info");
  const [errorMessage, setErrorMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const scannedRef = useRef(false);

  /* 
  * Handle scan
  * @param scannedValue - The scanned value to handle
  * @returns void
  */
  const handleScan = useCallback(
    async (scannedValue: string) => {
      if (scannedRef.current) return;
      scannedRef.current = true;

      try {
        const json = await resolveConfigFromScan(scannedValue, () =>
          setPhase("fetching"),
        );

        setPhase("applying");
        await runtimeConfigManager.applyAndPersist(
          json.sdk,
          json.config as SDKConfig,
        );
        await asyncStorageAdapter.clear();

        setPhase("success");
        cdfBootstrap.reset();
        restartApp();
      } catch (e) {
        setPhase("error");
        setErrorMessage(e instanceof Error ? e.message : String(e));
        scannedRef.current = false;
      }
    },
    [restartApp],
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    setPhase("scanning");
    setErrorMessage("");
    scannedRef.current = false;
  }, []);

  // Handle update config
  const handleUpdateConfig = useCallback(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    setShowScanner(true);
  }, [permission?.granted, requestPermission]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleBackFromScanner = useCallback(() => {
    setShowScanner(false);
  }, []);

  return {
    phase,
    errorMessage,
    showScanner,
    setShowScanner,
    permission,
    requestPermission,
    handleScan,
    handleRetry,
    handleUpdateConfig,
    handleCancel,
    handleBackFromScanner,
  };
}

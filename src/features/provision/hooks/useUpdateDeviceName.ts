/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { useCDF } from "@shared/hooks/useCDF";
import { useToast } from "@shared/hooks/useToast";
import { getSubDeviceInitialDisplayName } from "@shared/utils/device";
import { ESPRM_NAME_PARAM_TYPE } from "@shared/utils/constants";
import type { ESPCDFDevice, ESPCDFNode } from "@store";

export interface UseUpdateDeviceNameReturn {
  /** Display names being edited, keyed by `device.name` (each sub-device on the node). */
  deviceNamesByKey: Record<string, string>;
  setDeviceName: (deviceNameKey: string, name: string) => void;
  getDeviceName: (deviceNameKey: string) => string;
  /** Devices on the provisioned node (for rendering one row per device). */
  deviceList: ESPCDFDevice[];
  isLoading: boolean;
  provisionedNode: ESPCDFNode | null;
  handleContinue: () => Promise<void>;
  /** Skip name edits and go to room selection. */
  handleSkip: () => void;
  /** Leave provision setup and return to home (e.g. after back confirmation). */
  dismissToHome: () => void;
}

/** Post-provision step: set device display name, then go to room selection. */
export const useUpdateDeviceName = (): UseUpdateDeviceNameReturn => {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { store } = useCDF();
  const { nodeId } = useLocalSearchParams<{ nodeId: string }>();

  const [deviceNamesByKey, setDeviceNamesByKey] = useState<Record<string, string>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const lastSyncedNodeIdRef = useRef<string | null>(null);

  const provisionedNode = useMemo(() => {
    if (!nodeId) return null;
    return (
      store?.nodeStore?.nodesList?.find((n) => n.id === nodeId) ?? null
    );
  }, [nodeId, store?.nodeStore?.nodesList]);

  const deviceList = useMemo(
    () => provisionedNode?.devices ?? [],
    [provisionedNode?.devices]
  );

  useEffect(() => {
    if (!provisionedNode) {
      lastSyncedNodeIdRef.current = null;
      setDeviceNamesByKey({});
      return;
    }
    const nodeId = provisionedNode.id;
    const devices = provisionedNode.devices ?? [];
    const deviceKeys = new Set(devices.map((d) => d.name));

    if (lastSyncedNodeIdRef.current !== nodeId) {
      lastSyncedNodeIdRef.current = nodeId;
      const next: Record<string, string> = {};
      for (const d of devices) {
        next[d.name] = getSubDeviceInitialDisplayName(d, provisionedNode);
      }
      setDeviceNamesByKey(next);
      return;
    }

    setDeviceNamesByKey((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const d of devices) {
        if (!(d.name in next)) {
          next[d.name] = getSubDeviceInitialDisplayName(d, provisionedNode);
        }
      }
      for (const k of Object.keys(next)) {
        if (!deviceKeys.has(k)) {
          delete next[k];
        }
      }
      return next;
    });
  }, [provisionedNode]);

  const getDeviceName = useCallback(
    (deviceNameKey: string) => deviceNamesByKey[deviceNameKey] ?? "",
    [deviceNamesByKey]
  );

  const setDeviceName = useCallback((deviceNameKey: string, name: string) => {
    setDeviceNamesByKey((prev) => ({ ...prev, [deviceNameKey]: name }));
  }, []);

  const handleContinue = useCallback(async () => {
    if (!provisionedNode) return;

    const devices = provisionedNode.devices ?? [];
    for (const device of devices) {
      const trimmed = (deviceNamesByKey[device.name] ?? "").trim();
      if (!trimmed) {
        toast.showError(t("device.deviceDetails.nameRequired"));
        return;
      }
    }

    setIsLoading(true);
    try {
      for (const device of devices) {
        const trimmed = (deviceNamesByKey[device.name] ?? "").trim();
        const initialTrimmed = getSubDeviceInitialDisplayName(
          device,
          provisionedNode
        ).trim();
        if (trimmed === initialTrimmed) {
          continue;
        }

        const nameParam = device.params?.find(
          (param) => param.type === ESPRM_NAME_PARAM_TYPE
        );
        if (nameParam) {
          try {
            await (nameParam as { setValue: (v: string) => Promise<void> }).setValue(
              trimmed
            );
            device.displayName = trimmed;
          } catch (e) {
            console.warn("[UpdateDeviceName] Could not set device name:", e);
          }
        }
      }

      router.push({
        pathname: "/(provision)/SelectDeviceRoom" as const,
        params: { nodeId: provisionedNode.id },
      } as any);
    } catch (e) {
      console.error("[UpdateDeviceName] handleContinue error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [
    deviceNamesByKey,
    provisionedNode,
    router,
    t,
    toast,
  ]);

  const handleSkip = useCallback(() => {
    if (!provisionedNode || isLoading) return;
    router.push({
      pathname: "/(provision)/SelectDeviceRoom" as const,
      params: { nodeId: provisionedNode.id },
    } as any);
  }, [isLoading, provisionedNode, router]);

  const dismissToHome = useCallback(() => {
    router.dismissTo("/(group)/Home" as any);
  }, [router]);

  return {
    deviceNamesByKey,
    setDeviceName,
    getDeviceName,
    deviceList,
    isLoading,
    provisionedNode,
    handleContinue,
    handleSkip,
    dismissToHome,
  };
};

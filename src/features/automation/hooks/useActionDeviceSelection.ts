/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useMemo } from "react";
import type { ESPCDFNode, ESPCDFDevice } from "@store";
import { deepClone } from "@shared/utils/common";
import { getEventInfoFromEvents } from "@features/automation/utils/automationManagement";
import { sortByConnectivity } from "@shared/utils/eventDeviceSelection";
import { useCDF } from "@shared/hooks/useCDF";
import { useAutomation } from "@context/automation.context";
import type { DeviceSelectionData } from "@src/types/global";
import { ESPRMNGBaseAdaptorIdentifier } from "@config/sdk.identifiers";

export type SelectActionDeviceResult =
  | { success: true; navigateParams: { pathname: string; params: object } }
  | { success: false };

export interface UseActionDeviceSelectionParams {
  isEditingAction?: string;
}

export interface UseActionDeviceSelectionResult {
  /** All devices for action selection (sorted: online first) */
  devices: DeviceSelectionData[];
  /** Current event info for summary card */
  eventInfo: ReturnType<typeof getEventInfoFromEvents> | null;
  /** Event device from store for display name */
  eventDevice: ESPCDFDevice | null;
  /** Devices currently selected for action */
  selectedDevices: DeviceSelectionData[];
  /** Devices not selected */
  nonSelectedDevices: DeviceSelectionData[];
  /** Select device for action; returns navigate params on success. Caller handles router.push. */
  selectDevice: (device: DeviceSelectionData) => SelectActionDeviceResult;
  /** Remove device from action selection */
  deleteDevice: (device: DeviceSelectionData) => void;
  /** Get actions map for a selected device (param name -> value) */
  getDeviceActions: (device: DeviceSelectionData) => Record<string, unknown>;
  /** Check if device should be disabled (e.g. offline) */
  checkDeviceDisabled: (isConnected: boolean) => { isDisabled: boolean; reason?: "offline" };
  /** True when offline devices should be treated as selectable/normal in UI. */
  allowOfflineSelection: boolean;
}

/**
 * Hook that encapsulates Action Device Selection business logic.
 * No UI side effects (toast, navigation, i18n).
 */
export function useActionDeviceSelection(
  params: UseActionDeviceSelectionParams
): UseActionDeviceSelectionResult {
  const { isEditingAction } = params;
  const { store } = useCDF();
  const {
    state,
    checkDeviceDisabled,
    checkActionExists,
    setSelectedDevice,
    getActionValue,
    deleteAction,
  } = useAutomation();
  const allowOfflineSelection =
    store.getActiveAdaptorIdentifier() === ESPRMNGBaseAdaptorIdentifier;

  const eventInfo = useMemo(
    () => getEventInfoFromEvents(state.events),
    [state.events]
  );

  const devices = useMemo(() => {
    const home = store.getCurrentHome();
    const currentHomeNodes = store.getNodesForCurrentHome();
    if (!home || currentHomeNodes.length === 0) return [];

    const allDevices: DeviceSelectionData[] = [];

    currentHomeNodes.forEach((node) => {
      const nodeDevices = node?.devices ?? [];
      nodeDevices
        .filter((device) => device.params && device.params.length > 0)
        .forEach((device) => {
          allDevices.push({
            node: deepClone(node) as ESPCDFNode,
            device: deepClone(device) as ESPCDFDevice,
            isSelected: checkActionExists(node.id, device.name).exist,
            isMaxSceneReached: false,
          });
        });
    });

    return sortByConnectivity(
      allDevices,
      (d) => d.node.connectivityStatus?.isConnected ?? false
    );
  }, [store, state.actions, state.forceUpdateUI, checkActionExists]);

  const eventDevice = useMemo(() => {
    if (!eventInfo || !state.nodeId) return null;
    const node = store.nodeStore.nodesByIDMap?.[state.nodeId];
    if (!node?.devices) return null;
    return node.devices.find((d) => d.name === eventInfo.deviceName) ?? null;
  }, [eventInfo, state.nodeId, store.nodeStore.nodesByIDMap]);

  const selectedDevices = useMemo(
    () => devices.filter((d) => d.isSelected),
    [devices]
  );

  const nonSelectedDevices = useMemo(
    () => devices.filter((d) => !d.isSelected),
    [devices]
  );

  const selectDevice = useCallback(
    (device: DeviceSelectionData): SelectActionDeviceResult => {
      if (
        !allowOfflineSelection &&
        !device.node.connectivityStatus?.isConnected
      ) {
        return { success: false };
      }
      setSelectedDevice({
        nodeId: device.node.id,
        deviceName: device.device.name,
        displayName: device.device.displayName ?? "",
      });
      return {
        success: true,
        navigateParams: {
          pathname: "/(automation)/ActionDeviceParamSelection",
          params: { isEditingAction: isEditingAction ?? "false" },
        },
      };
    },
    [allowOfflineSelection, isEditingAction, setSelectedDevice]
  );

  const deleteDevice = useCallback(
    (device: DeviceSelectionData) => {
      deleteAction(device.node.id, device.device.name);
    },
    [deleteAction]
  );

  const getDeviceActions = useCallback(
    (device: DeviceSelectionData): Record<string, unknown> => {
      if (!device.isSelected || !device.device.params) return {};
      return device.device.params
        .filter((param) =>
          checkActionExists(device.node.id, device.device.name, param.name).exist
        )
        .reduce(
          (acc, param) => {
            acc[param.name] = getActionValue(
              device.node.id,
              device.device.name,
              param.name
            );
            return acc;
          },
          {} as Record<string, unknown>
        );
    },
    [checkActionExists, getActionValue]
  );

  return {
    devices,
    eventInfo,
    eventDevice,
    selectedDevices,
    nonSelectedDevices,
    selectDevice,
    deleteDevice,
    getDeviceActions,
    checkDeviceDisabled,
    allowOfflineSelection,
  };
}

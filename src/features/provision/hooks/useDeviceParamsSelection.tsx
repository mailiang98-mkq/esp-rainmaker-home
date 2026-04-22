/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import type { ESPCDFDeviceParam } from "@store";
import { useCDF } from "@shared/hooks/useCDF";
import { useScene } from "@context/scenes.context";
import { useSchedule } from "@context/schedules.context";
import { getSelectedDeviceWithParams } from "@features/scene/utils/sceneHelper";
import { filterExcludedParamTypes } from "@shared/utils/paramUtils";
import {
  getScheduleDeviceParams,
  formatParamValueForDisplay,
} from "@features/schedule/utils/scheduleHelper";

export type DeviceParamsSelectionIdentifier = "scene" | "schedule";

type ParamWithValue = ESPCDFDeviceParam & { value: any };

/**
 * Hook for managing device parameters selection logic
 * @param identifier - "scene" or "schedule" to determine which context to use
 * @returns View model containing device data, handlers, and computed values
 */
export const useDeviceParamsSelection = (
  identifier: DeviceParamsSelectionIdentifier = "scene",
) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { store } = useCDF();

  // Get the appropriate context based on identifier
  const sceneContext = useScene();
  const scheduleContext = useSchedule();
  const context = identifier === "scene" ? sceneContext : scheduleContext;

  const {
    state,
    checkActionExists,
    getActionValue,
    setActionValue,
    deleteActionValue,
  } = context;

  // State
  const [selectedParam, setSelectedParam] = useState<ESPCDFDeviceParam | null>(
    null,
  );
  const [paramSheetVisible, setParamSheetVisible] = useState(false);

  // Get selected device from context (set by DeviceSelection)
  const deviceData = useMemo(() => {
    if (identifier === "schedule") {
      // Use schedule-specific params function
      const nodeId = state.selectedDevice?.nodeId;
      if (!nodeId) return { selectedDevice: null, nodeId: "", params: [] };

      const node = store.nodeStore._nodesByIDMap[nodeId];
      if (!node) return { selectedDevice: null, nodeId: "", params: [] };

      const device = node.devices?.find(
        (device) => device.name === state.selectedDevice?.deviceName,
      );
      if (!device) return { selectedDevice: null, nodeId: "", params: [] };

      const params = getScheduleDeviceParams(
        { ...device, name: device.name },
        nodeId,
        getActionValue,
      );

      return { selectedDevice: device, nodeId, params };
    } else {
      // Use default scene helper function
      return getSelectedDeviceWithParams(
        state.selectedDevice,
        store.nodeStore.nodesByIDMap,
        getActionValue,
      );
    }
  }, [
    state.selectedDevice,
    store.nodeStore.nodesByIDMap,
    store.nodeStore._nodesByIDMap,
    getActionValue,
    identifier,
  ]);

  const selectedDevice = deviceData.selectedDevice ?? null;
  const nodeId = deviceData.nodeId ?? "";
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional hook deps
  const rawParams = deviceData.params ?? [];

  // Filtered parameters
  const filteredParams = useMemo<
    (ESPCDFDeviceParam & { value: any })[]
  >(() => {
    // If using schedule params function, params are already filtered and have values
    if (identifier === "schedule") {
      return rawParams as (ESPCDFDeviceParam & { value: any })[];
    }
    const filtered = filterExcludedParamTypes(rawParams) ?? [];
    return filtered as (ESPCDFDeviceParam & { value: any })[];
  }, [rawParams, identifier]);

  // Handlers
  const handleSave = async () => {
    router.back();
  };

  const handleParamValueChange = (value: any) => {
    setSelectedParam((prev) => {
      if (!prev) return null;
      return {
        ...(prev as ESPCDFDeviceParam),
        value: value,
      } as ESPCDFDeviceParam;
    });
  };

  const handleParamSelect = (param: ESPCDFDeviceParam) => {
    setSelectedParam(param);
    setParamSheetVisible(true);
  };

  const handleParamSheetClose = () => {
    setParamSheetVisible(false);
    setSelectedParam(null);
  };

  const handleParamSave = () => {
    if (!selectedParam || !selectedDevice) return;
    setActionValue(
      nodeId,
      selectedDevice.name,
      selectedParam.name,
      selectedParam.value,
    );
    handleParamSheetClose();
  };

  const handleParamDelete = () => {
    if (!selectedParam || !selectedDevice) return;
    deleteActionValue(nodeId, selectedDevice.name, selectedParam.name);
    handleParamSheetClose();
  };

  const shouldShowDelete = useMemo(() => {
    if (!selectedParam || !selectedDevice) return false;
    return checkActionExists(nodeId, selectedDevice.name, selectedParam.name)
      .exist;
  }, [selectedParam, selectedDevice, nodeId, checkActionExists]);

  // Format parameter value for display (schedule-specific)
  const renderParamValue = (param: ParamWithValue): string => {
    if (identifier !== "schedule") return "";
    if (!checkActionExists(nodeId, selectedDevice?.name, param.name).exist) {
      return "";
    }
    return formatParamValueForDisplay(param.value, t);
  };

  // Check if action exists for parameter (schedule-specific)
  const hasActionForParam = (paramName: string) => {
    return checkActionExists(nodeId, selectedDevice?.name || "", paramName)
      .exist;
  };

  return {
    // Data
    selectedDevice,
    nodeId,
    params: filteredParams,

    // Modal state
    selectedParam: selectedParam as ParamWithValue | null,
    paramSheetVisible,

    // Handlers
    handleSave,
    handleParamSelect,
    handleParamSheetClose,
    handleParamSave,
    handleParamDelete,
    handleParamValueChange,

    // Computed
    shouldShowDelete,
    disableActionButton: !selectedDevice,

    // Context methods
    checkActionExists,
    getActionValue,

    // Schedule-specific
    renderParamValue,
    hasActionForParam,
    setParamSheetVisible,
  };
};

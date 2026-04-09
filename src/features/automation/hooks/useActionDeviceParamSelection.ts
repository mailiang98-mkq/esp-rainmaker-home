/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback } from "react";
import type { ESPCDFDeviceParam, ESPCDFDevice } from "@store";
import { defaultWritableParamValue, filterExcludedParamTypes } from "@shared/utils/paramUtils";
import { ESPRM_PARAM_WRITE_PROPERTY } from "@shared/utils/constants";
import { useCDF } from "@shared/hooks/useCDF";
import { useAutomation } from "@context/automation.context";

export interface UseActionDeviceParamSelectionResult {
  /** Selected device from context (action device) */
  selectedDevice: ESPCDFDevice | null;
  /** Node ID of selected device */
  nodeId: string;
  /** Filtered writable params with values from context or default */
  params: ESPCDFDeviceParam[];
  /** Currently selected param in the sheet */
  selectedParam: ESPCDFDeviceParam | null;
  setSelectedParam: React.Dispatch<React.SetStateAction<ESPCDFDeviceParam | null>>;
  /** Sheet visible */
  paramSheetVisible: boolean;
  setParamSheetVisible: React.Dispatch<React.SetStateAction<boolean>>;
  /** Whether Done button should be disabled */
  disableActionButton: boolean;
  /** Whether param has action configured (for display) */
  paramHasAction: (paramName: string) => boolean;
  /** Get action value for param (for display) */
  getParamValue: (paramName: string) => unknown;
  /** Open sheet for param */
  handleParamSelect: (param: ESPCDFDeviceParam) => void;
  /** Close sheet */
  handleParamSheetClose: () => void;
  /** Save param value to context and close sheet */
  handleParamSave: () => void;
  /** Delete param from action and close sheet */
  handleParamDelete: () => void;
  /** Update value when param control changes (local state only until save) */
  handleParamValueChange: (value: unknown) => void;
}

/**
 * Hook that encapsulates Action Device Param Selection business logic.
 * No UI side effects (toast, navigation, i18n).
 */
export function useActionDeviceParamSelection(): UseActionDeviceParamSelectionResult {
  const { store } = useCDF();
  const {
    state,
    checkActionExists,
    getActionValue,
    setActionValue,
    deleteActionValue,
  } = useAutomation();

  const [selectedParam, setSelectedParam] = useState<ESPCDFDeviceParam | null>(null);
  const [paramSheetVisible, setParamSheetVisible] = useState(false);

  const { selectedDevice = null, nodeId = "", params: paramsList = [] } = useMemo(() => {
    const nId = state.selectedDevice?.nodeId;
    if (!nId) return {};
    const node = store.nodeStore.nodesByIDMap?.[nId];
    if (!node) return {};
    const device = node.devices?.find(
      (d) => d.name === state.selectedDevice?.deviceName
    );
    if (!device) return {};

    const withValues = (device.params ?? []).map((param) => ({
      ...param,
      value:
        getActionValue(nId, device.name, param.name) ??
        defaultWritableParamValue(param),
    }));
    const filtered = filterExcludedParamTypes(withValues as ESPCDFDeviceParam[]);
    const writable =
      filtered?.filter((param) =>
        param.properties?.includes(ESPRM_PARAM_WRITE_PROPERTY)
      ) ?? [];

    return { selectedDevice: device, nodeId: nId, params: writable };
  }, [state.selectedDevice, state.actions, store.nodeStore.nodesByIDMap, getActionValue]);

  const disableActionButton = !selectedDevice;

  const paramHasAction = useCallback(
    (paramName: string) =>
      checkActionExists(nodeId, selectedDevice?.name ?? "", paramName).exist,
    [nodeId, selectedDevice?.name, checkActionExists]
  );

  const getParamValue = useCallback(
    (paramName: string) =>
      getActionValue(nodeId, selectedDevice?.name ?? "", paramName),
    [nodeId, selectedDevice?.name, getActionValue]
  );

  const handleParamSelect = useCallback((param: ESPCDFDeviceParam) => {
    setSelectedParam(param);
    setParamSheetVisible(true);
  }, []);

  const handleParamSheetClose = useCallback(() => {
    setParamSheetVisible(false);
    setSelectedParam(null);
  }, []);

  const handleParamSave = useCallback(() => {
    if (!nodeId || !selectedDevice?.name || !selectedParam?.name) return;
    setActionValue(nodeId, selectedDevice.name, selectedParam.name, selectedParam.value);
    setParamSheetVisible(false);
    setSelectedParam(null);
  }, [nodeId, selectedDevice?.name, selectedParam, setActionValue]);

  const handleParamDelete = useCallback(() => {
    if (!nodeId || !selectedDevice?.name || !selectedParam?.name) return;
    deleteActionValue(nodeId, selectedDevice.name, selectedParam.name);
    setParamSheetVisible(false);
    setSelectedParam(null);
  }, [nodeId, selectedDevice?.name, selectedParam?.name, deleteActionValue]);

  const handleParamValueChange = useCallback((value: unknown) => {
    setSelectedParam((prev) => {
      if (!prev) return null;
      return { ...prev, value } as ESPCDFDeviceParam;
    });
  }, []);

  return {
    selectedDevice,
    nodeId,
    params: (paramsList ?? []) as ESPCDFDeviceParam[],
    selectedParam,
    setSelectedParam,
    paramSheetVisible,
    setParamSheetVisible,
    disableActionButton,
    paramHasAction,
    getParamValue,
    handleParamSelect,
    handleParamSheetClose,
    handleParamSave,
    handleParamDelete,
    handleParamValueChange,
  };
}

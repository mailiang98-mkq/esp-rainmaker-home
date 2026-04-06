/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import type {
  ESPCDFDeviceParam,
  ESPCDFDevice,
  ESPCDFAutomationNodeParamsEvent,
} from "@store";
import { ESPCDFAutomationConditionOperator } from "@store";
import { defaultValueBasedOnParamDataType, filterExcludedParamTypes } from "@shared/utils/paramUtils";
import { useCDF } from "@shared/hooks/useCDF";
import { useAutomation } from "@context/automation.context";

export interface UseEventDeviceParamSelectionParams {
  isEditingEvent?: string;
}

export interface UseEventDeviceParamSelectionResult {
  /** Selected device from context (event device) */
  selectedDevice: ESPCDFDevice | null;
  /** Filtered params with default values for display */
  params: ESPCDFDeviceParam[];
  /** Currently selected param in the sheet */
  selectedParam: ESPCDFDeviceParam | null;
  setSelectedParam: React.Dispatch<React.SetStateAction<ESPCDFDeviceParam | null>>;
  /** Sheet visible */
  paramSheetVisible: boolean;
  setParamSheetVisible: React.Dispatch<React.SetStateAction<boolean>>;
  /** Current event condition operator */
  eventCondition: string;
  setEventCondition: React.Dispatch<React.SetStateAction<string>>;
  /** Current event trigger value */
  eventValue: unknown;
  setEventValue: React.Dispatch<React.SetStateAction<unknown>>;
  /** Param name that has the event configured */
  activeEventParam: string | null;
  /** Whether Done button should be disabled */
  disableActionButton: boolean;
  /** Create/save event and persist to context. Caller navigates after. */
  createEvent: () => void;
  /** Open sheet for param and set as selected */
  handleParamSelect: (param: ESPCDFDeviceParam) => void;
  /** Close sheet */
  handleParamSheetClose: () => void;
  /** Save condition from sheet and set active param */
  handleEventConditionSave: () => void;
  /** Update value when param control changes */
  handleParamValueChange: (value: unknown) => void;
  /** Is editing existing event */
  isEditing: boolean;
}

/**
 * Hook that encapsulates Event Device Param Selection business logic.
 * No UI side effects (toast, navigation, i18n).
 */
export function useEventDeviceParamSelection(
  params: UseEventDeviceParamSelectionParams
): UseEventDeviceParamSelectionResult {
  const { isEditingEvent } = params;
  const { store } = useCDF();
  const { state, addEvent, updateEvent, setNodeId } = useAutomation();

  const isEditing = isEditingEvent === "true";

  const [selectedParam, setSelectedParam] = useState<ESPCDFDeviceParam | null>(null);
  const [paramSheetVisible, setParamSheetVisible] = useState(false);
  const [eventCondition, setEventCondition] = useState<string>(
    ESPCDFAutomationConditionOperator.EQUAL
  );
  const [eventValue, setEventValue] = useState<unknown>(null);
  const [activeEventParam, setActiveEventParam] = useState<string | null>(null);

  const { selectedDevice = null, params: paramsList = [] } = useMemo(() => {
    const nodeId = state.selectedEventDevice?.nodeId;
    if (!nodeId) return {};
    const node = store.nodeStore.nodesByIDMap?.[nodeId];
    if (!node) return {};
    const device = node.devices?.find(
      (d) => d.name === state.selectedEventDevice?.deviceName
    );
    if (!device) return {};

    const withDefaults = (device.params ?? []).map((param) => ({
      ...param,
      value: defaultValueBasedOnParamDataType(param.dataType ?? ""),
    }));
    const filtered = filterExcludedParamTypes(withDefaults as ESPCDFDeviceParam[]);

    return { selectedDevice: device, params: filtered ?? [] };
  }, [state.selectedEventDevice, store.nodeStore.nodesByIDMap]);

  useEffect(() => {
    if (!state.events?.length) return;
    const event = state.events[0];
    if (
      typeof event === "object" &&
      event !== null &&
      "deviceName" in event &&
      state.nodeId === state.selectedEventDevice?.nodeId
    ) {
      const nodeParamsEvent = event as ESPCDFAutomationNodeParamsEvent;
      if (nodeParamsEvent.deviceName === selectedDevice?.name) {
        setActiveEventParam(nodeParamsEvent.param);
        setEventCondition(nodeParamsEvent.check);
        setEventValue(nodeParamsEvent.value);
      }
    }
  }, [state.events, state.nodeId, state.selectedEventDevice?.nodeId, selectedDevice?.name]);

  const disableActionButton =
    !selectedDevice || !activeEventParam || eventValue === null;

  const createEvent = useCallback(() => {
    if (!activeEventParam || !selectedDevice || eventValue === null) return;

    const automationEvent: ESPCDFAutomationNodeParamsEvent = {
      deviceName: selectedDevice.name,
      param: activeEventParam,
      check: eventCondition as ESPCDFAutomationConditionOperator,
      value: eventValue,
    };

    if (isEditing && state.events.length > 0) {
      updateEvent(0, automationEvent);
    } else {
      addEvent(automationEvent);
    }

    const nodeId = state.selectedEventDevice?.nodeId;
    if (nodeId) setNodeId(nodeId);
  }, [
    activeEventParam,
    selectedDevice,
    eventValue,
    eventCondition,
    isEditing,
    state.events.length,
    state.selectedEventDevice?.nodeId,
    addEvent,
    updateEvent,
    setNodeId,
  ]);

  const handleParamSelect = useCallback((param: ESPCDFDeviceParam) => {
    setActiveEventParam(null);
    setSelectedParam(param);
    setEventValue(param.value);
    setEventCondition(ESPCDFAutomationConditionOperator.EQUAL);
    setParamSheetVisible(true);
  }, []);

  const handleParamSheetClose = useCallback(() => {
    setParamSheetVisible(false);
    setSelectedParam(null);
  }, []);

  const handleEventConditionSave = useCallback(() => {
    if (selectedParam) setActiveEventParam(selectedParam.name);
    setParamSheetVisible(false);
    setSelectedParam(null);
  }, [selectedParam]);

  const handleParamValueChange = useCallback((value: unknown) => {
    setEventValue(value);
    setSelectedParam((prev) => {
      if (!prev) return null;
      return { ...prev, value } as ESPCDFDeviceParam;
    });
  }, []);

  return {
    selectedDevice,
    params: (paramsList ?? []) as ESPCDFDeviceParam[],
    selectedParam,
    setSelectedParam,
    paramSheetVisible,
    setParamSheetVisible,
    eventCondition,
    setEventCondition,
    eventValue,
    setEventValue,
    activeEventParam,
    disableActionButton,
    createEvent,
    handleParamSelect,
    handleParamSheetClose,
    handleEventConditionSave,
    handleParamValueChange,
    isEditing,
  };
}

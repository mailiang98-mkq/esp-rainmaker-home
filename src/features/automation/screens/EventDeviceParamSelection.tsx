/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { getConditionLabel } from "@features/automation/utils/automationConditionUtils";
import { useEventDeviceParamSelection } from "@features/automation/hooks";
import { getParamControlComponent } from "@shared/utils/paramUtils";
import {
  getAvailableEventConditions,
  shouldShowConditionSelector,
} from "@features/automation/utils/eventDeviceParamSelection";
import { Header, ScreenWrapper } from "@shared/components";
import {
  EventDeviceParamSelectionParamList,
  EventDeviceParamSelectionDoneButton,
  EventDeviceParamSelectionParamSheet,
} from "@features/automation/components";
import type { ESPCDFDeviceParam } from "@store";

/**
 * EventDeviceParamSelection Screen – UI / presentation layer.
 * Business logic in useEventDeviceParamSelection and utils.
 * Handles navigation and translations; hook returns structured results.
 */
export const EventDeviceParamSelectionScreen = observer(() => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isEditingEvent } = useLocalSearchParams<{
    isEditingEvent?: string;
  }>();

  const {
    params,
    activeEventParam,
    selectedParam,
    paramSheetVisible,
    eventCondition,
    eventValue,
    disableActionButton,
    createEvent,
    handleParamSelect,
    handleParamSheetClose,
    handleEventConditionSave,
    handleParamValueChange,
    setEventCondition,
  } = useEventDeviceParamSelection({ isEditingEvent });

  const getParamDisplayValue = useCallback(
    (param: ESPCDFDeviceParam): string => {
      if (activeEventParam !== param.name || eventValue === null) return "";

      const displayValue =
        typeof eventValue === "boolean"
          ? eventValue
            ? t("automation.eventParamSelection.parameterOn")
            : t("automation.eventParamSelection.parameterOff")
          : String(eventValue);
      return `${getConditionLabel(eventCondition, t)} ${displayValue}`;
    },
    [activeEventParam, eventValue, eventCondition, t],
  );

  const handleDone = useCallback(() => {
    createEvent();
    router.dismissTo("/(automation)/CreateAutomation");
  }, [createEvent, router]);

  const renderParamControl = useCallback((param: ESPCDFDeviceParam) => {
    const Control = getParamControlComponent(param);
    if (!Control) return null;
    return <Control />;
  }, []);

  const conditionOptions = useMemo(() => getAvailableEventConditions(), []);
  const showConditionSelector = selectedParam
    ? shouldShowConditionSelector(selectedParam.dataType)
    : false;

  return (
    <>
      <Header
        label={t("automation.eventParamSelection.title")}
        showBack={true}
      />
      <ScreenWrapper style={globalStyles.automationScreenContainerPadded}>
        <EventDeviceParamSelectionParamList
          params={params}
          activeEventParam={activeEventParam}
          getParamDisplayValue={getParamDisplayValue}
          onParamPress={handleParamSelect}
        />
        <EventDeviceParamSelectionDoneButton
          disabled={disableActionButton}
          label={t("layout.shared.done")}
          onPress={handleDone}
        />
      </ScreenWrapper>

      <EventDeviceParamSelectionParamSheet
        visible={paramSheetVisible}
        selectedParam={selectedParam}
        eventCondition={eventCondition}
        conditionOptions={conditionOptions}
        showConditionSelector={showConditionSelector}
        conditionLabel={t("automation.eventParamSelection.condition")}
        saveLabel={t("layout.shared.save")}
        onClose={handleParamSheetClose}
        onValueChange={handleParamValueChange}
        onConditionChange={setEventCondition}
        onSave={handleEventConditionSave}
        renderParamControl={renderParamControl}
      />
    </>
  );
});

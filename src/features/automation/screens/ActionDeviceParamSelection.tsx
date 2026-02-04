/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { useActionDeviceParamSelection } from "@features/automation/hooks";
import { getParamControlComponent } from "@shared/utils/paramUtils";
import { Header, ScreenWrapper } from "@shared/components";
import {
  EventDeviceParamSelectionDoneButton,
  ActionDeviceParamSelectionEmptyState,
  ActionDeviceParamSelectionParamList,
  ActionDeviceParamSelectionParamSheet,
} from "@features/automation/components";
import type { ESPCDFDeviceParam } from "@store";

/**
 * ActionDeviceParamSelection Screen – UI / presentation layer.
 * Business logic in useActionDeviceParamSelection and utils.
 * Handles navigation and translations; hook returns structured results.
 */
export const ActionDeviceParamSelectionScreen = observer(() => {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    selectedDevice,
    params,
    selectedParam,
    paramSheetVisible,
    disableActionButton,
    paramHasAction,
    getParamValue,
    handleParamSelect,
    handleParamSheetClose,
    handleParamSave,
    handleParamDelete,
    handleParamValueChange,
  } = useActionDeviceParamSelection();

  const getParamDisplayValue = useCallback(
    (param: ESPCDFDeviceParam): string => {
      if (!paramHasAction(param.name)) return "";

      const value = getParamValue(param.name);
      if (value === undefined || value === null) return "";

      if (typeof value === "boolean") {
        return value
          ? t("automation.actionParamSelection.parameterOn")
          : t("automation.actionParamSelection.parameterOff");
      }
      return String(value);
    },
    [paramHasAction, getParamValue, t],
  );

  const handleDone = useCallback(() => {
    router.back();
  }, [router]);

  const renderParamControl = useCallback((param: ESPCDFDeviceParam) => {
    const Control = getParamControlComponent(param);
    if (!Control) return null;
    return <Control />;
  }, []);

  const showDeleteButton =
    !!selectedParam && paramHasAction(selectedParam.name);

  const emptyStateTitle = t(
    "automation.actionParamSelection.incompatibleParamsTitle",
    { deviceName: selectedDevice?.displayName },
  );

  return (
    <>
      <Header
        label={t("automation.actionParamSelection.title")}
        showBack={true}
        qaId="header_action_device_params_selection"
      />
      <ScreenWrapper
        style={globalStyles.automationScreenContainerPadded}
        qaId="screen_wrapper_action_device_params_selection"
      >
        {params.length === 0 ? (
          <ActionDeviceParamSelectionEmptyState title={emptyStateTitle} />
        ) : (
          <>
            <ActionDeviceParamSelectionParamList
              params={params}
              getParamDisplayValue={getParamDisplayValue}
              onParamPress={handleParamSelect}
            />
            <EventDeviceParamSelectionDoneButton
              disabled={disableActionButton}
              label={t("layout.shared.done")}
              onPress={handleDone}
            />
          </>
        )}
      </ScreenWrapper>

      <ActionDeviceParamSelectionParamSheet
        visible={paramSheetVisible}
        selectedParam={selectedParam}
        showDeleteButton={showDeleteButton}
        saveLabel={t("layout.shared.save")}
        deleteLabel={t("layout.shared.delete")}
        onClose={handleParamSheetClose}
        onValueChange={handleParamValueChange}
        onSave={handleParamSave}
        onDelete={handleParamDelete}
        renderParamControl={renderParamControl}
      />
    </>
  );
});

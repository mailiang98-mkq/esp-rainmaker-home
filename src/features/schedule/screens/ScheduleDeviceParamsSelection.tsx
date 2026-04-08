/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Styles
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Hooks
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { useDeviceParamsSelection } from "@features/provision/hooks";

// Components
import { Header, ScreenWrapper } from "@shared/components";
import {
  ScheduleDeviceParamsEmptyState,
  ScheduleParamsList,
  ScheduleParamConfigModal,
  ScheduleParamsSaveButton,
} from "@features/schedule/components";

/**
 * ScheduleDeviceParamsSelectionScreen
 *
 * A screen component that allows users to configure parameters for selected devices in schedules.
 * It displays selected devices and their parameters with bottom sheet configuration.
 *
 * Features:
 * - Lists selected devices and their parameters
 * - Allows parameter selection and value adjustment
 * - Groups parameters by type
 * - Bottom sheet for parameter configuration
 * - Handles online/offline device states
 */
export const ScheduleDeviceParamsSelectionScreen = observer(() => {
  const { t } = useTranslation();
  const {
    selectedDevice,
    params,
    selectedParam,
    paramSheetVisible,
    renderParamValue,
    handleParamValueChange,
    handleParamSelect,
    handleParamSheetClose,
    handleParamSave,
    handleParamDelete,
    handleSave,
    hasActionForParam,
  } = useDeviceParamsSelection("schedule");

  const disableActionButton = !selectedDevice;

  if (!selectedDevice) {
    return <ScheduleDeviceParamsEmptyState type="noDevice" />;
  }

  return (
    <>
      <Header
        label={t("schedule.deviceParamsSelection.title")}
        showBack={true}
        qaId="header_schedule_device_params_selection"
      />
      <ScreenWrapper
        style={{
          ...globalStyles.container,
          padding: tokens.spacing._15,
        }}
        qaId="screen_wrapper_schedule_device_params_selection"
      >
        {/* Main Content */}
        {params.length === 0 ? (
          <ScheduleDeviceParamsEmptyState
            type="noCompatibleParams"
            deviceName={selectedDevice.displayName || selectedDevice.name}
          />
        ) : (
          <>
            <ScheduleParamsList
              params={params}
              renderParamValue={renderParamValue}
              onParamSelect={handleParamSelect}
            />

            {/* SAVE ACTION */}
            <ScheduleParamsSaveButton
              disabled={disableActionButton}
              onPress={handleSave}
            />
          </>
        )}
      </ScreenWrapper>

      {/* Parameter Configuration Bottom Sheet */}
      <ScheduleParamConfigModal
        visible={paramSheetVisible}
        selectedParam={selectedParam}
        hasActionForParam={hasActionForParam}
        onClose={handleParamSheetClose}
        onValueChange={handleParamValueChange}
        onSave={handleParamSave}
        onDelete={handleParamDelete}
      />
    </>
  );
});

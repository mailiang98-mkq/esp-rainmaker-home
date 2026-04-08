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
  ParameterConfigModal,
  DeviceParamsSelectionEmptyState,
  DeviceParamsList,
  DeviceParamsSaveButton,
} from "@features/scene/components";

/**
 * SceneDeviceParamsSelection Component
 *
 * A screen component that allows users to configure parameters for selected devices.
 * It displays selected devices and their parameters with bottom sheet configuration.
 *
 * Features:
 * - Lists selected devices and their parameters
 * - Allows parameter selection and value adjustment
 * - Groups parameters by type
 * - Bottom sheet for parameter configuration
 * - Handles online/offline device states
 */
const SceneDeviceParamsSelection = observer(() => {
  const { t } = useTranslation();

  const {
    selectedDevice,
    nodeId,
    params,
    selectedParam,
    paramSheetVisible,
    handleSave,
    handleParamSelect,
    handleParamSheetClose,
    handleParamSave,
    handleParamDelete,
    handleParamValueChange,
    shouldShowDelete,
    disableActionButton,
    checkActionExists,
    getActionValue,
  } = useDeviceParamsSelection("scene");

  if (!selectedDevice) {
    return <DeviceParamsSelectionEmptyState />;
  }

  return (
    <>
      <Header
        label={t("scene.deviceParamsSelection.title")}
        showBack={true}
        qaId="header_device_params_selection"
      />
      <ScreenWrapper
        style={{
          ...globalStyles.container,
          padding: tokens.spacing._15,
        }}
        qaId="screen_wrapper_device_params_selection"
      >
        <DeviceParamsList
          params={params}
          nodeId={nodeId}
          deviceName={selectedDevice.name}
          onParamSelect={handleParamSelect}
          checkActionExists={checkActionExists}
          getActionValue={getActionValue}
        />

        <DeviceParamsSaveButton
          onPress={handleSave}
          disabled={disableActionButton}
        />
      </ScreenWrapper>

      {/* Parameter Configuration Bottom Sheet */}
      <ParameterConfigModal
        visible={paramSheetVisible}
        param={selectedParam}
        showDelete={shouldShowDelete}
        onClose={handleParamSheetClose}
        onSave={handleParamSave}
        onDelete={handleParamDelete}
        onValueChange={handleParamValueChange}
      />
    </>
  );
});

export default SceneDeviceParamsSelection;

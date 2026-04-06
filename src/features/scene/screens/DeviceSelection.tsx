/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";

// Styles
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Components
import { Header, ScreenWrapper } from "@shared/components";
import {
  DeviceSelectionEmptyState,
  DeviceSelectionFooter,
} from "@features/scene/components";
import DeviceSelectionList from "@shared/components/DeviceSelectionList";
import type { DeviceSelectionData } from "@src/types/global";

// Hooks
import { useDeviceSelection } from "@features/provision/hooks";

/**
 * DeviceSelection Component
 *
 * A screen component that allows users to select devices for creating scenes.
 * It displays available devices with their selection state and online status.
 *
 * Features:
 * - Lists all available devices
 * - Allows device selection/deselection
 * - Handles online/offline device states
 * - Shows device connectivity status
 * - Simple device list without parameter conflicts
 */
const DeviceSelection = observer(() => {
  const { t } = useTranslation();
  const {
    devices,
    selectedDevices,
    nonSelectedDevices,
    handleDeviceSelect,
    handleDeviceDelete,
    getDeviceActionsForDevice,
    isDeviceDisabled,
    isDeviceOnline,
  } = useDeviceSelection("scene");

  return (
    <>
      <Header
        label={t("scene.deviceSelection.title")}
        showBack={true}
        qaId="header_scene_device_selection"
      />
      <ScreenWrapper
        style={{
          ...globalStyles.container,
          padding: 0,
        }}
        qaId="screen_wrapper_scene_device_selection"
      >
        {devices.length === 0 ? (
          <DeviceSelectionEmptyState />
        ) : (
          <>
            <DeviceSelectionList
              identifier="scene"
              selectedDevices={selectedDevices as DeviceSelectionData[]}
              nonSelectedDevices={nonSelectedDevices as DeviceSelectionData[]}
              getDeviceActions={getDeviceActionsForDevice}
              isDeviceDisabled={isDeviceDisabled}
              isDeviceOnline={isDeviceOnline}
              onDeviceSelect={handleDeviceSelect}
              onDeviceDelete={handleDeviceDelete}
            />
            <DeviceSelectionFooter
              selectedDevicesCount={selectedDevices.length}
            />
          </>
        )}
      </ScreenWrapper>
    </>
  );
});

export default DeviceSelection;

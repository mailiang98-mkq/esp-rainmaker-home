/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";

// Styles
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Components
import { DeviceSelectionList, Header, ScreenWrapper } from "@shared/components";
import {
  DeviceSelectionEmptyState,
  DeviceSelectionFooter,
  SceneDeviceItem,
} from "@features/scene/components";
import { DEVICE_SELECTION_LIST_VARIANT_SCENE } from "@shared/utils/constants";
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
              variant={DEVICE_SELECTION_LIST_VARIANT_SCENE}
              selectedDevices={selectedDevices as DeviceSelectionData[]}
              nonSelectedDevices={nonSelectedDevices as DeviceSelectionData[]}
              translationKeySelectedSection="scene.deviceSelection.selectedDevices"
              translationKeySelectDevices="scene.deviceSelection.selectDevices"
              translationKeySelectMore="scene.deviceSelection.selectMore"
              renderDeviceItem={(device, index) => (
                <View key={`${device.node.id}-${index}`}>
                  <SceneDeviceItem
                    node={device.node}
                    device={device.device}
                    isSelected={device.isSelected}
                    isDisabled={isDeviceDisabled(device)}
                    isOnline={isDeviceOnline(device)}
                    isMaxSceneReached={device.isMaxSceneReached}
                    actions={getDeviceActionsForDevice(device)}
                    onPress={() => handleDeviceSelect(device)}
                    onDelete={() => handleDeviceDelete(device)}
                    qaId="scene_device_selection_item"
                  />
                </View>
              )}
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

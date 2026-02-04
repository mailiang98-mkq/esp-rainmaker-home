/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";
import { SceneDeviceItem } from "@features/scene/components";
import { ScheduleDeviceItem } from "@features/schedule/components";
import type { DeviceSelectionData, ScheduleDeviceSelectionData } from "@src/types/global";

export type DeviceSelectionListIdentifier = "scene" | "schedule";

interface SceneDeviceSelectionListProps {
  identifier: "scene";
  selectedDevices: DeviceSelectionData[];
  nonSelectedDevices: DeviceSelectionData[];
  getDeviceActions: (device: DeviceSelectionData) => Record<string, any>;
  isDeviceDisabled: (device: DeviceSelectionData) => boolean;
  isDeviceOnline: (device: DeviceSelectionData) => boolean;
  onDeviceSelect: (device: DeviceSelectionData) => void;
  onDeviceDelete: (device: DeviceSelectionData) => void;
}

interface ScheduleDeviceSelectionListProps {
  identifier: "schedule";
  selectedDevices: ScheduleDeviceSelectionData[];
  nonSelectedDevices: ScheduleDeviceSelectionData[];
  isDeviceDisabled: (device: ScheduleDeviceSelectionData) => boolean;
  getDeviceActionValues: (device: ScheduleDeviceSelectionData) => Record<string, any>;
  onDeviceSelect: (device: ScheduleDeviceSelectionData) => void;
  onDeviceDelete: (device: ScheduleDeviceSelectionData) => void;
}

type DeviceSelectionListProps = SceneDeviceSelectionListProps | ScheduleDeviceSelectionListProps;

/**
 * Unified DeviceSelectionList Component
 *
 * Displays lists of selected and non-selected devices for both scenes and schedules
 * Separates devices into two sections for better UX
 */
export default function DeviceSelectionList(props: DeviceSelectionListProps) {
  const { t } = useTranslation();
  const { identifier, selectedDevices, nonSelectedDevices } = props;

  // Determine styles and translation keys based on identifier
  const scrollViewStyle =
    identifier === "scene"
      ? globalStyles.deviceSelectionScrollView
      : globalStyles.scheduleDevicesListScrollView;
  const selectedSectionStyle =
    identifier === "scene"
      ? globalStyles.deviceSelectionSection
      : globalStyles.scheduleDevicesListSection;
  const nonSelectedSectionStyle =
    identifier === "scene"
      ? globalStyles.deviceSelectionSectionNonSelected
      : globalStyles.scheduleDevicesListNonSelectedSection;

  const selectedDevicesKey =
    identifier === "scene"
      ? "scene.deviceSelection.selectedDevices"
      : "schedule.deviceSelection.selectedDevices";
  const selectDevicesKey =
    identifier === "scene"
      ? "scene.deviceSelection.selectDevices"
      : "schedule.deviceSelection.selectDevices";
  const selectMoreKey =
    identifier === "scene"
      ? "scene.deviceSelection.selectMore"
      : "schedule.deviceSelection.selectMore";

  const scrollViewTestId =
    identifier === "scene" ? "scroll_scene_devices" : "scroll_schedule_devices";

  /**
   * Renders a device item based on identifier
   */
  const renderDeviceItem = (
    device: DeviceSelectionData | ScheduleDeviceSelectionData,
    index: number
  ) => {
    if (identifier === "scene") {
      const sceneDevice = device as DeviceSelectionData;
      const sceneProps = props as SceneDeviceSelectionListProps;
      return (
        <View key={`${sceneDevice.node.id}-${index}`}>
          <SceneDeviceItem
            node={sceneDevice.node}
            device={sceneDevice.device}
            isSelected={sceneDevice.isSelected}
            isDisabled={sceneProps.isDeviceDisabled(sceneDevice)}
            isOnline={sceneProps.isDeviceOnline(sceneDevice)}
            isMaxSceneReached={sceneDevice.isMaxSceneReached}
            actions={sceneProps.getDeviceActions(sceneDevice)}
            onPress={() => sceneProps.onDeviceSelect(sceneDevice)}
            onDelete={() => sceneProps.onDeviceDelete(sceneDevice)}
            qaId="scene_device_selection_item"
          />
        </View>
      );
    } else {
      const scheduleDevice = device as ScheduleDeviceSelectionData;
      const scheduleProps = props as ScheduleDeviceSelectionListProps;
      return (
        <ScheduleDeviceItem
          key={`${scheduleDevice.node.id}-${index}`}
          device={scheduleDevice}
          deviceIndex={index}
          isDeviceDisabled={scheduleProps.isDeviceDisabled}
          getDeviceActionValues={scheduleProps.getDeviceActionValues}
          onDeviceSelect={scheduleProps.onDeviceSelect}
          onDeviceDelete={scheduleProps.onDeviceDelete}
          qaId="schedule_device_selection_item"
        />
      );
    }
  };

  return (
    <ScrollView {...testProps(scrollViewTestId)} style={scrollViewStyle}>
      {/* Selected Devices Section */}
      {selectedDevices.length > 0 && (
        <View
          {...(identifier === "scene" ? testProps("view_selected_devices") : {})}
          style={selectedSectionStyle}
        >
          <View style={globalStyles.deviceSelectionSectionHeader}>
            <Text
              {...(identifier === "scene" ? testProps("text_selected_devices") : {})}
              style={[
                globalStyles.fontSm,
                globalStyles.fontMedium,
                globalStyles.textPrimary,
              ]}
            >
              {t(selectedDevicesKey)}
            </Text>
          </View>
          {selectedDevices.map((device, index) => renderDeviceItem(device, index))}
        </View>
      )}

      {/* Non-Selected Devices Section */}
      {nonSelectedDevices.length > 0 && (
        <View
          {...(identifier === "scene" ? testProps("view_non_selected_devices") : {})}
          style={nonSelectedSectionStyle}
        >
          <View style={globalStyles.deviceSelectionSectionHeader}>
            <Text
              {...(identifier === "scene" ? testProps("text_select_devices") : {})}
              style={[
                globalStyles.fontSm,
                globalStyles.fontMedium,
                globalStyles.textPrimary,
              ]}
            >
              {selectedDevices.length === 0
                ? t(selectDevicesKey)
                : t(selectMoreKey)}
            </Text>
          </View>
          {nonSelectedDevices.map((device, index) => renderDeviceItem(device, index))}
        </View>
      )}
    </ScrollView>
  );
}

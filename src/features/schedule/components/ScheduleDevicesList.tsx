/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { ScheduleDeviceItem } from "./ScheduleDeviceItem";
import { testProps } from "@shared/utils/testProps";
import type { ScheduleDeviceSelectionData } from "@src/types/global";

interface ScheduleDevicesListProps {
  selectedDevices: ScheduleDeviceSelectionData[];
  nonSelectedDevices: ScheduleDeviceSelectionData[];
  isDeviceDisabled: (device: ScheduleDeviceSelectionData) => boolean;
  getDeviceActionValues: (device: ScheduleDeviceSelectionData) => Record<string, any>;
  onDeviceSelect: (device: ScheduleDeviceSelectionData) => void;
  onDeviceDelete: (device: ScheduleDeviceSelectionData) => void;
}

/**
 * ScheduleDevicesList Component
 *
 * Displays a scrollable list of devices grouped by selected and non-selected.
 */
export const ScheduleDevicesList = ({
  selectedDevices,
  nonSelectedDevices,
  isDeviceDisabled,
  getDeviceActionValues,
  onDeviceSelect,
  onDeviceDelete,
}: ScheduleDevicesListProps) => {
  const { t } = useTranslation();

  return (
    <ScrollView
      {...testProps("scroll_schedule_devices")}
      style={globalStyles.scheduleDevicesListScrollView}
    >
      {/* Selected Devices Section */}
      {selectedDevices.length > 0 && (
        <View style={globalStyles.scheduleDevicesListSection}>
          <View style={globalStyles.scheduleDevicesListSectionHeader}>
            <Text
              style={[
                globalStyles.fontSm,
                globalStyles.fontMedium,
                globalStyles.textPrimary,
              ]}
            >
              {t("schedule.deviceSelection.selectedDevices")}
            </Text>
          </View>
          {selectedDevices.map((device, index) => (
            <ScheduleDeviceItem
              key={`${device.node.id}-${index}`}
              device={device}
              deviceIndex={index}
              isDeviceDisabled={isDeviceDisabled}
              getDeviceActionValues={getDeviceActionValues}
              onDeviceSelect={onDeviceSelect}
              onDeviceDelete={onDeviceDelete}
            />
          ))}
        </View>
      )}

      {/* Non-Selected Devices Section */}
      {nonSelectedDevices.length > 0 && (
        <View style={globalStyles.scheduleDevicesListNonSelectedSection}>
          <View style={globalStyles.scheduleDevicesListSectionHeader}>
            <Text
              style={[
                globalStyles.fontSm,
                globalStyles.fontMedium,
                globalStyles.textPrimary,
              ]}
            >
              {selectedDevices.length === 0
                ? t("schedule.deviceSelection.selectDevices")
                : t("schedule.deviceSelection.selectMore")}{" "}
              {}
            </Text>
          </View>
          {nonSelectedDevices.map((device, index) => (
            <ScheduleDeviceItem
              key={`${device.node.id}-${index}`}
              device={device}
              deviceIndex={index}
              isDeviceDisabled={isDeviceDisabled}
              getDeviceActionValues={getDeviceActionValues}
              onDeviceSelect={onDeviceSelect}
              onDeviceDelete={onDeviceDelete}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

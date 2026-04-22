/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from "react";
import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";
import {
  DEVICE_SELECTION_LIST_VARIANT_SCENE,
  DEVICE_SELECTION_LIST_VARIANT_SCHEDULE,
  QA_DEVICE_SELECTION_SCROLL_SCENE,
  QA_DEVICE_SELECTION_SCROLL_SCHEDULE,
  QA_DEVICE_SELECTION_TEXT_SELECT_DEVICES,
  QA_DEVICE_SELECTION_TEXT_SELECTED_DEVICES,
  QA_DEVICE_SELECTION_VIEW_NON_SELECTED_DEVICES,
  QA_DEVICE_SELECTION_VIEW_SELECTED_DEVICES,
} from "@shared/utils/constants";

export type DeviceSelectionListVariant =
  | typeof DEVICE_SELECTION_LIST_VARIANT_SCENE
  | typeof DEVICE_SELECTION_LIST_VARIANT_SCHEDULE;

export interface DeviceSelectionListProps<T> {
  variant: DeviceSelectionListVariant;
  selectedDevices: T[];
  nonSelectedDevices: T[];
  renderDeviceItem: (device: T, index: number) => ReactNode;
  translationKeySelectedSection: string;
  translationKeySelectDevices: string;
  translationKeySelectMore: string;
}

/**
 * Two-section scrollable device list (selected vs available) with variant-specific spacing and QA ids.
 * Row UI is provided by `renderDeviceItem` so shared code does not import feature-domain components.
 * @param props - Devices, i18n resource keys, and per-row renderer.
 * @returns ScrollView containing zero, one, or two labeled sections.
 */
export default function DeviceSelectionList<T>(props: DeviceSelectionListProps<T>) {
  const { t } = useTranslation();
  const {
    variant,
    selectedDevices,
    nonSelectedDevices,
    renderDeviceItem,
    translationKeySelectedSection,
    translationKeySelectDevices,
    translationKeySelectMore,
  } = props;

  const isSceneVariant = variant === DEVICE_SELECTION_LIST_VARIANT_SCENE;

  const scrollViewStyle = isSceneVariant
    ? globalStyles.deviceSelectionScrollView
    : globalStyles.scheduleDevicesListScrollView;
  const selectedSectionStyle = isSceneVariant
    ? globalStyles.deviceSelectionSection
    : globalStyles.scheduleDevicesListSection;
  const nonSelectedSectionStyle = isSceneVariant
    ? globalStyles.deviceSelectionSectionNonSelected
    : globalStyles.scheduleDevicesListNonSelectedSection;

  const scrollViewTestId = isSceneVariant
    ? QA_DEVICE_SELECTION_SCROLL_SCENE
    : QA_DEVICE_SELECTION_SCROLL_SCHEDULE;

  return (
    <ScrollView {...testProps(scrollViewTestId)} style={scrollViewStyle}>
      {selectedDevices.length > 0 && (
        <View
          {...(isSceneVariant
            ? testProps(QA_DEVICE_SELECTION_VIEW_SELECTED_DEVICES)
            : {})}
          style={selectedSectionStyle}
        >
          <View style={globalStyles.deviceSelectionSectionHeader}>
            <Text
              {...(isSceneVariant
                ? testProps(QA_DEVICE_SELECTION_TEXT_SELECTED_DEVICES)
                : {})}
              style={[
                globalStyles.fontSm,
                globalStyles.fontMedium,
                globalStyles.textPrimary,
              ]}
            >
              {t(translationKeySelectedSection)}
            </Text>
          </View>
          {selectedDevices.map((device, index) => renderDeviceItem(device, index))}
        </View>
      )}

      {nonSelectedDevices.length > 0 && (
        <View
          {...(isSceneVariant
            ? testProps(QA_DEVICE_SELECTION_VIEW_NON_SELECTED_DEVICES)
            : {})}
          style={nonSelectedSectionStyle}
        >
          <View style={globalStyles.deviceSelectionSectionHeader}>
            <Text
              {...(isSceneVariant
                ? testProps(QA_DEVICE_SELECTION_TEXT_SELECT_DEVICES)
                : {})}
              style={[
                globalStyles.fontSm,
                globalStyles.fontMedium,
                globalStyles.textPrimary,
              ]}
            >
              {selectedDevices.length === 0
                ? t(translationKeySelectDevices)
                : t(translationKeySelectMore)}
            </Text>
          </View>
          {nonSelectedDevices.map((device, index) => renderDeviceItem(device, index))}
        </View>
      )}
    </ScrollView>
  );
}

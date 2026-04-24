/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, ScrollView } from "react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import type { DeviceSelectionData } from "@src/types/global";

export interface EventDeviceSelectionContentProps {
  selectedDevices: DeviceSelectionData[];
  nonSelectedDevices: DeviceSelectionData[];
  selectedSectionTitle: string;
  availableSectionTitle: string;
  renderDeviceItem: (device: DeviceSelectionData, index: number) => React.ReactNode;
}

/**
 * Renders the event device selection content UI section.
 */
export const EventDeviceSelectionContent: React.FC<
  EventDeviceSelectionContentProps
> = ({
  selectedDevices,
  nonSelectedDevices,
  selectedSectionTitle,
  availableSectionTitle,
  renderDeviceItem,
}) => {
  const sectionTitleStyle = [
    globalStyles.fontSm,
    globalStyles.fontMedium,
    globalStyles.textPrimary,
  ];

  return (
    <ScrollView
      style={{ flex: 1, marginBottom: 80 }}
    >
      {selectedDevices.length > 0 && (
        <View style={{ padding: tokens.spacing._15, paddingBottom: 0 }}>
          <View style={{ marginBottom: tokens.spacing._10 }}>
            <Text style={sectionTitleStyle}>{selectedSectionTitle}</Text>
          </View>
          {selectedDevices.map((device, index) =>
            renderDeviceItem(device, index)
          )}
        </View>
      )}

      {nonSelectedDevices.length > 0 && (
        <View style={{ flex: 1, padding: tokens.spacing._15 }}>
          <View style={{ marginBottom: tokens.spacing._10 }}>
            <Text style={sectionTitleStyle}>{availableSectionTitle}</Text>
          </View>
          {nonSelectedDevices.map((device, index) =>
            renderDeviceItem(device, index)
          )}
        </View>
      )}
    </ScrollView>
  );
};

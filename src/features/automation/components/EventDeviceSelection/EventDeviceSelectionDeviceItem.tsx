/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { DeviceAction } from "@shared/components";
import type { DeviceSelectionData } from "@src/types/global";
import type { CreateAutomationEventInfo } from "@features/automation/utils/automationManagement";

export interface EventDeviceSelectionDeviceItemProps {
  device: DeviceSelectionData;
  currentEventInfo: CreateAutomationEventInfo | null;
  isCurrentEventDevice: boolean;
  isDisabled: boolean;
  offlineLabel: string;
  onPress: () => void;
}

export const EventDeviceSelectionDeviceItem: React.FC<
  EventDeviceSelectionDeviceItemProps
> = ({
  device,
  currentEventInfo,
  isCurrentEventDevice,
  isDisabled,
  offlineLabel,
  onPress,
}) => {
  const isOnline = device.node.connectivityStatus?.isConnected ?? false;

  const eventConditions =
    isCurrentEventDevice && currentEventInfo
      ? {
          [currentEventInfo.parameter]: {
            condition: currentEventInfo.condition,
            value: currentEventInfo.value,
          },
        }
      : undefined;

  return (
    <View
      style={[
        globalStyles.sceneDeviceSection,
        !isOnline && globalStyles.deviceCardDisabled,
        isDisabled && globalStyles.deviceCardDisabled,
      ]}
    >
      <DeviceAction
        device={device.device.type ?? ""}
        displayDeviceName={device.device.displayName ?? ""}
        actions={{}}
        onPress={() => !isDisabled && onPress()}
        eventConditions={eventConditions}
        isEventMode={!!isCurrentEventDevice}
        badgeLable={
          !isOnline ? (
            <Text style={[globalStyles.fontXs, globalStyles.textGray]}>
              {offlineLabel}
            </Text>
          ) : undefined
        }
      />
    </View>
  );
};

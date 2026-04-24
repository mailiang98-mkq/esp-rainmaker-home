/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { X } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { DeviceAction } from "@shared/components";
import { testProps } from "@shared/utils/testProps";
import type { DeviceSelectionData } from "@src/types/global";

export interface ActionDeviceSelectionDeviceItemProps {
  device: DeviceSelectionData;
  actions: Record<string, unknown>;
  isDisabled: boolean;
  offlineLabel: string;
  treatOfflineAsOnline?: boolean;
  onPress: () => void;
  onDelete: () => void;
  showDelete: boolean;
}

/**
 * Renders the action device selection device item UI section.
 */
export const ActionDeviceSelectionDeviceItem: React.FC<
  ActionDeviceSelectionDeviceItemProps
> = ({
  device,
  actions,
  isDisabled,
  offlineLabel,
  treatOfflineAsOnline = false,
  onPress,
  onDelete,
  showDelete,
}) => {
  const isOnline = device.node.connectivityStatus?.isConnected ?? false;
  const showAsOnline = treatOfflineAsOnline || isOnline;

  return (
    <View
      {...testProps("view_action_device_item")}
      style={[
        globalStyles.sceneDeviceSection,
        !showAsOnline && globalStyles.deviceCardDisabled,
        isDisabled && globalStyles.deviceCardDisabled,
      ]}
    >
      <DeviceAction
        qaId="action_device_action_item"
        device={device.device.type ?? ""}
        displayDeviceName={device.device.displayName ?? ""}
        actions={actions as Record<string, any>}
        onPress={() => !isDisabled && onPress()}
        rightSlot={
          showDelete ? (
            <Pressable
              {...testProps("button_delete_selected_action_device")}
              style={{ padding: tokens.spacing._10 }}
              onPress={() => !isDisabled && onDelete()}
            >
              <X
                {...testProps("icon_delete_selected_action_device")}
                size={16}
                color={tokens.colors.red}
              />
            </Pressable>
          ) : undefined
        }
        badgeLable={
          !showAsOnline ? (
            <Text
              {...testProps("text_offline_action")}
              style={[globalStyles.fontXs, globalStyles.textGray]}
            >
              {offlineLabel}
            </Text>
          ) : undefined
        }
      />
    </View>
  );
};

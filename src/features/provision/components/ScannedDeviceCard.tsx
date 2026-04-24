/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { deviceImages } from "@shared/utils/device";
import { testProps } from "@shared/utils/testProps";

interface ScannedDeviceCardProps {
  name: string;
  type: string;
  onPress: () => void;
}

/**
 * ScannedDeviceCard
 *
 * Displays a card for a scanned device with its name and icon
 * @param props - Device information and onPress handler
 * @returns Tappable row with device image and truncated name
 */
export const ScannedDeviceCard: React.FC<ScannedDeviceCardProps> = ({
  name,
  type,
  onPress,
}) => (
  <TouchableOpacity
    {...testProps("button_scanned_device_ble")}
    style={[globalStyles.deviceCard, { padding: 0 }]}
    onPress={onPress}
  >
    <Image
      {...testProps("image_icon_device")}
      source={deviceImages[`${type}-online`]}
      style={globalStyles.deviceIcon}
      resizeMode="contain"
    />
    <View {...testProps("view_info_device")} style={globalStyles.deviceInfo}>
      <Text {...testProps("text_device_name")} style={globalStyles.deviceName}>{name}</Text>
    </View>
  </TouchableOpacity>
);

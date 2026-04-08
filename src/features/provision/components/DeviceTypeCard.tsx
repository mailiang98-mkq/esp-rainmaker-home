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

interface DeviceTypeCardProps {
  label: string;
  defaultIcon: string;
  disabled: boolean;
  onPress: () => void;
  style?: any;
}

/**
 * DeviceTypeCard
 *
 * Displays a card for a device type with its label and icon
 * @param props - Device type information and onPress handler
 * @returns JSX component
 */
export const DeviceTypeCard: React.FC<DeviceTypeCardProps> = ({
  label,
  defaultIcon,
  disabled,
  onPress,
  style,
}) => (
  <TouchableOpacity
    {...testProps(`button_device_type_${label}`)}
    style={[
      globalStyles.deviceCard,
      disabled && globalStyles.deviceCardDisabled,
      { padding: 0 },
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <View style={globalStyles.deviceIconContainer}>
      <Image
        {...testProps(`image_device_type_${label}`)}
        source={deviceImages[`${defaultIcon}-online`]}
        style={globalStyles.deviceIcon}
        resizeMode="contain"
      />
    </View>
    <Text {...testProps("text_label")} style={[globalStyles.deviceLabel, disabled && globalStyles.textGray]}>
      {label}
    </Text>
  </TouchableOpacity>
);

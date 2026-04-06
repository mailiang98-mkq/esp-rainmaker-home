/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Text, Pressable } from "react-native";
import { Plus, MinusCircle } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import type { DeviceItemProps } from "@src/types/global";

/**
 * Single device row for Create Room: plus/minus icon and device name.
 * UI only; receives device and handlers via props.
 */
export const CreateRoomDeviceItem: React.FC<DeviceItemProps> = ({
  device,
  showPlus = false,
  showMinus = false,
  onPress,
}) => (
  <Pressable
    style={[globalStyles.createRoomDeviceItem]}
    onPress={() => onPress(device)}
  >
    {showPlus && <Plus size={20} color={tokens.colors.blue} />}
    {showMinus && <MinusCircle size={20} color={tokens.colors.red} />}
    <Text style={globalStyles.createRoomDeviceText}>{device.name}</Text>
  </Pressable>
);

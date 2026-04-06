/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Text, Pressable } from "react-native";
import { Circle, Check } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";
import type { RoomType } from "@src/types/global";

export interface CustomizeRoomNameRoomItemProps {
  room: RoomType;
  index: number;
  total: number;
  isSelected: boolean;
  onPress: (roomLabel: string) => void;
}

/**
 * Single predefined room name row: label and selection icon.
 * UI only; no business logic.
 */
export const CustomizeRoomNameRoomItem: React.FC<CustomizeRoomNameRoomItemProps> = ({
  room,
  index,
  total,
  isSelected,
  onPress,
}) => (
  <Pressable
    {...testProps(`button_room_${room.key}`)}
    style={[
      globalStyles.customizeRoomNameRoomItem,
      { borderBottomWidth: index === total - 1 ? 0 : 1 },
    ]}
    onPress={() => onPress(room.label)}
  >
    <Text style={globalStyles.customizeRoomNameRoomText}>{room.label}</Text>
    {isSelected ? (
      <Check size={20} color={tokens.colors.blue} strokeWidth={3} />
    ) : (
      <Circle size={20} color={tokens.colors.primary} fill="transparent" />
    )}
  </Pressable>
);

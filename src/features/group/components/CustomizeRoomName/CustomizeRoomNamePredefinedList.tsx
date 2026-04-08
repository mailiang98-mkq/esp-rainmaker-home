/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ScrollView } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";
import { CustomizeRoomNameRoomItem } from "./CustomizeRoomNameRoomItem";
import type { RoomType } from "@src/types/global";

export interface CustomizeRoomNamePredefinedListProps {
  rooms: RoomType[];
  selectedRoom: string;
  onRoomSelect: (roomLabel: string) => void;
}

/**
 * Scrollable list of predefined room name options.
 * UI only; receives data and handler via props.
 */
export const CustomizeRoomNamePredefinedList: React.FC<CustomizeRoomNamePredefinedListProps> = ({
  rooms,
  selectedRoom,
  onRoomSelect,
}) => (
  <ScrollView
    {...testProps("scroll_room_names")}
    style={globalStyles.customizeRoomNameScrollView}
  >
    {rooms.map((room, index) => (
      <CustomizeRoomNameRoomItem
        key={`room-${room.key}-${index}`}
        room={room}
        index={index}
        total={rooms.length}
        isSelected={selectedRoom === room.label}
        onPress={onRoomSelect}
      />
    ))}
  </ScrollView>
);

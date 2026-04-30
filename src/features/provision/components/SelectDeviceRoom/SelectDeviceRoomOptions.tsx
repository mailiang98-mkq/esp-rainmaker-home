/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { ChevronRight, Plus } from "lucide-react-native";

import {
  selectDeviceRoomIconColors,
  selectDeviceRoomStyles,
} from "@features/provision/theme";
import { testProps } from "@shared/utils/testProps";
import type { ESPCDFGroup } from "@store";

const styles = selectDeviceRoomStyles;

export interface SelectDeviceRoomOptionsProps {
  /** Rooms the user can assign the device to. */
  rooms: ESPCDFGroup[];
  /** Currently selected room, if any. */
  selectedRoom: ESPCDFGroup | null;
  /** Called when the user picks a room row. */
  onSelectRoom: (room: ESPCDFGroup) => void;
  /** Called when the user chooses “create a new room”. */
  onCreateRoom: () => void;
}

/**
 * “Select a room” section: list of existing rooms, empty hint, and create-room row.
 */
export const SelectDeviceRoomOptions = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  onCreateRoom,
}: SelectDeviceRoomOptionsProps) => {
  const { t } = useTranslation();
  const hasExistingRooms = rooms.length > 0;

  return (
    <>
      <Text style={styles.sectionTitle}>
        {t("device.deviceDetails.selectARoom")}
      </Text>
      {!hasExistingRooms && (
        <Text style={styles.emptyHint}>
          {t("device.deviceDetails.noRoomsAvailable")}
        </Text>
      )}

      {hasExistingRooms &&
        rooms.map((room: ESPCDFGroup) => (
          <Pressable
            key={room.id}
            {...testProps(`room_option_${room.id}`)}
            style={[
              styles.roomRow,
              selectedRoom?.id === room.id && styles.roomRowSelected,
            ]}
            onPress={() => onSelectRoom(room)}
          >
            <Text
              style={[
                styles.roomRowText,
                selectedRoom?.id === room.id && styles.roomRowTextSelected,
              ]}
            >
              {room.name}
            </Text>
          </Pressable>
        ))}

      <Pressable
        {...testProps("button_create_new_room_row")}
        style={[
          styles.createRoomRow,
          hasExistingRooms && styles.createRoomRowAfterList,
        ]}
        onPress={onCreateRoom}
      >
        <Plus
          size={20}
          color={selectDeviceRoomIconColors.createRoomPlus}
        />
        <Text style={styles.createRoomRowText}>
          {t("device.deviceDetails.createRoomAction")}
        </Text>
        <ChevronRight
          size={20}
          color={selectDeviceRoomIconColors.chevron}
        />
      </Pressable>
    </>
  );
};

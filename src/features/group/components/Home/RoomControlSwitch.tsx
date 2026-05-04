/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Power } from "lucide-react-native";

import { testProps } from "@shared/utils/testProps";
import { SwitchButton } from "@shared/components";
import { useRoomControl } from "@features/group/hooks/useRoomControl";
import { POWER_ICON_SIZE, POWER_ACTION_ON, POWER_ACTION_OFF } from "@features/group/utils/constants";
import { roomControlSwitchStyles as styles } from "../../theme/roomControlStyles";
import type { RoomControlSwitchProps } from "@src/types/global";

/**
 * All On / All Off switch shown when a room tab is selected.
 * @param filteredDevices - Devices filtered by the active device type tab.
 * @param roomGroup - The CDF group for the selected room.
 */
const RoomControlSwitch: React.FC<RoomControlSwitchProps> = observer(
  ({ filteredDevices, roomGroup }) => {
    const { t } = useTranslation();
    const { devicesWithPower, activeAction, handlePower } =
      useRoomControl(filteredDevices, roomGroup);

    if (devicesWithPower.length === 0) return null;

    return (
      <View
        {...testProps("view_room_control_switch")}
        style={styles.container}
      >
        <SwitchButton
          qaId="button_all_on"
          text={t("group.rooms.allOn")}
          icon={Power}
          iconSize={POWER_ICON_SIZE}
          loading={activeAction === POWER_ACTION_ON}
          onPress={() => handlePower(true)}
          style={[styles.controlButton, styles.controlButtonLeft]}
          textStyle={styles.controlButtonText}
        />

        <View style={styles.divider} />

        <SwitchButton
          qaId="button_all_off"
          text={t("group.rooms.allOff")}
          icon={Power}
          iconSize={POWER_ICON_SIZE}
          loading={activeAction === POWER_ACTION_OFF}
          onPress={() => handlePower(false)}
          style={[styles.controlButton, styles.controlButtonRight]}
          textStyle={styles.controlButtonText}
        />
      </View>
    );
  }
);

export default RoomControlSwitch;

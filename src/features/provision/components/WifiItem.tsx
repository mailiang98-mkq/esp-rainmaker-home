/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Wifi as WifiIcon, Lock } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import type { WifiNetwork } from "@src/types/global";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { getSignalStrength, getOpacityFromStrength } from "@features/provision/utils/wifiHelper";
import { testProps } from "@shared/utils/testProps";

interface WifiItemProps {
  item: WifiNetwork;
  onSelect: (ssid: string) => void;
}

/**
 * WifiItem Component
 *
 * Displays a single WiFi network item in the list
 */
export const WifiItem: React.FC<WifiItemProps> = ({ item, onSelect }) => {
  const { t } = useTranslation();
  const signalInfo = getSignalStrength(item.rssi, t);

  return (
    <TouchableOpacity
      style={[globalStyles.settingsItem]}
      {...testProps("wifi_item")}
      onPress={() => onSelect(item.ssid)}
    >
      <View style={globalStyles.settingsItemLeft} {...testProps("view_wifi")}>
        <WifiIcon
          {...testProps("icon_wifi_strength")}
          size={20}
          color={signalInfo.color}
          style={{
            ...globalStyles.settingsItemIcon,
            opacity: getOpacityFromStrength(signalInfo.strength),
          }}
        />
        <View style={{ flex: 1 }} {...testProps("view_wifi")}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }} {...testProps("view_wifi")}>
            {item.secure && <Lock {...testProps("icon_lock")} size={14} color={tokens.colors.gray} />}
            <Text style={globalStyles.settingsItemText} {...testProps("text_ssid")}>{item.ssid}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

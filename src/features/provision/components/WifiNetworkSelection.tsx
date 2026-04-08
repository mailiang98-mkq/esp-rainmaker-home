/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";

interface WifiNetworkSelectionProps {
  selectedWifi: string;
  placeholder: string;
  onPress: () => void;
}

/**
 * WifiNetworkSelection Component
 *
 * Displays the selected WiFi network or placeholder
 */
export const WifiNetworkSelection: React.FC<WifiNetworkSelectionProps> = ({
  selectedWifi,
  placeholder,
  onPress,
}) => (
  <TouchableOpacity
    style={[
      styles.input,
      { borderRadius: tokens.radius.md },
      globalStyles.shadowElevationForLightTheme,
    ]}
    {...testProps("button_select_network_wifi")}
    onPress={onPress}
  >
    <Text
      style={
        selectedWifi ? globalStyles.settingsItemText : globalStyles.textGray
      }
      {...testProps("text_selected_wifi")}
    >
      {selectedWifi || placeholder}
    </Text>
    <ChevronDown size={20} color={tokens.colors.gray} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    paddingHorizontal: tokens.spacing._15,
    backgroundColor: tokens.colors.white,
    borderWidth: 1,
    borderColor: tokens.colors.bg2,
  },
});

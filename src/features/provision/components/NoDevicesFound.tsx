/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { RotateCcw, CircleAlert } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { ContentWrapper } from "@shared/components";
import { testProps } from "@shared/utils/testProps";

interface NoDevicesFoundProps {
  onScanAgain: () => void;
  devicePrefix?: string;
  style?: any;
}

/**
 * NoDevicesFound
 *
 * Displays a message when no devices are found with refresh icon to rescan
 * @param props - onScanAgain handler, device prefix, and optional style
 * @returns JSX component
 */
export const NoDevicesFound: React.FC<NoDevicesFoundProps> = ({
  onScanAgain,
  devicePrefix,
  style,
}) => {
  const { t } = useTranslation();

  return (
    <ContentWrapper
      title={t("device.scan.ble.noDevicesFound")}
      style={style}
      leftSlot={
        <TouchableOpacity
          {...testProps("button_rescan")}
          onPress={onScanAgain}
          style={styles.rescanButton}
        >
          <RotateCcw size={20} color={tokens.colors.primary} />
        </TouchableOpacity>
      }
      qaId="no_devices_found_scan_ble"
    >
      <View style={styles.emptyContainer}>
        <View style={styles.noDeviceContent}>
          <View style={styles.noDeviceIconContainer}>
            <CircleAlert size={48} color={tokens.colors.primary} />
          </View>
          <Text
            {...testProps("text_no_device_message")}
            style={[globalStyles.textGray, styles.noDeviceMessage]}
          >
            {t("device.scan.ble.noDeviceMessage")}{" "}
            <Text
              {...testProps("text_prefix_value")}
              style={[
                globalStyles.fontMd,
                globalStyles.textPrimary,
                styles.prefixValue,
              ]}
            >
              {devicePrefix}
            </Text>
          </Text>
        </View>
      </View>
    </ContentWrapper>
  );
};

const styles = StyleSheet.create({
  rescanButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: tokens.spacing._20,
  },
  noDeviceContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  noDeviceIconContainer: {
    marginBottom: tokens.spacing._20,
    padding: tokens.spacing._15,
    borderRadius: 50,
    backgroundColor: tokens.colors.bg4,
  },
  noDeviceMessage: {
    marginBottom: tokens.spacing._15,
    textAlign: "center",
    paddingHorizontal: tokens.spacing._20,
  },
  prefixValue: {
    fontWeight: "600",
    fontFamily: "monospace",
  },
});

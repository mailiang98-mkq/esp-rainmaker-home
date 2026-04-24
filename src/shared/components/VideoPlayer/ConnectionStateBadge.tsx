/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@shared/theme/tokens";
import { videoPlayerStyles } from "@shared/theme/VideoPlayerStyle";
import type { ConnectionStateBadgeProps } from "@src/types/global";
import { ConnectionState } from "@src/types/global";

/**
 * ConnectionStateBadge Component
 * A reusable badge component that displays connection state with appropriate styling.
 * Follows Single Responsibility Principle - only responsible for displaying connection state.
 * States: CONNECTED (green), DISCONNECTED (gray), LIVE (green), ERROR (red); text is white on all.
 * @param props - ConnectionStateBadge component props
 * @returns JSX component for connection state badge
 */
const ConnectionStateBadge: React.FC<ConnectionStateBadgeProps> = ({
  state,
  testId,
}) => {
  const { t } = useTranslation();

  const getStateConfig = () => {
    switch (state) {
      case ConnectionState.CONNECTED:
        return {
          label: t("device.camera.connectionState.connected"),
          backgroundColor: tokens.colors.green,
          textColor: tokens.colors.white,
        };
      case ConnectionState.DISCONNECTED:
        return {
          label: t("device.camera.connectionState.disconnected"),
          backgroundColor: tokens.colors.gray,
          textColor: tokens.colors.white,
        };
      case ConnectionState.LIVE:
        return {
          label: t("device.camera.connectionState.live"),
          backgroundColor: tokens.colors.green,
          textColor: tokens.colors.white,
        };
      case ConnectionState.ERROR:
        return {
          label: t("device.camera.connectionState.error"),
          backgroundColor: tokens.colors.red,
          textColor: tokens.colors.white,
        };
      default:
        return {
          label: t("device.camera.connectionState.unknown"),
          backgroundColor: tokens.colors.gray,
          textColor: tokens.colors.white,
        };
    }
  };

  const config = getStateConfig();

  return (
    <View
      style={[
        videoPlayerStyles.badge,
        {
          backgroundColor: config.backgroundColor,
        },
      ]}
      {...(testId ? { testID: testId } : {})}
    >
      <Text style={[videoPlayerStyles.badgeText, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
};

export default ConnectionStateBadge;

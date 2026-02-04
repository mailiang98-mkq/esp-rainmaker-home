/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, ActivityIndicator } from "react-native";

import { ScreenWrapper, Header } from "@shared/components";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

export interface ConfigScanLoadingViewProps {
  title: string;
  message: string;
  onCancel: () => void;
}

export function ConfigScanLoadingView({
  title,
  message,
  onCancel,
}: ConfigScanLoadingViewProps) {
  return (
    <ScreenWrapper style={globalStyles.configScanNoPadding}>
      <Header label={title} showBack onBackPress={onCancel} />
      <View style={globalStyles.configScanCenterContent}>
        <ActivityIndicator size="large" color={tokens.colors.primary} />
        <Text style={globalStyles.configScanMessage}>{message}</Text>
      </View>
    </ScreenWrapper>
  );
}

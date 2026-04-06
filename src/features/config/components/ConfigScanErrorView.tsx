/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenWrapper, Header } from "@shared/components";
import { globalStyles } from "@shared/theme/globalStyleSheet";

export interface ConfigScanErrorViewProps {
  title: string;
  errorMessage: string;
  onRetry: () => void;
  onCancel: () => void;
}

export function ConfigScanErrorView({
  title,
  errorMessage,
  onRetry,
  onCancel,
}: ConfigScanErrorViewProps) {
  const { t } = useTranslation();

  return (
    <ScreenWrapper style={globalStyles.configScanNoPadding}>
      <Header label={title} showBack onBackPress={onCancel} />
      <View style={globalStyles.configScanCenterContent}>
        <Text style={globalStyles.configScanErrorText}>{errorMessage}</Text>
        <View style={globalStyles.configScanButtonRow}>
          {/* Retry Button */}
          <TouchableOpacity
            style={globalStyles.configScanButton}
            onPress={onRetry}
          >
            <Text style={globalStyles.configScanButtonText}>
              {t("config.scan.retry")}
            </Text>
          </TouchableOpacity>
          {/* Cancel Button */}
          <TouchableOpacity
            style={[
              globalStyles.configScanButton,
              globalStyles.configScanCancelButton,
            ]}
            onPress={onCancel}
          >
            <Text style={globalStyles.configScanButtonText}>
              {t("config.scan.cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

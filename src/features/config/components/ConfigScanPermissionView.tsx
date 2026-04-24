/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenWrapper, Header } from "@shared/components";
import { globalStyles } from "@shared/theme/globalStyleSheet";

export interface ConfigScanPermissionViewProps {
  title: string;
  onGrant: () => void;
  onBack: () => void;
}

/**
 * Renders the config scan permission view UI section.
 */
export function ConfigScanPermissionView({
  title,
  onGrant,
  onBack,
}: ConfigScanPermissionViewProps) {
  const { t } = useTranslation();

  return (
    <ScreenWrapper style={globalStyles.configScanNoPadding}>
      <Header label={title} showBack onBackPress={onBack} />
      <View style={globalStyles.configScanCenterContent}>
        <Text style={globalStyles.configScanMessage}>
          {t("config.scan.cameraPermissionRequired")}
        </Text>
        <View style={globalStyles.configScanButtonRow}>
          <TouchableOpacity
            style={globalStyles.configScanButton}
            onPress={onGrant}
          >
            <Text style={globalStyles.configScanButtonText}>
              {t("config.scan.grantPermission")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              globalStyles.configScanButton,
              globalStyles.configScanCancelButton,
            ]}
            onPress={onBack}
          >
            <Text style={globalStyles.configScanButtonText}>
              {t("config.scan.back")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

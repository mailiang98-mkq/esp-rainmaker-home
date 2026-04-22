/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";

import { ScreenWrapper } from "@shared/components";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

/**
 * Renders the config scan success view UI section.
 */
export function ConfigScanSuccessView() {
  const { t } = useTranslation();

  return (
    <ScreenWrapper style={globalStyles.configScanNoPadding}>
      <View style={globalStyles.configScanCenterContent}>
        <Check size={48} color={tokens.colors.primary} />
        <Text style={globalStyles.configScanMessage}>
          {t("config.scan.success")}
        </Text>
      </View>
    </ScreenWrapper>
  );
}

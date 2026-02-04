/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { Settings } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";

/**
 * DeviceParamsSelectionEmptyState Component
 *
 * Displays an empty state when no device is selected for parameter configuration
 */
export default function DeviceParamsSelectionEmptyState() {
  const { t } = useTranslation();

  return (
    <View
      style={globalStyles.emptyStateContainer}
      {...testProps("view_device_params_selection")}
    >
      <View
        style={globalStyles.emptyStateIconContainer}
        {...testProps("view_device_params_selection")}
      >
        <Settings size={35} color={tokens.colors.primary} />
      </View>
      <Text
        style={globalStyles.emptyStateTitle}
        {...testProps("text_title_no_devices")}
      >
        {t("scene.deviceParamsSelection.noDevicesAvailable")}
      </Text>
      <Text
        style={globalStyles.emptyStateDescription}
        {...testProps("text_subtitle_no_devices")}
      >
        {t("scene.deviceParamsSelection.noActionsSelectedDescription")}
      </Text>
    </View>
  );
}

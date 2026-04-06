/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Settings, TriangleAlert } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

interface ScheduleDeviceParamsEmptyStateProps {
  type: "noDevice" | "noCompatibleParams";
  deviceName?: string;
}

/**
 * ScheduleDeviceParamsEmptyState Component
 *
 * Displays empty state for device parameter selection screen.
 * Shows different messages based on the type of empty state.
 */
export const ScheduleDeviceParamsEmptyState = ({
  type,
  deviceName,
}: ScheduleDeviceParamsEmptyStateProps) => {
  const { t } = useTranslation();

  if (type === "noDevice") {
    return (
      <View style={globalStyles.emptyStateContainer}>
        <View style={globalStyles.emptyStateIconContainer}>
          <Settings size={35} color={tokens.colors.primary} />
        </View>
        <Text style={globalStyles.emptyStateTitle}>
          {t("schedule.deviceParamsSelection.noDevicesAvailable")}
        </Text>
        <Text style={globalStyles.emptyStateDescription}>
          {t("schedule.deviceParamsSelection.noActionsSelectedDescription")}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        globalStyles.sceneEmptyStateContainer,
        {
          justifyContent: "center",
        },
      ]}
    >
      <View style={globalStyles.sceneEmptyStateIconContainer}>
        <TriangleAlert size={35} color={tokens.colors.primary} />
      </View>
      <Text style={globalStyles.emptyStateTitle}>
        {t("schedule.deviceParamsSelection.noCompatibleParams", {
          deviceName: deviceName || "",
        })}
      </Text>
    </View>
  );
};

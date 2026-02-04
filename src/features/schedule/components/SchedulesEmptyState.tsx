/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { LayoutPanelLeft } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";

interface SchedulesEmptyStateProps {
  isLoading: boolean;
}

/**
 * SchedulesEmptyState Component
 *
 * Displays an empty state when no schedules exist.
 * Shows a loading indicator when schedules are being fetched.
 */
export const SchedulesEmptyState = ({ isLoading }: SchedulesEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <View {...testProps("view_empty_schedules")} style={[globalStyles.sceneEmptyStateContainer]}>
      {!isLoading && (<>
        <View style={globalStyles.sceneEmptyStateIconContainerTop}>
          <LayoutPanelLeft size={35} color={tokens.colors.primary} />
        </View>
        <Text {...testProps("text_title_empty")} style={globalStyles.emptyStateTitle}>
          {t("schedule.schedules.noSchedulesYet")}
        </Text>
        <Text {...testProps("text_description_empty")} style={globalStyles.emptyStateDescription}>
          {t("schedule.schedules.noSchedulesYetDescription")}
        </Text>
      </>)}
    </View>
  );
};

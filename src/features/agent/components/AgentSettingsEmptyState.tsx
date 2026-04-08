/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

export function AgentSettingsEmptyState() {
  const { t } = useTranslation();

  return (
    <View style={globalStyles.sceneEmptyStateContainer}>
      <View style={globalStyles.sceneEmptyStateIconContainerTop}>
        <MessageSquare size={35} color={tokens.colors.primary} />
      </View>
      <Text style={globalStyles.emptyStateTitle}>
        {t("aiSettings.noAgents")}
      </Text>
      <Text style={globalStyles.emptyStateDescription}>
        {t("aiSettings.noAgentsDescription")}
      </Text>
    </View>
  );
}

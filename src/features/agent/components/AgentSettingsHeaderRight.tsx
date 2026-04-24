/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import { TouchableOpacity, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

interface AgentSettingsHeaderRightProps {
  hasAgents: boolean;
  isEditing: boolean;
  onToggleEdit: () => void;
  onRefresh: () => void;
}

/**
 * Header actions for agent settings: toggles edit/done when agents exist, or shows a refresh control when the list is empty.
 */
export function AgentSettingsHeaderRight({
  hasAgents,
  isEditing,
  onToggleEdit,
  onRefresh,
}: AgentSettingsHeaderRightProps) {
  const { t } = useTranslation();

  if (hasAgents) {
    return (
      <TouchableOpacity
        onPress={onToggleEdit}
        style={globalStyles.agentSettingsEditButtonContainer}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={globalStyles.agentSettingsEditButton}>
          {isEditing
            ? t("schedule.schedules.done") || "Done"
            : t("schedule.schedules.edit") || "Edit"}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onRefresh}
      style={globalStyles.agentSettingsEditButtonContainer}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <RefreshCw size={20} color={tokens.colors.primary} />
    </TouchableOpacity>
  );
}

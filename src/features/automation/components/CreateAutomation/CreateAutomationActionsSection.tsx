/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Plus, Settings } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import AutomationDeviceCard from "../AutomationDeviceCard";
import { testProps } from "@shared/utils/testProps";
import { createAutomationStyles as styles } from "../../theme/createAutomationStyles";
import type { CreateAutomationActionCard } from "@features/automation/utils/automationManagement";

export interface CreateAutomationActionsSectionProps {
  sectionLabel: string;
  hasActions: boolean;
  emptyTitle: string;
  emptyDescription: string;
  actionCards: CreateAutomationActionCard[];
  disabled?: boolean;
  onAddAction: () => void;
}

/**
 * Renders the create automation actions section UI section.
 */
export const CreateAutomationActionsSection: React.FC<
  CreateAutomationActionsSectionProps
> = ({
  sectionLabel,
  hasActions,
  emptyTitle,
  emptyDescription,
  actionCards,
  disabled = false,
  onAddAction,
}) => {
  return (
    <View style={[styles.section, styles.actionsSection]}>
      <View style={styles.sectionHeader}>
        <Text {...testProps("text_label_actions")} style={styles.sectionLabel}>
          {sectionLabel}
        </Text>
        <Pressable
          {...testProps("button_add_action")}
          onPress={disabled ? undefined : onAddAction}
          style={[styles.addButton, disabled && styles.disabledButton]}
          disabled={disabled}
        >
          <Plus
            size={16}
            color={
              disabled
                ? tokens.colors.text_secondary
                : tokens.colors.text_primary
            }
          />
        </Pressable>
      </View>
      {!hasActions ? (
        <View
          {...testProps("view_empty_actions")}
          style={styles.emptyStateContainer}
        >
          <View style={styles.emptyStateIconContainer}>
            <Settings size={35} color={tokens.colors.primary} />
          </View>
          <Text
            {...testProps("text_title_empty_automations")}
            style={globalStyles.emptyStateTitle}
          >
            {emptyTitle}
          </Text>
          <Text
            {...testProps("text_description_empty_automations")}
            style={globalStyles.emptyStateDescription}
          >
            {emptyDescription}
          </Text>
        </View>
      ) : (
        <ScrollView
          {...testProps("scroll_actions_automations")}
          style={styles.actionScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.actionScrollContent}
        >
          <View style={styles.actionSummaryContainer}>
            {actionCards.map((actionCard) => (
              <AutomationDeviceCard
                key={actionCard.key}
                device={actionCard.device}
                displayDeviceName={actionCard.displayDeviceName}
                type="action"
                actions={actionCard.actions}
                onPress={disabled ? () => {} : onAddAction}
                qaId={`automation_action_${actionCard.device.name}`}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

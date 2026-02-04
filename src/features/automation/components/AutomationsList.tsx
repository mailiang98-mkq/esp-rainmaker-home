/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import type { ESPCDFAutomation } from "@store";
import { tokens } from "@shared/theme/tokens";
import AutomationCard from "./AutomationCard";

export interface AutomationsListProps {
  /** List of automations to render */
  automations: ESPCDFAutomation[];
  /** Called when an automation card is pressed */
  onAutomationPress: (automation: ESPCDFAutomation) => void;
  /** Called when toggle is changed */
  onToggle: (automation: ESPCDFAutomation, enabled: boolean) => void;
  /** Map of automationId -> loading for toggle state */
  toggleLoadingStates: Record<string, boolean>;
  /** Test ID for the scroll content container */
  testID?: string;
}

/**
 * AutomationsList
 *
 * Renders a list of AutomationCard components for the automations screen.
 */
export const AutomationsList: React.FC<AutomationsListProps> = ({
  automations,
  onAutomationPress,
  onToggle,
  toggleLoadingStates,
  testID = "scroll_automations_list",
}) => {
  return (
    <View style={styles.scrollContent} testID={testID}>
      {automations.map((automation) => {
        const automationId = automation.id;
        return (
          <AutomationCard
            key={automationId}
            automation={automation}
            onPress={() => onAutomationPress(automation)}
            onToggle={(enabled) => onToggle(automation, enabled)}
            toggleLoading={toggleLoadingStates[automationId] ?? false}
            qaId="card_automation"
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: tokens.spacing._15,
  },
});

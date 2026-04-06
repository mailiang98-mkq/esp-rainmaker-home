/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Zap } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";

export interface AutomationsEmptyStateProps {
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Title text (e.g. "No automations yet" or "Add devices first") */
  title: string;
  /** Description text */
  description: string;
  /** Test ID for the container view */
  testID?: string;
}

/**
 * AutomationsEmptyState
 *
 * Empty state for the Automations list. Shows a loading spinner when loading,
 * otherwise shows icon, title and description.
 */
export const AutomationsEmptyState: React.FC<AutomationsEmptyStateProps> = ({
  isLoading,
  title,
  description,
  testID = "view_empty_automations",
}) => {
  return (
    <View
      {...testProps(testID)}
      style={[globalStyles.automationEmptyStateContainer]}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
        </View>
      ) : (
        <>
          <View style={globalStyles.automationEmptyStateIconContainerTop}>
            <Zap size={35} color={tokens.colors.primary} />
          </View>
          <Text
            {...testProps("text_title_empty")}
            style={globalStyles.emptyStateTitle}
          >
            {title}
          </Text>
          <Text
            {...testProps("text_description_empty")}
            style={globalStyles.emptyStateDescription}
          >
            {description}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

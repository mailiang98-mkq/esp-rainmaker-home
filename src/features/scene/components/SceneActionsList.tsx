/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Plus, Settings } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";
import SceneActions from "./SceneActions";

type SceneActionsListProps = {
  actions: any[];
  onAddPress: () => void;
  title: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
};

/**
 * SceneActionsList Component
 *
 * Reusable component for displaying scene actions list
 * Shows list of device actions or empty state
 * Used in Create Scene, Edit Scene, and other scene-related screens
 */
export default function SceneActionsList({
  actions,
  onAddPress,
  title,
  emptyStateTitle,
  emptyStateDescription,
}: SceneActionsListProps) {
  return (
    <View style={styles.container}>
      {/* Header with title and add button */}
      <View style={styles.header}>
        <Text {...testProps("text_label_actions")} style={styles.title}>
          {title}
        </Text>
        <Pressable {...testProps("button_add_action")} onPress={onAddPress}>
          <Plus
            {...testProps("icon_add_action")}
            size={20}
            color={tokens.colors.text_secondary}
          />
        </Pressable>
      </View>

      {/* Device actions list */}
      <ScrollView
        {...testProps("scroll_actions_scenes")}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {actions.length > 0 ? (
          actions.map((action: any) => (
            <SceneActions
              qaId={`scene_action_${action.device.name}`}
              key={action.nodeId + action.device.name}
              device={action.device}
              displayDeviceName={action.displayDeviceName}
              action={action.action}
              onActionPress={onAddPress}
            />
          ))
        ) : (
          <View {...testProps("view_empty_actions_scenes")} style={styles.emptyState}>
            <View style={styles.emptyStateIconContainer}>
              <Settings size={35} color={tokens.colors.primary} />
            </View>
            <Text {...testProps("text_title_empty_scenes")} style={globalStyles.emptyStateTitle}>
              {emptyStateTitle}
            </Text>
            <Text
              {...testProps("text_description_empty_scenes")}
              style={globalStyles.emptyStateDescription}
            >
              {emptyStateDescription}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: tokens.spacing._15,
    marginBottom: tokens.spacing._15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: tokens.spacing._10,
  },
  title: {
    fontSize: tokens.fontSize.sm,
    fontWeight: 500,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_primary,
    paddingLeft: tokens.spacing._5,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: tokens.spacing._10,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: "35%",
  },
  emptyStateIconContainer: {
    backgroundColor: tokens.colors.white,
    borderRadius: 48,
    padding: 20,
    marginBottom: 24,
  },
});

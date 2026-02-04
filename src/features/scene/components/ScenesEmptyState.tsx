/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { LayoutPanelLeft, Heart } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";

interface ScenesEmptyStateProps {
  isLoading: boolean;
  hasFavorites: boolean;
}

/**
 * Empty state component for scenes screen
 * Shows loading indicator, no scenes message, or all favorites message
 */
export const ScenesEmptyState = ({
  isLoading,
  hasFavorites,
}: ScenesEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <View {...testProps("view_empty_scenes")} style={globalStyles.sceneEmptyStateContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color={tokens.colors.primary} />
      ) : hasFavorites ? (
        // All scenes are favorites, so "All Scenes" is empty
        <>
          <View style={globalStyles.sceneEmptyStateIconContainer}>
            <Heart size={35} color={tokens.colors.primary} />
          </View>
          <Text {...testProps("text_title_all_favorites")} style={globalStyles.sceneEmptyStateTitleLarge}>
            {t("scene.scenes.allScenesFavorites")}
          </Text>
          <Text {...testProps("text_description_all_favorites")} style={globalStyles.emptyStateDescription}>
            {t("scene.scenes.allScenesFavoritesDescription")}
          </Text>
        </>
      ) : (
        <>
          <View style={globalStyles.sceneEmptyStateIconContainerTop}>
            <LayoutPanelLeft size={35} color={tokens.colors.primary} />
          </View>
          <Text {...testProps("text_title_empty")} style={globalStyles.emptyStateTitle}>
            {t("scene.scenes.noScenesYet")}
          </Text>
          <Text {...testProps("text_description_empty")} style={globalStyles.emptyStateDescription}>
            {t("scene.scenes.noScenesYetDescription")}
          </Text>
        </>
      )}
    </View>
  );
};

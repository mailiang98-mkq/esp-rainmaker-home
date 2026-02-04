/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { ESPCDFScene } from "@store";
import SceneItem from "./SceneItem";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";
import type { SceneLoadingState } from "@src/types/global";

interface ScenesAllScenesSectionProps {
  allScenes: ESPCDFScene[];
  favoriteScenes: ESPCDFScene[];
  favoriteSceneIds: string[];
  addingFavoriteLoading: string | null;
  sceneCardDimensions: { width: number; height: number; cardsPerRow: number };
  sceneLoadingStates: SceneLoadingState;
  isEditing: boolean;
  onFavoriteToggle: (sceneId: string) => void;
  onScenePress: (scene: ESPCDFScene) => void;
  onSceneAction: (sceneId: string, action: string) => void;
}

/**
 * All scenes section component for scenes screen
 * Displays non-favorite scenes in a grid layout
 */
export const ScenesAllScenesSection = ({
  allScenes,
  favoriteScenes,
  favoriteSceneIds,
  addingFavoriteLoading,
  sceneCardDimensions,
  sceneLoadingStates,
  isEditing,
  onFavoriteToggle,
  onScenePress,
  onSceneAction,
}: ScenesAllScenesSectionProps) => {
  const { t } = useTranslation();

  if (allScenes.length === 0) {
    return null;
  }

  return (
    <View style={[globalStyles.sceneSection, { paddingBottom: 140 }]}>
      {/* Only show "All Scenes" header if there are favorite scenes */}
      {favoriteScenes.length > 0 && (
        <Text {...testProps("text_title_all_scenes")} style={globalStyles.sceneSectionTitle}>
          {t("scene.scenes.allScenes")}
        </Text>
      )}
      {allScenes.length > 0 && (
        <View {...testProps("view_grid_all_scenes")} style={globalStyles.sceneAllScenesGrid}>
          {allScenes.map((scene, index) => (
            <SceneItem
              key={scene.id}
              index={index + 1}
              name={scene.name}
              deviceCount={scene.devicesCount}
              devices={[]}
              icon={null}
              variant="vertical"
              isFavorite={favoriteSceneIds.includes(scene.id)}
              saveFavoriteLoading={addingFavoriteLoading === scene.id}
              onFavoriteToggle={() => onFavoriteToggle(scene.id)}
              onPress={() => onScenePress(scene)}
              sceneCardDimensions={sceneCardDimensions}
              onDelete={() => onSceneAction(scene.id, "delete")}
              deleteLoading={sceneLoadingStates[scene.id] === "delete"}
              isEditing={isEditing}
              qaId={`card_scene`}
            />
          ))}
        </View>
      )}
    </View>
  );
};

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet, RefreshControl, ScrollView, View } from "react-native";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useScenes } from "@features/scene/hooks";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { ScreenWrapper, Button, InputDialog } from "@shared/components";
import {
  SceneMenuBottomSheet,
  ScenesEmptyState,
  ScenesFavoritesSection,
  ScenesAllScenesSection,
  ScenesHeader,
} from "@features/scene/components";
import { testProps } from "@shared/utils/testProps";
import type { SceneAction } from "@src/types/global";

/**
 * Scenes Component
 *
 * A screen component that displays and manages scenes.
 * Allows users to view, create, edit, and trigger scenes.
 *
 * Features:
 * - Lists all available scenes
 * - Create new scenes
 * - Edit existing scenes
 * - Trigger scenes
 * - Pull to refresh
 */
const Scenes = observer(() => {
  const { t } = useTranslation();

  const {
    // State
    isLoading,
    isEditing,
    setIsEditing,
    favoriteSceneIds,
    addingFavoriteLoading,
    selectedScene,
    isBottomSheetVisible,
    isSceneNameDialogVisible,
    sceneName,
    sceneLoadingStates,
    favoriteScenes,
    allScenes,
    sceneCardDimensions,
    getSceneMenuOptions,
    getConnectionWarning,

    // Handlers
    fetchScenes,
    handleAddScene,
    handleSceneNameConfirm,
    handleScenePress,
    handleFavoriteToggle,
    handleSceneAction,
    handleCloseBottomSheet,
    setIsSceneNameDialogVisible,
  } = useScenes();

  const hasScenes = favoriteScenes.length > 0 || allScenes.length > 0;
  const showEmptyState = !isLoading && !hasScenes;

  return (
    <>
      <ScenesHeader
        hasScenes={hasScenes}
        isEditing={isEditing}
        onEditToggle={() => setIsEditing(!isEditing)}
        onRefresh={fetchScenes}
      />
      <ScreenWrapper style={styles.container}>
        <ScrollView
          {...testProps("scroll_scenes")}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          horizontal={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchScenes} />
          }
        >
          {/* Favorites Section */}
          <ScenesFavoritesSection
            favoriteScenes={favoriteScenes}
            favoriteSceneIds={favoriteSceneIds}
            addingFavoriteLoading={addingFavoriteLoading}
            sceneCardDimensions={sceneCardDimensions}
            sceneLoadingStates={sceneLoadingStates}
            isEditing={isEditing}
            onFavoriteToggle={handleFavoriteToggle}
            onScenePress={handleScenePress}
            onSceneAction={(sceneId: string, action: string) =>
              handleSceneAction(sceneId, action as SceneAction)
            }
          />

          {/* All Scenes Section */}
          {allScenes.length > 0 ? (
            <ScenesAllScenesSection
              allScenes={allScenes}
              favoriteScenes={favoriteScenes}
              favoriteSceneIds={favoriteSceneIds}
              addingFavoriteLoading={addingFavoriteLoading}
              sceneCardDimensions={sceneCardDimensions}
              sceneLoadingStates={sceneLoadingStates}
              isEditing={isEditing}
              onFavoriteToggle={handleFavoriteToggle}
              onScenePress={handleScenePress}
              onSceneAction={(sceneId: string, action: string) =>
                handleSceneAction(sceneId, action as SceneAction)
              }
            />
          ) : showEmptyState ? (
            <ScenesEmptyState
              isLoading={isLoading}
              hasFavorites={favoriteScenes.length > 0}
            />
          ) : null}
        </ScrollView>

        {/* Fixed Add Scene Button */}
        <View style={globalStyles.footerAddButtonContainer}>
          <Button
            label={t("scene.scenes.addScene")}
            onPress={handleAddScene}
            style={globalStyles.footerAddButton}
            qaId="button_add_scenes"
          />
        </View>
      </ScreenWrapper>

      {/* Scene Menu Bottom Sheet */}
      {selectedScene && (
        <SceneMenuBottomSheet
          visible={isBottomSheetVisible}
          scene={selectedScene}
          sceneName={selectedScene.name}
          options={getSceneMenuOptions}
          onClose={handleCloseBottomSheet}
          warning={getConnectionWarning}
        />
      )}

      {/* Scene Name Input Dialog */}
      <InputDialog
        qaId="create_scene"
        open={isSceneNameDialogVisible}
        title={t("scene.scenes.createScene")}
        inputPlaceholder={t("scene.scenes.sceneNamePlaceholder")}
        confirmLabel={t("layout.shared.next")}
        cancelLabel={t("layout.shared.cancel")}
        onSubmit={handleSceneNameConfirm}
        onCancel={() => setIsSceneNameDialogVisible(false)}
        initialValue={sceneName}
      />
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg5,
  },
  scrollView: {
    flex: 1,
  },
});

export default Scenes;

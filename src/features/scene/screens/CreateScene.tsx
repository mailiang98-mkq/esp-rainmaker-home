/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";

// Styles
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Hooks
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useCDF } from "@shared/hooks/useCDF";
import { useToast } from "@shared/hooks/useToast";
import { useScene } from "@context/scenes.context";

// Icons
import { ShieldAlert } from "lucide-react-native";

// Components
import { ScreenWrapper, Header } from "@shared/components";
import {
  SceneNameInput,
  SceneActionsList,
  SceneActionButtons,
} from "@features/scene/components";

import { generateRandomId } from "@shared/utils/common";
import { testProps } from "@shared/utils/testProps";
import {
  create,
  update,
  deleteScene,
  SceneData,
  shouldDisableActionButton,
  getConnectionWarning,
} from "@features/scene/utils/sceneHelper";

import { LoadingState } from "@src/types/global";

/**
 * CreateScene Component
 *
 * A screen component for creating and editing scenes.
 * Allows users to define scene actions for multiple devices.
 *
 * Features:
 * - Create new scenes with custom names and actions
 * - Edit existing scenes
 * - Add/modify device actions
 * - Delete scenes
 * - Validate scene requirements
 
 */
const CreateScene = () => {
  // Hooks
  const { store } = useCDF();
  const { sceneStore, groupStore } = store;
  const toast = useToast();
  const router = useRouter();
  const { t } = useTranslation();
  const { state, setSceneName, setSceneId, getSceneActions, resetState } =
    useScene();

  const [loading, setLoading] = useState<LoadingState>({
    save: false,
    delete: false,
  });

  const { sceneName } = useLocalSearchParams();

  useEffect(() => {
    if (!state.isEditing) {
      setSceneId(generateRandomId());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional hook deps
  }, []);

  useEffect(() => {
    if (sceneName) {
      setSceneName(sceneName as string);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional hook deps
  }, [sceneName]);

  const disableActionButton = useMemo(() => {
    return shouldDisableActionButton(
      loading.save,
      state.sceneName,
      getSceneActions().length,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional hook deps
  }, [loading.save, state.sceneName, getSceneActions().length]);

  const warning: string = useMemo(() => {
    return getConnectionWarning(
      state.nodes,
      store.nodeStore.nodesByIDMap,
      t("scene.scenes.someDevicesNotConnected"),
    );
  }, [state.nodes, store.nodeStore.nodesByIDMap, t]);

  const handleCreateSuccess = () => {
    toast.showSuccess(t("scene.createScene.sceneCreatedSuccessfully"));
    resetState();
    router.dismissTo("/(scene)/Scenes");
    setLoading((prev) => ({ ...prev, save: false }));
  };

  const handleCreateError = (error: any) => {
    console.error("Error creating scene:", error);
    toast.showError(t("scene.errors.sceneCreationFailed"));
    setLoading((prev) => ({ ...prev, save: false }));
  };

  const handleUpdateSuccess = () => {
    toast.showSuccess(t("scene.createScene.sceneUpdatedSuccessfully"));
    resetState();
    router.dismissTo("/(scene)/Scenes");
    setLoading((prev) => ({ ...prev, save: false }));
  };

  const handleUpdateError = (error: any) => {
    console.error("Error updating scene:", error);
    toast.showError(t("scene.errors.sceneUpdateFailed"));
    setLoading((prev) => ({ ...prev, save: false }));
  };

  const handleDeleteSuccess = () => {
    toast.showSuccess(t("scene.createScene.sceneDeletedSuccessfully"));
    resetState();
    router.dismissTo("/(scene)/Scenes");
    setLoading((prev) => ({ ...prev, delete: false }));
  };

  const handleDeleteError = (error: any) => {
    console.error("Error deleting scene:", error);
    toast.showError(t("scene.errors.sceneDeletionFailed"));
    setLoading((prev) => ({ ...prev, delete: false }));
  };

  /**
   * Handles scene creation or update
   * Uses helper functions for scene operations
   */
  const handleSave = async () => {
    setLoading((prev) => ({ ...prev, save: true }));

    // Prepare scene data
    const sceneData: SceneData = {
      id: state.sceneId,
      name: state.sceneName,
      info: "",
      nodes: Object.keys(state.actions),
      actions: state.actions || {},
    };

    if (state.isEditing) {
      // Update scene using helper function
      const sceneEntity = sceneStore.scenesByID[state.sceneId];

      await update(
        state.sceneId,
        sceneData,
        sceneEntity,
        handleUpdateSuccess,
        handleUpdateError,
      );
    } else {
      // Create scene using helper function
      const currentHomeId = groupStore?.currentHomeId;
      const currentHome = currentHomeId
        ? groupStore?.groupsByIDMap?.[currentHomeId]
        : null;

      await create(
        sceneData,
        currentHome,
        handleCreateSuccess,
        handleCreateError,
      );
    }
  };

  /**
   * Handles scene deletion
   * Uses helper function for scene deletion
   */
  const handleDelete = async () => {
    setLoading((prev) => ({ ...prev, delete: true }));

    const sceneEntity = sceneStore.scenesByID[state.sceneId];

    await deleteScene(
      state.sceneId,
      sceneEntity,
      handleDeleteSuccess,
      handleDeleteError,
    );
  };

  /**
   * Navigates to device action selection screen
   * Passes current scene data for context
   */
  const handleAddDeviceAction = () => {
    router.push({
      pathname: "/(scene)/SceneDeviceSelection",
    } as any);
  };

  const handleBackPress = () => {
    resetState();
    router.dismissTo("/(scene)/Scenes");
  };

  return (
    <>
      <Header
        label={
          state.isEditing
            ? t("scene.createScene.editScene")
            : t("scene.createScene.title")
        }
        showBack={true}
        onBackPress={handleBackPress}
      />
      <ScreenWrapper style={globalStyles.container}>
        {warning && (
          <View
            style={[globalStyles.warningContainer, { marginHorizontal: 0 }]}
          >
            <ShieldAlert size={tokens.fontSize.xs} color={tokens.colors.warn} />
            <Text
              {...testProps("text_warning")}
              style={globalStyles.warningText}
            >
              {warning}
            </Text>
          </View>
        )}

        {/* SCENE NAME */}
        <SceneNameInput
          value={state.sceneName}
          onChange={setSceneName}
          placeholder={t("scene.createScene.sceneNamePlaceholder")}
          title={t("scene.createScene.sceneName")}
        />

        {/* SCENE ACTIONS */}
        <SceneActionsList
          actions={getSceneActions()}
          onAddPress={handleAddDeviceAction}
          title={t("scene.createScene.sceneActions")}
          emptyStateTitle={t("scene.createScene.noActionsSelected")}
          emptyStateDescription={t(
            "scene.createScene.noActionsSelectedDescription",
          )}
        />

        {/* ACTION BUTTONS */}
        <SceneActionButtons
          isEditing={state.isEditing}
          loadingSave={loading.save}
          loadingDelete={loading.delete}
          disabled={disableActionButton}
          onSave={handleSave}
          onDelete={handleDelete}
          saveLabel={
            state.isEditing
              ? t("layout.shared.update")
              : t("layout.shared.save")
          }
          deleteLabel={t("layout.shared.delete")}
        />
      </ScreenWrapper>
    </>
  );
};

export default CreateScene;

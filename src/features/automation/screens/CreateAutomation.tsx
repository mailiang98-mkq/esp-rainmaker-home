/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useToast } from "@shared/hooks/useToast";
import { useAutomation } from "@context/automation.context";
import { useCreateAutomation } from "@features/automation/hooks";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { Header, ScreenWrapper } from "@shared/components";
import {
  CreateAutomationNameSection,
  CreateAutomationRetriggerSection,
  CreateAutomationEventsSection,
  CreateAutomationActionsSection,
  CreateAutomationActionButtons,
} from "@features/automation/components";

/**
 * CreateAutomation Screen – UI / presentation layer.
 * Business logic in useCreateAutomation and utils/automation.
 * Handles toast, navigation, and translations; hook returns structured results.
 */
export function CreateAutomationScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const { resetState } = useAutomation();
  const { automationName, automationId, isEditing } = useLocalSearchParams<{
    automationName?: string;
    automationId?: string;
    isEditing?: string;
  }>();

  const {
    state,
    setAutomationName,
    setRetrigger,
    loading,
    isValidAutomation,
    eventInfo,
    eventDevice,
    actionCards,
    createAutomation,
    updateAutomation,
    deleteAutomation,
  } = useCreateAutomation({
    automationName,
    automationId,
    isEditing,
  });

  const resetAndNavigateToAutomations = useCallback(() => {
    resetState();
    router.dismissTo("/(automation)/Automations");
  }, [resetState, router]);

  const handleAddEvent = useCallback(() => {
    router.push({
      pathname: "/(automation)/EventDeviceSelection",
      params: {
        isEditingEvent: state.isEditing ? "true" : "false",
      },
    } as any);
  }, [router, state.isEditing]);

  const handleAddAction = useCallback(() => {
    router.push({
      pathname: "/(automation)/ActionDeviceSelection",
      params: {
        isEditingAction: state.isEditing ? "true" : "false",
      },
    } as any);
  }, [router, state.isEditing]);

  const handleCreateAutomation = useCallback(async () => {
    if (!state.automationName?.trim()) {
      toast.showError(
        t("automation.errors.failedToCreateAutomation"),
        t("automation.errors.pleaseEnterAutomationName"),
      );
      return;
    }
    const result = await createAutomation();
    if (result.status === "success") {
      toast.showSuccess(
        t("automation.createAutomation.automationCreated"),
        t("automation.createAutomation.automationCreatedMessage"),
      );
      resetAndNavigateToAutomations();
    } else {
      toast.showError(
        t("automation.errors.failedToCreateAutomation"),
        result.description ?? t("automation.errors.fallback"),
      );
    }
  }, [
    state.automationName,
    createAutomation,
    toast,
    t,
    resetAndNavigateToAutomations,
  ]);

  const handleUpdateAutomation = useCallback(async () => {
    if (!state.automationName?.trim()) {
      toast.showError(
        t("automation.errors.updateFailedMessage"),
        t("automation.errors.pleaseEnterAutomationName"),
      );
      return;
    }
    const result = await updateAutomation();
    if (result.status === "success") {
      toast.showSuccess(
        t("automation.createAutomation.automationUpdated"),
        t("automation.createAutomation.automationUpdatedMessage"),
      );
      resetAndNavigateToAutomations();
    } else {
      toast.showError(
        t("automation.errors.updateFailedMessage"),
        result.description ?? t("automation.errors.fallback"),
      );
    }
  }, [
    state.automationName,
    updateAutomation,
    toast,
    t,
    resetAndNavigateToAutomations,
  ]);

  const handleDeleteAutomation = useCallback(async () => {
    const result = await deleteAutomation();
    if (result.status === "success") {
      toast.showSuccess(
        t("automation.createAutomation.automationDeleted"),
        t("automation.createAutomation.automationDeletedMessage"),
      );
      resetAndNavigateToAutomations();
    } else {
      toast.showError(
        t("automation.errors.deleteFailedMessage"),
        result.description ?? t("automation.errors.fallback"),
      );
    }
  }, [deleteAutomation, toast, t, resetAndNavigateToAutomations]);

  const eventDeviceShape = eventDevice
    ? { type: eventDevice.type ?? "switch", name: eventDevice.name }
    : null;
  const eventDisplayName =
    eventDevice?.displayName ?? eventInfo?.deviceName ?? "";

  return (
    <>
      <Header
        label={
          state.isEditing
            ? t("automation.createAutomation.editAutomation")
            : t("automation.createAutomation.title")
        }
        showBack={true}
        onBackPress={resetAndNavigateToAutomations}
      />
      <ScreenWrapper style={globalStyles.container}>
        <CreateAutomationNameSection
          title={t("automation.createAutomation.automationName")}
          placeholder={t(
            "automation.createAutomation.automationNamePlaceholder",
          )}
          value={state.automationName ?? ""}
          onNameChange={setAutomationName}
        />
        <CreateAutomationRetriggerSection
          label={t("automation.createAutomation.retrigger")}
          description={t("automation.createAutomation.retriggerDescription")}
          checked={state.retrigger}
          onCheckedChange={setRetrigger}
        />
        <CreateAutomationEventsSection
          sectionLabel={t("automation.createAutomation.event")}
          hasEvents={state.events.length > 0}
          emptyTitle={t("automation.createAutomation.noEventSelected")}
          emptyDescription={t(
            "automation.createAutomation.noEventSelectedDescription",
          )}
          eventInfo={eventInfo}
          eventDevice={eventDeviceShape}
          eventDisplayName={eventDisplayName}
          onAddEvent={handleAddEvent}
        />
        {state.events.length > 0 && (
          <CreateAutomationActionsSection
            sectionLabel={t("automation.createAutomation.actions")}
            hasActions={Object.keys(state.actions).length > 0}
            emptyTitle={t("automation.createAutomation.noActionsSelected")}
            emptyDescription={t(
              "automation.createAutomation.noActionsSelectedDescription",
              {
                action: state.isEditing ? "update" : "create",
              },
            )}
            actionCards={actionCards}
            onAddAction={handleAddAction}
          />
        )}
        <CreateAutomationActionButtons
          isEditing={state.isEditing}
          loadingSave={loading.save}
          loadingDelete={loading.delete}
          disableSave={loading.save || !isValidAutomation}
          disableDelete={loading.delete}
          createButtonLabel={t(
            "automation.actionDeviceSelection.createAutomation",
          )}
          updateButtonLabel={t("layout.shared.update")}
          deleteButtonLabel={t("layout.shared.delete")}
          onCreate={handleCreateAutomation}
          onUpdate={handleUpdateAutomation}
          onDelete={handleDeleteAutomation}
        />
      </ScreenWrapper>
    </>
  );
}

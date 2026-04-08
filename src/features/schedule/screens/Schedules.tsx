/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet, View } from "react-native";

// Styles
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Hooks
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { useSchedulesList } from "@features/schedule/hooks";

// Components
import {
  Header,
  ScreenWrapper,
  Button,
  InputDialog,
} from "@shared/components";
import {
  SchedulesHeaderActions,
  SchedulesList,
} from "@features/schedule/components";

/**
 * SchedulesScreen
 *
 * A screen component that displays and manages schedules.
 * Allows users to view, create, edit, enable, disable schedules.
 *
 * Features:
 * - Lists all available schedules
 * - Create new schedules
 * - Edit existing schedules
 * - Enable existing schedules
 * - Disable existing schedules
 * - Pull to refresh
 */
export const SchedulesScreen = observer(() => {
  const { t } = useTranslation();
  const {
    schedulesList,
    isLoading,
    isEditing,
    scheduleLoadingStates,
    isScheduleNameDialogVisible,
    scheduleName,
    fetchSchedules,
    setIsEditing,
    handleAddSchedule,
    handleScheduleNameConfirm,
    handleScheduleAction,
    setIsScheduleNameDialogVisible,
  } = useSchedulesList();

  return (
    <>
      <Header
        label={t("schedule.schedules.title")}
        showBack={false}
        rightSlot={
          <SchedulesHeaderActions
            hasSchedules={schedulesList.length > 0}
            isEditing={isEditing}
            onEditToggle={() => setIsEditing(!isEditing)}
            onRefresh={fetchSchedules}
          />
        }
      />

      <ScreenWrapper style={styles.container}>
        <SchedulesList
          schedules={schedulesList}
          isLoading={isLoading}
          isEditing={isEditing}
          scheduleLoadingStates={scheduleLoadingStates}
          onRefresh={fetchSchedules}
          onScheduleAction={handleScheduleAction}
        />

        {/* Fixed Add Schedule Button */}
        <View style={globalStyles.footerAddButtonContainer}>
          <Button
            label={t("schedule.schedules.addSchedule")}
            onPress={handleAddSchedule}
            style={globalStyles.footerAddButton}
            qaId="button_add_schedules"
          />
        </View>
      </ScreenWrapper>

      {/* Schedule Name Input Dialog */}
      <InputDialog
        qaId="create_schedule"
        open={isScheduleNameDialogVisible}
        title={t("schedule.schedules.createSchedule")}
        inputPlaceholder={t("schedule.schedules.scheduleNamePlaceholder")}
        confirmLabel={t("layout.shared.next")}
        cancelLabel={t("layout.shared.cancel")}
        onSubmit={handleScheduleNameConfirm}
        onCancel={() => setIsScheduleNameDialogVisible(false)}
        initialValue={scheduleName}
      />
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg5,
  },
});

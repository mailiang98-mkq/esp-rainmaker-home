/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScrollView, RefreshControl } from "react-native";
import type { ESPCDFSchedule } from "@store";
import ScheduleCard from "./ScheduleCard";
import { SchedulesEmptyState } from "./SchedulesEmptyState";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";

interface SchedulesListProps {
  schedules: ESPCDFSchedule[];
  isLoading: boolean;
  isEditing: boolean;
  scheduleLoadingStates: Record<string, string>;
  onRefresh: () => void;
  onScheduleAction: (schedule: ESPCDFSchedule, action: string) => void;
}

/**
 * SchedulesList Component
 *
 * Displays a scrollable list of schedules with pull-to-refresh functionality.
 * Shows empty state when no schedules exist.
 */
export const SchedulesList = ({
  schedules,
  isLoading,
  isEditing,
  scheduleLoadingStates,
  onRefresh,
  onScheduleAction,
}: SchedulesListProps) => {
  return (
    <ScrollView
      {...testProps("scroll_schedules")}
      style={globalStyles.schedulesScrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 150,
      }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {schedules.length > 0
        ? schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              name={schedule.name}
              triggers={schedule.triggers}
              deviceCount={schedule.devicesCount}
              enabled={schedule.enabled || false}
              isEditing={isEditing}
              onToggle={(value) =>
                onScheduleAction(schedule, value ? "enable" : "disable")
              }
              onPress={() => onScheduleAction(schedule, "edit")}
              onDelete={() => onScheduleAction(schedule, "delete")}
              deleteLoading={
                scheduleLoadingStates[schedule.id] === "delete"
              }
              qaId="card_schedule"
              toggleLoading={
                scheduleLoadingStates[schedule.id] === "enable" ||
                scheduleLoadingStates[schedule.id] === "disable"
              }
            />
          ))
        : <SchedulesEmptyState isLoading={isLoading} />}
    </ScrollView>
  );
};

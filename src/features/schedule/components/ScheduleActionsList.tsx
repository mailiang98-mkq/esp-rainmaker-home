/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import ScheduleActions from "./ScheduleActions";
import ScheduleActionsHeader from "./ScheduleActionsHeader";
import { testProps } from "@shared/utils/testProps";

interface ScheduleAction {
  nodeId: string;
  device: {
    name: string;
  };
  displayDeviceName: string;
  action: any;
}

interface ScheduleActionsListProps {
  scheduleActions: ScheduleAction[];
  onAddDeviceAction: () => void;
}

/**
 * ScheduleActionsList Component
 *
 * Displays a scrollable list of schedule actions with an empty state.
 */
export const ScheduleActionsList = ({
  scheduleActions,
  onAddDeviceAction,
}: ScheduleActionsListProps) => {
  const { t } = useTranslation();

  return (
    <View style={[globalStyles.section, globalStyles.scheduleActionsContainer]}>
      <ScheduleActionsHeader onAddPress={onAddDeviceAction} />

      {/* Device actions list */}
      <ScrollView
        {...testProps("scroll_schedule_actions")}
        style={globalStyles.scheduleActionsDeviceList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={globalStyles.scheduleActionsDeviceListContent}
      >
        {scheduleActions.length > 0 ? (
          scheduleActions.map((action: ScheduleAction) => (
            <ScheduleActions
              key={action.nodeId + action.device.name}
              device={action.device}
              displayDeviceName={action.displayDeviceName}
              action={action.action}
              onActionPress={onAddDeviceAction}
              nodeId={action.nodeId}
            />
          ))
        ) : (
          <View {...testProps("view_empty_actions")} style={globalStyles.scheduleActionsEmptyStateContainer}>
            <View style={globalStyles.scheduleActionsEmptyStateIconContainer}>
              <Settings size={35} color={tokens.colors.primary} />
            </View>
            <Text {...testProps("text_title_empty_schedule")} style={globalStyles.emptyStateTitle}>
              {t("schedule.createSchedule.noActionsSelected")}
            </Text>
            <Text {...testProps("text_description_empty_schedule")} style={globalStyles.emptyStateDescription}>
              {t("schedule.createSchedule.noActionsSelectedDescription")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Edit3 } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { ContentWrapper, Input } from "@shared/components";

interface ScheduleNameInputProps {
  scheduleName: string;
  onNameChange: (name: string) => void;
}

/**
 * ScheduleNameInput Component
 *
 * Displays an input field for schedule name with an edit icon.
 */
export const ScheduleNameInput = ({
  scheduleName,
  onNameChange,
}: ScheduleNameInputProps) => {
  const { t } = useTranslation();

  return (
    <ContentWrapper
      title={t("schedule.createSchedule.scheduleName")}
      style={globalStyles.scheduleNameContentWrapper}
    >
      <View style={globalStyles.scheduleNameInputContainer}>
        <Input
          qaId="schedule_name"
          placeholder={t("schedule.createSchedule.scheduleNamePlaceholder")}
          value={scheduleName}
          onFieldChange={onNameChange}
          style={globalStyles.scheduleNameInput}
          border={false}
          paddingHorizontal={false}
          marginBottom={false}
        />
        <View style={globalStyles.scheduleNameEditIcon}>
          <Edit3 size={20} color={tokens.colors.text_secondary} />
        </View>
      </View>
    </ContentWrapper>
  );
};

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { ActionButton } from "@shared/components";
import { testProps } from "@shared/utils/testProps";

interface ScheduleParamsSaveButtonProps {
  disabled: boolean;
  onPress: () => void;
}

/**
 * ScheduleParamsSaveButton Component
 *
 * Displays a save/done button for schedule parameter selection.
 */
export const ScheduleParamsSaveButton = ({
  disabled,
  onPress,
}: ScheduleParamsSaveButtonProps) => {
  const { t } = useTranslation();

  return (
    <View
      style={[
        globalStyles.actionButtonContainer,
        globalStyles.scheduleParamsSaveButtonContainer,
      ]}
    >
      <ActionButton
        qaId="button_done_schedule_params"
        onPress={onPress}
        disabled={disabled}
        variant="secondary"
      >
        <View style={globalStyles.scheduleParamsSaveButtonContent}>
          <Text
            {...testProps("text_done_schedule_device_params_selection")}
            style={[globalStyles.fontMedium]}
          >
            {t("layout.shared.done")}
          </Text>
        </View>
      </ActionButton>
    </View>
  );
};

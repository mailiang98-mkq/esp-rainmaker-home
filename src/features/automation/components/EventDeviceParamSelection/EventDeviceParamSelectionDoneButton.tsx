/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { ActionButton } from "@shared/components";
import { testProps } from "@shared/utils/testProps";
import { eventDeviceParamSelectionStyles as styles } from "../../theme/eventDeviceParamSelectionStyles";

export interface EventDeviceParamSelectionDoneButtonProps {
  disabled: boolean;
  label: string;
  onPress: () => void;
}

export const EventDeviceParamSelectionDoneButton: React.FC<
  EventDeviceParamSelectionDoneButtonProps
> = ({ disabled, label, onPress }) => {
  return (
    <View style={[globalStyles.actionButtonContainer, styles.buttonContainer]}>
      <ActionButton
        qaId="button_create_event"
        onPress={onPress}
        disabled={disabled}
        variant="secondary"
      >
        <View style={styles.buttonContent}>
          <Text
            {...testProps("text_done_event_device_param_selection")}
            style={globalStyles.fontMedium}
          >
            {label}
          </Text>
        </View>
      </ActionButton>
    </View>
  );
};

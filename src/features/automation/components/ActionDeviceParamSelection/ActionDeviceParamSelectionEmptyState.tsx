/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text } from "react-native";
import { TriangleAlert } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";
import { actionDeviceParamSelectionStyles as styles } from "../../theme/actionDeviceParamSelectionStyles";

export interface ActionDeviceParamSelectionEmptyStateProps {
  title: string;
}

export const ActionDeviceParamSelectionEmptyState: React.FC<
  ActionDeviceParamSelectionEmptyStateProps
> = ({ title }) => {
  return (
    <View
      {...testProps("view_action_params_selection")}
      style={styles.incompatibleParamsContainer}
    >
      <View
        {...testProps("view_action_params_selection")}
        style={styles.incompatibleParamsIconContainer}
      >
        <TriangleAlert
          {...testProps("alert_icon_action_params_selection")}
          size={35}
          color={tokens.colors.primary}
        />
      </View>
      <Text
        {...testProps("text_title_no_compatible_params")}
        style={styles.incompatibleParamsTitle}
      >
        {title}
      </Text>
    </View>
  );
};

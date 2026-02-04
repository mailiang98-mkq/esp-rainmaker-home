/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { ShieldAlert } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

interface ScheduleWarningBannerProps {
  warning: string;
}

/**
 * ScheduleWarningBanner Component
 *
 * Displays a warning banner when there are issues with schedule devices.
 */
export const ScheduleWarningBanner = ({ warning }: ScheduleWarningBannerProps) => {
  if (!warning) return null;

  return (
    <View
      style={[globalStyles.warningContainer, { marginHorizontal: 0 }]}
    >
      <ShieldAlert size={tokens.fontSize.xs} color={tokens.colors.warn} />
      <Text style={globalStyles.warningText}>{warning}</Text>
    </View>
  );
};

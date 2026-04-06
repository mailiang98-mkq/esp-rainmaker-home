/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { ActionButton } from "@shared/components";

interface ScheduleDeviceSelectionFooterProps {
  selectedDevicesCount: number;
}

/**
 * ScheduleDeviceSelectionFooter Component
 *
 * Displays footer with done button for device selection.
 */
export const ScheduleDeviceSelectionFooter = ({
  selectedDevicesCount,
}: ScheduleDeviceSelectionFooterProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={globalStyles.sceneFooter}>
      <ActionButton
        qaId="button_done_schedule_selection"
        onPress={() => router.back()}
        disabled={selectedDevicesCount === 0}
        variant="secondary"
      >
        <View>
          <Text style={[globalStyles.fontMedium]}>
            {t("layout.shared.done")}
          </Text>
        </View>
      </ActionButton>
    </View>
  );
};

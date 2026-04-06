/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { ActionButton } from "@shared/components";

interface DeviceSelectionFooterProps {
  selectedDevicesCount: number;
}

/**
 * DeviceSelectionFooter Component
 *
 * Footer with done button for device selection screen
 * Shows loading indicator when no devices are selected
 */
export default function DeviceSelectionFooter({
  selectedDevicesCount,
}: DeviceSelectionFooterProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={[globalStyles.sceneFooter]}>
      <ActionButton
        qaId="button_done_scene_selection"
        onPress={() => router.back()}
        disabled={selectedDevicesCount === 0}
        variant="secondary"
      >
        {selectedDevicesCount === 0 ? (
          <ActivityIndicator size="small" color={tokens.colors.white} />
        ) : (
          <View>
            <Text style={[globalStyles.fontMedium]}>
              {t("layout.shared.done")}
            </Text>
          </View>
        )}
      </ActionButton>
    </View>
  );
}

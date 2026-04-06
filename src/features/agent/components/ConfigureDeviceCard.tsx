/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { getDeviceImage, extractDeviceType, findDeviceConfig } from "@shared/utils/device";
import { testProps } from "@shared/utils/testProps";
import type { AIDeviceData } from "@src/types/global";

interface ConfigureDeviceCardProps {
  deviceData: AIDeviceData;
  index: number;
  deviceKey: string;
  isSelected: boolean;
  isUpdating: boolean;
  onPress: () => void;
}

export function ConfigureDeviceCard({
  deviceData,
  index,
  deviceKey,
  isSelected,
  isUpdating,
  onPress,
}: ConfigureDeviceCardProps) {
  const { t } = useTranslation();
  const isDeviceOnline =
    deviceData.node.connectivityStatus?.isConnected || false;
  const deviceImage = getDeviceImage(deviceData.device.type, isDeviceOnline);
  const deviceType = extractDeviceType(deviceData.device.type);
  const deviceConfig = findDeviceConfig(deviceType);

  return (
    <Pressable
      key={deviceKey}
      {...testProps(`view_device_card_${index}`)}
      onPress={onPress}
      disabled={!isDeviceOnline || isUpdating}
      style={[
        globalStyles.deviceCard,
        globalStyles.configureDeviceCard,
        isSelected && globalStyles.configureDeviceCardSelected,
        !isDeviceOnline && globalStyles.deviceCardDisabled,
        isUpdating && globalStyles.configureDeviceCardUpdating,
      ]}
    >
      <View style={globalStyles.configureDeviceIconContainer}>
        <Image
          source={deviceImage}
          style={globalStyles.configureDeviceIcon}
          resizeMode="contain"
        />
      </View>

      <View style={globalStyles.flex1}>
        <Text
          style={[
            globalStyles.fontMd,
            globalStyles.fontMedium,
            globalStyles.textPrimary,
          ]}
          numberOfLines={1}
        >
          {deviceData.device.displayName}
        </Text>
        {deviceConfig && (
          <Text style={[globalStyles.fontSm, globalStyles.textSecondary]}>
            {deviceConfig.groupLabel || deviceConfig.name}
          </Text>
        )}
      </View>

      {isUpdating ? (
        <ActivityIndicator size="small" color={tokens.colors.primary} />
      ) : !isDeviceOnline ? (
        <Text style={globalStyles.configureOfflineBadge}>
          {t("layout.shared.offline")}
        </Text>
      ) : null}
    </Pressable>
  );
}

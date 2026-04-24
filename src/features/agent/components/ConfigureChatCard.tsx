/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";

interface ConfigureChatCardProps {
  onPress: () => void;
}

/**
 * Entry card on the configure flow that navigates to chat-oriented setup when pressed.
 */
export function ConfigureChatCard({ onPress }: ConfigureChatCardProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      {...testProps("view_chat_card")}
      onPress={onPress}
      style={[
        globalStyles.deviceCard,
        globalStyles.configureDeviceCard,
        globalStyles.configureChatCard,
      ]}
    >
      <View style={globalStyles.configureDeviceIconContainer}>
        <MessageSquare strokeWidth={1} size={32} color={tokens.colors.black} />
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
          {t("agent.configure.defaultChat")}
        </Text>
        <Text style={[globalStyles.fontSm, globalStyles.textSecondary]}>
          {t("agent.configure.addAgentToChat")}
        </Text>
      </View>
    </Pressable>
  );
}

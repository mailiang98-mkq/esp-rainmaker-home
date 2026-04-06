/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Text, ActivityIndicator, Pressable, TouchableWithoutFeedback } from "react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { AgentConfigResponse } from "@src/types/global";

type AgentConfigTool = NonNullable<AgentConfigResponse["tools"]>[number];

interface ChatSettingsToolCardProps {
  tool: AgentConfigTool;
  index: number;
  cardWidth: number;
  isInTools: boolean;
  connectionStatus: { isConnected: boolean } | null;
  isConnecting: boolean;
  isDisconnecting: boolean;
  onConnect: (tool: AgentConfigTool) => void;
  onDisconnect: (tool: AgentConfigTool) => void;
}

export function ChatSettingsToolCard({
  tool,
  index,
  cardWidth,
  isInTools,
  connectionStatus,
  isConnecting,
  isDisconnecting,
  onConnect,
  onDisconnect,
}: ChatSettingsToolCardProps) {
  const { t } = useTranslation();

  return (
    <TouchableWithoutFeedback>
      <Pressable
        style={({ pressed }) => [
          globalStyles.chatSettingsToolCard,
          {
            width: cardWidth,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={globalStyles.chatSettingsToolName} numberOfLines={2}>
          {tool.name || `Tool ${index + 1}`}
        </Text>
        {isInTools && connectionStatus ? (
          connectionStatus.isConnected ? (
            <Pressable
              style={({ pressed }) => [
                globalStyles.chatSettingsConnectedBadge,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => onDisconnect(tool)}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <ActivityIndicator
                  size="small"
                  color={tokens.colors.primary}
                />
              ) : (
                <Text style={globalStyles.chatSettingsConnectedText}>
                  {t("chatSettings.connected") || "Connected"}
                </Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                globalStyles.chatSettingsConnectButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => onConnect(tool)}
              disabled={isConnecting}
            >
              <Text style={globalStyles.chatSettingsConnectButtonText}>
                {isConnecting
                  ? t("chatSettings.connecting") || "Connecting..."
                  : t("chatSettings.connect") || "Connect"}
              </Text>
            </Pressable>
          )
        ) : null}
      </Pressable>
    </TouchableWithoutFeedback>
  );
}

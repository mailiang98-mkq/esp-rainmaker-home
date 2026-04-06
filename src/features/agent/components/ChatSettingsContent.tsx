/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { CollapsibleCard } from "@shared/components";
import FontSizeSlider from "./FontSizeSlider";
import { ChatSettingsBasicInfo } from "./ChatSettingsBasicInfo";
import { ChatSettingsToolCard } from "./ChatSettingsToolCard";
import { AgentConfigResponse } from "@src/types/global";

type AgentConfigTool = NonNullable<AgentConfigResponse["tools"]>[number];

interface ChatSettingsContentProps {
  isLoading: boolean;
  error: string | null;
  agentConfig: AgentConfigResponse | null;
  fontSize: number;
  conversationId: string | null;
  onRetry: () => void;
  onFontSizeChange: (value: number) => void;
  onConnectTool: (tool: AgentConfigTool) => void;
  onDisconnectTool: (tool: AgentConfigTool) => void;
  getToolConnectionStatus: (
    url: string,
    expectedConnectorId?: string,
  ) => { isConnected: boolean } | null;
  getExpectedConnectorId: (tool: AgentConfigTool) => string | undefined;
  isToolInConfig: (tool: AgentConfigTool) => boolean;
  connectingToolUrl: string | null;
  disconnectingToolUrl: string | null;
}

export function ChatSettingsContent({
  isLoading,
  error,
  agentConfig,
  fontSize,
  conversationId,
  onRetry,
  onFontSizeChange,
  onConnectTool,
  onDisconnectTool,
  getToolConnectionStatus,
  getExpectedConnectorId,
  isToolInConfig,
  connectingToolUrl,
  disconnectingToolUrl,
}: ChatSettingsContentProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const getCardWidth = () => {
    if (width <= 500) {
      return (width - tokens.spacing._15 * 3) / 2;
    }
    return 180;
  };

  const cardWidth = getCardWidth();

  if (isLoading) {
    return (
      <View style={globalStyles.chatSettingsCenterContainer}>
        <ActivityIndicator size="large" color={tokens.colors.primary} />
        <Text style={globalStyles.chatSettingsLoadingText}>
          Loading agent configuration...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.chatSettingsCenterContainer}>
        <AlertCircle size={48} color={tokens.colors.error} />
        <Text style={globalStyles.chatSettingsErrorText}>{error}</Text>
        <TouchableOpacity
          style={globalStyles.chatSettingsRetryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={globalStyles.chatSettingsRetryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!agentConfig) {
    return (
      <View style={globalStyles.chatSettingsCenterContainer}>
        <Text style={globalStyles.chatSettingsEmptyText}>
          No agent configuration available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.chatSettingsScrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={globalStyles.chatSettingsScrollContent}
    >
      <CollapsibleCard
        title={t("chatSettings.agentInfo") || "Agent Information"}
        defaultExpanded={true}
        style={{
          ...globalStyles.shadowElevationForLightTheme,
          backgroundColor: tokens.colors.white,
        }}
      >
        <ChatSettingsBasicInfo
          agentConfig={agentConfig}
          conversationId={conversationId}
        />
      </CollapsibleCard>

      <View style={globalStyles.chatSettingsSectionContainer}>
        <Text style={globalStyles.chatSettingsSectionTitle}>
          {t("chatSettings.tools") || "Tools"}
        </Text>
        {!agentConfig.tools || agentConfig.tools.length === 0 ? (
          <Text style={globalStyles.chatSettingsEmptyText}>
            {t("chatSettings.noTools") || "No tools configured"}
          </Text>
        ) : (
          <View style={globalStyles.chatSettingsCardsGrid}>
            {agentConfig.tools.map((tool: AgentConfigTool, index: number) => {
              const isInTools = isToolInConfig(tool);
              const expectedConnectorId = getExpectedConnectorId(tool);
              const connectionStatus = isInTools
                ? getToolConnectionStatus(tool.url, expectedConnectorId)
                : null;

              return (
                <ChatSettingsToolCard
                  key={tool.url ?? index}
                  tool={tool}
                  index={index}
                  cardWidth={cardWidth}
                  isInTools={isInTools}
                  connectionStatus={connectionStatus}
                  isConnecting={connectingToolUrl === tool.url}
                  isDisconnecting={disconnectingToolUrl === tool.url}
                  onConnect={onConnectTool}
                  onDisconnect={onDisconnectTool}
                />
              );
            })}
          </View>
        )}
      </View>

      <CollapsibleCard
        title={t("chatSettings.fontSize") || "Font Size"}
        defaultExpanded={false}
        style={{
          ...globalStyles.shadowElevationForLightTheme,
          backgroundColor: tokens.colors.white,
        }}
      >
        <View style={{ padding: tokens.spacing._10 }}>
          <FontSizeSlider
            value={fontSize}
            onValueChange={onFontSizeChange}
            minimumValue={1}
            maximumValue={4}
            step={1}
          />
        </View>
      </CollapsibleCard>
    </ScrollView>
  );
}

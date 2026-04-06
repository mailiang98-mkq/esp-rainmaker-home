/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { TouchableWithoutFeedback, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { InfoRow } from "@shared/components";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { AgentConfigResponse } from "@src/types/global";

interface ChatSettingsBasicInfoProps {
  agentConfig: AgentConfigResponse;
  conversationId: string | null;
}

export function ChatSettingsBasicInfo({
  agentConfig,
  conversationId,
}: ChatSettingsBasicInfoProps) {
  const { t } = useTranslation();

  return (
    <TouchableWithoutFeedback>
      <Pressable
        style={({ pressed }) => [
          globalStyles.infoContainer,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <InfoRow
          label={t("chatSettings.agentId") || "Agent ID"}
          value={agentConfig.agentId}
          isCopyable={true}
          scrollable={true}
          rightAligned={true}
        />
        <InfoRow
          label={t("chatSettings.name") || "Name"}
          value={agentConfig.name}
          scrollable={true}
          rightAligned={true}
        />
        {agentConfig.createdByName && (
          <InfoRow
            label={t("chatSettings.createdBy") || "Created By"}
            value={agentConfig.createdByName}
            scrollable={true}
            rightAligned={true}
          />
        )}
        <InfoRow
          label={t("chatSettings.textModelId") || "Text Model ID"}
          value={agentConfig.textModelId}
          scrollable={true}
          rightAligned={true}
        />
        <InfoRow
          label={t("chatSettings.speechModelId") || "Speech Model ID"}
          value={agentConfig.speechModelId}
          scrollable={true}
          rightAligned={true}
        />
        <InfoRow
          label={t("chatSettings.conversationId") || "Conversation ID"}
          value={
            conversationId ||
            t("chatSettings.noConversation") ||
            "No conversation"
          }
          isCopyable={!!conversationId}
          scrollable={true}
          rightAligned={true}
        />
      </Pressable>
    </TouchableWithoutFeedback>
  );
}

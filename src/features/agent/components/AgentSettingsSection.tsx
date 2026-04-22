/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import { View, Text } from "react-native";
import { agentSelectionSheetStyles } from "@features/agent/theme";
import { AgentCard } from "./AgentCard";
import type { AgentConfig } from "@src/types/global";

interface AgentSettingsSectionProps {
  title: string;
  agents: AgentConfig[];
  selectedAgentId: string;
  isEditing: boolean;
  actionLoading: string | null;
  onSelectAgent: (agent: AgentConfig) => void;
  onDeleteAgent: (agent: AgentConfig) => void;
}

/**
 * Titled block that lists agents as selectable cards with loading state per agent and delete in edit mode.
 */
export function AgentSettingsSection({
  title,
  agents,
  selectedAgentId,
  isEditing,
  actionLoading,
  onSelectAgent,
  onDeleteAgent,
}: AgentSettingsSectionProps) {
  if (agents.length === 0) return null;

  return (
    <View
      style={[
        agentSelectionSheetStyles.section,
        { paddingHorizontal: 0, marginBottom: 0 },
      ]}
    >
      <Text style={agentSelectionSheetStyles.sectionTitle}>{title}</Text>
      {agents.map((agent) => {
        const isAgentLoading = actionLoading === agent.id;
        return (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={selectedAgentId === agent.agentId}
            isEditing={isEditing}
            isLoading={isAgentLoading}
            onPress={() =>
              !isEditing && !isAgentLoading && onSelectAgent(agent)
            }
            onDelete={() => onDeleteAgent(agent)}
          />
        );
      })}
    </View>
  );
}

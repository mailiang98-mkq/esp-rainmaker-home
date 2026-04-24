/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import StorageAdapter from '@native-adaptors/implementations/ESPAsyncStorage';

import { ESPCDFUser } from '@store';
import { getAgentConfig as fetchAgentConfig } from './apiHelper';
import type { ConnectedConnector } from '@src/types/global';
import { AGENTS_WEBSOCKET_BASE_URL, DEFAULT_AGENT_ID, RAINMAKER_MCP_CONNECTOR_URL } from '@/config/agent.config';
import { TOKEN_STORAGE_KEYS } from './constants';
import { getSelectedAgentId } from './storage';
import type { AgentConfigResponse } from './types';
import type { ToolConnectionStatus } from '@src/types/global';

// ==================== Agent Config Cache ====================

const AGENT_CONFIGS_MAP_KEY = 'agents_config';

/**
 * Retrieves agent config from cache for downstream consumers.
 */
export const getAgentConfigFromCache = async (
  agentId: string
): Promise<AgentConfigResponse | null> => {
  try {
    if (!agentId || typeof agentId !== 'string') {
      return null;
    }

    const trimmedAgentId = agentId.trim();
    if (!trimmedAgentId) {
      return null;
    }

    const cachedConfigs = await StorageAdapter.getItem(AGENT_CONFIGS_MAP_KEY);
    if (!cachedConfigs) {
      return null;
    }

    const configMap: Record<string, AgentConfigResponse> =
      JSON.parse(cachedConfigs);
    return configMap[trimmedAgentId] || null;
  } catch {
    return null;
  }
};

/**
 * Handles save agent config to cache logic for this module.
 */
export const saveAgentConfigToCache = async (
  agentId: string,
  config: AgentConfigResponse
): Promise<void> => {
  if (!agentId || typeof agentId !== 'string') {
    throw new Error('Agent ID is required and must be a string');
  }

  const trimmedAgentId = agentId.trim();
  if (!trimmedAgentId) {
    throw new Error('Agent ID cannot be empty');
  }

  const cachedConfigs = await StorageAdapter.getItem(AGENT_CONFIGS_MAP_KEY);
  const configMap: Record<string, AgentConfigResponse> = cachedConfigs
    ? JSON.parse(cachedConfigs)
    : {};

  configMap[trimmedAgentId] = config;

  await StorageAdapter.setItem(AGENT_CONFIGS_MAP_KEY, JSON.stringify(configMap));
};

/**
 * Retrieves agent name from cache for downstream consumers.
 */
export const getAgentNameFromCache = async (
  agentId: string
): Promise<string | null> => {
  try {
    const config = await getAgentConfigFromCache(agentId);
    return config?.name || null;
  } catch {
    return null;
  }
};

// ==================== Agent API Operations ====================

/**
 * Retrieves agent config for downstream consumers.
 */
export const getAgentConfig = async (
  agentId?: string,
  user?: ESPCDFUser
): Promise<any> => {
  let finalAgentId: string = '';

  try {
    if (!agentId || agentId.trim() === '') {
      if (user) {
        finalAgentId = await getSelectedAgentId(user);
      } else {
        finalAgentId = DEFAULT_AGENT_ID;
      }
    } else {
      finalAgentId = agentId;
    }

    finalAgentId = finalAgentId.trim();

    if (!finalAgentId || finalAgentId === '') {
      throw new Error('Agent ID is required and cannot be empty');
    }

    const config = await fetchAgentConfig(finalAgentId);
    return config;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Retrieves web socket url for downstream consumers.
 */
export const getWebSocketUrl = async (user: ESPCDFUser): Promise<string | null> => {
  try {
    if (!user) {
      return null;
    }
    const agentId = await getSelectedAgentId(user);
    let token: string | null = null;
    try {
      token = await user.getAccessToken();
    } catch {
      token = await StorageAdapter.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    }

    return `${AGENTS_WEBSOCKET_BASE_URL}/user/agents/${agentId}/ws?token=${token || ''}`;
  } catch {
    return null;
  }
};

/**
 * Retrieves tool connection status for downstream consumers.
 */
export function getToolConnectionStatus(
  toolUrl: string,
  connectors: ConnectedConnector[],
  expectedConnectorId?: string
): ToolConnectionStatus {
  // Ensure connectors is an array
  if (!Array.isArray(connectors) || connectors.length === 0) {
    return { isConnected: false, isExpired: false };
  }

  let connector: ConnectedConnector | undefined;

  if (toolUrl === RAINMAKER_MCP_CONNECTOR_URL && expectedConnectorId) {
    // For MCP connector, match by connectorId
    connector = connectors.find(
      (c) => c.connectorId === expectedConnectorId
    );
  }

  // If connector exists in array, it's connected
  if (!connector) {
    return { isConnected: false, isExpired: false };
  }

  return {
    isConnected: true,
    isExpired: false,
  };
}


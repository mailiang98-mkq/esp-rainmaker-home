/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "expo-router";
import { pipelineTask, PipelineStep } from "@shared/utils/pipelineTask";
import { registerForNotification } from "@shared/utils/notifications";
import { setUserTimeZone } from "@shared/utils/timezone";
import { RAINMAKER_MCP_CONNECTOR_ID, updateRefreshTokensForAllAIDevices } from "@features/agent/utils";
import { getUserProfile, getAgentConfig, getConnectedConnectors } from "@features/agent/utils/apiHelper";
import { getSelectedAgentId } from "@features/agent/utils/storage";
import { connectToolWithTokens } from "@features/agent/utils/oauth";
import { DEFAULT_AGENT_ID, RAINMAKER_MCP_CONNECTOR_URL } from "@/config/agent.config";
import { CDFConfig } from "@config/sdk.config";
import { ESPCDF } from "@store";

export interface PostLoginPipelineOptions {
  router: Router;
  syncHomeWithNodes: (shouldFetchFirstPage?: boolean) => Promise<void>;
  initUserCustomData: () => Promise<void>;
  shouldFetchFirstPage?: boolean;
  skipNodesFetch?: boolean;
  onProgress?: (stepName: string, state: { completed: number; total: number; lastFinished: string }) => void;
  onStepStart?: (stepName: string) => void;
  onStepComplete?: (stepName: string) => void;
  store: ESPCDF;
}

/**
 * Executes the post-login pipeline with all necessary steps.
 * Caller must ensure React state (espCDFUser) is synced from store after login
 * (e.g. setESPCDFUser(store.userStore.user)) before calling this.
 *
 * This pipeline handles:
 * - Setting user timezone
 * - Creating platform endpoint for notifications
 * - Initializing user custom data
 * - Syncing homes and nodes
 *
 * @param options - Configuration options for the pipeline
 */
export async function executePostLoginPipeline(
  options: PostLoginPipelineOptions
): Promise<void> {
  const {
    store,
    router,
    syncHomeWithNodes,
    initUserCustomData,
    shouldFetchFirstPage = CDFConfig.autoSync,
    skipNodesFetch = false,
    onProgress,
    onStepStart,
    onStepComplete,
  } = options;

  const postLoginSteps: PipelineStep[] = [
    {
      name: "setUserTimeZone",
      optional: true,
      background: true,
      run: async () => {
        const user = store?.userStore.user;
        if (!user) {
          return;
        }
        await setUserTimeZone(user);
      },
    },
    {
      name: "registerForNotification",
      optional: true,
      background: true,
      run: () => registerForNotification(store),
    },
  ];

  // Flow: initUserCustomData first (so lastSelectedHomeId is available), then sync via syncHomeWithNodes
  postLoginSteps.push(
    {
      name: "initUserCustomData",
      run: initUserCustomData,
    },
    {
      name: "syncHomeWithNodes",
      dependsOn: ["initUserCustomData"],
      optional: false,
      background: false,
      run: async () => {
        await syncHomeWithNodes(shouldFetchFirstPage);
      },
    }
  );

  // Keep old flow for backward compatibility if skipNodesFetch is false
  // But we won't use it in the new flow
  if (!skipNodesFetch) {
    // Note: Nodes will be fetched on home page for selected group
    // This step is kept for any legacy code that might depend on it
    // but it won't be executed in the normal flow
  }

  // Auto-connect MCP RainMaker connector for default agent
  postLoginSteps.push({
    name: "autoConnectMCPConnector",
    dependsOn: ["initUserCustomData"],
    optional: true,
    background: true,
    run: async () => {
      try {
        // Check if default agent is selected
        const user = store?.userStore.user;
        if (!user) {
          return;
        }
        const selectedAgentId = await getSelectedAgentId(user);
        if (selectedAgentId !== DEFAULT_AGENT_ID) {
          return;
        }

        // Get default agent config
        const agentConfig = await getAgentConfig(DEFAULT_AGENT_ID);
        if (!agentConfig?.tools) {
          return;
        }

        // Find MCP RainMaker tool
        const mcpTool = agentConfig.tools.find(
          (tool: any) => tool.url === RAINMAKER_MCP_CONNECTOR_URL
        );

        if (!mcpTool) {
          return;
        }

        // Check if already connected (match by specific connectorId or connectorUrl)
        const connectedConnectors = await getConnectedConnectors();
        const isConnected = connectedConnectors.some(
          (connector) => {
            // Match by specific connectorId
            if (connector.connectorId === RAINMAKER_MCP_CONNECTOR_ID) {
              return true;
            }
            // Fallback: match by connectorUrl
            return connector.connectorUrl === RAINMAKER_MCP_CONNECTOR_URL;
          }
        );

        if (isConnected) {
          return;
        }

        // Auto-connect using tokens
        const oauthMetadata = mcpTool.oauthMetadata
          ? {
            tokenEndpoint: mcpTool.oauthMetadata.tokenEndpoint,
            clientId: mcpTool.oauthMetadata.clientId,
            resource: mcpTool.oauthMetadata.resource,
          }
          : undefined;

        await connectToolWithTokens(store, RAINMAKER_MCP_CONNECTOR_URL, oauthMetadata);
      } catch (error: any) {
        // Silent error - don't block login flow
        console.error("[Post-Login] Failed to auto-connect MCP connector:", error?.message);
      }
    },
  });

  // Add the final routing step
  postLoginSteps.push({
    name: "getUserProfileAndRoute",
    dependsOn: ["initUserCustomData"],
    run: async () => {
      try {
        await getUserProfile();
        router.replace("/(group)/Home");
      } catch (error: any) {
        // Always route to Home, profile setup will be shown when needed
        router.replace("/(group)/Home");
      }
    },
  });

  await pipelineTask(postLoginSteps, {
    onStart: (stepName) => {
      console.log(`[post-login pipeline] start: ${stepName}`);
      onStepStart?.(stepName);
    },
    onComplete: (stepName) => {
      console.log(`[post-login pipeline] complete: ${stepName}`);
      onStepComplete?.(stepName);
    },
    onError: (stepName, error) => {
      console.warn(`[post-login pipeline] step "${stepName}" failed:`, error);
    },
    onBackground: (stepName) => {
      console.log(`[post-login pipeline] background step started: ${stepName}`);
    },
    onProgress: (state) => {
      console.log(
        `[post-login pipeline] progress ${state.completed}/${state.total} (last: ${state.lastFinished})`
      );
      onProgress?.(state.lastFinished, state);
    },
  });
}

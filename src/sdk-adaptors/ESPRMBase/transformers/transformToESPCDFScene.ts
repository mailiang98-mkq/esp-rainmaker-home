/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import { ESPCDFScene, ESPSDKAdaptorAPIResponse } from "@store";
import { ESPRMUser } from "@espressif/rainmaker-base-sdk";

// Scene operation types matching ESP Rainmaker API
enum SceneOperation {
    ADD = "add",
    EDIT = "edit",
    REMOVE = "remove",
    ACTIVATE = "activate",
}

/**
 * Transforms scene data to ESPCDFScene entity with operations
 *
 * Creates an ESPCDFScene entity with add, edit, remove, and activate operations
 * that use the ESPRMUser's setMultipleNodesParams method to perform scene operations.
 * @param scene - Scene data object containing scene information
 * @param user - ESPRMUser instance for performing scene operations
 * @param identifier - Adaptor identifier for the scene
 * @returns ESPCDFScene entity with operations
 */
export function transformToESPCDFScene(
    scene: {
        id?: string;
        name: string;
        info?: string;
        nodes?: string[];
        actions: {
            [key: string]: {
                [key: string]: any;
            };
        };
        devicesCount?: number;
        adaptorIdentifier?: string;
    },
    user: ESPRMUser,
    identifier: string,
): ESPCDFScene {
    // Generate scene ID if not provided
    const sceneId = scene.id || `scene_${Date.now()}`;
    const sceneNodes = scene.nodes || [];
    /**
     * Generates payload for scene operations based on the ESP Rainmaker API format
     * @param actions - Scene action configuration object containing device actions
     * @param nodeId - ID of the target node
     * @param type - Operation type (ADD, EDIT, REMOVE, ACTIVATE)
     * @param sceneName - Scene name (required for add/edit operations)
     * @param sceneId - Scene ID
     * @param info - Scene info/description
     * @returns Formatted payload for ESP Rainmaker API
     */
    const generatePayload = (
        actions: any,
        nodeId: string,
        type: SceneOperation,
        sceneName?: string,
        sceneId?: string,
        info?: string
    ): { nodeId: string; payload: any } => {
        const sceneData: Record<string, any> = {
            [SceneOperation.ADD]: {
                id: sceneId,
                operation: SceneOperation.ADD,
                name: sceneName,
                action: actions,
                info: info,
            },
            [SceneOperation.ACTIVATE]: {
                id: sceneId,
                operation: SceneOperation.ACTIVATE,
            },
            [SceneOperation.REMOVE]: {
                id: sceneId,
                operation: SceneOperation.REMOVE,
            },
            [SceneOperation.EDIT]: {
                name: sceneName,
                id: sceneId,
                operation: SceneOperation.EDIT,
                action: actions,
                info: info,
            },
        };

        const operationData = sceneData[type];
        if (!operationData) {
            throw new Error(`Unknown operation type: ${type}`);
        }

        return {
            nodeId,
            payload: {
                Scenes: [
                    {
                        Scenes: [operationData],
                    },
                ],
            },
        };
    };

    /**
     * Determines the appropriate operation type for editing a scene based on action existence
     * @param nodeId - The node identifier
     * @param oldActions - The existing actions
     * @param newActions - The new actions to be applied
     * @returns The operation type: SceneOperation.ADD, SceneOperation.EDIT, or SceneOperation.REMOVE
     */
    const determineEditOperation = (
        nodeId: string,
        oldActions: any,
        newActions: any
    ): SceneOperation => {
        if (!nodeId) {
            throw new Error("nodeId is required for determining edit operation");
        }

        const existInOldActions = !!oldActions?.[nodeId];
        const existInNewActions = !!newActions?.[nodeId];

        if (existInOldActions && existInNewActions) return SceneOperation.EDIT;
        if (existInOldActions && !existInNewActions) return SceneOperation.REMOVE;
        if (!existInOldActions && existInNewActions) return SceneOperation.ADD;

        // Default case: no change needed (both actions are falsy)
        return SceneOperation.EDIT;
    };

    /**
     * Internal method to perform scene operations
     * @param type - Operation type
     * @param sceneName - Scene name
     * @param actions - Scene actions
     * @param nodes - Node IDs
     * @param info - Scene info
     * @returns Promise resolving to API response
     */
    const performOperation = async (
        type: SceneOperation,
        sceneName: string = scene.name,
        actions: any = scene.actions,
        nodes: string[] = sceneNodes,
        info: string = scene.info || ""
    ): Promise<ESPSDKAdaptorAPIResponse> => {
        if (!user) {
            throw new Error("User not found");
        }

        const payload = nodes.map((nodeId: string) => {
            // Handle edit operations with dynamic operation type determination
            if (type === SceneOperation.EDIT) {
                const operationType = determineEditOperation(nodeId, scene.actions, actions);
                return generatePayload(
                    actions[nodeId],
                    nodeId,
                    operationType,
                    sceneName,
                    sceneId,
                    info
                );
            }

            // Handle other operation types directly
            return generatePayload(
                actions[nodeId],
                nodeId,
                type,
                sceneName,
                sceneId,
                info
            );
        });

        return await user.setMultipleNodesParams(payload);
    };

    // Create operations object
    const operations = {
        async add(): Promise<ESPSDKAdaptorAPIResponse> {
            return await performOperation(SceneOperation.ADD);
        },
        async edit(data: { name: string; actions: any; info?: string }): Promise<ESPSDKAdaptorAPIResponse> {
            const nodes = Object.keys({ ...data.actions, ...scene.actions });
            return await performOperation(SceneOperation.EDIT, data.name, data.actions, nodes, data.info);
        },
        async remove(): Promise<ESPSDKAdaptorAPIResponse> {
            return await performOperation(SceneOperation.REMOVE);
        },
        async activate(): Promise<ESPSDKAdaptorAPIResponse> {
            return await performOperation(SceneOperation.ACTIVATE);
        },
    };

    return new ESPCDFScene({
        id: sceneId,
        name: scene.name,
        info: scene.info || "",
        nodes: sceneNodes,
        actions: scene.actions || {},
        devicesCount: scene.devicesCount || 0,
        adaptorIdentifier: identifier,
        operations: operations,
        _raw: scene,
    });
}

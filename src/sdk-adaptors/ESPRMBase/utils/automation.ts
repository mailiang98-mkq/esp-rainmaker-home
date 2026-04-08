/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ESPAutomationAction } from "@espressif/rainmaker-base-sdk";
import type { ESPCDFAutomationAction } from "@store";

/**
 * CDF flat actions → RainMaker SDK shape (one item per node, `deviceParams` maps device → param → value).
 * Used for create / update API calls.
 */
export function transformToESPAutomationActions(
    actions: ESPCDFAutomationAction[],
): ESPAutomationAction[] {
    const byNode: Record<string, Record<string, Record<string, unknown>>> = {};

    for (const action of actions) {
        if (action?.nodeId == null || action.nodeId === "") {
            continue;
        }
        const { nodeId, deviceName, param, value } = action;
        if (!byNode[nodeId]) {
            byNode[nodeId] = {};
        }
        if (!byNode[nodeId][deviceName]) {
            byNode[nodeId][deviceName] = {};
        }
        byNode[nodeId][deviceName][param] = value as unknown;
    }

    return Object.entries(byNode).map(([nodeId, deviceParams]) => ({
        nodeId,
        deviceParams: deviceParams as Record<string, Record<string, any>>,
    }));
}

/**
 * RainMaker SDK actions → CDF flat rows (one row per node / device / param).
 * Used when hydrating {@link ESPCDFAutomation} from {@link ESPAutomation}.
 */
export function transformToESPCDFAutomationActions(
    actions: ESPAutomationAction[] | undefined | null,
): ESPCDFAutomationAction[] {
    if (!actions?.length) {
        return [];
    }

    const result: ESPCDFAutomationAction[] = [];

    for (const action of actions) {
        if (action?.nodeId == null || action.nodeId === "") {
            continue;
        }
        const { nodeId, deviceParams } = action;
        if (!deviceParams || typeof deviceParams !== "object") {
            continue;
        }
        for (const [deviceName, params] of Object.entries(deviceParams)) {
            if (params == null || typeof params !== "object") {
                continue;
            }
            for (const [param, value] of Object.entries(
                params as Record<string, unknown>,
            )) {
                result.push({ nodeId, deviceName, param, value });
            }
        }
    }

    return result;
}

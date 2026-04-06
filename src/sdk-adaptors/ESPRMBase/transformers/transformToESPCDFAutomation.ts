/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    ESPCDFAutomation,
    ESPCDFAPIResponse,
    ESPCDFAutomationEditInput,
} from "@store";
import { ESPAutomation } from "@espressif/rainmaker-base-sdk";
import {
    transformToESPCDFAutomationActions,
    transformToESPAutomationActions,
} from "../utils/automation";

/**
 * Transforms ESPAutomation (from SDK) to ESPCDFAutomation entity with operations
 * 
 * Creates an ESPCDFAutomation entity with update, delete, and enable operations
 * that use the ESPAutomation's methods to perform automation operations.
 * 
 * @param automation - ESPAutomation instance from SDK
 * @param identifier - Adaptor identifier for the automation
 * @returns ESPCDFAutomation entity with operations
 */
export function transformToESPCDFAutomation(
    automation: ESPAutomation,
    identifier: string,
): ESPCDFAutomation {
    // Create operations object
    const operations = {
        async update(data: ESPCDFAutomationEditInput): Promise<ESPCDFAPIResponse> {
            try {
                // Build update payload
                // Note: eventOperator is excluded from update payloads as the backend
                // doesn't support updating event_operator for existing automations
                const updatePayload: any = {
                    name: data.name,
                    enabled: data.enabled,
                    retrigger: data.retrigger,
                    nodeId: data.nodeId,
                    events: data.events,
                    ...(data.actions !== undefined && {
                        actions: transformToESPAutomationActions(data.actions),
                    }),
                };

                // Include optional fields
                if (data.metadata !== undefined) {
                    updatePayload.metadata = data.metadata;
                }
                if (data.location !== undefined) {
                    updatePayload.location = data.location;
                }
                if (data.region !== undefined) {
                    updatePayload.region = data.region;
                }

                const response = await automation.update(updatePayload);
                // Transform ESPAPIResponse to ESPCDFAPIResponse
                // Both have status and description, so they're compatible
                return {
                    status: response.status,
                    description: response.description,
                };
            } catch (error) {
                throw error;
            }
        },

        async delete(): Promise<ESPCDFAPIResponse> {
            try {
                const response = await automation.delete();
                // Transform ESPAPIResponse to ESPCDFAPIResponse
                return {
                    status: response.status,
                    description: response.description,
                };
            } catch (error) {
                throw error;
            }
        },

        async enable(enabled: boolean): Promise<ESPCDFAPIResponse> {
            try {
                const response = await automation.enable(enabled);
                // Transform ESPAPIResponse to ESPCDFAPIResponse
                return {
                    status: response.status,
                    description: response.description,
                };
            } catch (error) {
                throw error;
            }
        },
    };

    return new ESPCDFAutomation({
        id: automation.automationId,
        name: automation.automationName,
        enabled: automation.enabled,
        nodeId: automation.nodeId,
        eventType: automation.eventType,
        events: automation.events || [],
        eventOperator: automation.eventOperator,
        actions: transformToESPCDFAutomationActions(automation.actions),
        retrigger: automation.retrigger,
        location: automation.location,
        region: automation.region,
        metadata: automation.metadata,
        adaptorIdentifier: identifier,
        operations: operations,
        _raw: automation,
    });
}

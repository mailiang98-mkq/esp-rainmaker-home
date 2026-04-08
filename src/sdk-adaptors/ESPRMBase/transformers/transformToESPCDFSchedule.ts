/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ESPCDFSchedule, ESPSDKAdaptorAPIResponse } from "@store";
import { ESPRMUser } from "@espressif/rainmaker-base-sdk";

// Schedule operation types matching ESP Rainmaker API
enum ScheduleOperation {
    ADD = "add",
    EDIT = "edit",
    REMOVE = "remove",
    ENABLE = "enable",
    DISABLE = "disable",
}

/**
 * Transforms schedule data to ESPCDFSchedule entity with operations
 * 
 * Creates an ESPCDFSchedule entity with add, edit, remove, enable, and disable operations
 * that use the ESPRMUser's setMultipleNodesParams method to perform schedule operations.
 * 
 * @param schedule - Schedule data object containing schedule information
 * @param user - ESPRMUser instance for performing schedule operations
 * @param identifier - Adaptor identifier for the schedule
 * @returns ESPCDFSchedule entity with operations
 */
export function transformToESPCDFSchedule(
    schedule: {
        id?: string;
        name: string;
        info?: string;
        nodes?: string[];
        triggers: Array<{
            m?: number;
            d?: number;
            dd?: number;
            mm?: number;
            yy?: number;
            rsec?: number;
        }>;
        action: {
            [key: string]: {
                [key: string]: any;
            };
        };
        enabled?: boolean;
        validity?: {
            start?: number;
            end?: number;
        };
        flags?: number;
        devicesCount?: number;
        adaptorIdentifier?: string;
    },
    user: ESPRMUser,
    identifier: string,
): ESPCDFSchedule {
    // Generate schedule ID if not provided
    const scheduleId = schedule.id || `schedule_${Date.now()}`;
    const scheduleNodes = schedule.nodes || [];

    /**
     * Generates payload for schedule operations based on the ESP Rainmaker API format
     * 
     * @param action - Schedule action configuration object containing device actions
     * @param nodeId - ID of the target node
     * @param type - Operation type (ADD, EDIT, REMOVE, ENABLE, DISABLE)
     * @param scheduleName - Schedule name (required for add/edit operations)
     * @param scheduleId - Schedule ID
     * @param triggers - Schedule triggers array
     * @param info - Schedule info/description
     * @param flags - Schedule flags
     * @param validity - Schedule validity period
     * @returns Formatted payload for ESP Rainmaker API
     */
    const generatePayload = (
        action: any,
        nodeId: string,
        type: ScheduleOperation,
        scheduleName?: string,
        scheduleId?: string,
        triggers?: Array<{
            m?: number;
            d?: number;
            dd?: number;
            mm?: number;
            yy?: number;
            rsec?: number;
        }>,
        info?: string,
        flags?: number,
        validity?: {
            start?: number;
            end?: number;
        }
    ): { nodeId: string; payload: any } => {
        // Helper function to create payload with only defined values
        const createPayload = (basePayload: Record<string, any>) => {
            const payload: Record<string, any> = { ...basePayload };
            // Only add optional fields if they are defined
            if (info !== undefined && info !== null) payload.info = info;
            if (flags !== undefined && flags !== null) payload.flags = flags;
            if (validity !== undefined && validity !== null) payload.validity = validity;
            return payload;
        };

        const scheduleData: Record<string, any> = {
            [ScheduleOperation.ADD]: createPayload({
                id: scheduleId,
                operation: ScheduleOperation.ADD,
                name: scheduleName,
                action: action,
                triggers: triggers,
            }),
            [ScheduleOperation.EDIT]: createPayload({
                id: scheduleId,
                name: scheduleName,
                operation: ScheduleOperation.EDIT,
                action: action,
                triggers: triggers,
            }),
            [ScheduleOperation.REMOVE]: {
                id: scheduleId,
                operation: ScheduleOperation.REMOVE,
            },
            [ScheduleOperation.ENABLE]: {
                id: scheduleId,
                operation: ScheduleOperation.ENABLE,
            },
            [ScheduleOperation.DISABLE]: {
                id: scheduleId,
                operation: ScheduleOperation.DISABLE,
            },
        };

        const operationData = scheduleData[type];
        if (!operationData) {
            throw new Error(`Unknown operation type: ${type}`);
        }

        return {
            nodeId,
            payload: {
                Schedule: [
                    {
                        Schedules: [operationData],
                    },
                ],
            },
        };
    };

    /**
     * Determines the appropriate operation type for editing a schedule based on action existence
     * 
     * @param nodeId - The node identifier
     * @param oldActions - The existing actions
     * @param newActions - The new actions to be applied
     * @returns The operation type: ScheduleOperation.ADD, ScheduleOperation.EDIT, or ScheduleOperation.REMOVE
     */
    const determineEditOperation = (
        nodeId: string,
        oldActions: any,
        newActions: any
    ): ScheduleOperation => {
        if (!nodeId) {
            throw new Error("nodeId is required for determining edit operation");
        }

        const existInOldActions = !!oldActions?.[nodeId];
        const existInNewActions = !!newActions?.[nodeId];

        if (existInOldActions && existInNewActions) return ScheduleOperation.EDIT;
        if (existInOldActions && !existInNewActions) return ScheduleOperation.REMOVE;
        if (!existInOldActions && existInNewActions) return ScheduleOperation.ADD;

        // Default case: no change needed (both actions are falsy)
        return ScheduleOperation.EDIT;
    };

    /**
     * Internal method to perform schedule operations
     * 
     * @param type - Operation type
     * @param scheduleName - Schedule name
     * @param triggers - Schedule triggers
     * @param action - Schedule actions
     * @param nodes - Node IDs
     * @param info - Schedule info
     * @param flags - Schedule flags
     * @param validity - Schedule validity
     * @returns Promise resolving to API response
     */
    const performOperation = async (
        type: ScheduleOperation,
        scheduleName: string = schedule.name,
        triggers: Array<{
            m?: number;
            d?: number;
            dd?: number;
            mm?: number;
            yy?: number;
            rsec?: number;
        }> = schedule.triggers,
        action: any = schedule.action,
        nodes: string[] = scheduleNodes,
        info: string = schedule.info || "",
        flags?: number,
        validity?: {
            start?: number;
            end?: number;
        }
    ): Promise<ESPSDKAdaptorAPIResponse> => {
        if (!user) {
            throw new Error("User not found");
        }

        const payload = nodes.map((nodeId: string) => {
            // Handle edit operations with dynamic operation type determination
            if (type === ScheduleOperation.EDIT) {
                const operationType = determineEditOperation(nodeId, schedule.action, action);
                return generatePayload(
                    action[nodeId],
                    nodeId,
                    operationType,
                    scheduleName,
                    scheduleId,
                    triggers,
                    info,
                    flags,
                    validity
                );
            }

            // Handle other operation types directly
            return generatePayload(
                action[nodeId],
                nodeId,
                type,
                scheduleName,
                scheduleId,
                triggers,
                info,
                flags,
                validity
            );
        });

        return await user.setMultipleNodesParams(payload);
    };

    // Create operations object
    const operations = {
        async add(): Promise<ESPSDKAdaptorAPIResponse> {
            return await performOperation(ScheduleOperation.ADD);
        },
        async edit(data: {
            name?: string;
            triggers?: Array<{
                m?: number;
                d?: number;
                dd?: number;
                mm?: number;
                yy?: number;
                rsec?: number;
            }>;
            action?: {
                [key: string]: {
                    [key: string]: any;
                };
            };
            info?: string;
            flags?: number;
            validity?: {
                start?: number;
                end?: number;
            };
            enabled?: boolean;
        }): Promise<ESPSDKAdaptorAPIResponse> {
            const nodes = Object.keys({ ...data.action, ...schedule.action });
            return await performOperation(
                ScheduleOperation.EDIT,
                data.name || schedule.name,
                data.triggers || schedule.triggers,
                data.action || schedule.action,
                nodes,
                data.info !== undefined ? data.info : schedule.info,
                data.flags !== undefined ? data.flags : schedule.flags,
                data.validity !== undefined ? data.validity : schedule.validity
            );
        },
        async remove(): Promise<ESPSDKAdaptorAPIResponse> {
            return await performOperation(ScheduleOperation.REMOVE);
        },
        async enable(): Promise<ESPSDKAdaptorAPIResponse> {
            return await performOperation(ScheduleOperation.ENABLE);
        },
        async disable(): Promise<ESPSDKAdaptorAPIResponse> {
            return await performOperation(ScheduleOperation.DISABLE);
        },
    };

    // Calculate devices count
    const devicesCount = Object.values(schedule.action || {}).reduce(
        (acc: number, deviceAction: any) => {
            acc += Object.keys(deviceAction || {}).length;
            return acc;
        },
        0
    );

    return new ESPCDFSchedule({
        id: scheduleId,
        name: schedule.name,
        info: schedule.info || "",
        nodes: scheduleNodes,
        triggers: schedule.triggers || [],
        action: schedule.action || {},
        enabled: schedule.enabled,
        validity: schedule.validity,
        flags: schedule.flags,
        devicesCount: schedule.devicesCount || devicesCount,
        adaptorIdentifier: identifier,
        operations: operations,
        _raw: schedule,
    });
}

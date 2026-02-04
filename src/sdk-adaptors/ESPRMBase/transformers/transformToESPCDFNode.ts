/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ESPCDFNodeConfig, ESPCDFNodeOperation } from "@store";
import { ESPCDFNode } from "@store";
import { ESPRMNode, ESPRMDevice, ESPRMService } from "@espressif/rainmaker-base-sdk";

import type { ESPCDFAPIDataResponse, ESPCDFOTAUpdateStatusResponse, ESPCDFPropertyChangeCallback, ESPCDFPropertyChangeEvent } from "@store";
import { transformToESPCDFDevice } from "./transformToESPCDFDevice";
import { transformToESPCDFService } from "./transformToESPCDFService";

/**
 * Creates a property change callback that syncs CDF node property updates to raw ESPRMNode
 * This subscribes to typed property change events and updates the raw node accordingly
 * Using fixed event types provides better type safety and maintainability
 */
const createPropertyChangeSyncCallback = (rawNode: ESPRMNode): ESPCDFPropertyChangeCallback => {
    return (event: ESPCDFPropertyChangeEvent) => {
        try {
            // Use discriminated union to handle each event type with proper typing
            switch (event.type) {
                case 'deviceParamChanged': {
                    // Find the device in raw node
                    const device = rawNode.nodeConfig?.devices?.find(d => d.name === event.deviceName);
                    if (device) {
                        // Find the param in the device
                        const param = device.params?.find(p => p.name === event.paramName);
                        if (param) {
                            param.value = event.value;
                        }
                    }
                    break;
                }

                case 'serviceParamChanged': {
                    // Find the service in raw node
                    const service = rawNode.nodeConfig?.services?.find(s => s.name === event.serviceName);
                    if (service) {
                        // Find the param in the service
                        const param = service.params?.find(p => p.name === event.paramName);
                        if (param) {
                            param.value = event.value;
                        }
                    }
                    break;
                }

                case 'metadataChanged': {
                    // Direct property on node
                    rawNode.metadata = event.metadata;
                    break;
                }

                case 'availableTransportsChanged': {
                    // Direct property on node
                    rawNode.availableTransports = event.availableTransports as typeof rawNode.availableTransports;
                    break;
                }

                case 'connectivityStatusChanged': {
                    // Direct property on node
                    rawNode.connectivityStatus = event.connectivityStatus as typeof rawNode.connectivityStatus;
                    break;
                }

                case 'tagsChanged': {
                    // Direct property on node
                    rawNode.tags = event.tags;
                    break;
                }

                case 'roleChanged': {
                    // Direct property on node
                    rawNode.role = event.role;
                    break;
                }

                default:
                    // Exhaustive check - TypeScript will error if we miss an event type
                    const _exhaustive: never = event;
                    console.error(`[transformToESPCDFNode] Unhandled event type:`, _exhaustive);
            }
        } catch (error) {
            console.error(`[transformToESPCDFNode] Failed to sync event ${event.type} to raw node:`, error);
        }
    };
};

export function transformToESPCDFNode(
    node: ESPRMNode,
): ESPCDFNode {
    const devices = node.nodeConfig?.devices?.map((device: ESPRMDevice) =>
        transformToESPCDFDevice(device, { nodeMetadata: node.metadata })
    ) || [];
    const services = node.nodeConfig?.services?.map((service: ESPRMService) => transformToESPCDFService(service)) || [];
    const nodeConfig: ESPCDFNodeConfig = {
        configVersion: node.nodeConfig?.configVersion!,
        info: node.nodeConfig?.info,
    };
    const operations: ESPCDFNodeOperation = {
        setMultipleParams: async (params: Record<string, any>) => {
            return node.setMultipleParams(params);
        },
        delete: async () => {
            return node.delete();
        },
        setTimeZone: async (timeZone: string) => {
            return node.setTimeZone(timeZone);
        },
        updateMetadata: async (metadata: Record<string, any>) => {
            return node.updateMetadata(metadata);
        },
        checkOTAUpdate: async () => {
            const otaUpdate = await node.checkOTAUpdate?.();
            return {
                status: "success",
                data: otaUpdate,
            };
        },
        pushOTAUpdate: async (params: any) => {
            return node.pushOTAUpdate(params);
        },
        getOTAUpdateStatus: async (otaJobId: string) => {
            const otaUpdateStatus = await node.getOTAUpdateStatus(otaJobId);
            return {
                status: "success",
                description: "OTA update status fetched successfully",
                data: otaUpdateStatus,
            } as ESPCDFAPIDataResponse<ESPCDFOTAUpdateStatusResponse>;
        },
    };

    const cdfNode = new ESPCDFNode({
        identifier: node.id,
        id: node.id,
        type: node.type,
        nodeConfig: nodeConfig,
        devices: devices,
        services: services,
        connectivityStatus: node.connectivityStatus,
        metadata: node.metadata,
        operations: operations,
        isPrimaryUser: node.isPrimaryUser || true,
        transportOrder: node.transportOrder,
        availableTransports: node.availableTransports,
        _raw: node,
    });

    // Subscribe to property change events to sync to _raw
    // This creates an event-based sync mechanism
    const syncCallback = createPropertyChangeSyncCallback(node);
    cdfNode.onPropertyChange(syncCallback);

    return cdfNode;
}

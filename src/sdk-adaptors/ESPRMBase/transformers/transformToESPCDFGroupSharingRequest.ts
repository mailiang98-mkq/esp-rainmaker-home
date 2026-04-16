/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    ESPSDKAdaptorAPIResponse,
    ESPCDFGroupSharingRequest,
    ESPCDFGroupSharingRequestInterface,
    ESPCDFGroupSharingRequestOperation,
    ESPCDFGroupSharingStatus,
} from "@store";
import { ESPGroupSharingRequest } from "@espressif/rainmaker-base-sdk";

/**
 * Transforms a raw SDK group sharing request to ESPCDFGroupSharingRequest entity
 * @param rawRequest - The raw group sharing request from SDK (ESPRMGroupSharingRequest or similar)
 * @returns ESPCDFGroupSharingRequest entity instance
 */
export function transformToESPCDFGroupSharingRequest(
    rawRequest: ESPGroupSharingRequest,
): ESPCDFGroupSharingRequest {
    // Map SDK status to CDF status enum
    const mapStatus = (status: string): ESPCDFGroupSharingStatus => {
        switch (status?.toLowerCase()) {
            case 'accepted':
                return ESPCDFGroupSharingStatus.accepted;
            case 'pending':
                return ESPCDFGroupSharingStatus.pending;
            case 'rejected':
            case 'declined':
                return ESPCDFGroupSharingStatus.rejected;
            default:
                return ESPCDFGroupSharingStatus.pending;
        }
    };

    // Create operations wrapper that delegates to SDK methods
    const operations: ESPCDFGroupSharingRequestOperation = {
        async accept(): Promise<ESPSDKAdaptorAPIResponse> {
            if (rawRequest.accept) {
                return await rawRequest.accept();
            }
            throw new Error('accept method not available on raw request');
        },
        async decline(): Promise<ESPSDKAdaptorAPIResponse> {
            if (rawRequest.decline) {
                return await rawRequest.decline();
            }
            throw new Error('decline method not available on raw request');
        },
        async remove(): Promise<ESPSDKAdaptorAPIResponse> {
            if (rawRequest.remove) {
                return await rawRequest.remove();
            }
            throw new Error('remove method not available on raw request');
        },
    };

    // Extract data from raw request
    const requestData: ESPCDFGroupSharingRequestInterface = {
        id: rawRequest.id || '',
        status: mapStatus(rawRequest.status),
        timestamp: rawRequest.timestamp || 0,
        groupIds: rawRequest.groupIds || [],
        groupnames: rawRequest.groupnames || [],
        username: rawRequest.username || '',
        primaryUsername: rawRequest.primaryUsername || '',
        transfer: rawRequest.transfer || false,
        newRole: rawRequest.newRole || '',
        metadata: rawRequest.metadata || {},
        operations: operations,
        _raw: rawRequest,
    };

    return new ESPCDFGroupSharingRequest(requestData);
}

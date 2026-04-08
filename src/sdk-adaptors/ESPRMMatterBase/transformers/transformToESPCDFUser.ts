/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { transformToESPCDFUser as transformToESPCDFUserBase } from "@sdk-adaptors/ESPRMBase/transformers/transformToESPCDFUser";
import { ESPMatterUtilityAdapter } from "@native-adaptors/implementations/ESPMatterUtilityAdapter";
import {
    ESPCDFGroup,
    ESPCDFMatterPrecommissionInfo,
    ESPCDFUser,
} from "@store";
import { ESPRMFabric, ESPRMUser, ESPRMGroup } from "@espressif/rainmaker-matter-sdk";
import { ESPRMMatterBaseAdaptorIdentifier } from "../constants";
import { transformToESPCDFGroup } from "./transformToESPCDFGroup";

/**
 * RainMaker + Matter: delegate to ESPRMBase user transformation, then attach Matter-only
 * operations (fabrics, NOC, precommission storage) and mark the CDF user with this adaptor id.
 */
export function transformToESPCDFUser(esprmUser: ESPRMUser | null): ESPCDFUser {
    if (!esprmUser) {
        throw new Error("ESPRMUser is required for transformation");
    }

    const matterOperations = {
        async getGroupsAndFabrics(): Promise<ESPCDFGroup[]> {
            const response = await esprmUser.getGroupsAndFabrics();
            return [...(response.groups || []).map((g: ESPRMGroup) =>
                    transformToESPCDFGroup(g, esprmUser as any, ESPRMMatterBaseAdaptorIdentifier),
                ),
                ...(response.fabrics || []).map((f: ESPRMFabric) =>
                    transformToESPCDFGroup(f, esprmUser as any, ESPRMMatterBaseAdaptorIdentifier),
                ),
            ];
        },

        async prepareFabricForMatterCommissioning(group: ESPCDFGroup): Promise<ESPCDFGroup> {
            const rawItem = group._raw;
            const fabric = await (esprmUser as any).prepareFabricForMatterCommissioning(rawItem);
            return transformToESPCDFGroup(fabric, esprmUser as any, ESPRMMatterBaseAdaptorIdentifier);
        },

        async isUserNocAvailableForFabric(fabricId: string): Promise<boolean> {
            return ESPMatterUtilityAdapter.isUserNocAvailableForFabric(fabricId);
        },

        async storePrecommissionInfo(info: ESPCDFMatterPrecommissionInfo): Promise<void> {
            return ESPMatterUtilityAdapter.storePrecommissionInfo(info);
        },
    };

    const baseUser = transformToESPCDFUserBase(esprmUser as any);
    baseUser.operations = {
        ...baseUser.operations,
        ...matterOperations,
    };
    baseUser.identifier = ESPRMMatterBaseAdaptorIdentifier;

    return baseUser;
}

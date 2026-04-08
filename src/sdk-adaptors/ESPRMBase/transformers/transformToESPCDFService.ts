/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ESPCDFService, ESPCDFServiceParam } from "@store";
import { ESPRMService, ESPRMServiceParam } from "@espressif/rainmaker-base-sdk";
import { transformToESPCDFServiceParam } from "./transformToESPCDFServiceParam";

export function transformToESPCDFService(
    service: ESPRMService,
): ESPCDFService {
    const params: ESPCDFServiceParam[] = service.params?.map((param: ESPRMServiceParam) =>
        transformToESPCDFServiceParam(param)
    ) || [];

    const operations = {
        getParams: async () => {
            const params = await service.params?.map((param: ESPRMServiceParam) =>
                transformToESPCDFServiceParam(param)
            ) || [];
            return params;
        },
    };

    // Create ESPCDFDevice entity instance
    return new ESPCDFService({
        name: service.name || "",
        type: service.type || "",
        params,
        operations: operations,
        _raw: service,
    });
}

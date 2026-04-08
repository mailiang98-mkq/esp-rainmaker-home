import { ESPCDFService, ESPCDFServiceParam } from "@store";
import { ESPRMNGService, ESPRMNGServiceParam } from "@espressif/rmng-base-sdk";
import { transformToESPCDFServiceParam } from "./transformToESPCDFServiceParam";

export function transformToESPCDFService(
    service: ESPRMNGService,
): ESPCDFService {
    const params: ESPCDFServiceParam[] = service.params?.map((param: ESPRMNGServiceParam) =>
        transformToESPCDFServiceParam(param)
    ) || [];

    const operations = {
        getParams: async () => {
            const params = await service.params?.map((param: ESPRMNGServiceParam) =>
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

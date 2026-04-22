import { ESPCDFServiceParam, ESPCDFServiceParamOperation } from "@store";
import { ESPRMNGServiceParam } from "@espressif/rmng-base-sdk";

export function transformToESPCDFServiceParam(
    param: ESPRMNGServiceParam,
): ESPCDFServiceParam {
    // Create ESPCDFDeviceParam entity instance
    const operations: ESPCDFServiceParamOperation = {
        setValue: async (value: any) => {
            return param.setValue(value);
        },
    };
    return new ESPCDFServiceParam({
        name: param.name || "",
        dataType: param.dataType || "string",
        type: param.type || "",
        value: param.value,
        properties: param.properties || ["read", "write"],
        bounds: param.bounds,
        serviceName: (param as any).serviceName, // Preserve serviceName
        operations: operations,
        _raw: param,
    });
}

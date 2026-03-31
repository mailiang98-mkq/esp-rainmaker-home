import { ESPCDFDevice, ESPCDFDeviceParam } from "@store";
import { ESPRMNGDevice, ESPRMNGDeviceParam } from "@espressif/rmng-base-sdk";
import { transformToESPCDFDeviceParam } from "./transformToESPCDFDeviceParam";
import { resolveDeviceDisplayName } from "../utils/device";

export function transformToESPCDFDevice(
  device: ESPRMNGDevice,
  options?: { nodeMetadata?: Record<string, unknown> },
): ESPCDFDevice {
  const params: ESPCDFDeviceParam[] = device.params?.map((param: ESPRMNGDeviceParam) =>
    transformToESPCDFDeviceParam(param)
  ) || [];

  const operations = {
    getParams: async () => {
      const params = await device.getParams();
      return params?.map((param: ESPRMNGDeviceParam) =>
        transformToESPCDFDeviceParam(param)
      ) || [];
    },
  };

  const displayName = resolveDeviceDisplayName(options?.nodeMetadata, device, "");

  return new ESPCDFDevice({
    name: device.name || "",
    type: device.type || "",
    params,
    displayName,
    attributes: device.attributes,
    operations: operations,
    _raw: device,
  });
}

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ESPCDFDevice, ESPCDFDeviceParam } from "@store";
import { ESPRMDevice, ESPRMDeviceParam } from "@espressif/rainmaker-base-sdk";
import { transformToESPCDFDeviceParam } from "./transformToESPCDFDeviceParam";
import { resolveDeviceDisplayName } from "../utils/device";

export function transformToESPCDFDevice(
  device: ESPRMDevice,
  options?: { nodeMetadata?: Record<string, unknown> },
): ESPCDFDevice {
  const params: ESPCDFDeviceParam[] = device.params?.map((param: ESPRMDeviceParam) =>
    transformToESPCDFDeviceParam(param)
  ) || [];

  const operations = {
    getParams: async () => {
      const params = await device.getParams();
      return params?.map((param: ESPRMDeviceParam) =>
        transformToESPCDFDeviceParam(param)
      ) || [];
    },
  };

  const displayName = resolveDeviceDisplayName(options?.nodeMetadata, device, "");

  // Create ESPCDFDevice entity instance
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

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PARAM_CONTROLS } from "@/config/params.config";
import type { ESPCDFDeviceParam } from "@store";
import type { DeviceParamGroup } from "@src/types/global";
import {
  ESPRM_NAME_PARAM_TYPE,
  ESPRM_UI_HIDDEN_PARAM_TYPE,
} from "./constants";

/**
 * UI Control Map for parameter types
 * Maps parameter types to their corresponding UI controls
 * This is a memoized map that can be reused across components
 */
export const getParamsUIMap = (): Record<string, DeviceParamGroup["control"]> => {
  return PARAM_CONTROLS.reduce((acc, control) => {
    if (control.types.includes("esp.ui.hidden")) return acc;
    control.types.forEach((type) => {
      acc[type] = {
        types: control.types,
        control: control.control
      };
    });
    return acc;
  }, {} as Record<string, DeviceParamGroup["control"]>);
};

/**
 * Gets the UI control component for a given parameter
 * 
 * @param param - The device parameter
 * @param paramsUIMap - Optional pre-computed UI map (for performance)
 * @returns The React component for the parameter control, or null if not found
 */
export const getParamControlComponent = (
  param: ESPCDFDeviceParam,
  paramsUIMap?: Record<string, DeviceParamGroup["control"]>
): any => {
  const uiMap = paramsUIMap || getParamsUIMap();
  let Control = uiMap[param.uiType ?? ""]?.control as any;
  if (!Control) {
    Control = uiMap[param.type ?? ""]?.control as any;
  }
  if (!Control) {
    return null;
  }
  return Control || null;
};

/**
 * Returns a default value based on parameter data type
 * 
 * @param type - The parameter data type (string, int, bool, float)
 * @returns Default value for the given type
 */
export const defaultValueBasedOnParamDataType = (type: string) => {
  switch (type) {
    case "string":
      return "";
    case "int":
      return 0;
    case "bool":
      return false;
    case "float":
      return 0.0;
    default:
      return "";
  }
};

/**
 * Filters out parameters with excluded types (name and hidden parameters)
 * 
 * @param params - Array of device parameters to filter
 * @returns Filtered array excluding name and hidden parameters
 */
export const filterExcludedParamTypes = (
  params?: ESPCDFDeviceParam[]
): ESPCDFDeviceParam[] | undefined => {
  if (!params) return undefined;
  return params.filter(
    (param) =>
      ![ESPRM_NAME_PARAM_TYPE, ESPRM_UI_HIDDEN_PARAM_TYPE].includes(
        param.type ?? "",
      ),
  );
};

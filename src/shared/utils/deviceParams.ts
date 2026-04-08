/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ESPCDFDeviceParam } from "@store";
import { PARAM_CONTROLS } from "@/config/params.config";
import { ESPRM_UI_SLIDER_PARAM_TYPE } from "@shared/utils/constants";

/**
 * Type definition for a parameter control configuration
 */
export interface ParamControlConfig {
  name: string;
  types: string[];
  control: React.ComponentType<any> | null;
  dataTypes?: string[];
  derivedMeta?: Record<string, string>[];
  [key: string]: any;
}

/**
 * Type definition for the params map
 */
export type ParamsMap = Record<string, ParamControlConfig>;

/**
 * Builds a map of parameter types to their control configurations.
 * Single Responsibility: Only responsible for building the params map.
 * @returns A map where keys are parameter types and values are control configurations
 */
export const buildParamsMap = (): ParamsMap => {
  return PARAM_CONTROLS.reduce((acc, control) => {
    if (control.types.includes("esp.ui.hidden")) {
      return acc;
    }
    control.types.forEach((type) => {
      acc[type] = control as ParamControlConfig;
    });
    return acc;
  }, {} as ParamsMap);
};

/**
 * Resolves the appropriate control configuration for a given parameter.
 * Single Responsibility: Only responsible for resolving the control for a parameter.
 * @param param - The device parameter
 * @param paramsMap - The map of parameter types to control configurations
 * @returns The control configuration or null if not found
 */
export const resolveParamControl = (
  param: ESPCDFDeviceParam,
  paramsMap: ParamsMap
): ParamControlConfig | null => {
  if (!param.uiType) {
    return null;
  }

  let control = paramsMap[param.uiType];
  if (!control) {
    return null;
  }

  // Special handling for slider parameters that may have a specific type-based control
  if (
    param.uiType === ESPRM_UI_SLIDER_PARAM_TYPE &&
    param.type &&
    paramsMap[param.type] !== undefined
  ) {
    control = paramsMap[param.type];
  }

  return control;
};

/**
 * Processes derived metadata for a parameter by updating its bounds.
 * Single Responsibility: Only responsible for processing derived metadata.
 * @param param - The parameter to process
 * @param control - The control configuration with derivedMeta
 * @param allParams - All device parameters to search for derived values
 */
export const processDerivedMeta = (
  param: ESPCDFDeviceParam,
  control: ParamControlConfig,
  allParams: ESPCDFDeviceParam[]
): void => {
  if (!control.derivedMeta || control.derivedMeta.length === 0) {
    return;
  }

  if (!param.bounds) {
    return;
  }

  control.derivedMeta.forEach((derivedParamConfig) => {
    const first = Object.entries(derivedParamConfig)[0];
    if (!first) return;
    const [name, type] = first;
    const derivedParam = allParams.find((p) => p.type === type);
    if (derivedParam && param.bounds) {
      param.bounds[name] = derivedParam.value;
    }
  });
};

/**
 * Filters device parameters by excluding specified parameter types.
 * Single Responsibility: Only responsible for filtering parameters by type.
 * @param params - Array of device parameters
 * @param excludedTypes - Array of parameter types to exclude
 * @returns Filtered array of parameters
 */
export const filterDeviceParamsByType = (
  params: ESPCDFDeviceParam[] | undefined,
  excludedTypes: string[]
): ESPCDFDeviceParam[] => {
  if (!params) {
    return [];
  }

  return params.filter(
    (param) =>
      Boolean(param.type) && !excludedTypes.includes(param.type as string)
  );
};

/**
 * Configuration for rendering device parameters
 */
export interface RenderParamsConfig {
  params: ESPCDFDeviceParam[];
  paramsMap: ParamsMap;
  allParams: ESPCDFDeviceParam[];
  isConnected: boolean;
  onSetUpdating: (updating: boolean) => void;
}

/**
 * Processes a single parameter and returns the resolved control.
 * Single Responsibility: Only responsible for processing a single parameter.
 * @param param - The parameter to process
 * @param config - Configuration object containing paramsMap, allParams, etc.
 * @returns The resolved control configuration or null
 */
export const processParam = (
  param: ESPCDFDeviceParam,
  config: Omit<RenderParamsConfig, "params">
): ParamControlConfig | null => {
  const control = resolveParamControl(param, config.paramsMap);
  if (!control) {
    return null;
  }

  processDerivedMeta(param, control, config.allParams);
  return control;
};

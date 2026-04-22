/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import ParamControlWrap from "../ParamControls/ParamControlWrap";
import {
  buildParamsMap,
  processParam,
  RenderParamsConfig,
} from "@shared/utils/deviceParams";
import { DeviceParamsRendererProps } from "@src/types/global";

/**
 * DeviceParamsRenderer Component
 * A reusable component for rendering device parameters following SOLID principles:
 * - Single Responsibility: Only responsible for rendering device parameters
 * - Open/Closed: Extensible through props without modification
 * - Dependency Inversion: Depends on abstractions (interfaces) not concrete implementations
 * @param props - Component props
 * @returns Array of React elements representing parameter controls
 */
export const DeviceParamsRenderer: React.FC<DeviceParamsRendererProps> = ({
  params,
  allParams,
  isConnected,
  onSetUpdating,
  paramsMap,
  paramWrapperStyle,
}) => {
  const resolvedParamsMap = paramsMap || buildParamsMap();

  const config: Omit<RenderParamsConfig, "params"> = {
    paramsMap: resolvedParamsMap,
    allParams,
    isConnected,
    onSetUpdating,
  };

  return (
    <>
      {params.map((param) => {
        const control = processParam(param, config);
        if (!control || !control.control) {
          return null;
        }

        const ControlComponent = control.control;

        return (
          <ParamControlWrap
            key={param.name}
            param={param}
            disabled={!isConnected}
            setUpdating={onSetUpdating}
            style={paramWrapperStyle}
          >
            <ControlComponent />
          </ParamControlWrap>
        );
      })}
    </>
  );
};

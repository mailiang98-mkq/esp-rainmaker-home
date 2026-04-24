/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import { useMemo } from "react";
import type { ESPCDFDeviceParam } from "@store";
import { getParamControlComponent, getParamsUIMap } from "@shared/utils/paramUtils";
import type { ParamControlChildProps } from "@shared/components/ParamControls/lib/types";

type ParameterControlProps = {
  param: ESPCDFDeviceParam;
} & Partial<ParamControlChildProps>;

/**
 * ParameterControl Component
 *
 * Reusable component for rendering parameter UI controls
 * Automatically selects the appropriate control component based on parameter type
 * Forwards props from ParamWrap to the actual control component
 * @param param - The parameter to render a control for
 * @param label - Label for the control (injected by ParamWrap)
 * @param value - Current value (injected by ParamWrap)
 * @param onValueChange - Value change handler (injected by ParamWrap)
 * @param disabled - Whether the control is disabled (injected by ParamWrap)
 * @param meta - Additional metadata (injected by ParamWrap)
 */
export default function ParameterControl({
  param,
  label,
  value,
  onValueChange,
  disabled,
  meta,
}: ParameterControlProps) {
  const paramsUIMap = useMemo(() => getParamsUIMap(), []);
  const Control = useMemo(
    () => getParamControlComponent(param, paramsUIMap),
    [param, paramsUIMap],
  );

  if (!Control) return null;

  // Forward props to the control component if they were provided by ParamWrap
  return (
    <Control
      label={label}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      meta={meta}
    />
  );
}

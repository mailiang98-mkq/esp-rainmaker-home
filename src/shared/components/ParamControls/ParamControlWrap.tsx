/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, ReactElement, useMemo } from "react";
import { View, GestureResponderEvent } from "react-native";

// Components
import { observer, useLocalObservable } from "mobx-react-lite";

// Hooks
import { useThrottle } from "@shared/hooks/useThrottle";
import { useToast } from "@shared/hooks/useToast";

// Types & Styles
import {
  ParamControlProps,
  getParamBounds,
  ParamControlChildProps,
  comparableRoundedParamNumber,
  normalizeNumericParamValue,
} from "./lib/types";
import {
  ESPRM_PARAM_TIME_SERIES_PROPERTY,
  ESPRM_PARAM_SIMPLE_TIME_SERIES_PROPERTY,
} from "@shared/utils/constants";

/**
 * ParamControlWrap
 *
 * A wrapper component for controlling device parameter.
 *
 * @param param - The device parameter to control
 * @param disabled - Whether the control is disabled
 * @returns JSX component for brightness control
 */
const ParamControlWrap = observer(
  ({
    param,
    disabled = false,
    setUpdating,
    onOpenChart,
    children,
    style,
  }: ParamControlProps) => {
    // 1. Computed Values
    const { min, max, step = 1, ...rest } = getParamBounds(param);
    const hasFiniteBounds =
      typeof min === "number" &&
      Number.isFinite(min) &&
      typeof max === "number" &&
      Number.isFinite(max);
    const toast = useToast();
    const state = useLocalObservable(() => ({
      value: normalizeNumericParamValue(param.value),
      setValue: (next: any) => {
        state.value = next;
      },
    }));

    const isTimeSeriesParam = useMemo(
      () =>
        [
          ESPRM_PARAM_TIME_SERIES_PROPERTY,
          ESPRM_PARAM_SIMPLE_TIME_SERIES_PROPERTY,
        ].some((property) => param.properties?.includes(property)),
      [param.properties],
    );

    useEffect(() => {
      state.value = normalizeNumericParamValue(param.value);
    }, [param.value]);

    // 2. Handlers
    const handleValueChange = async (
      event: GestureResponderEvent | null,
      newValue: any,
      validate: boolean = true,
    ) => {
      if (disabled) return;
      if (typeof newValue == "number" && validate) {
        const roundedValue = Math.round(newValue);
        const cur = comparableRoundedParamNumber(state.value);
        if (cur !== null && roundedValue === cur) return;
        if (hasFiniteBounds) {
          if (roundedValue < min!) {
            toast.showError("Value is below minimum");
            return;
          }
          if (roundedValue > max!) {
            toast.showError("Value is above maximum");
            return;
          }
        }
        newValue = roundedValue;
      }
      setUpdating(true);
      state.setValue(newValue);
      throttledValueChange();
    };

    const throttledValueChange = useThrottle(async () => {
      await param.setValue(state.value);
      setTimeout(() => setUpdating(false), 100);
    }, 100);

    // 3. Render
    return (
      <View style={[style]}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(
            child as ReactElement<ParamControlChildProps>,
            {
              label: param.name,
              value: state.value,
              onValueChange: handleValueChange,
              disabled: !isTimeSeriesParam && disabled,
              meta: {
                ...getParamBounds(param),
                dataType: param.dataType,
              },
              onOpenChart: onOpenChart ? () => onOpenChart(param) : null,
            },
          );
        })}
      </View>
    );
  },
);

export default ParamControlWrap;

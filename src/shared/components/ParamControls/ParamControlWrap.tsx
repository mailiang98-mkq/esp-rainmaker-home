/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactElement, useEffect, useMemo, useRef } from "react";
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
  PARAM_CONTROL_THROTTLE_MS,
} from "@shared/utils/constants";

/**
 * ParamControlWrap
 *
 * A wrapper component for controlling device parameter.
 *
 * Persists numeric changes via {@link useThrottle} (latest value wins, serial async drain, spacing via
 * `PARAM_CONTROL_THROTTLE_MS`).
 * @param param - The device parameter to control
 * @param disabled - Whether the control is disabled
 * @returns Shell around a numeric param child with bounds and leading/trailing-throttled `param.setValue`; optional chart entry
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
    const { min, max } = getParamBounds(param);
    const paramUpdateDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasFiniteBounds =
      typeof min === "number" &&
      Number.isFinite(min) &&
      typeof max === "number" &&
      Number.isFinite(max);
    const toast = useToast();

    const state = useLocalObservable(() => ({
      value: normalizeNumericParamValue(param.value),
      setValue: (next: unknown) => {
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
      // Debounce the update of the state.value to avoid rapid changes
      const debounceUpdateDelay = 3000;

      if (paramUpdateDelayTimeoutRef.current === null) {
        state.value = normalizeNumericParamValue(param.value);
      }

      if (paramUpdateDelayTimeoutRef.current !== null) {
        clearTimeout(paramUpdateDelayTimeoutRef.current);
      }
      paramUpdateDelayTimeoutRef.current = setTimeout(() => {
        state.value = normalizeNumericParamValue(param.value);
        paramUpdateDelayTimeoutRef.current = null;
      }, debounceUpdateDelay);

      return () => {
        // cancel the timeout if the value changes again
        if (paramUpdateDelayTimeoutRef.current !== null) {
          clearTimeout(paramUpdateDelayTimeoutRef.current);
        }
      };  
    }, [param.value, state.value])

    /** Latest `param` for throttled persistence (avoid stale closures). */
    const paramRef = useRef(param);
    paramRef.current = param;

    const enqueueUpdate = useThrottle(
      async (value: unknown) => {
        await paramRef.current.setValue(value);
      },
      PARAM_CONTROL_THROTTLE_MS,
      {
        throttleWithLoading: true,
        setLoadingWhilePending: setUpdating,
      },
    );

    /**
     * Applies optional numeric rounding and bounds checks, updates local UI state,
     * and schedules throttled persistence (latest queued value wins).
     */
    const handleValueChange = async (
      _event: GestureResponderEvent | null,
      newValue: unknown,
      validate: boolean = true,
    ) => {
      if (disabled) return;
      if (typeof newValue === "number" && validate) {
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
      state.setValue(newValue);
      enqueueUpdate(newValue);
    };

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

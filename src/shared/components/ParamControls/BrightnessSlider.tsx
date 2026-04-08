/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { View, Text, GestureResponderEvent } from "react-native";

// Components
import { Slider } from "tamagui";
import { observer } from "mobx-react-lite";

// Types & Styles
import {
  ParamControlChildProps,
  clampValue,
  comparableRoundedParamNumber,
} from "./lib/types";
import { paramControlStyles as styles } from "./lib/styles";
import { tokens } from "@shared/theme/tokens";

/**
 * BrightnessSlider
 *
 * A slider component for controlling device brightness parameter.
 * Displays current brightness value and allows adjustment through a slider.
 *
 * @param param - The device parameter to control
 * @param disabled - Whether the control is disabled
 * @returns JSX component for brightness control
 */
const BRIGHTNESS_DEFAULTS = { min: 0, max: 100, step: 1 };

const BrightnessSlider = observer(
  ({
    label,
    value,
    onValueChange = () => {},
    disabled,
    meta = BRIGHTNESS_DEFAULTS,
  }: ParamControlChildProps) => {
    const rawMin = meta?.min;
    const rawMax = meta?.max;
    const rawStep = meta?.step;
    const min =
      typeof rawMin === "number" && Number.isFinite(rawMin)
        ? rawMin
        : BRIGHTNESS_DEFAULTS.min;
    const max =
      typeof rawMax === "number" && Number.isFinite(rawMax)
        ? rawMax
        : BRIGHTNESS_DEFAULTS.max;
    const step =
      typeof rawStep === "number" &&
      Number.isFinite(rawStep) &&
      rawStep > 0
        ? rawStep
        : BRIGHTNESS_DEFAULTS.step;

    const n = Number(value);
    const clamped = Number.isFinite(n)
      ? clampValue(Math.round(n), min, max)
      : min;
    const sliderValue = useMemo(() => [clamped], [clamped]);

    const commitValue = (
      event: GestureResponderEvent | null,
      newValue: number,
    ) => {
      if (disabled) return;
      const roundedValue = Math.round(newValue);
      const cur = comparableRoundedParamNumber(value);
      if (cur !== null && roundedValue === cur) return;
      if (roundedValue < min) return;
      if (roundedValue > max) return;
      onValueChange(event, roundedValue);
    };

    const handleTamaguiValueChange = (values: number[]) => {
      const raw = values[0];
      if (typeof raw !== "number" || !Number.isFinite(raw)) return;
      commitValue(null, raw);
    };

    return (
      <View style={[styles.container, disabled && styles.disabled]}>
        <View style={[styles.header, disabled && styles.disabledText]}>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.value}>{clamped}%</Text>
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            value={sliderValue}
            min={min}
            max={max}
            step={step}
            onSlideMove={commitValue}
            onValueChange={handleTamaguiValueChange}
            disabled={disabled}
            style={styles.slider}
          >
            <Slider.Track
              style={{ ...styles.track, backgroundColor: tokens.colors.bg2 }}
            >
              <Slider.TrackActive
                style={{
                  ...styles.trackActive,
                  backgroundColor: tokens.colors.blue,
                }}
              />
            </Slider.Track>
            <Slider.Thumb
              index={0}
              style={[styles.thumb, disabled && styles.disabled]}
              size="$1.5"
              borderWidth={1}
            />
          </Slider>
        </View>
      </View>
    );
  }
);

export default BrightnessSlider;

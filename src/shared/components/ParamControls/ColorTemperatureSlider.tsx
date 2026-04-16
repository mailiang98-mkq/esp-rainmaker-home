/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useId } from "react";
import { View, Text, GestureResponderEvent } from "react-native";

// Components
import { Slider } from "tamagui";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { observer } from "mobx-react-lite";

// Styles
import { tokens } from "@shared/theme/tokens";

// Types
import {
  ParamControlChildProps,
  clampValue,
  comparableRoundedParamNumber,
} from "./lib/types";
import { paramControlStyles as styles } from "./lib/styles"; 

/**
 * ColorTemperatureSlider
 *
 * A slider component for controlling color temperature of a light.
 * Features a gradient background representing warm to cool temperatures
 * and displays the current value in Kelvin.
 * @param param - The device parameter to control
 * @param disabled - Whether the control is disabled
 * @returns Color-temperature slider (K) with rounded commits
 */
const KELVIN_DEFAULTS = { min: 2700, max: 6500, step: 100 };

const ColorTemperatureSlider = observer(
  ({
    label,
    value,
    onValueChange = () => {},
    disabled,
    meta = KELVIN_DEFAULTS,
  }: ParamControlChildProps) => {
    const rawMin = meta?.min;
    const rawMax = meta?.max;
    const rawStep = meta?.step;

    let min =
      typeof rawMin === "number" && Number.isFinite(rawMin)
        ? rawMin
        : KELVIN_DEFAULTS.min;
    let max =
      typeof rawMax === "number" && Number.isFinite(rawMax)
        ? rawMax
        : KELVIN_DEFAULTS.max;
    if (max <= min) {
      min = KELVIN_DEFAULTS.min;
      max = KELVIN_DEFAULTS.max;
    }

    const step =
      typeof rawStep === "number" &&
      Number.isFinite(rawStep) &&
      rawStep > 0
        ? rawStep
        : KELVIN_DEFAULTS.step;

    const n = Number(value);
    const clamped = Number.isFinite(n)
      ? clampValue(Math.round(n), min, max)
      : Math.round(min + (max - min) / 2);

    const sliderValue = useMemo(() => [clamped], [clamped]);
    const gradientId = `ctg-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

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

    /** Tap on track often skips onSlideMove on iOS; Tamagui still calls onValueChange. */
    const handleTamaguiValueChange = (values: number[]) => {
      const raw = values[0];
      if (typeof raw !== "number" || !Number.isFinite(raw)) return;
      commitValue(null, raw);
    };

    return (
      <View style={[styles.container, disabled && styles.disabled]}>
        <View style={[styles.header, disabled && styles.disabledText]}>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.value}>{clamped}K</Text>
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
            style={[styles.slider, { zIndex: 10 }]}
          >
            <Slider.Track
              style={[styles.track, { backgroundColor: "transparent" }]}
            >
              <Slider.TrackActive
                style={[styles.trackActive, { backgroundColor: "transparent" }]}
              />
            </Slider.Track>
            <Slider.Thumb
              index={0}
              style={[
                styles.thumb,
                { zIndex: 10 },
                disabled && styles.disabled,
              ]}
              size="$1.5"
              borderWidth={1}
            />
          </Slider>

          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 8,
              zIndex: 1,
            }}
          >
            <Svg width="100%" height="4" style={styles.gradientSvg}>
              <Defs>
                <LinearGradient
                  id={gradientId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <Stop offset="0%" stopColor="#f8cf6d" />
                  <Stop offset="50%" stopColor="#ffffff" />
                  <Stop offset="100%" stopColor="#a4d5ff" />
                </LinearGradient>
              </Defs>
              <Rect
                width="100%"
                height="4"
                fill={`url(#${gradientId})`}
                stroke={tokens.colors.bg2}
                strokeWidth="1"
                rx="2"
              />
            </Svg>
          </View>
        </View>
      </View>
    );
  }
);

export default ColorTemperatureSlider;

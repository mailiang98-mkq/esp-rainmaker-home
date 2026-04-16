/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, GestureResponderEvent } from "react-native";

// Components
import { Slider } from "tamagui";
import { observer } from "mobx-react-lite";

// Types & Styles
import {
  ParamControlChildProps,
  comparableRoundedParamNumber,
} from "./lib/types";
import { paramControlStyles as styles } from "./lib/styles";
import { tokens } from "@shared/theme/tokens";

/**
 * SliderControl
 *
 * A basic slider component for controlling numeric parameters.
 * Provides a simple slider interface with current value display.
 * @param param - The device parameter to control
 * @param disabled - Whether the control is disabled
 * @returns Generic labeled slider with min/max from `meta`
 */
const SliderControl = observer(
  ({
    label,
    value,
    onValueChange = () => {},
    disabled,
    meta = { min: 0, max: 100, step: 1 },
  }: ParamControlChildProps) => {
    // 1. Computed Values
    const { min, max, step } = meta;

    // 2. Handlers
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

    // 3. Render
    return (
      <View style={[styles.container, disabled && styles.disabled]}>
        <View style={[styles.header, disabled && styles.disabledText]}>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            value={[value]}
            min={min}
            max={max}
            step={step}
            onSlideMove={commitValue}
            onValueChange={handleTamaguiValueChange}
            disabled={disabled}
            style={[styles.slider]}
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

export default SliderControl;

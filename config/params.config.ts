/*
 * SPDX-FileCopyrightText: 2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrightnessSlider } from "@shared/components";
import { ColorTemperatureSlider } from "@shared/components";
import { HueSlider } from "@shared/components";
import { SaturationSlider } from "@shared/components";
import { ToggleSwitch } from "@shared/components";
import { Slider } from "@shared/components";
import { HueCircle } from "@shared/components";
import { PushButton } from "@shared/components";
import { DropdownSelector } from "@shared/components";
import { TriggerButton } from "@shared/components";
import { TextInput, Temperature } from "@shared/components";

import {
  // DATA TYPES
  DATA_TYPE_ALL,
  DATA_TYPE_BOOL,
  DATA_TYPE_INT,
  DATA_TYPE_FLOAT,
  DATA_TYPE_STRING,

  // SUPPORTED PARAM TYPES
  ESPRM_BRIGHTNESS_PARAM_TYPE,
  ESPRM_CCT_PARAM_TYPE,
  ESPRM_HUE_PARAM_TYPE,
  ESPRM_POWER_PARAM_TYPE,
  ESPRM_SATURATION_PARAM_TYPE,
  ESPRM_TEMPERATURE_PARAM_TYPE,

  // SUPPORTED PARAM UI TYPES
  ESPRM_UI_DROPDOWN_PARAM_TYPE,
  ESPRM_UI_HIDDEN_PARAM_TYPE,
  ESPRM_UI_HUE_CIRCLE_PARAM_TYPE,
  ESPRM_UI_HUE_SLIDER_PARAM_TYPE,
  ESPRM_UI_PUSH_BUTTON_PARAM_TYPE,
  ESPRM_UI_SLIDER_PARAM_TYPE,
  ESPRM_UI_TEXT_PARAM_TYPE,
  ESPRM_UI_TOGGLE_PARAM_TYPE,
  ESPRM_UI_TRIGGER_PARAM_TYPE,
} from "@shared/utils/constants";

export const PARAM_CONTROLS = [
  {
    name: "Temperature",
    types: [ESPRM_TEMPERATURE_PARAM_TYPE],
    control: Temperature,
    dataTypes: [DATA_TYPE_INT, DATA_TYPE_FLOAT],
  },
  {
    name: "Text",
    types: [ESPRM_UI_TEXT_PARAM_TYPE],
    control: TextInput,
    dataTypes: DATA_TYPE_ALL,
  },
  {
    name: "Toggle",
    types: [ESPRM_UI_TOGGLE_PARAM_TYPE, ESPRM_POWER_PARAM_TYPE],
    control: ToggleSwitch,
    dataTypes: DATA_TYPE_BOOL,
    hide: true,
  },
  {
    name: "Slider",
    types: [ESPRM_UI_SLIDER_PARAM_TYPE],
    control: Slider,
    dataTypes: [DATA_TYPE_INT, DATA_TYPE_FLOAT],
    requirements: "bounds (min, max)",
  },
  {
    name: "Brightness",
    types: [ESPRM_BRIGHTNESS_PARAM_TYPE],
    control: BrightnessSlider,
    dataTypes: DATA_TYPE_INT,
    paramType: ESPRM_BRIGHTNESS_PARAM_TYPE,
  },
  {
    name: "CCT",
    types: [ESPRM_CCT_PARAM_TYPE],
    control: ColorTemperatureSlider,
    dataTypes: DATA_TYPE_INT,
    paramType: ESPRM_CCT_PARAM_TYPE,
  },
  {
    name: "Saturation",
    types: [ESPRM_SATURATION_PARAM_TYPE],
    control: SaturationSlider,
    dataTypes: DATA_TYPE_INT,
    paramType: ESPRM_SATURATION_PARAM_TYPE,
    derivedMeta: [
      {
        hue: ESPRM_HUE_PARAM_TYPE,
      },
    ],
  },
  {
    name: "Hue Slider",
    types: [ESPRM_UI_HUE_SLIDER_PARAM_TYPE, ESPRM_HUE_PARAM_TYPE],
    control: HueSlider,
    dataTypes: DATA_TYPE_INT,
    paramType: ESPRM_HUE_PARAM_TYPE,
  },
  {
    name: "Hue Circle",
    types: [ESPRM_UI_HUE_CIRCLE_PARAM_TYPE],
    control: HueCircle,
    dataTypes: DATA_TYPE_INT,
    paramType: ESPRM_HUE_PARAM_TYPE,
  },
  {
    name: "Push Button",
    types: [ESPRM_UI_PUSH_BUTTON_PARAM_TYPE],
    control: PushButton,
    dataTypes: DATA_TYPE_BOOL,
  },
  {
    name: "Dropdown",
    types: [ESPRM_UI_DROPDOWN_PARAM_TYPE],
    control: DropdownSelector,
    dataTypes: [DATA_TYPE_INT, DATA_TYPE_STRING],
    requirements: "bounds (min/max) for Int, valid strings for String",
  },
  {
    name: "Trigger",
    types: [ESPRM_UI_TRIGGER_PARAM_TYPE],
    control: TriggerButton,
    dataTypes: DATA_TYPE_BOOL,
    platformRestriction: "android",
  },
  {
    name: "Hidden",
    types: [ESPRM_UI_HIDDEN_PARAM_TYPE],
    control: null,
    dataTypes: DATA_TYPE_BOOL,
    platformRestriction: "android",
    requirements: "param will be hidden",
  },
];

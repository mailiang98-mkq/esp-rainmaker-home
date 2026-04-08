/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { ESPCDFDeviceParam } from "@store";
import { testProps } from "@shared/utils/testProps";
import { globalStyles } from "@shared/theme/globalStyleSheet";

type ParameterValueDisplayProps = {
  param: ESPCDFDeviceParam;
  value: any;
  qaId?: string;
};

/**
 * ParameterValueDisplay Component
 *
 * Reusable component for displaying parameter values in a formatted way
 * Handles boolean, string, number, and null/undefined values
 *
 * @param param - The parameter object
 * @param value - The value to display
 * @param qaId - Optional QA identifier for testing
 */
export default function ParameterValueDisplay({
  param,
  value,
  qaId,
}: ParameterValueDisplayProps) {
  const { t } = useTranslation();

  const renderValue = (): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "boolean")
      return value
        ? t("scene.deviceParamsSelection.parameterOn")
        : t("scene.deviceParamsSelection.parameterOff");
    return value.toString();
  };

  return (
    <Text
      style={globalStyles.fontMedium}
      {...testProps(qaId || `text_${param.name}_params_value`)}
    >
      {renderValue()}
    </Text>
  );
}

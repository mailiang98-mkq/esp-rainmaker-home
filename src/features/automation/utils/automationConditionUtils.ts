/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TFunction } from "i18next";
import { ESPCDFAutomationConditionOperator } from "@store";

/**
 * Returns the translated label for an automation condition operator.
 * Supports both enum values and string literals ("==", "!=", etc.).
 */
export function getConditionLabel(condition: string, t: TFunction): string {
  switch (condition) {
    case ESPCDFAutomationConditionOperator.EQUAL:
      return t("automation.conditions.equals");
    case ESPCDFAutomationConditionOperator.NOT_EQUAL:
      return t("automation.conditions.notEquals");
    case ESPCDFAutomationConditionOperator.GREATER_THAN:
      return t("automation.conditions.greaterThan");
    case ESPCDFAutomationConditionOperator.LESS_THAN:
      return t("automation.conditions.lessThan");
    case ESPCDFAutomationConditionOperator.GREATER_THAN_OR_EQUAL:
      return t("automation.conditions.greaterThanOrEqual");
    case ESPCDFAutomationConditionOperator.LESS_THAN_OR_EQUAL:
      return t("automation.conditions.lessThanOrEqual");
    default:
      return condition;
  }
}

/**
 * Returns a display string for a condition value (e.g. boolean -> "On"/"Off").
 */
export function getValueDisplay(value: unknown, t: TFunction): string {
  if (typeof value === "boolean") {
    return value
      ? t("automation.conditions.on")
      : t("automation.conditions.off");
  }
  return value != null ? String(value) : "N/A";
}

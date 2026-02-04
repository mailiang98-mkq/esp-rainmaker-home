/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ESPCDFAutomationConditionOperator } from "@store";

export interface EventConditionOption {
  label: string;
  value: ESPCDFAutomationConditionOperator;
  isVisible?: boolean;
}

/**
 * Returns available condition options for event parameter (non-bool, non-string show all operators).
 * Pure; no side effects.
 */
export function getAvailableEventConditions(): EventConditionOption[] {
  return [
    { label: "==", value: ESPCDFAutomationConditionOperator.EQUAL, isVisible: true },
    { label: ">", value: ESPCDFAutomationConditionOperator.GREATER_THAN, isVisible: true },
    { label: "<", value: ESPCDFAutomationConditionOperator.LESS_THAN, isVisible: true },
    { label: "!=", value: ESPCDFAutomationConditionOperator.NOT_EQUAL },
    { label: ">=", value: ESPCDFAutomationConditionOperator.GREATER_THAN_OR_EQUAL },
    { label: "<=", value: ESPCDFAutomationConditionOperator.LESS_THAN_OR_EQUAL },
  ];
}

/**
 * Whether the parameter type should show condition selector (numeric types).
 * Bool and string use only EQUAL in UI.
 */
export function shouldShowConditionSelector(dataType: string | undefined): boolean {
  if (!dataType) return false;
  const lower = dataType.toLowerCase();
  return lower !== "bool" && lower !== "string";
}

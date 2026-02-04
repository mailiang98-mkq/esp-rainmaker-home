/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export {
  useAutomationsList,
  type RefreshAutomationsResult,
  type LoadAutomationsResult,
  type DeleteAutomationResult,
  type ToggleAutomationResult,
  type UseAutomationsListResult,
  type UseAutomationsListOptions,
} from "./useAutomationsList";
export {
  useCreateAutomation,
  type CreateAutomationResult,
  type UpdateAutomationResult,
  type DeleteAutomationResult as UseCreateDeleteAutomationResult,
  type UseCreateAutomationParams,
  type UseCreateAutomationResult,
} from "./useCreateAutomation";
export {
  useActionDeviceSelection,
  type SelectActionDeviceResult,
  type UseActionDeviceSelectionParams,
  type UseActionDeviceSelectionResult,
} from "./useActionDeviceSelection";
export {
  useActionDeviceParamSelection,
  type UseActionDeviceParamSelectionResult,
} from "./useActionDeviceParamSelection";
export {
  useEventDeviceSelection,
  type SelectEventDeviceResult,
  type UseEventDeviceSelectionParams,
  type UseEventDeviceSelectionResult,
} from "./useEventDeviceSelection";
export {
  useEventDeviceParamSelection,
  type UseEventDeviceParamSelectionParams,
  type UseEventDeviceParamSelectionResult,
} from "./useEventDeviceParamSelection";

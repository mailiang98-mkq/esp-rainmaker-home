/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { getBleScanErrorType } from "@shared/utils/device";

export type BleScanErrorType = "permission" | "noDevices" | "scanFailed" | "bluetoothDisabled" | "generic";

/**
 * Get BLE scan error type from error message and code
 */
export const getBleScanErrorTypeHelper = (
  errorMessage: string,
  errorCode?: string
): BleScanErrorType => {
  return getBleScanErrorType(errorMessage, errorCode);
};

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext } from "react";

export const AppRestartContext = createContext<{ restartApp: () => void }>({
  restartApp: () => {},
});

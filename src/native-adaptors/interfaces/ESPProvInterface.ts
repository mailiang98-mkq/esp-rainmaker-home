/*
 * SPDX-FileCopyrightText: 2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ESPProvisionAdapterInterface } from "@store";
import { NativeModules } from "react-native";
const { ESPProvModule } = NativeModules;

export default ESPProvModule as ESPProvisionAdapterInterface;

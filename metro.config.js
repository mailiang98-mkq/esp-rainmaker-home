// SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
//
// SPDX-License-Identifier: Apache-2.0

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// MQTT.js: resolve package "exports" so React Native gets dist/mqtt.esm.js
// (Node build pulls `url` and other stdlib). Required for Expo SDK ≤ 53.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

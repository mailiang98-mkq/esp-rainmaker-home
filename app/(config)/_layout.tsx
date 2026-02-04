/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stack } from "expo-router";

export default function ConfigLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "fullScreenModal",
        animation: "slide_from_bottom",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="ConfigScan" />
    </Stack>
  );
}

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, StyleSheet } from "react-native";
import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";

/**
 * BottomSheetHandle Component
 *
 * Reusable handle indicator for bottom sheet modals
 * Provides visual feedback for draggable bottom sheets
 */
export default function BottomSheetHandle() {
  return (
    <View style={styles.handle} {...testProps("view_device_params_selection")} />
  );
}

const styles = StyleSheet.create({
  handle: {
    width: 40,
    height: 4,
    backgroundColor: tokens.colors.bg2,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
});

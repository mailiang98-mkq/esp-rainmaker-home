/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import Constants from "expo-constants";

// Styles
import { tokens } from "@shared/theme/tokens";

import { testProps } from "@shared/utils/testProps";
import { useMultiTap } from "../../hooks/useMultiTap";

const CONFIG_SCAN_TRIGGER = 5;
const CONFIG_RESET_TRIGGER = 10;
const TAP_WINDOW_MS = 1000;

// Types
interface LogoProps {
  /** Size of the logo in pixels */
  size?: number;
  /** QA automation identifier */
  qaId?: string;
  /** Called after 10 rapid taps (config scan) */
  onConfigTrigger?: () => void;
  /** Called after 15 rapid taps (config reset) */
  onConfigReset?: () => void;
}

/**
 * Logo
 *
 * A component for displaying the app logo with customizable size.
 * Features:
 * - Configurable size
 * - Maintains aspect ratio
 * - Consistent bottom margin
 * - Optional: 10 taps opens config scan, 15 taps resets runtime config
 */
const Logo: React.FC<LogoProps> = ({
  size = 180,
  qaId,
  onConfigTrigger,
  onConfigReset,
}) => {
  const handleTap = useMultiTap({
    windowMs: TAP_WINDOW_MS,
    triggers: [
      { count: CONFIG_RESET_TRIGGER, action: () => onConfigReset?.() },
      { count: CONFIG_SCAN_TRIGGER, action: () => onConfigTrigger?.() },
    ],
  });

  const image = (
    <Image
      {...(qaId ? testProps(qaId) : {})}
      style={styles(size).logo}
      resizeMethod="scale"
      source={require("@assets/images/logo.png")}
    />
  );

  if (!Constants.expoConfig?.extra?.enableScanConfiguration) {
    return image;
  }

  if (!onConfigTrigger && !onConfigReset) {
    return image;
  }

  return (
    <TouchableOpacity onPress={handleTap} activeOpacity={1}>
      {image}
    </TouchableOpacity>
  );
};

/* ------------------------------ Styles ------------------------------- */
const styles = (size: number) =>
  StyleSheet.create({
    logo: {
      width: size,
      height: size,
      marginBottom: tokens.spacing._20,
    },
  });

export default Logo;

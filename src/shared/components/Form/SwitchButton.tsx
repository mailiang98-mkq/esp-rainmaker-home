/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Text,
  Pressable,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";

export interface SwitchButtonProps {
  qaId: string;
  text: string;
  icon: LucideIcon;
  iconSize: number;
  iconColor?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Reusable pressable button with an icon, text, and loading state.
 */
const SwitchButton: React.FC<SwitchButtonProps> = ({
  qaId,
  text,
  icon: Icon,
  iconSize,
  iconColor = tokens.colors.blue,
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
}) => (
  <Pressable
    {...testProps(qaId)}
    style={style}
    onPress={onPress}
    disabled={disabled}
  >
    {loading ? (
      <ActivityIndicator size="small" color={iconColor} />
    ) : (
      <Icon size={iconSize} color={iconColor} />
    )}
    <Text style={textStyle}>{text}</Text>
  </Pressable>
);

export default SwitchButton;

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, type StyleProp, type ViewStyle } from "react-native";
import { ShieldAlert } from "lucide-react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";

export interface WarningBannerProps {
  message: string;
  /** Applied after `globalStyles.warningContainer` (e.g. horizontal margins). */
  containerStyle?: StyleProp<ViewStyle>;
  /** Explicit test id for the message `Text` (preferred for stable E2E). */
  textTestId?: string;
  /** When `textTestId` is omitted, text uses `{qaId}_text` if `qaId` is set. */
  qaId?: string;
}

/**
 * Inline warning row: shield icon + text. Same visuals as SceneMenuBottomSheet warning block.
 */
export default function WarningBanner({
  message,
  containerStyle,
  textTestId,
  qaId,
}: WarningBannerProps) {
  const textProps = textTestId
    ? testProps(textTestId)
    : qaId
      ? testProps(`${qaId}_text`)
      : {};

  return (
    <View style={[globalStyles.warningContainer, containerStyle]}>
      <ShieldAlert size={tokens.fontSize.xs} color={tokens.colors.warn} />
      <Text {...textProps} style={globalStyles.warningText}>
        {message}
      </Text>
    </View>
  );
}

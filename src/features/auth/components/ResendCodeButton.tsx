/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Text, TouchableOpacity } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";

interface ResendCodeButtonProps {
  countdown: number;
  onPress: () => void;
  disabled?: boolean;
  resendLabel: string;
  testId?: string;
}

/**
 * Renders the resend code button UI section.
 */
export function ResendCodeButton({
  countdown,
  onPress,
  disabled = false,
  resendLabel,
  testId = "button_resend",
}: ResendCodeButtonProps) {
  return (
    <TouchableOpacity
      {...testProps(testId)}
      onPress={onPress}
      disabled={countdown > 0 || disabled}
    >
      <Text
        {...testProps(`text_${testId}`)}
        style={[globalStyles.linkText, countdown > 0 && { opacity: 0.5 }]}
      >
        {countdown > 0
          ? `${resendLabel} (${countdown}s)`
          : resendLabel}
      </Text>
    </TouchableOpacity>
  );
}

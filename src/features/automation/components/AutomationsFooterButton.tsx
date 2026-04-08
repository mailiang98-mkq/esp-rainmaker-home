/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import Button from "@shared/components/Form/Button";

export interface AutomationsFooterButtonProps {
  /** Button label (e.g. "Add automation" or "Add first device") */
  label: string;
  /** Called when button is pressed */
  onPress: () => void;
  /** Test ID for the button */
  testID?: string;
}

/**
 * AutomationsFooterButton
 *
 * Fixed footer button for adding automation or navigating to add device.
 */
export const AutomationsFooterButton: React.FC<
  AutomationsFooterButtonProps
> = ({ label, onPress, testID = "button_add_automation" }) => {
  return (
    <View style={globalStyles.footerAddButtonContainer}>
      <Button
        label={label}
        onPress={onPress}
        style={globalStyles.footerAddButton}
        qaId={testID}
      />
    </View>
  );
};

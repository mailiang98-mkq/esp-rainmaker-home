/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View } from "react-native";
import { useTranslation } from "react-i18next";

import {
  selectDeviceRoomContinueButtonStyle,
  selectDeviceRoomStyles,
} from "@features/provision/theme";
import { Button } from "@shared/components";
import { testProps } from "@shared/utils/testProps";

const styles = selectDeviceRoomStyles;

export interface SelectDeviceRoomFooterProps {
  /** True while the assign-and-navigate action is in progress. */
  isLoading: boolean;
  /** Disables the primary action (e.g. no room selected). */
  continueDisabled: boolean;
  /** Invoked when the user confirms room selection. */
  onContinue: () => void;
}

/**
 * Pinned footer with the post-provision “Continue” CTA.
 */
export const SelectDeviceRoomFooter = ({
  isLoading,
  continueDisabled,
  onContinue,
}: SelectDeviceRoomFooterProps) => {
  const { t } = useTranslation();

  return (
    <View
      style={styles.footer}
      {...testProps("footer_select_device_room_actions")}
    >
      <Button
        label={t("device.deviceDetails.continue")}
        onPress={onContinue}
        isLoading={isLoading}
        style={selectDeviceRoomContinueButtonStyle}
        disabled={continueDisabled}
        qaId="button_continue_select_device_room"
      />
    </View>
  );
};

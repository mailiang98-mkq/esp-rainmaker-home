/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { ActionButton } from "@shared/components";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";

interface DeviceParamsSaveButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

/**
 * DeviceParamsSaveButton Component
 *
 * Renders the save/done button for device parameters selection
 */
export default function DeviceParamsSaveButton({
  onPress,
  disabled = false,
}: DeviceParamsSaveButtonProps) {
  const { t } = useTranslation();

  return (
    <View
      style={[
        globalStyles.actionButtonContainer,
        globalStyles.deviceParamsButtonContainer,
      ]}
      {...testProps("view_device_params_selection")}
    >
      <ActionButton
        onPress={onPress}
        disabled={disabled}
        variant="secondary"
        qaId="button_save_device_params_selection"
      >
        <View
          style={globalStyles.deviceParamsButtonContent}
          {...testProps("view_device_params_selection")}
        >
          <Text
            style={[globalStyles.fontMedium]}
            {...testProps("text_done_device_params_selection")}
          >
            {t("layout.shared.done")}
          </Text>
        </View>
      </ActionButton>
    </View>
  );
}

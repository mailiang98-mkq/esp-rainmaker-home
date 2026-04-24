/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import { View, Text, StyleSheet } from "react-native";
import { ActionButton } from "@shared/components";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";
import { useTranslation } from "react-i18next";

type ParameterModalActionsProps = {
  showDelete: boolean;
  onSave: () => void;
  onDelete: () => void;
};

/**
 * ParameterModalActions Component
 *
 * Reusable action buttons for parameter configuration modals
 * Displays Save and optionally Delete buttons
 * @param showDelete - Whether to show the delete button
 * @param onSave - Handler for saving the parameter value
 * @param onDelete - Handler for deleting the parameter value
 */
export default function ParameterModalActions({
  showDelete,
  onSave,
  onDelete,
}: ParameterModalActionsProps) {
  const { t } = useTranslation();

  return (
    <View
      style={styles.container}
      {...testProps("view_device_params_selection")}
    >
      {showDelete && (
        <ActionButton
          onPress={onDelete}
          variant="danger"
          style={styles.actionButton}
          qaId="button_delete_device_params_selection"
        >
          <Text
            style={[globalStyles.fontMedium, globalStyles.textWhite]}
            {...testProps("text_delete_device_params_selection")}
          >
            {t("layout.shared.delete")}
          </Text>
        </ActionButton>
      )}
      <ActionButton
        onPress={onSave}
        variant="primary"
        style={styles.actionButton}
        qaId="button_save_device_params_selection"
      >
        <Text
          style={[globalStyles.fontMedium, globalStyles.textWhite]}
          {...testProps("text_save_device_params_selection")}
        >
          {t("layout.shared.save")}
        </Text>
      </ActionButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: tokens.spacing._10,
  },
  actionButton: {
    flex: 1,
  },
});

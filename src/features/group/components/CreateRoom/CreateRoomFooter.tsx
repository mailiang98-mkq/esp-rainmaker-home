/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { Button } from "@shared/components";
import { testProps } from "@shared/utils/testProps";

export interface CreateRoomFooterProps {
  saveLabel: string;
  deleteLabel: string;
  saveDisabled: boolean;
  deleteDisabled: boolean;
  saveLoading: boolean;
  deleteLoading: boolean;
  showDelete: boolean;
  onSave: () => void;
  onDelete: () => void;
}

/**
 * Save and optional Delete buttons for Create Room screen.
 */
export const CreateRoomFooter: React.FC<CreateRoomFooterProps> = ({
  saveLabel,
  deleteLabel,
  saveDisabled,
  deleteDisabled,
  saveLoading,
  deleteLoading,
  showDelete,
  onSave,
  onDelete,
}) => (
  <View
    style={globalStyles.createRoomFooter}
    {...testProps("view_create_room")}
  >
    <Button
      label={saveLabel}
      disabled={saveDisabled}
      onPress={onSave}
      style={StyleSheet.flatten([globalStyles.btn, globalStyles.bgBlue])}
      isLoading={saveLoading}
      qaId="button_save_create_room"
    />
    {showDelete && (
      <Button
        label={deleteLabel}
        disabled={deleteDisabled}
        isLoading={deleteLoading}
        onPress={onDelete}
        style={StyleSheet.flatten([
          globalStyles.btn,
          globalStyles.buttonDanger,
        ])}
        qaId="button_delete_create_room"
      />
    )}
  </View>
);

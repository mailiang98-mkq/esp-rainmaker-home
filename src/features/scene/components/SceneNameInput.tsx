/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, StyleSheet } from "react-native";
import { Edit3 } from "lucide-react-native";
import { Input, ContentWrapper } from "@shared/components";
import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";

type SceneNameInputProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  title: string;
  qaId?: string;
};

/**
 * SceneNameInput Component
 *
 * Reusable component for scene name input with edit icon
 * Used in Create Scene, Edit Scene, and other scene-related screens
 */
export default function SceneNameInput({
  value,
  onChange,
  placeholder,
  title,
  qaId = "scene_name",
}: SceneNameInputProps) {
  return (
    <ContentWrapper qaId={qaId} title={title} style={styles.contentWrapper}>
      <View style={styles.inputContainer}>
        <Input
          qaId={qaId}
          placeholder={placeholder}
          value={value}
          onFieldChange={onChange}
          style={styles.input}
          border={false}
          paddingHorizontal={false}
          marginBottom={false}
        />
        <View style={styles.editIcon}>
          <Edit3
            {...testProps("icon_edit_scene_name")}
            size={20}
            color={tokens.colors.text_secondary}
          />
        </View>
      </View>
    </ContentWrapper>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    backgroundColor: tokens.colors.white,
    borderWidth: tokens.border.defaultWidth,
    borderColor: tokens.colors.borderColor,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: tokens.spacing._10,
  },
  input: {
    flex: 1,
    paddingRight: tokens.spacing._40,
  },
  editIcon: {
    top: tokens.spacing._10,
    position: "absolute",
    right: 0,
  },
});

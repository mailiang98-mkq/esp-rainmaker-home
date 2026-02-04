/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View } from "react-native";
import { Edit3 } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { ContentWrapper, Input } from "@shared/components";
import { testProps } from "@shared/utils/testProps";
import { createAutomationStyles as styles } from "../../theme/createAutomationStyles";

export interface CreateAutomationNameSectionProps {
  title: string;
  placeholder: string;
  value: string;
  onNameChange: (name: string) => void;
}

export const CreateAutomationNameSection: React.FC<
  CreateAutomationNameSectionProps
> = ({ title, placeholder, value, onNameChange }) => {
  return (
    <ContentWrapper
      qaId="automation_name"
      title={title}
      style={{
        ...styles.contentWrapper,
        ...styles.section,
      }}
    >
      <View style={styles.inputContainer}>
        <Input
          qaId="automation_name"
          placeholder={placeholder}
          value={value}
          onFieldChange={onNameChange}
          style={styles.input}
          border={false}
          paddingHorizontal={false}
          marginBottom={false}
        />
        <View style={styles.editIcon}>
          <Edit3
            {...testProps("icon_edit_automation_name")}
            size={20}
            color={tokens.colors.text_secondary}
          />
        </View>
      </View>
    </ContentWrapper>
  );
};

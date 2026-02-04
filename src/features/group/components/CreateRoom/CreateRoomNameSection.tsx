/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";

export interface CreateRoomNameSectionProps {
  title: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  sectionTestId?: string;
  valueTestId?: string;
}

/**
 * Room name row: label + value/placeholder + chevron. Tappable to customize name.
 */
export const CreateRoomNameSection: React.FC<CreateRoomNameSectionProps> = ({
  title,
  value,
  placeholder,
  onPress,
  sectionTestId = "view_create_room",
  valueTestId = "text_name_customized_room",
}) => (
  <View style={globalStyles.createRoomSection} {...testProps(sectionTestId)}>
    <Pressable
      style={[
        globalStyles.flex,
        globalStyles.alignCenter,
        globalStyles.justifyBetween,
        globalStyles.createRoomRoomNameRow,
      ]}
      onPress={onPress}
      {...testProps("button_create_room")}
    >
      <Text
        style={globalStyles.createRoomRoomNameTitle}
        {...testProps("text_title_room")}
      >
        {title}
      </Text>
      <View
        style={[globalStyles.flex, globalStyles.alignCenter]}
        {...testProps("view_create_room")}
      >
        <Text
          style={globalStyles.createRoomCustomizeText}
          {...testProps(valueTestId)}
        >
          {value || placeholder}
        </Text>
        <ChevronRight size={20} color={tokens.colors.primary} />
      </View>
    </Pressable>
  </View>
);

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";

export interface CreateRoomSuccessContentProps {
  title: string;
  subtitle?: string;
  doneLabel: string;
  onDone: () => void;
}

/**
 * Success content: illustration, title, optional subtitle, and done button.
 * UI only; receives copy and handler via props.
 */
export const CreateRoomSuccessContent: React.FC<CreateRoomSuccessContentProps> = ({
  title,
  subtitle,
  doneLabel,
  onDone,
}) => (
  <View {...testProps("view_create_room_success")} style={globalStyles.createRoomSuccessContent}>
    <Image
      {...testProps("image_create_room_success")}
      source={require("@assets/images/success.png")}
      style={globalStyles.createRoomSuccessIllustration}
      resizeMode="contain"
    />
    <Text {...testProps("text_create_room_success_title")} style={globalStyles.createRoomSuccessTitle}>
      {title}
    </Text>
    {subtitle != null && subtitle !== "" && (
      <Text {...testProps("text_create_room_success_subtitle")} style={globalStyles.createRoomSuccessSubtitle}>
        {subtitle}
      </Text>
    )}
    <Pressable
      {...testProps("button_create_room_success")}
      style={[
        globalStyles.btn,
        globalStyles.bgBlue,
        globalStyles.createRoomSuccessButton,
        globalStyles.createRoomSuccessButtonSpacing,
      ]}
      onPress={onDone}
    >
      <Text {...testProps("text_done_create_room_success")} style={[globalStyles.fontMedium, globalStyles.textWhite]}>
        {doneLabel}
      </Text>
    </Pressable>
  </View>
);

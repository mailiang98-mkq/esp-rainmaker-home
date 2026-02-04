/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { Header } from "@shared/components";
import { testProps } from "@shared/utils/testProps";

export interface HomeManagementHeaderProps {
  /** Screen title (e.g. translated "Home Management") */
  title: string;
  /** Called when the add (plus) button is pressed */
  onAddPress: () => void;
  /** QA id for the header */
  qaId?: string;
}

/**
 * Home Management screen header with title and add-home action.
 * UI only; no business logic.
 */
export const HomeManagementHeader: React.FC<HomeManagementHeaderProps> = ({
  title,
  onAddPress,
  qaId = "header_home_management",
}) => (
  <Header
    label={title}
    showBack={true}
    rightSlot={
      <Pressable {...testProps("button_add_home")} onPress={onAddPress}>
        <Plus color={tokens.colors.primary} />
      </Pressable>
    }
    qaId={qaId}
  />
);

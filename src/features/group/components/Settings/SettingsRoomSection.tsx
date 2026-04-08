/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ChevronRight } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { ContentWrapper } from "@shared/components";

export interface SettingsRoomSectionProps {
  /** Section title (e.g. "Room Management") */
  title: string;
  onPress: () => void;
  qaId?: string;
}

/**
 * Tappable "Room Management" section for Settings screen.
 * UI only; uses global styles.
 */
export const SettingsRoomSection: React.FC<SettingsRoomSectionProps> = ({
  title,
  onPress,
  qaId = "section_room_management",
}) => (
  <ContentWrapper
    title={title}
    leftSlot={<ChevronRight size={20} color={tokens.colors.primary} />}
    style={globalStyles.settingsContentWrapper}
    onPress={onPress}
    qaId={qaId}
  />
);

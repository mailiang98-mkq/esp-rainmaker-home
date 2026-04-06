/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { Typo } from "@shared/components";

interface NonPrimaryUserCardProps {
  homeName: string;
  restrictionTitle: string;
  restrictionMessage: string;
}

/**
 * NonPrimaryUserCard Component
 *
 * Displays a message when user is not the primary user of the home
 */
export const NonPrimaryUserCard: React.FC<NonPrimaryUserCardProps> = ({
  restrictionTitle,
  restrictionMessage,
}) => (
  <View
    style={[
      globalStyles.emptyStateContainer,
      { borderRadius: tokens.radius.md },
    ]}
  >
    <View style={globalStyles.emptyStateIconContainer}>
      <AlertCircle size={48} color={tokens.colors.primary} />
    </View>
    <View>
      <Typo variant="h2" style={globalStyles.emptyStateTitle}>
        {restrictionTitle}
      </Typo>
      <Typo variant="body" style={globalStyles.emptyStateDescription}>
        {restrictionMessage}
      </Typo>
    </View>
  </View>
);

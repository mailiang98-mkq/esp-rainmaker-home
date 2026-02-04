/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";

export interface HomeManagementListHeaderProps {
  /** Section title (e.g. "My Homes") */
  title: string;
}

/**
 * Section header above the home list.
 * UI only; uses global styles.
 */
export const HomeManagementListHeader: React.FC<
  HomeManagementListHeaderProps
> = ({ title }) => (
  <View style={globalStyles.homeManagementHeader}>
    <Text style={globalStyles.homeManagementHeaderTitle}>{title}</Text>
  </View>
);

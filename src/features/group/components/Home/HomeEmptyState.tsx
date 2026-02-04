/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ScrollView, RefreshControl } from "react-native";
import { tokens } from "@shared/theme/tokens";
import AddYourFirstDeviceBanner from "./AddYourFirstDeviceBanner";
import { testProps } from "@shared/utils/testProps";

export interface HomeEmptyStateProps {
  onRedirect: (type: string) => void;
  refreshing: boolean;
  onRefresh: () => void;
}

/**
 * Empty state: scroll view with AddYourFirstDeviceBanner and pull-to-refresh.
 * UI only; receives handlers via props.
 */
export const HomeEmptyState: React.FC<HomeEmptyStateProps> = ({
  onRedirect,
  refreshing,
  onRefresh,
}) => (
  <ScrollView
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[tokens.colors.primary]}
        tintColor={tokens.colors.primary}
        progressViewOffset={10}
      />
    }
    {...testProps("scroll_home")}
  >
    <AddYourFirstDeviceBanner
      redirectOperations={onRedirect}
      qaId="banner_add_first_device"
    />
  </ScrollView>
);

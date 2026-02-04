/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { tokens } from "@shared/theme/tokens";

export interface HomeManagementListProps<T> {
  data: T[];
  renderItem: (info: { item: T }) => React.ReactElement | null;
  keyExtractor: (item: T) => string;
  refreshing: boolean;
  onRefresh: () => void;
  /** Optional refresh control tint (defaults to primary) */
  refreshTintColor?: string;
}

/**
 * Scrollable list of homes with pull-to-refresh.
 * UI only; receives data and callbacks via props.
 */
export function HomeManagementList<T>({
  data,
  renderItem,
  keyExtractor,
  refreshing,
  onRefresh,
  refreshTintColor = tokens.colors.primary,
}: HomeManagementListProps<T>): React.ReactElement {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={globalStyles.homeManagementListContent}
      style={globalStyles.homeManagementListContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[refreshTintColor]}
          tintColor={refreshTintColor}
          progressViewOffset={10}
        />
      }
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.5}
    />
  );
}

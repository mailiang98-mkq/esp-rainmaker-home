/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { tokens } from "@shared/theme/tokens";

export interface RoomsListProps<T> {
  data: T[];
  renderItem: (info: { item: T }) => React.ReactElement | null;
  keyExtractor: (item: T, index: number) => string;
  refreshing: boolean;
  onRefresh: () => void;
  refreshTintColor?: string;
}

/**
 * FlatList of rooms with pull-to-refresh and performance options.
 * UI only; uses global styles.
 */
export function RoomsList<T>({
  data,
  renderItem,
  keyExtractor,
  refreshing,
  onRefresh,
  refreshTintColor = tokens.colors.primary,
}: RoomsListProps<T>): React.ReactElement {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[refreshTintColor]}
          tintColor={refreshTintColor}
          progressViewOffset={10}
        />
      }
      onEndReachedThreshold={0.5}
      removeClippedSubviews={false}
      maxToRenderPerBatch={10}
      initialNumToRender={10}
      windowSize={10}
      updateCellsBatchingPeriod={50}
      contentContainerStyle={globalStyles.roomsFlatListContent}
      style={globalStyles.roomsFlatListContainer}
      scrollEnabled={true}
      bounces={true}
    />
  );
}

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  FlatList,
  RefreshControl,
  SectionList,
  View,
  type SectionListRenderItemInfo,
} from "react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { tokens } from "@shared/theme/tokens";
import { HomeManagementListHeader } from "./HomeManagementListHeader";

export interface HomeManagementListProps<T> {
  data: T[];
  renderItem: (info: { item: T }) => React.ReactElement | null;
  keyExtractor: (item: T) => string;
  refreshing: boolean;
  onRefresh: () => void;
  /** Optional refresh control tint (defaults to primary) */
  refreshTintColor?: string;
}

export type HomeManagementHomeListSection<T> = {
  title: string;
  data: T[];
  /** When true, adds top margin before this section’s header (first section should omit). */
  sectionHeaderTopSpacing?: boolean;
  /** Passed through for row rendering (e.g. HomeItem ownership styling). */
  ownershipType?: "primary" | "shared";
};

export interface HomeManagementSectionListProps<
  T,
  S extends HomeManagementHomeListSection<T>,
> {
  sections: S[];
  renderItem: (info: SectionListRenderItemInfo<T, S>) => React.ReactElement | null;
  keyExtractor: (item: T, index: number) => string;
  refreshing: boolean;
  onRefresh: () => void;
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

/**
 * Sectioned home list (e.g. primary vs shared homes) with pull-to-refresh.
 */
export function HomeManagementSectionList<
  T,
  S extends HomeManagementHomeListSection<T>,
>({
  sections,
  renderItem,
  keyExtractor,
  refreshing,
  onRefresh,
  refreshTintColor = tokens.colors.primary,
}: HomeManagementSectionListProps<T, S>): React.ReactElement {
  return (
    <SectionList<T, S>
      sections={sections}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      renderSectionHeader={({ section }) => (
        <View
          style={
            section.sectionHeaderTopSpacing
              ? { marginTop: tokens.spacing._15 }
              : undefined
          }
        >
          <HomeManagementListHeader title={section.title} />
        </View>
      )}
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
      stickySectionHeadersEnabled={false}
    />
  );
}

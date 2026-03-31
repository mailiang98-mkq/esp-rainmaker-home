/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import type { ESPCDFGroup } from "@store";
import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";
import ControlGroupCard from "../Rooms/ControlGroupCard";

export interface HomeGroupControlListProps {
  groups: ESPCDFGroup[];
  homeId: string;
}

/**
 * Non-scrolling grid of group-control cards on Home, plus divider before devices.
 */
export const HomeGroupControlList: React.FC<HomeGroupControlListProps> = ({
  groups,
  homeId,
}) => {
  if (groups.length === 0 || !homeId) {
    return null;
  }

  return (
    <>
      <FlatList
        {...testProps("list_home_group_control")}
        data={groups}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <ControlGroupCard
            group={item}
            homeId={homeId}
            qaId="card_group_control_home"
          />
        )}
        scrollEnabled={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <View
        {...testProps("view_home_group_control_divider")}
        style={styles.divider}
      />
    </>
  );
};

const styles = StyleSheet.create({
  /** Non-scrolling list: wraps cards like `homeDeviceList` (row + wrap). */
  list: {
    flexGrow: 0,
  },
  listContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.borderColor,
    marginHorizontal: tokens.spacing._15,
    marginTop: tokens.spacing._20,
    marginBottom: tokens.spacing._5,
  },
});

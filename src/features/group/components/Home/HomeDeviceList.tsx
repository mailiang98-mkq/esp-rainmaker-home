/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { DeviceCard } from "@shared/components";
import { testProps } from "@shared/utils/testProps";
import type { UseHomeViewModelResult } from "@features/group/hooks";

export interface HomeDeviceListProps {
  roomDevices: UseHomeViewModelResult["roomDevices"];
  refreshing: boolean;
  onRefresh: () => void;
}

/**
 * FlatList of device cards with pull-to-refresh.
 * UI only; receives data and handlers via props.
 */
export const HomeDeviceList: React.FC<HomeDeviceListProps> = ({
  roomDevices,
  refreshing,
  onRefresh,
}) => (
  <View {...testProps("view_devices_list_home")} style={globalStyles.flex1}>
    <FlatList
      {...testProps("list_devices_home")}
      data={roomDevices}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => {
        const nodeRef = item.node.deref();
        return nodeRef ? (
          <DeviceCard
            node={nodeRef}
            device={item}
            key={nodeRef.id + item.name}
            qaId="device_card_home"
          />
        ) : null;
      }}
      contentContainerStyle={globalStyles.homeDeviceList}
      showsVerticalScrollIndicator={false}
      numColumns={1}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[tokens.colors.primary]}
          tintColor={tokens.colors.primary}
          progressViewOffset={10}
        />
      }
    />
  </View>
);

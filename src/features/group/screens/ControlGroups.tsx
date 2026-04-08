/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { tokens } from "@shared/theme/tokens";
import type { ESPCDFGroup } from "@store";
import { Header } from "@shared/components";
import {
  ControlGroupCard,
  RoomsEmptyState,
} from "@features/group/components";
import { testProps } from "@shared/utils/testProps";
import {
  useControlGroups,
  type UseControlGroupsOptions,
} from "@features/group/hooks";

const ControlGroups = observer(() => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const {
    home,
    deviceGroups: controlGroups,
    refreshing,
    handleRefresh,
    handleAddGroup,
    handlePressGroup,
  } = useControlGroups({
    homeId: id,
    router: router as UseControlGroupsOptions["router"],
  });

  const renderItem = useCallback(
    ({ item }: { item: ESPCDFGroup }) => (
      <ControlGroupCard
        group={item}
        homeId={id ?? ""}
        onPress={handlePressGroup}
        qaId="card_control_group"
      />
    ),
    [handlePressGroup, id],
  );

  const keyExtractor = useCallback((item: ESPCDFGroup) => item.id, []);

  const hasGroups = controlGroups.length > 0;

  return (
    <>
      <Header
        label={home?.name ?? ""}
        showBack={router.canGoBack()}
        rightSlot={
          <Plus
            size={24}
            color={tokens.colors.primary}
            onPress={handleAddGroup}
          />
        }
        qaId="header_control_groups"
      />
      <View
        {...testProps("view_control_groups")}
        style={globalStyles.roomsScreenContainer}
      >
        {hasGroups ? (
          <FlatList
            {...testProps("list_control_groups")}
            data={controlGroups}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            style={globalStyles.roomsFlatListContainer}
            contentContainerStyle={[
              globalStyles.roomsFlatListContent,
              styles.gridContent,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[tokens.colors.primary]}
                tintColor={tokens.colors.primary}
                progressViewOffset={10}
              />
            }
            onEndReachedThreshold={0.5}
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            initialNumToRender={10}
            windowSize={10}
            updateCellsBatchingPeriod={50}
          />
        ) : (
          <View
            {...testProps("view_control_groups_empty")}
            style={globalStyles.roomsEmptyRoomContainer}
          >
            <RoomsEmptyState
              title={t("group.deviceGroups.addYourFirstGroup")}
              subtitle={t("group.deviceGroups.addGroupDescription")}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onAddRoom={handleAddGroup}
            />
          </View>
        )}
      </View>
    </>
  );
});

/** Same wrapped row layout as `HomeGroupControlList` on Home. */
const styles = StyleSheet.create({
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default ControlGroups;

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";
import { buildDeviceFilterTabs } from "@features/group/utils/homeScreenHelpers";
import {
  CATEGORY_ICONS,
  OTHER_CATEGORY_ICON,
  FILTER_ICON_SIZE,
  FILTER_OTHER,
} from "@features/group/utils/constants";
import { deviceTypeFilterTabsStyles as styles } from "../../theme/roomControlStyles";
import type { LucideIcon } from "lucide-react-native";
import type { DeviceTypeFilterTabsProps } from "@src/types/global";

interface TabWithIcon {
  id: string;
  label: string;
  icon: LucideIcon | null;
}

/** Derives unique device categories present in `roomDevices` and renders pill-shaped filter tabs. */
const DeviceTypeFilterTabs: React.FC<DeviceTypeFilterTabsProps> = ({
  roomDevices,
  activeFilter,
  onSelectFilter,
}) => {
  const { t } = useTranslation();

  const enrichedTabs: TabWithIcon[] = useMemo(() => {
    const raw = buildDeviceFilterTabs(
      roomDevices,
      t("group.rooms.filterAll"),
      t("group.rooms.filterOther")
    );
    return raw.map((tab) => ({
      ...tab,
      icon:
        CATEGORY_ICONS[tab.id] ??
        (tab.id === FILTER_OTHER ? OTHER_CATEGORY_ICON : null),
    }));
  }, [roomDevices, t]);

  if (enrichedTabs.length === 0) return null;

  return (
    <View {...testProps("view_device_type_filter_tabs")} style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {enrichedTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          const iconColor = isActive
            ? tokens.colors.white
            : tokens.colors.text_secondary;

          return (
            <Pressable
              key={tab.id}
              {...testProps(`filter_tab_${tab.id}`)}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onSelectFilter(tab.id)}
            >
              {tab.icon && (
                <tab.icon size={FILTER_ICON_SIZE} color={iconColor} />
              )}
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default DeviceTypeFilterTabs;

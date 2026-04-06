/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text } from "react-native";
import { ContentWrapper } from "@shared/components";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { testProps } from "@shared/utils/testProps";
import type { Node } from "@src/types/global";
import { CreateRoomDeviceItem } from "./CreateRoomDeviceItem";

export interface CreateRoomDeviceSectionProps {
  title: string;
  devices: Node[];
  emptyLabel: string;
  showPlus: boolean;
  showMinus: boolean;
  onDevicePress: (node: Node) => void;
  qaId: string;
  viewTestId?: string;
  listTestId?: string;
  placeholderTestId?: string;
}

/**
 * Section with title and list of devices (or placeholder). Used for existing and add-device lists.
 */
export const CreateRoomDeviceSection: React.FC<
  CreateRoomDeviceSectionProps
> = ({
  title,
  devices,
  emptyLabel,
  showPlus,
  showMinus,
  onDevicePress,
  qaId,
  viewTestId,
  listTestId = "view_list_device_create_room",
  placeholderTestId = "text_select_devices_create_room",
}) => (
  <View
    style={globalStyles.createRoomSection}
    {...testProps(viewTestId ?? `view_${qaId}`)}
  >
    <ContentWrapper
      title={title}
      style={globalStyles.createRoomContentWrapperOverride}
      qaId={qaId}
    >
      <View
        style={globalStyles.createRoomDeviceList}
        {...testProps(listTestId)}
      >
        {devices.map((device, index) => (
          <CreateRoomDeviceItem
            key={`${device.id}-${index}`}
            device={device}
            showPlus={showPlus}
            showMinus={showMinus}
            onPress={onDevicePress}
          />
        ))}
        {devices.length === 0 && (
          <Text
            style={globalStyles.createRoomPlaceholderText}
            {...testProps(placeholderTestId)}
          >
            {emptyLabel}
          </Text>
        )}
      </View>
    </ContentWrapper>
  </View>
);

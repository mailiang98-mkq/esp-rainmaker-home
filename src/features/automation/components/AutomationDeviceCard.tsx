/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import { DeviceAction } from "@shared/components";
import { observer } from "mobx-react-lite";
import { AutomationDeviceCardProps } from "@src/types/global";

/**
 * AutomationDeviceCard Component
 *
 * Unified component that renders both automation events and actions
 * Uses type prop to determine behavior and display
 * @param device - Device object with type and name
 * @param displayDeviceName - Display device name
 * @param type - Type of automation component (event or action)
 * @param actions - Action object (for action type)
 * @param eventConditions - Event conditions (for event type)
 * @param onPress - Handler for press events
 * @param qaId - QA identifier
 */
const AutomationDeviceCard = ({
  device,
  displayDeviceName,
  type,
  actions = {},
  eventConditions,
  onPress,
  qaId,
}: AutomationDeviceCardProps & { qaId?: string }) => {
  return (
    <DeviceAction
      qaId={qaId}
      displayDeviceName={displayDeviceName}
      device={device.type}
      actions={type === "action" ? actions : {}}
      eventConditions={type === "event" ? eventConditions : undefined}
      isEventMode={type === "event"}
      onPress={onPress}
    />
  );
};

export default observer(AutomationDeviceCard);

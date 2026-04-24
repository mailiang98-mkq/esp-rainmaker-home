/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import { DeviceAction } from "@shared/components";
import { ScheduleActionProps } from "@src/types/global";
import { useSchedule } from "@context/schedules.context";

/**
 * ScheduleActions Component
 *
 * Renders a list of device actions for a schedule
 * Allows interaction with individual actions
 * @param device - Device name (e.g. "light")
 * @param displayDeviceName - Display device name
 * @param action - Action object
 * @param onActionPress - Handler for action press events
 */
const ScheduleActions = ({
  device,
  displayDeviceName,
  action,
  onActionPress,
  nodeId,
}: ScheduleActionProps) => {
  const { checkNodeOutOfSync } = useSchedule();
  const { isOutOfSync } = checkNodeOutOfSync(nodeId);

  return (
    <DeviceAction
      displayDeviceName={displayDeviceName}
      device={device.type ?? ""}
      actions={action}
      onPress={() => onActionPress()}
      isOutOfSync={isOutOfSync}
    />
  );
};

export default ScheduleActions;

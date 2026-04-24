/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import DeviceAction from "@shared/components/ParamControls/DeviceAction";
import { SceneActionsProps } from "@src/types/global";

/**
 * SceneActions Component
 *
 * Renders a single device action for a scene
 * Allows interaction with individual actions
 * @param device - Device object
 * @param displayDeviceName - Display device name
 * @param action - Action object
 * @param onActionPress - Handler for action press events
 * @param qaId - Optional QA identifier for testing
 */
const SceneActions = ({
  device,
  displayDeviceName,
  action,
  onActionPress,
  qaId,
}: SceneActionsProps & { qaId?: string }) => {
  return (
    <DeviceAction
      qaId={qaId}
      displayDeviceName={displayDeviceName}
      device={device.type ?? ""}
      actions={action}
      onPress={() => onActionPress(device.name)}
    />
  );
};

export default SceneActions;

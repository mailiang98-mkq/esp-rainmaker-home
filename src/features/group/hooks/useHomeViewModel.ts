/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from "react";
import { ESPCDFGroup, ESPCDFNode } from "@store";
import { RoomTab } from "@src/types/global";
import { transformNodesToDevices } from "@shared/utils/device";
import {
  validateHomeData,
  createRoomTabs,
  getFilteredDevices,
} from "@features/group/utils/home";

export interface UseHomeViewModelParams {
  selectedHome: ESPCDFGroup | null;
  selectedRoom: RoomTab;
  activeHomeNodes: ESPCDFNode[];
  defaultTabs: RoomTab[];
}

export interface UseHomeViewModelResult {
  roomTabs: RoomTab[];
  rooms: ESPCDFGroup[];
  devices: ReturnType<typeof transformNodesToDevices>;
  roomDevices: ReturnType<typeof getFilteredDevices>;
  processedHome: ESPCDFGroup | null;
}

/**
 * View model hook for the Home screen.
 * Derives roomTabs, rooms, devices, and roomDevices from home and node data.
 */
export function useHomeViewModel({
  selectedHome,
  selectedRoom,
  activeHomeNodes,
  defaultTabs,
}: UseHomeViewModelParams): UseHomeViewModelResult {
  const processedHome = useMemo(
    () => validateHomeData(selectedHome),
    [selectedHome]
  );

  const roomTabs = useMemo(
    () => createRoomTabs(processedHome, defaultTabs),
    [processedHome, defaultTabs]
  );

  const devices = useMemo(
    () => transformNodesToDevices(activeHomeNodes),
    [activeHomeNodes]
  );

  const rooms = useMemo(
    () => selectedHome?.subGroups ?? [],
    [selectedHome?.subGroups]
  );

  const roomDevices = useMemo(
    () => getFilteredDevices(selectedRoom, rooms, activeHomeNodes, devices),
    [selectedRoom, rooms, activeHomeNodes, devices]
  );

  return {
    roomTabs,
    rooms,
    devices,
    roomDevices,
    processedHome,
  };
}

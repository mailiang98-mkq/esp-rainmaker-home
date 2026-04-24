/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import type { TFunction } from "i18next";
import type { RoomType } from "@src/types/global";
import { getPredefinedRoomOptions } from "@features/group/utils/customizeRoomNameHelpers";

export interface UseCustomizeRoomNameOptions {
  currentRoomName: string | string[] | undefined;
  id: string | string[] | undefined;
  roomId: string | string[] | undefined;
  router: { dismissTo: (opts: { pathname: string; params: Record<string, unknown> }) => void; back: () => void };
  t: TFunction;
}

export interface UseCustomizeRoomNameResult {
  selectedRoom: string;
  roomName: string;
  predefinedRooms: RoomType[];
  canConfirm: boolean;
  handleConfirm: () => void;
  handleCustomRoomNameChange: (value: string) => void;
  handleRoomSelection: (roomLabel: string) => void;
}

/**
 * Manages customize room name state and related actions.
 */
export function useCustomizeRoomName(
  options: UseCustomizeRoomNameOptions
): UseCustomizeRoomNameResult {
  const { currentRoomName, id, roomId, router, t } = options;

  const [selectedRoom, setSelectedRoom] = useState("");
  const [roomName, setRoomName] = useState("");

  const predefinedRooms = useMemo(
    () => getPredefinedRoomOptions(t),
    [t]
  );

  useEffect(() => {
    if (!currentRoomName) return;
    const roomNameStr = Array.isArray(currentRoomName)
      ? currentRoomName[0]
      : currentRoomName;
    const isPredefined = predefinedRooms.find((room) => room.label === roomNameStr);
    if (isPredefined) {
      setSelectedRoom(roomNameStr);
    } else {
      setRoomName(roomNameStr);
    }
  }, [currentRoomName, predefinedRooms]);

  const handleConfirm = useCallback(() => {
    const finalRoomName = roomName.trim() || selectedRoom;
    if (finalRoomName) {
      router.dismissTo({
        pathname: "/(group)/CreateRoom",
        params: { roomName: finalRoomName, id, roomId },
      });
    } else {
      router.back();
    }
  }, [roomName, selectedRoom, router, id, roomId]);

  const handleCustomRoomNameChange = useCallback((value: string) => {
    setRoomName(value);
    if (value.trim()) {
      setSelectedRoom("");
    }
  }, []);

  const handleRoomSelection = useCallback((roomLabel: string) => {
    setSelectedRoom(roomLabel);
    setRoomName("");
  }, []);

  const canConfirm = Boolean(selectedRoom || roomName.trim());

  return {
    selectedRoom,
    roomName,
    predefinedRooms,
    canConfirm,
    handleConfirm,
    handleCustomRoomNameChange,
    handleRoomSelection,
  };
}

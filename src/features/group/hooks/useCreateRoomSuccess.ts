/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { firstRouteParam } from "@shared/utils/common";

export interface UseCreateRoomSuccessResult {
  id: string | undefined;
  /** Normalized from route params; truthy when the flow was "update room" (e.g. `"true"`). */
  updated: string | undefined;
  handleDone: () => void;
}

/**
 * Manages create room success state and related actions.
 */
export function useCreateRoomSuccess(): UseCreateRoomSuccessResult {
  const raw = useLocalSearchParams();
  const id = firstRouteParam(raw.id);
  const updated = firstRouteParam(raw.updated);
  const dismissTo = firstRouteParam(raw.dismissTo);
  const nodeId = firstRouteParam(raw.nodeId);
  const selectedRoomId = firstRouteParam(raw.selectedRoomId);
  const router = useRouter();

  const handleDone = useCallback(async () => {
    if (dismissTo) {
      // Always forward home `id` when present so e.g. Rooms keeps `?id` after add-room flow
      // (dismissTo is set from CreateRoom, which would otherwise skip the `id`-only branch below).
      router.dismissTo({
        pathname: dismissTo as any,
        params: {
          ...(id ? { id } : {}),
          ...(nodeId ? { nodeId } : {}),
          ...(selectedRoomId ? { selectedRoomId } : {}),
        } as Record<string, string>,
      } as any);
      return;
    }
    if (id) {
      router.dismissTo({
        pathname: "/(group)/Rooms",
        params: { id },
      } as any);
    } else {
      router.back();
    }
  }, [router, id, dismissTo, nodeId, selectedRoomId]);

  return {
    id,
    updated,
    handleDone,
  };
}

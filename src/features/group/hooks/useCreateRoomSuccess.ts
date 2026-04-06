/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

export interface UseCreateRoomSuccessResult {
  id: string | string[] | undefined;
  updated: string | boolean | undefined;
  handleDone: () => void;
}

export function useCreateRoomSuccess(): UseCreateRoomSuccessResult {
  const { id, updated = false } = useLocalSearchParams<{ id?: string; updated?: string }>();
  const router = useRouter();

  const handleDone = useCallback(() => {
    router.dismissTo({
      pathname: "/(group)/Rooms",
      params: { id },
    });
  }, [router, id]);

  return {
    id,
    updated,
    handleDone,
  };
}

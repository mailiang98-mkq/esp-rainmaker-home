/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import type { TFunction } from "i18next";
import type { ESPCDFGroup } from "@store";
import { GROUP_TYPE_ROOM } from "@shared/utils/constants";
import { getNodeDiff } from "@features/group/utils/createRoomHelpers";
import { useCDF } from "@shared/hooks/useCDF";
import { fetchNodesIfEmpty } from "@store";
import type { Node } from "@src/types/global";

export interface UseCreateRoomOptions {
  homeId: string | undefined;
  roomId: string | undefined;
  paramRoomName: string | undefined;
  toast: {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
  };
  t: TFunction;
  router: {
    push: (href: unknown) => void;
    replace: (href: unknown) => void;
    dismissTo: (href: unknown) => void;
  };
}

export interface UseCreateRoomResult {
  roomName: string;
  setRoomName: (name: string) => void;
  room: ESPCDFGroup | undefined;
  selectedNodes: Node[];
  availableNodes: Node[];
  isLoading: { save: boolean; delete: boolean };
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  handleCustomRoomName: () => void;
  handleAddDevice: (node: Node) => void;
  handleRemoveDevice: (node: Node) => void;
  handleSave: () => void;
  handleUpdate: () => Promise<void>;
  handleDelete: () => void;
  confirmDelete: () => Promise<void>;
}

function mapNodeToDisplay(node: any): Node {
  return {
    id: node.id,
    name: node.devices?.map((d: any) => d.displayName).join(", ") ?? "",
    node,
  };
}

/**
 * Hook that encapsulates Create Room business logic and state.
 */
export function useCreateRoom(
  options: UseCreateRoomOptions
): UseCreateRoomResult {
  const { homeId, roomId, paramRoomName, toast, t, router } = options;
  const { store } = useCDF();

  const [roomName, setRoomName] = useState(paramRoomName || "");
  const [selectedNodesIds, setSelectedNodesIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState({
    save: false,
    delete: false,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const home = useMemo(
    () => store?.groupStore?.groupsByIDMap?.[homeId as string],
    [store?.groupStore?.groupsByIDMap, homeId]
  );

  const room = useMemo(
    () => home?.subGroups?.find((r: ESPCDFGroup) => r.id === roomId),
    [home?.subGroups, roomId]
  );

  const nodes = useMemo(
    () =>
      store?.nodeStore?.nodesList.filter((node) =>
        home?.nodeIds?.includes(node.id)
      ) ?? [],
    [store?.nodeStore?.nodesList, home?.nodeIds]
  );

  const selectedNodes: Node[] = useMemo(
    () =>
      nodes
        .filter((node) => selectedNodesIds.includes(node.id))
        .map(mapNodeToDisplay),
    [nodes, selectedNodesIds]
  );

  const availableNodes: Node[] = useMemo(
    () =>
      nodes
        .filter((node) => !selectedNodesIds.includes(node.id))
        .map(mapNodeToDisplay),
    [nodes, selectedNodesIds]
  );

  useEffect(() => {
    if (home) fetchNodesIfEmpty(home);
  }, [home]);

  useEffect(() => {
    if (room) {
      if (room.name !== paramRoomName) {
        setRoomName(paramRoomName || room.name || "");
      }
      if (room.nodeIds?.length) {
        setSelectedNodesIds(room.nodeIds);
      }
    }
  }, [room, paramRoomName]);

  useEffect(() => {
    if (paramRoomName) setRoomName(paramRoomName);
  }, [paramRoomName]);

  const handleCustomRoomName = useCallback(() => {
    router.push({
      pathname: "/(group)/CustomizeRoomName",
      params: { currentRoomName: roomName, id: homeId, roomId },
    } as any);
  }, [router, roomName, homeId, roomId]);

  const handleAddDevice = useCallback((node: Node) => {
    setSelectedNodesIds((prev) => [...prev, node.id]);
  }, []);

  const handleRemoveDevice = useCallback((node: Node) => {
    setSelectedNodesIds((prev) => prev.filter((id) => id !== node.id));
  }, []);

  const handleSave = useCallback(() => {
    if (!home) return;
    setIsLoading((prev) => ({ ...prev, save: true }));
    home
      .createSubGroup({
        name: roomName,
        nodeIds: selectedNodesIds,
        customData: {},
        type: GROUP_TYPE_ROOM,
        mutuallyExclusive: true,
      })
      .then(async (group) => {
        if (group) {
          toast.showSuccess(t("group.createRoom.roomCreatedSuccessfully"));
          await new Promise((r) => setTimeout(r, 500));
          router.replace({
            pathname: "/(group)/CreateRoomSuccess",
            params: { id: homeId },
          } as any);
        }
      })
      .catch((error: any) => {
        toast.showError(error.description ?? t("group.errors.fallback"));
      })
      .finally(() => {
        setIsLoading((prev) => ({ ...prev, save: false }));
      });
  }, [
    home,
    roomName,
    selectedNodesIds,
    toast,
    t,
    router,
    homeId,
  ]);

  const handleUpdate = useCallback(async () => {
    if (!room) return;
    try {
      const existing = room.nodeIds ?? [];
      const { toAdd, toRemove } = getNodeDiff(existing, selectedNodesIds);
      await Promise.allSettled([
        room.updateGroupInfo({ groupName: roomName }),
        toAdd.length > 0 ? room.addNodes(toAdd) : undefined,
        toRemove.length > 0 ? room.removeNodes(toRemove) : undefined,
      ]);
      toast.showSuccess(t("group.createRoom.roomUpdatedSuccessfully"));
      router.replace({
        pathname: "/(group)/CreateRoomSuccess",
        params: { id: homeId, updated: true },
      } as any);
    } catch (error: any) {
      toast.showError(error.description ?? t("group.errors.fallback"));
    }
  }, [room, roomName, selectedNodesIds, toast, t, router, homeId]);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!room) return;
    setIsLoading((prev) => ({ ...prev, delete: true }));
    try {
      await room.delete();
      toast.showSuccess(t("group.createRoom.roomRemovedSuccessfully"));
      router.dismissTo({
        pathname: "/(group)/Rooms",
        params: { id: homeId },
      } as any);
    } catch (error: any) {
      toast.showError(error.description ?? t("group.errors.fallback"));
    } finally {
      setIsLoading((prev) => ({ ...prev, delete: false }));
    }
  }, [room, toast, t, router, homeId]);

  return {
    roomName,
    setRoomName,
    room,
    selectedNodes,
    availableNodes,
    isLoading,
    showDeleteDialog,
    setShowDeleteDialog,
    handleCustomRoomName,
    handleAddDevice,
    handleRemoveDevice,
    handleSave,
    handleUpdate,
    handleDelete,
    confirmDelete,
  };
}

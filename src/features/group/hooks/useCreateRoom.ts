/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { TFunction } from "i18next";
import type { ESPCDFGroup } from "@store";
import { ESPCDFGroupSharingRequest } from "@store";
import type { GroupSharedUser } from "@src/types/global";
import { GROUP_TYPE_ROOM, ERROR_CODES_MAP } from "@shared/utils/constants";
import {
  getRemainingDays,
  isRequestExpired,
  formatExpirationMessage,
  sortByExpirationDate,
} from "@features/group/utils/dateUtils";
import { generateRandomId } from "@shared/utils/common";
import {
  createGroupSharingInviteValidator,
  getGroupSharingAllowedTypes,
  isGroupSharingInviteAllowed,
  normalizeGroupSharingInviteForApi,
} from "@features/group/utils/settingsHelpers";
import { getNodeDiff } from "@features/group/utils/createRoomHelpers";
import { useCDF } from "@shared/hooks/useCDF";
import { fetchNodesIfEmpty } from "@store";
import type { Node } from "@src/types/global";
import { getFeatures } from "@config/features.config";

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
  /** Room (subgroup) sharing — only meaningful when `room` exists and `subGroupSharing` is enabled */
  isRoomSharePrimary: boolean;
  roomSharedUsers: GroupSharedUser[];
  roomPendingUsers: GroupSharedUser[];
  roomSharedByUser: GroupSharedUser | null;
  isAddingRoomUser: boolean;
  setIsAddingRoomUser: (show: boolean) => void;
  newRoomUserInvite: string;
  setNewRoomUserInvite: (value: string) => void;
  makeRoomUserPrimary: boolean;
  setMakeRoomUserPrimary: (v: boolean) => void;
  transferRoom: boolean;
  setTransferRoom: (v: boolean) => void;
  transferRoomAndAssignRole: boolean;
  setTransferRoomAndAssignRole: (v: boolean) => void;
  isAddingRoomUserLoading: boolean;
  removeRoomUserLoading: boolean;
  handleAddRoomUser: () => Promise<void>;
  handleRemoveRoomUser: (username: string) => Promise<void>;
  handleRemoveRoomPendingUser: (username: string) => Promise<void>;
  handleCloseAddRoomUserModal: () => void;
  handleRoomInviteChange: (value: string, isValid: boolean) => void;
  roomInviteValidator: (value: string) => { isValid: boolean; error?: string };
  isRoomInviteValid: boolean;
}

const norm = (s?: string) => (s || "").trim().toLowerCase();

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

  const [isRoomSharePrimary, setIsRoomSharePrimary] = useState(false);
  const [roomSharedUsers, setRoomSharedUsers] = useState<GroupSharedUser[]>(
    []
  );
  const [roomPendingUsers, setRoomPendingUsers] = useState<GroupSharedUser[]>(
    []
  );
  const [roomSharedByUser, setRoomSharedByUser] =
    useState<GroupSharedUser | null>(null);
  const [isAddingRoomUser, setIsAddingRoomUser] = useState(false);
  const [newRoomUserInvite, setNewRoomUserInvite] = useState("");
  const [isAddingRoomUserLoading, setIsAddingRoomUserLoading] = useState(false);
  const [removeRoomUserLoading, setRemoveRoomUserLoading] = useState(false);
  const [makeRoomUserPrimary, setMakeRoomUserPrimary] = useState(false);
  const [transferRoom, setTransferRoom] = useState(false);
  const [transferRoomAndAssignRole, setTransferRoomAndAssignRole] =
    useState(false);
  const [isRoomInviteValid, setIsRoomInviteValid] = useState(false);

  const roomInviteValidator = useMemo(
    () =>
      createGroupSharingInviteValidator(getGroupSharingAllowedTypes(), t),
    [t]
  );

  const user = store?.userStore?.user;

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

  const getRoomSharedUsers = useCallback(async () => {
    if (!room) return;
    if (!getFeatures().subGroupSharing) {
      setIsRoomSharePrimary(true);
      setRoomSharedUsers([]);
      setRoomPendingUsers([]);
      setRoomSharedByUser(null);
      return;
    }
    try {
      const res = await room.getSharingInfo({
        metadata: false,
        withSubGroups: false,
        withParentGroups: false,
      });
      if (!res.data) return;
      const currentUsername = norm(user?.userInfo?.email);
      const primaryUsers = (res.data.primaryUsers || []).map((u) => ({
        ...u,
        username: norm(u.username),
      }));
      const secondaryUsers = (res.data.secondaryUsers || []).map((u) => ({
        ...u,
        username: norm(u.username),
      }));

      const isCurrentUserPrimary = primaryUsers.some(
        (u) => u.username === currentUsername
      );
      setIsRoomSharePrimary(isCurrentUserPrimary);

      if (!isCurrentUserPrimary && primaryUsers.length > 0) {
        setRoomSharedByUser({
          id: generateRandomId(),
          username: primaryUsers[0].username,
          metadata: primaryUsers[0].metadata,
        });
        setRoomSharedUsers([]);
        setRoomPendingUsers([]);
        return;
      }

      if (isCurrentUserPrimary) {
        const unifiedIssuedSharingInfo =
          await user?.getIssuedGroupSharingRequests();
        let allSharingRequests: ESPCDFGroupSharingRequest[] = [];
        if (unifiedIssuedSharingInfo) {
          allSharingRequests = unifiedIssuedSharingInfo.data ?? [];
        }

        const roomIdStr = room.id as string;
        const pendingRequests = allSharingRequests
          .filter((req: ESPCDFGroupSharingRequest) => {
            const isPending = req.status === "pending";
            const isForThisRoom = req.groupIds?.includes(roomIdStr);
            const isNotExpired = !isRequestExpired(req.timestamp);
            return isPending && isForThisRoom && isNotExpired;
          })
          .map((req: ESPCDFGroupSharingRequest) => ({
            id: req.id || generateRandomId(),
            username: norm(req.username),
            metadata: req.metadata || {},
            requestId: req.id,
            timestamp: req.timestamp,
            remainingDays: getRemainingDays(req.timestamp),
            expirationMessage: formatExpirationMessage(req.timestamp, t),
          }));

        setRoomPendingUsers((prev) => {
          const map = new Map<string, GroupSharedUser>();
          prev.forEach((u) => map.set(u.username, u));
          pendingRequests.forEach((u) => map.set(u.username, u));
          return sortByExpirationDate(Array.from(map.values()));
        });

        const acceptedUsers = [
          ...primaryUsers.filter((u) => u.username !== currentUsername),
          ...secondaryUsers.filter((u) => u.username !== currentUsername),
        ].map((u) => ({
          id: generateRandomId(),
          username: u.username,
          metadata: u.metadata,
        }));

        setRoomSharedUsers(acceptedUsers);
        setRoomSharedByUser(null);
      }
    } catch {
      toast.showError(t("group.errors.errorGettingSharedUsers"));
    }
  }, [room, user, t, toast]);

  const getRoomSharedUsersRef = useRef(getRoomSharedUsers);
  getRoomSharedUsersRef.current = getRoomSharedUsers;

  useEffect(() => {
    if (room && getFeatures().subGroupSharing) {
      getRoomSharedUsersRef.current();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional hook deps
  }, [room?.id]);

  const handleAddRoomUser = useCallback(async () => {
    if (!room) return;
    const allowed = getGroupSharingAllowedTypes();
    if (!isGroupSharingInviteAllowed(newRoomUserInvite, allowed)) return;
    const toUserName = normalizeGroupSharingInviteForApi(
      newRoomUserInvite,
      allowed
    );
    setIsAddingRoomUserLoading(true);
    try {
      if (transferRoomAndAssignRole) {
        await room.transfer({
          toUserName,
          assignRoleToSelf: "secondary",
          metadata: {},
        });
      } else if (transferRoom) {
        await room.transfer({
          toUserName,
          metadata: {},
        });
      } else {
        await room.share({
          toUserName,
          makePrimary: makeRoomUserPrimary,
        });
      }
      toast.showSuccess(
        transferRoom || transferRoomAndAssignRole
          ? t("group.settings.transferRequestedSuccessfully")
          : t("group.settings.sharingRequestedSuccessfully")
      );
      setIsAddingRoomUser(false);
      setNewRoomUserInvite("");
      setMakeRoomUserPrimary(false);
      setTransferRoom(false);
      setTransferRoomAndAssignRole(false);
    } catch (err: any) {
      switch (err.errorCode) {
        case ERROR_CODES_MAP.USER_NOT_FOUND:
          toast.showError(t("group.errors.userNotFound"));
          break;
        case ERROR_CODES_MAP.ADDING_SELF_NOT_ALLOWED:
          toast.showError(t("group.errors.addingSelfNotAllowed"));
          break;
        default:{
          if (err.responseData.status) {
            toast.showError(err.responseData.status);
          }
          toast.showError(
            err.description ?? t("group.errors.fallback")
          );
          break;
        }
      }
    } finally {
      setIsAddingRoomUserLoading(false);
      setTimeout(() => {
        getRoomSharedUsersRef.current();
      }, 1000);
    }
  }, [
    room,
    newRoomUserInvite,
    makeRoomUserPrimary,
    transferRoom,
    transferRoomAndAssignRole,
    t,
    toast,
  ]);

  const handleRemoveRoomUser = useCallback(
    async (username: string) => {
      if (!room) return;
      setRemoveRoomUserLoading(true);
      try {
        await room.removeSharingFor(username);
        toast.showSuccess(t("group.settings.sharingRemovedSuccessfully"));
        getRoomSharedUsersRef.current();
      } catch {
        toast.showError(t("group.errors.errorRemovingUser"));
      } finally {
        setRemoveRoomUserLoading(false);
      }
    },
    [room, t, toast]
  );

  const handleRemoveRoomPendingUser = useCallback(
    async (username: string) => {
      if (!user || !room) return;
      setRemoveRoomUserLoading(true);
      try {
        const unifiedIssuedSharingInfo =
          await user.getIssuedGroupSharingRequests();
        let allSharingRequests: ESPCDFGroupSharingRequest[] = [];
        if (unifiedIssuedSharingInfo) {
          allSharingRequests = unifiedIssuedSharingInfo.data ?? [];
        }
        const roomIdStr = room.id as string;
        const pendingRequest = allSharingRequests.find(
          (req: ESPCDFGroupSharingRequest) => {
            const isMatchingUser = norm(req.username) === norm(username);
            const isForThisRoom = req.groupIds?.includes(roomIdStr);
            const isPending = req.status === "pending";
            return isMatchingUser && isForThisRoom && isPending;
          }
        );
        if (pendingRequest) {
          await pendingRequest.remove();
          toast.showSuccess(t("group.settings.sharingRemovedSuccessfully"));
          getRoomSharedUsersRef.current();
        } else {
          throw new Error("Pending request not found");
        }
      } catch {
        toast.showError(t("group.errors.errorRemovingUser"));
      } finally {
        setRemoveRoomUserLoading(false);
      }
    },
    [user, room, t, toast]
  );

  const handleCloseAddRoomUserModal = useCallback(() => {
    setIsAddingRoomUser(false);
    setNewRoomUserInvite("");
    setIsRoomInviteValid(false);
    setMakeRoomUserPrimary(false);
    setTransferRoom(false);
    setTransferRoomAndAssignRole(false);
  }, []);

  const handleRoomInviteChange = useCallback(
    (value: string, isValid: boolean) => {
      setNewRoomUserInvite(value);
      setIsRoomInviteValid(isValid);
    },
    []
  );

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
    isRoomSharePrimary,
    roomSharedUsers,
    roomPendingUsers,
    roomSharedByUser,
    isAddingRoomUser,
    setIsAddingRoomUser,
    newRoomUserInvite,
    setNewRoomUserInvite,
    makeRoomUserPrimary,
    setMakeRoomUserPrimary,
    transferRoom,
    setTransferRoom,
    transferRoomAndAssignRole,
    setTransferRoomAndAssignRole,
    isAddingRoomUserLoading,
    removeRoomUserLoading,
    handleAddRoomUser,
    handleRemoveRoomUser,
    handleRemoveRoomPendingUser,
    handleCloseAddRoomUserModal,
    handleRoomInviteChange,
    roomInviteValidator,
    isRoomInviteValid,
  };
}

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";

// Hooks
import { useCDF } from "@shared/hooks/useCDF";
import { useToast } from "@shared/hooks/useToast";

export const useNotificationCenter = () => {
  const { store, syncHomeWithNodes } = useCDF();
  const toast = useToast();

  const user = store?.userStore.user;
  const [sharingList, setSharingList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSharingRequests();
  }, []);

  const loadSharingRequests = async () => {
    setIsLoading(true);
    try {
      const sharingRequests: any[] = [];
      const groupSharingRequests = await user?.getReceivedGroupSharingRequests();
      if (groupSharingRequests) {
        sharingRequests.push(...groupSharingRequests.data);
      }
      setSharingList(sharingRequests.sort((a: any, b: any) => b.timestamp - a.timestamp));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error loading sharing requests:", error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleAccept = async (request: any, accept: boolean) => {
    setIsLoading(true);
    try {
      request.loading = true;
      if (accept) {
        request.acceptLoading = true;
        await request.accept();
      } else {
        request.declineLoading = true;
        await request.decline();
      }
      setSharingList((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? { ...item, status: accept ? "accepted" : "declined" }
            : item
        )
      );
      const shouldFetchFirstPage = true;
      syncHomeWithNodes(shouldFetchFirstPage);

      if (request.type === "group") {
        store.groupStore.currentHomeId = request.groupIds[0];
      }
      setIsLoading(false);
    } catch (error) {
      toast.showError("Failed to update request");
      console.error("Error updating request:", error);
    } finally {
      request.loading = false;
      request.acceptLoading = false;
      request.declineLoading = false;
      setIsLoading(false);
    }
  };

  return {
    sharingList,
    isLoading,
    formatTimestamp,
    handleAccept,
  };
};

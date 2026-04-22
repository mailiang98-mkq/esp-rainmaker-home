/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useMemo } from "react";
import type { ESPCDFGroup } from "@store";
import { useCDF } from "@shared/hooks/useCDF";
import { useHomeViewModel, type UseHomeViewModelResult } from "./useHomeViewModel";
import { useMigrationPromptViewModel } from "./useMigrationPromptViewModel";
import { useFocusEffect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useToast } from "@shared/hooks/useToast";
import { getDefaultHomeTabs } from "@features/group/utils/homeScreenHelpers";
import { startNodeLocalDiscovery } from "@features/group/utils/localDiscovery";
import type { RoomTab } from "@src/types/global";
import { getFeatures } from "@/config/features.config";

export interface UseHomeScreenResult {
  isLoading: boolean;
  refreshing: boolean;
  selectedRoom: RoomTab;
  setSelectedRoom: (tab: RoomTab) => void;
  roomTabs: RoomTab[];
  roomDevices: UseHomeViewModelResult["roomDevices"];
  controlGroups: UseHomeViewModelResult["groupControlGroups"];
  homeList: ESPCDFGroup[];
  selectedHome: ESPCDFGroup | null;
  tooltipVisible: boolean;
  tooltipPosition: { x: number; y: number };
  handleDropdownPress: (position: { x: number; y: number }) => void;
  handleCloseTooltip: () => void;
  handleHomeSelect: (home: ESPCDFGroup) => Promise<void>;
  onRefresh: () => Promise<void>;
  redirectOperations: (type: string) => void;
  showMigrationPrompt: boolean;
  handleMigrationPromptUnderstood: () => Promise<void>;
}

/**
 * Manages home screen state and related actions.
 */
export function useHomeScreen(): UseHomeScreenResult {
  const { t } = useTranslation();
  const { store, isInitialized: isStoreInitialized } = useCDF();
  const { groupStore: unifiedGroupStore, userStore: unifiedUserStore } = store;
  const unifiedUser = unifiedUserStore?.user;
  const router = useRouter();
  const toast = useToast();

  const defaultTabs = useMemo(() => getDefaultHomeTabs(t), [t]);
  const hasInitialized = useRef(false);
  const initializeHomeRef = useRef<(() => Promise<void>) | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomTab>(
    defaultTabs[0] ?? { label: "", id: "common" }
  );
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const homeList = unifiedGroupStore.groupsList;
  const selectedHome = store.getCurrentHome() ?? null;
  const activeHomeNodes = store.getNodesForCurrentHome();

  const { roomTabs, roomDevices, groupControlGroups: raw } = useHomeViewModel({
    selectedHome,
    selectedRoom,
    activeHomeNodes,
    defaultTabs,
  });

  const controlGroups = getFeatures().controlGroups ? raw : [];

  const { showMigrationPrompt, handleMigrationPromptUnderstood } =
    useMigrationPromptViewModel({ store, unifiedUser });

  const initializeHome = useCallback(async () => {
    if (hasInitialized.current) return;
    try {
      if (!isStoreInitialized || !unifiedGroupStore) {
        setIsLoading(false);
        return;
      }
      hasInitialized.current = true;
      await unifiedUser?.syncHomeWithNodes?.();
      startNodeLocalDiscovery(store);
    } catch (error) {
      console.error("Failed to initialize home:", error);
      hasInitialized.current = false;
      toast.showError(
        t("group.errors.failedToInitializeHome"),
        t("layout.shared.manualRefreshHelperText")
      );
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional hook deps
  }, [isStoreInitialized, unifiedGroupStore, unifiedUser, toast, t]);

  initializeHomeRef.current = initializeHome;

  useFocusEffect(
    useCallback(() => {
      initializeHomeRef.current?.();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await unifiedUser?.syncHomeWithNodes?.();
      startNodeLocalDiscovery(store);
    } catch (error) {
      console.error("Error refreshing home:", error);
    } finally {
      setRefreshing(false);
    }
  }, [unifiedUser, store]);

  const handleHomeSelect = useCallback(
    async (home: ESPCDFGroup) => {
      if (home?.id) {
        await unifiedUser?.setCurrentHome?.(home);
        await unifiedUser?.syncHomeWithNodes?.();
        setTooltipVisible(false);
      }
    },
    [unifiedUser]
  );

  const handleDropdownPress = useCallback(
    (position: { x: number; y: number }) => {
      setTooltipPosition(position);
      setTooltipVisible((v) => !v);
    },
    []
  );

  const handleCloseTooltip = useCallback(() => setTooltipVisible(false), []);

  const redirectOperations = useCallback(
    (type: string) => {
      if (type === "AddDevice") {
        router.push({
          pathname: "/(provision)/AddDeviceSelection",
        } as Parameters<typeof router.push>[0]);
      }
    },
    [router]
  );

  useFocusEffect(
    useCallback(() => {
      setTooltipVisible(false);
    }, [])
  );

  return {
    isLoading,
    refreshing,
    selectedRoom,
    setSelectedRoom,
    roomTabs,
    roomDevices,
    controlGroups,
    homeList,
    selectedHome,
    tooltipVisible,
    tooltipPosition,
    handleDropdownPress,
    handleCloseTooltip,
    handleHomeSelect,
    onRefresh,
    redirectOperations,
    showMigrationPrompt,
    handleMigrationPromptUnderstood,
  };
}

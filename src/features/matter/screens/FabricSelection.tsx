/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

// Theme and Styles
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Components
import { ScreenWrapper, Header } from "@shared/components";

// Hooks
import { useToast } from "@shared/hooks/useToast";
import { useCDF } from "@shared/hooks/useCDF";
import { updateLastSelectedHome } from "@shared/utils/common";

// Types
import { ESPCDFCommissioningProgress, ESPCDFGroup } from "@store";
import {
  DEFAULT_MATTER_DEVICE_NAME,
  MATTER_COMMISSIONING_EVENT,
  MATTER_EVENT_COMMISSIONING_COMPLETE,
  MATTER_EVENT_COMMISSIONING_CONFIRMATION_RESPONSE,
  MATTER_EVENT_COMMISSIONING_ERROR,
  MATTER_STATUS_PREPARING,
  MATTER_STATUS_PREPARING_FABRIC,
  MATTER_STATUS_STARTING_COMMISSIONING,
} from "@shared/utils/constants";
import {
  categorizeGroupsByOwnership,
  ensureHomesAreMutuallyExclusive,
  getValidHomes,
} from "@store";

/** iOS wraps fields in `requestBody`; Android often sends a flat map. */
function getMatterCommissioningPayload(event: Record<string, unknown>) {
  const rb = event.requestBody;
  if (rb && typeof rb === "object" && !Array.isArray(rb)) {
    return rb as Record<string, unknown>;
  }
  return event;
}

function commissioningPayloadIndicatesFailure(payload: Record<string, unknown>) {
  if (payload.success === false) return true;
  const st = String(payload.status ?? "").toLowerCase();
  if (st && st !== "success") return true;
  return false;
}

function extractCommissioningErrorMessage(payload: Record<string, unknown>) {
  const msg =
    payload.errorMessage ??
    payload.error_message ??
    payload.error ??
    payload.description ??
    "";
  return typeof msg === "string" ? msg : String(msg);
}

/**
 * Renders the fabric selection screen UI section.
 */
export function FabricSelectionScreen() {
  const { qrData } = useLocalSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { espCDFUser, initUserCustomData, store } = useCDF();
  const groupsListRef = useRef<ESPCDFGroup[]>([]);
  const userRef = useRef(espCDFUser);
  const toastRef = useRef(toast);
  const routerRef = useRef(router);
  const initUserCustomDataRef = useRef(initUserCustomData);
  const storeRef = useRef(store);
  const commissioningTargetGroupIdRef = useRef<string | null>(null);
  const [groupsAndFabrics, setGroupsAndFabrics] = useState<ESPCDFGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCommissioning, setIsCommissioning] = useState(false);
  const [commissioningStatus, setCommissioningStatus] = useState<string>(
    MATTER_STATUS_PREPARING,
  );

  useEffect(() => {
    loadGroupsAndFabrics();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional hook deps
  }, []);

  useEffect(() => {
    groupsListRef.current = groupsAndFabrics;
  }, [groupsAndFabrics]);

  useEffect(() => {
    userRef.current = espCDFUser;
  }, [espCDFUser]);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    initUserCustomDataRef.current = initUserCustomData;
  }, [initUserCustomData]);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  useEffect(() => {
    const handleCommissioningFailure = (message?: string) => {
      const failureMessage =
        message && message.trim().length > 0
          ? message
          : "Matter commissioning failed. Please try again.";

      toastRef.current.showError("Matter commissioning failed", failureMessage);
      setIsCommissioning(false);
      setCommissioningStatus(MATTER_STATUS_PREPARING);
      commissioningTargetGroupIdRef.current = null;
    };

    const handleCommissioningComplete = async (rawEvent: Record<string, unknown>) => {
      const payload = getMatterCommissioningPayload(rawEvent);

      if (commissioningPayloadIndicatesFailure(payload)) {
        handleCommissioningFailure(extractCommissioningErrorMessage(payload));
        return;
      }

      const deviceName =
        (payload.deviceName as string) ??
        (rawEvent.deviceName as string) ??
        DEFAULT_MATTER_DEVICE_NAME;

      setIsCommissioning(false);
      setCommissioningStatus(MATTER_STATUS_PREPARING);

      toastRef.current.showSuccess(
        `Device "${deviceName}" commissioned successfully!`,
      );

      const user = userRef.current;
      const targetGroupId = commissioningTargetGroupIdRef.current;
      commissioningTargetGroupIdRef.current = null;

      try {
        if (user && targetGroupId) {
          const homeGroup = groupsListRef.current.find(
            (g) => g.id === targetGroupId,
          );
          if (homeGroup && user.setCurrentHome) {
            await user.setCurrentHome(homeGroup);
            await initUserCustomDataRef.current?.();
          } else {
            storeRef.current.groupStore.setCurrentHomeId(targetGroupId);
            await updateLastSelectedHome(user, targetGroupId);
            await initUserCustomDataRef.current?.();
          }
        }

        if (user) {
          await user.syncHomeWithNodes?.();
        }

        routerRef.current.dismissTo("/(group)/Home");
      } catch (error) {
        console.error(
          "[FabricSelection] Failed to refresh nodes after commissioning:",
          error,
        );
        routerRef.current.dismissTo("/(group)/Home");
      }
    };

    const handleConfirmResponse = (event: Record<string, unknown>) => {
      const payload = getMatterCommissioningPayload(event);
      const status = String(payload.status ?? event.status ?? "").toLowerCase();
      if (status && status !== "success") {
        const description =
          (payload.description as string) ||
          (payload.errorMessage as string) ||
          (event.description as string) ||
          (event.errorMessage as string) ||
          "Invalid challenge response.";
        handleCommissioningFailure(description);
      }
    };

    const commissioningCompleteListener = DeviceEventEmitter.addListener(
      MATTER_COMMISSIONING_EVENT,
      (event: Record<string, unknown>) => {
        if (event.eventType === MATTER_EVENT_COMMISSIONING_COMPLETE) {
          void handleCommissioningComplete(event);
        } else if (
          event.eventType === MATTER_EVENT_COMMISSIONING_CONFIRMATION_RESPONSE
        ) {
          handleConfirmResponse(event);
        } else if (event.eventType === MATTER_EVENT_COMMISSIONING_ERROR) {
          const p = getMatterCommissioningPayload(event);
          handleCommissioningFailure(extractCommissioningErrorMessage(p));
        }
      },
    );

    return () => {
      commissioningCompleteListener.remove();
    };
  }, []);

  const loadGroupsAndFabrics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!espCDFUser) {
        throw new Error("No authenticated user found. Please login first.");
      }

      const cdfGroups = await espCDFUser.getGroupsAndFabrics();

      const { primaryGroups } = categorizeGroupsByOwnership(cdfGroups);
      await ensureHomesAreMutuallyExclusive(primaryGroups, true);
      const validPrimaryHomes = getValidHomes(primaryGroups);

      if (validPrimaryHomes.length > 0) {
        setGroupsAndFabrics(validPrimaryHomes);
      } else {
        setError("No groups or fabrics found. Please create a group first.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to load groups and fabrics: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = async (item: ESPCDFGroup) => {
    try {
      commissioningTargetGroupIdRef.current = item.id ?? null;
      setIsCommissioning(true);
      setCommissioningStatus(MATTER_STATUS_PREPARING_FABRIC);
      setError(null);

      if (!espCDFUser) {
        throw new Error("No authenticated user found. Please login first.");
      }

      const preparedFabric =
        await espCDFUser.prepareFabricForMatterCommissioning(item);
      setCommissioningStatus(MATTER_STATUS_STARTING_COMMISSIONING);

      const nocAvailable = await espCDFUser.isUserNocAvailableForFabric(
        preparedFabric.fabricId || "",
      );

      if (!nocAvailable) {
        const response = await preparedFabric.issueUserNoC();
        const groupIdFromResponse = response.certificates?.at(0)?.groupId || "";
        if (groupIdFromResponse !== item.id) {
          throw new Error("Fabric ID mismatch between response and fabric");
        }

        const fabricDetails =
          preparedFabric.fabricDetails ??
          {};
        const userNoc = response.certificates?.at(0)?.userNoC || "";
        const rootCa = fabricDetails.rootCa || "";
        const matterUserId = fabricDetails.matterUserId || "";

        if (!userNoc || !rootCa || !matterUserId) {
          throw new Error(
            "Missing required fabric details (userNOC/rootCa/matterUserId) for pre-commission storage",
          );
        }

        await espCDFUser.storePrecommissionInfo({
          groupId: preparedFabric.id,
          fabricId: preparedFabric.fabricId || "",
          name: preparedFabric.name,
          userNoc,
          matterUserId,
          rootCa,
          ipk: fabricDetails.ipk,
          groupCatIdOperate: fabricDetails.groupCatIdOperate,
          groupCatIdAdmin: fabricDetails.groupCatIdAdmin,
          userCatId: fabricDetails.userCatId,
        });
      }

      await preparedFabric.startCommissioning(
        qrData as string,
        (message: ESPCDFCommissioningProgress) => {
          if (message.description) {
            setCommissioningStatus(message.description);
          }
        },
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.showError(`Failed to start commissioning: ${errorMessage}`);

      commissioningTargetGroupIdRef.current = null;
      setIsCommissioning(false);
      setCommissioningStatus(MATTER_STATUS_PREPARING);
    }
  };

  const renderItem = ({ item }: { item: ESPCDFGroup }) => (
    <TouchableOpacity
      style={[styles.item, globalStyles.shadowElevationForLightTheme]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemType}>
          {item.isMatter ? "Matter Fabric" : "Group (can convert to fabric)"}
        </Text>
        <Text style={styles.itemId}>ID: {item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading || isCommissioning) {
    const loadingMessage = loading
      ? "Loading groups and fabrics..."
      : "Commissioning device...";

    return (
      <>
        <Header label="Fabric Selection" />
        <ScreenWrapper style={styles.screenWrapper}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={tokens.colors.primary} />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
            {isCommissioning && (
              <Text style={styles.commissioningStatusText}>
                {commissioningStatus}
              </Text>
            )}
          </View>
        </ScreenWrapper>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header label="Fabric Selection" />
        <ScreenWrapper style={styles.screenWrapper}>
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadGroupsAndFabrics}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </ScreenWrapper>
      </>
    );
  }

  return (
    <>
      <Header label="Fabric Selection" />
      <ScreenWrapper style={styles.screenWrapper}>
        <Text style={styles.subtitle}>
          Choose a group or fabric to commission the device
        </Text>

        {groupsAndFabrics.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No groups or fabrics found</Text>
            <Text style={styles.emptySubtext}>
              Create a group first to commission Matter devices
            </Text>
          </View>
        ) : (
          <FlatList
            data={groupsAndFabrics}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id || `item-${index}`}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScreenWrapper>
    </>
  );
}

/**
 * Stylesheet for FabricSelection component
 *
 * Uses design tokens for consistency with the app's design system:
 * - Colors, spacing, fonts, and radii from tokens
 * - Shadow elevations from global styles
 * - Responsive design for different screen sizes
 */
const styles = StyleSheet.create({
  screenWrapper: {
    padding: tokens.spacing._15,
    backgroundColor: tokens.colors.bg5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: tokens.spacing._20,
  },
  subtitle: {
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text_secondary,
    marginBottom: tokens.spacing._20,
    textAlign: "center",
    fontFamily: tokens.fonts.regular,
  },
  loadingText: {
    marginTop: tokens.spacing._15,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text_secondary,
    fontFamily: tokens.fonts.regular,
  },
  commissioningStatusText: {
    marginTop: tokens.spacing._10,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
    fontFamily: tokens.fonts.medium,
    textAlign: "center",
  },
  errorText: {
    fontSize: tokens.fontSize.md,
    color: tokens.colors.error,
    textAlign: "center",
    marginBottom: tokens.spacing._15,
    fontFamily: tokens.fonts.regular,
  },
  retryButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing._20,
    paddingVertical: tokens.spacing._15,
    borderRadius: tokens.radius.md,
  },
  retryButtonText: {
    color: tokens.colors.white,
    fontSize: tokens.fontSize.md,
    fontFamily: tokens.fonts.medium,
  },
  emptyText: {
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text_secondary,
    textAlign: "center",
    marginBottom: tokens.spacing._15,
    fontFamily: tokens.fonts.medium,
  },
  emptySubtext: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text_secondary,
    textAlign: "center",
    fontFamily: tokens.fonts.regular,
  },
  list: {
    flex: 1,
  },
  item: {
    backgroundColor: tokens.colors.white,
    marginVertical: tokens.spacing._5,
    borderRadius: tokens.radius.md,
  },
  itemContent: {
    padding: tokens.spacing._15,
  },
  itemName: {
    fontSize: tokens.fontSize.lg,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_primary,
    marginBottom: tokens.spacing._5,
  },
  itemType: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
    marginBottom: tokens.spacing._5,
    fontFamily: tokens.fonts.medium,
  },
  itemId: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.text_secondary,
    fontFamily: tokens.fonts.regular,
  },
});

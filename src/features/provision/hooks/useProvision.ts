/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollView, unstable_batchedUpdates } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useCDF } from "@shared/hooks/useCDF";
import { startNodeLocalDiscovery } from "@features/group/utils/localDiscovery";
import { useToast } from "@shared/hooks/useToast";
import {
  ESPCDF,
  ESPCDFProvisionResponse,
  ESPCDFProvisionResponseStatus,
  ESPCDFProvProgressMessages,
  ESPCDFProvisioningDevice,
  ESPCDFServiceParam,
  ESPCDFNode,
} from "@store";
import {
  ESPRM_AGENT_AUTH_SERVICE,
  ESPRM_REFRESH_TOKEN_PARAM_TYPE,
} from "@shared/utils/constants";
import { setUserAuthForNode } from "@features/agent/utils/device";
import { TOKEN_STORAGE_KEYS } from "@features/agent/utils";
import {
  ProvisionStage,
  getProvisionStages,
  getChallengeResponseStages,
  MESSAGE_STAGE_MAP,
  CHAL_RESP_MESSAGE_STAGE_MAP,
  extractErrorMessage,
  getLocalizedErrorMessage,
} from "@features/provision/utils/provisionHelper";

interface UseProvisionReturn {
  stages: ProvisionStage[];
  isComplete: boolean;
  stepsScrollViewRef: React.RefObject<ScrollView>;
  handleContinue: () => void;
}

/** Same as Home pull-to-refresh: fresh node list + connectivity from cloud, then local discovery. */
async function syncHomeAfterProvision(
  store: ESPCDF | undefined,
  syncHomeWithNodes: (shouldFetchFirstPage?: boolean) => Promise<void>
): Promise<void> {
  if (!store) return;
  try {
    await syncHomeWithNodes();
    startNodeLocalDiscovery(store);
  } catch (e) {
    console.error(
      "[Provision] Post-provision syncHomeWithNodes failed (non-blocking):",
      e
    );
  }
}

/**
 * Custom hook for Provision component business logic
 */
export const useProvision = (): UseProvisionReturn => {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { store, syncHomeWithNodes } = useCDF();
  const { ssid, password } = useLocalSearchParams();

  // State
  const [stages, setStages] = useState<ProvisionStage[]>(() =>
    getProvisionStages(t)
  );
  const [isComplete, setIsComplete] = useState(false);

  // Refs
  const stepsScrollViewRef = useRef<ScrollView>(null);
  const stagesRef = useRef<ProvisionStage[]>(stages);
  const isChallengeResponseFlowRef = useRef(false);
  const provisionedNodeRef = useRef<ESPCDFNode | null>(null);
  const hasStartedProvisioningRef = useRef(false);

  // Data
  const device: ESPCDFProvisioningDevice = store?.nodeStore?.connectedDevice as ESPCDFProvisioningDevice;
  const currentHomeId = store?.groupStore?.currentHomeId;
  const user = store?.userStore?.user;

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      stepsScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Mark stages as error helper
  const markStagesAsError = useCallback((
    stages: ProvisionStage[],
    stageId: number,
    errorMessage?: string
  ): ProvisionStage[] => {
    const newStages = [...stages];
    for (let i = stageId - 1; i < newStages.length; i++) {
      const stage = newStages[i];
      if (stage) {
        stage.status = "error";
        stage.error = i === stageId - 1 ? (errorMessage || "An error occurred") : undefined;
      }
    }
    return newStages;
  }, []);

  // Update challenge response stage
  const updateChallengeResponseStage = useCallback((stageId: number, isError?: boolean, errorMessage?: string) => {
    setStages((prevStages) => {
      const newStages = isError
        ? markStagesAsError(prevStages, stageId, errorMessage)
        : [...prevStages];

      if (!isError) {
        const currentStage = newStages[stageId - 1];
        if (currentStage) {
          currentStage.status = "success";
          currentStage.error = undefined;
        }

        if (stageId < 3) {
          const nextStage = newStages[stageId];
          if (nextStage) {
            nextStage.status = "pending";
          }
        }
      }

      stagesRef.current = newStages;
      return newStages;
    });

    scrollToBottom();
  }, [markStagesAsError, scrollToBottom]);

  // Update stage status
  const updateStageStatus = useCallback((message: string, isError?: boolean, errorMessage?: string) => {
    const stageId = MESSAGE_STAGE_MAP[message];

    if (!stageId) return;

    setStages((prevStages) => {
      const newStages = isError
        ? markStagesAsError(prevStages, stageId, errorMessage || message)
        : [...prevStages];

      if (!isError) {
        const currentStage = newStages[stageId - 1];
        if (currentStage) {
          currentStage.status = "success";
          currentStage.error = undefined;
        }

        if (stageId < 5) {
          const nextStage = newStages[stageId];
          if (nextStage) {
            nextStage.status = "pending";
          }
        }
      }

      stagesRef.current = newStages;
      return newStages;
    });

    scrollToBottom();
  }, [markStagesAsError, scrollToBottom]);

  // Mark stage 3 as complete
  const markStage3AsComplete = useCallback(() => {
    setTimeout(() => {
      setStages((prevStages) => {
        const newStages = [...prevStages];
        const stage3 = newStages[2];
        if (stage3) {
          stage3.status = "success";
          stage3.error = undefined;
        }
        const stage4 = newStages[3];
        if (stage4) {
          stage4.status = "pending";
        }
        stagesRef.current = newStages;
        return newStages;
      });
      scrollToBottom();
    }, 2000);
  }, [scrollToBottom]);

  // Set refresh token for node
  const setRefreshTokenForNode = useCallback(async (node: ESPCDFNode) => {
    try {
      const agentAuthService = node?.services?.find(
        (service) => service.type === ESPRM_AGENT_AUTH_SERVICE
      );

      if (!agentAuthService) return;

      const refreshTokenParam: ESPCDFServiceParam | undefined =
        agentAuthService.params?.find(
          (param) => param.type === ESPRM_REFRESH_TOKEN_PARAM_TYPE
        );

      if (!refreshTokenParam) return;

      const refreshToken = await AsyncStorage.getItem(
        TOKEN_STORAGE_KEYS.REFRESH_TOKEN
      );

      if (!refreshToken) return;

      await node?.setMultipleParams({
        [agentAuthService.name]: [
          {
            [refreshTokenParam.name]: refreshToken,
          },
        ],
      });
    } catch (error) {
      console.error("Error setting refresh token for provisioned node:", error);
    }
  }, []);

  /** Last step ("Setting up node") ticks only when Continue is enabled — same moment as setIsComplete. */
  const markFinalProvisionStageComplete = useCallback(() => {
    setStages((prevStages) => {
      const newStages = [...prevStages];
      if (isChallengeResponseFlowRef.current) {
        const stage3 = newStages[2];
        if (stage3) {
          stage3.status = "success";
          stage3.error = undefined;
        }
      } else {
        const stage5 = newStages[4];
        if (stage5) {
          stage5.status = "success";
          stage5.error = undefined;
        }
      }
      stagesRef.current = newStages;
      return newStages;
    });
    scrollToBottom();
  }, [scrollToBottom]);

  // Handle add device success
  const handleAddDeviceSuccess = useCallback(async (provisionedNode: ESPCDFNode) => {
    try {
      provisionedNodeRef.current = provisionedNode;
      const agentAuthService = provisionedNode?.services?.find(
        (service) => service.type === ESPRM_AGENT_AUTH_SERVICE
      );
      const isAgentDevice = !!agentAuthService;

      if (isAgentDevice) {
        try {
          await setRefreshTokenForNode(provisionedNode);
          await setUserAuthForNode(provisionedNode);
        } catch (tokenError) {
          console.error("Error setting refresh token (non-blocking):", tokenError);
        }
      } else {
        try {
          await setUserAuthForNode(provisionedNode);
        } catch (userAuthError) {
          console.error("Error setting user auth (non-blocking):", userAuthError);
        }
      }
      await syncHomeAfterProvision(store, syncHomeWithNodes);
      unstable_batchedUpdates(() => {
        markFinalProvisionStageComplete();
        setIsComplete(true);
      });
      toast.showSuccess(t("device.provision.success"));
    } catch (error) {
      console.error("Error in post-provision agent setup:", error);
      await syncHomeAfterProvision(store, syncHomeWithNodes);
      unstable_batchedUpdates(() => {
        markFinalProvisionStageComplete();
        setIsComplete(true);
      });
      toast.showSuccess(t("device.provision.success"));
    }
  }, [
    markFinalProvisionStageComplete,
    setRefreshTokenForNode,
    store,
    syncHomeWithNodes,
    toast,
    t,
  ]);

  // Handle provision update
  const handleProvisionUpdate = useCallback((response: ESPCDFProvisionResponse) => {
    const message = response.description || "";

    switch (response.status) {
      case ESPCDFProvisionResponseStatus.SUCCEED:
        // Challenge flow: stage 3 completes in handleAddDeviceSuccess with Continue.
        if (!isChallengeResponseFlowRef.current) {
          if (message === ESPCDFProvProgressMessages.DEVICE_PROVISIONED) {
            updateStageStatus(message);
            markStage3AsComplete();
          } else if (message === ESPCDFProvProgressMessages.USER_NODE_MAPPING_SUCCEED) {
            updateStageStatus(message);
          }
        }
        break;

      case ESPCDFProvisionResponseStatus.ON_PROGRESS:
        if (message === ESPCDFProvProgressMessages.DECODED_NODE_ID) {
          updateStageStatus(message);
        } else if (
          isChallengeResponseFlowRef.current &&
          CHAL_RESP_MESSAGE_STAGE_MAP[message] !== undefined
        ) {
          updateChallengeResponseStage(CHAL_RESP_MESSAGE_STAGE_MAP[message], false);
        }
        break;

      case ESPCDFProvisionResponseStatus.FAILED:
        handleProvisionError(new Error(message));
        updateStageStatus(message, true, message);
        break;

      default:
        handleProvisionError(new Error(message));
        updateStageStatus(message, true, message);
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional hook deps
  }, [updateChallengeResponseStage, updateStageStatus, markStage3AsComplete, scrollToBottom]);

  // Mark current stage as error
  const markCurrentStageAsError = useCallback((errorMessage: string) => {
    const currentStages = stagesRef.current;
    const loadingStageIndex = currentStages.findIndex(
      (stage) => stage.status === "pending"
    );

    if (loadingStageIndex < 0) return;

    const stage = currentStages[loadingStageIndex];
    if (!stage) return;

    if (isChallengeResponseFlowRef.current) {
      updateChallengeResponseStage(stage.id, true, errorMessage);
    } else {
      const stageIdToMessage: Record<number, string> = {
        1: ESPCDFProvProgressMessages.DECODED_NODE_ID,
        2: ESPCDFProvProgressMessages.DEVICE_PROVISIONED,
        3: ESPCDFProvProgressMessages.DEVICE_PROVISIONED,
        4: ESPCDFProvProgressMessages.USER_NODE_MAPPING_SUCCEED,
        5: ESPCDFProvProgressMessages.NODE_TIMEZONE_SETUP_SUCCEED,
      };
      updateStageStatus(stageIdToMessage[stage.id] ?? "", true, errorMessage);
    }
  }, [updateChallengeResponseStage, updateStageStatus]);

  // Handle provision error
  const handleProvisionError = useCallback((error: any) => {
    console.error("[Provision] Provision error:", error);
    const rawErrorMessage = extractErrorMessage(error);
    const localizedMessage = getLocalizedErrorMessage(rawErrorMessage, t);
    markCurrentStageAsError(localizedMessage);
    setIsComplete(true);
  }, [t, markCurrentStageAsError]);

  // Start provisioning
  const startProvisioning = useCallback(async () => {
    // Prevent multiple calls
    if (hasStartedProvisioningRef.current) {
      return;
    }
    hasStartedProvisioningRef.current = true;

    try {
      if (!user || !device || !currentHomeId) {
        hasStartedProvisioningRef.current = false; // Reset on error so it can retry
        handleProvisionError(new Error(t("device.errors.missingProvisionData") || "Missing provision data"));
        return;
      }
      const isChallengeResponseSupported = await device?.checkChallengeResponseSupport();
      if (isChallengeResponseSupported) {
        isChallengeResponseFlowRef.current = true;
        setStages(getChallengeResponseStages(t));
        stagesRef.current = getChallengeResponseStages(t);
      } else {
        isChallengeResponseFlowRef.current = false;
        setStages(getProvisionStages(t));
        stagesRef.current = getProvisionStages(t);
      }

      const node = await user.addDevice({
        provisioningDevice: device,
        groupId: currentHomeId,
        ssid: ssid as string,
        password: (password as string) || "",
        onProgress: handleProvisionUpdate,
      });

      if (node) {
        await handleAddDeviceSuccess(node);
      } else {
        hasStartedProvisioningRef.current = false; // Reset on error
        toast.showError(t("device.errors.nodeNotFound") || "Device not found after provisioning");
      }
    } catch (error) {
      console.error("[Provision] startProvisioning caught error:", error);
      hasStartedProvisioningRef.current = false; // Reset on error so it can retry
      handleProvisionError(error);
    }
  }, [user, device, currentHomeId, ssid, password, t, handleProvisionUpdate, handleAddDeviceSuccess, handleProvisionError, toast]);

  // Handle continue
  const handleContinue = useCallback(() => {
    const provisionedNode = provisionedNodeRef.current;
    if (provisionedNode) {
      const readmeUrl = provisionedNode?.nodeConfig?.info?.readme;
      if (readmeUrl) {
        const headerName = provisionedNode?.nodeConfig?.info?.name || "Device";
        const device = provisionedNode?.devices?.[0];
        const deviceDisplayName = device?.displayName || headerName;

        router.replace({
          pathname: "/(control)/Guide" as any,
          params: {
            url: readmeUrl,
            title: headerName,
            deviceName: deviceDisplayName,
            fromProvisionFlow: "true",
          },
        });
        return;
      }
    }

    router.dismissTo("/(group)/Home");
  }, [router]);

  // Start provisioning on mount - only once
  useEffect(() => {
    if (ssid && device && !hasStartedProvisioningRef.current) {
      startProvisioning();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssid, device]); // Removed startProvisioning from deps to prevent re-runs

  return {
    stages,
    isComplete,
    stepsScrollViewRef,
    handleContinue,
  };
};

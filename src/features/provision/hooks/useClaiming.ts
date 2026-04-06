/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useCDF } from "@shared/hooks/useCDF";
import {
  ESPCDFClaimStatus,
  ESPCDFClaimResponse,
  ESPCDFProvisioningDevice,
} from "@store";

interface UseClaimingReturn {
  status: ESPCDFClaimStatus;
  progressMessage: string;
  errorMessage: string;
  spin: Animated.AnimatedInterpolation<string | number>;
  handleOkPress: () => void;
}

/**
 * Custom hook for Claiming screen business logic
 */
export const useClaiming = (): UseClaimingReturn => {
  const { t } = useTranslation();
  const { store } = useCDF();
  const device: ESPCDFProvisioningDevice = store?.nodeStore?.connectedDevice;

  // State
  const [status, setStatus] = useState<ESPCDFClaimStatus>(
    ESPCDFClaimStatus.inProgress
  );
  const [progressMessage, setProgressMessage] = useState(
    t("device.claiming.starting") || "Starting assisted claiming..."
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Animation
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const hasStartedRef = useRef(false);

  // Start rotation animation
  useEffect(() => {
    if (status === ESPCDFClaimStatus.inProgress) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
    }
  }, [status, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  /**
   * Progress callback for claiming
   */
  const handleClaimProgress = (response: ESPCDFClaimResponse) => {
    setStatus(response.status);
    setProgressMessage(response.message);

    if (response.status === ESPCDFClaimStatus.failed && response.error) {
      setErrorMessage(response.error);
    }
  };

  /**
   * Main claiming flow
   */
  const startClaiming = async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    try {
      await device.startAssistedClaiming(handleClaimProgress);
    } catch (error) {
      setStatus(ESPCDFClaimStatus.failed);
      setErrorMessage(
        (error as Error).message ||
        t("device.claiming.failed") ||
        "Claiming failed"
      );
      setProgressMessage(
        t("device.claiming.failedMessage") || "Claiming failed"
      );
    }
  };

  // Start claiming on mount
  useEffect(() => {
    if (device) {
      startClaiming();
    } else {
      setStatus(ESPCDFClaimStatus.failed);
      setErrorMessage(
        t("device.errors.deviceNotConnected") || "Device not connected"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, t]);

  // Handle success - navigate to WiFi
  useEffect(() => {
    if (status === ESPCDFClaimStatus.success) {
      const timer = setTimeout(() => {
        router.push({
          pathname: "/(provision)/Wifi",
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  /**
   * Handle OK button press (on error)
   */
  const handleOkPress = () => {
    if (device) {
      try {
        device.disconnect?.();
      } catch (e) {
        console.error("Error disconnecting:", e);
      }
    }
    router.back();
  };

  return {
    status,
    progressMessage,
    errorMessage,
    spin,
    handleOkPress,
  };
};

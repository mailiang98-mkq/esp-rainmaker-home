/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useCDF } from "@shared/hooks/useCDF";
import { useToast } from "@shared/hooks/useToast";
import { useWifiStorage } from "./useWifiStorage";
import { ESPCDFProvisioningDevice } from "@store";
import type { WifiNetwork } from "@src/types/global";
import { isAIAgentFromAdvertisement } from "@shared/utils/device";
import { getAgentTermsAccepted } from "@features/agent/utils/storage";

interface UseWifiReturn {
  wifiList: WifiNetwork[];
  selectedWifi: string;
  password: string;
  isLoading: boolean;
  showPassword: boolean;
  shouldSave: boolean;
  isModalVisible: boolean;
  showAgentTerms: boolean;
  setSelectedWifi: (ssid: string) => void;
  setPassword: (password: string) => void;
  setShowPassword: (show: boolean) => void;
  setShouldSave: (save: boolean) => void;
  setIsModalVisible: (visible: boolean) => void;
  setShowAgentTerms: (show: boolean) => void;
  scanWifiNetworks: () => Promise<void>;
  handleConnect: () => Promise<void>;
  handleWifiSelect: (ssid: string) => void;
  handleAgentTermsComplete: () => void;
  handleAgentTermsClose: () => void;
}

/**
 * Custom hook for Wifi screen business logic
 */
export const useWifi = (): UseWifiReturn => {
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const { store } = useCDF();
  const { saveNetwork, getNetworkPassword } = useWifiStorage();

  const [wifiList, setWifiList] = useState<WifiNetwork[]>([]);
  const [selectedWifi, setSelectedWifi] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shouldSave, setShouldSave] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showAgentTerms, setShowAgentTerms] = useState(false);

  const user = store?.userStore?.user;
  const device: ESPCDFProvisioningDevice = store?.nodeStore?.connectedDevice as ESPCDFProvisioningDevice;

  /**
   * Check if device is an AI Agent based on advertisement data
   */
  const isAIAgentDevice = (): boolean => {
    const deviceAny = device as any;
    return isAIAgentFromAdvertisement(deviceAny?.advertisementData);
  };

  useEffect(() => {
    scanWifiNetworks();

    if (isAIAgentDevice()) {
      const termsAccepted = user ? getAgentTermsAccepted(user) : null;
      if (!termsAccepted) {
        setShowAgentTerms(true);
      }
    }
  }, []);

  // Only load/clear password when user selects a *different* network.
  // Don't depend on getNetworkPassword — it gets a new reference when storage loads
  // and would re-run this effect, clearing the field while the user is typing.
  const prevSelectedWifiRef = useRef<string>("");
  useEffect(() => {
    if (!selectedWifi) {
      prevSelectedWifiRef.current = "";
      return;
    }
    if (prevSelectedWifiRef.current === selectedWifi) {
      return;
    }
    prevSelectedWifiRef.current = selectedWifi;
    const savedPassword = getNetworkPassword(selectedWifi);
    if (savedPassword) {
      setPassword(savedPassword);
      setShouldSave(true);
    } else {
      setPassword("");
      setShouldSave(false);
    }
  }, [selectedWifi]);

  /**
   * Scan for available WiFi networks
   */
  const scanWifiNetworks = async () => {
    try {
      setIsLoading(true);
      const networks = await device.scanWifiList();
      const validNetworks = networks
        .filter((network) => network.ssid && network.ssid.trim().length > 0)
        .map(
          (network: any): WifiNetwork => ({
            ssid: network.ssid,
            rssi: network.rssi,
            secure: network.secure,
          })
        );
      validNetworks.sort((a, b) => b.rssi - a.rssi);
      setWifiList(validNetworks);
    } catch (error) {
      console.error("Error scanning networks:", error);
      toast.showError(t("device.errors.failedToScanNetworks"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle WiFi connection
   */
  const handleConnect = async () => {
    if (!selectedWifi) {
      toast.showError(t("device.errors.invalidCredentials"));
      return;
    }

    const selectedNetwork = wifiList.find(
      (network) => network.ssid === selectedWifi
    );
    const isSecureNetwork = selectedNetwork?.secure;

    if (isSecureNetwork && !password) {
      toast.showError(t("device.errors.invalidCredentials"));
      return;
    }

    if (shouldSave && password) {
      await saveNetwork(selectedWifi, password);
    }

    router.push({
      pathname: "/(provision)/Provision",
      params: { ssid: selectedWifi, password: password || "" },
    });
  };

  /**
   * Handle WiFi network selection
   */
  const handleWifiSelect = (ssid: string) => {
    setSelectedWifi(ssid);
    setIsModalVisible(false);
  };

  /**
   * Handle agent terms completion
   */
  const handleAgentTermsComplete = () => {
    setShowAgentTerms(false);
  };

  /**
   * Handle agent terms close
   */
  const handleAgentTermsClose = () => {
    setShowAgentTerms(false);
    if (device) {
      device.disconnect();
      store.nodeStore.connectedDevice = null;
    }
    router.back();
  };

  return {
    wifiList,
    selectedWifi,
    password,
    isLoading,
    showPassword,
    shouldSave,
    isModalVisible,
    showAgentTerms,
    setSelectedWifi,
    setPassword,
    setShowPassword,
    setShouldSave,
    setIsModalVisible,
    setShowAgentTerms,
    scanWifiNetworks,
    handleConnect,
    handleWifiSelect,
    handleAgentTermsComplete,
    handleAgentTermsClose,
  };
};

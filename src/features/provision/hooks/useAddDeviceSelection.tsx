/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useCDF } from "@shared/hooks/useCDF";
import { QrCode, Bluetooth, HouseWifi } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";

export interface DeviceOption {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}

interface UseAddDeviceSelectionReturn {
  deviceOptions: DeviceOption[];
  currentHome: any;
  isPrimaryUser: boolean;
  homeName: string;
  restrictionTitle: string;
  restrictionMessage: string;
}

/**
 * Custom hook for AddDeviceSelection screen business logic
 */
export const useAddDeviceSelection = (): UseAddDeviceSelectionReturn => {
  const router = useRouter();
  const { t } = useTranslation();
  const { store } = useCDF();
  const currentHome = store.getCurrentHome();

  const deviceOptions: DeviceOption[] = [
    {
      icon: (
        <QrCode
          {...testProps("icon_qr_code")}
          size={24}
          color={tokens.colors.primary}
        />
      ),
      label: t("device.addDeviceSelection.qrOption"),
      description: t("device.addDeviceSelection.qrDescription"),
      onClick: () => router.push("/(provision)/ScanQR"),
    },
    {
      icon: (
        <Bluetooth
          {...testProps("icon_bluetooth")}
          size={24}
          color={tokens.colors.primary}
        />
      ),
      label: t("device.addDeviceSelection.bluetoothOption"),
      description: t("device.addDeviceSelection.bluetoothDescription"),
      onClick: () => router.push("/(provision)/ScanBLE"),
    },
    {
      icon: (
        <HouseWifi
          {...testProps("icon_house_wifi")}
          size={24}
          color={tokens.colors.primary}
        />
      ),
      label: t("device.addDeviceSelection.softAPOption"),
      description: t("device.addDeviceSelection.softAPDescription"),
      onClick: () => router.push("/(provision)/ScanSoftAP"),
    },
  ];

  return {
    deviceOptions,
    currentHome,
    isPrimaryUser: currentHome?.isPrimaryUser || false,
    homeName:
      currentHome?.name || t("device.addDeviceSelection.defaultHomeName"),
    restrictionTitle: t("device.addDeviceSelection.sharedHomeRestriction"),
    restrictionMessage: t("device.addDeviceSelection.sharedHomeMessage", {
      homeName:
        currentHome?.name || t("device.addDeviceSelection.defaultHomeName"),
    }),
  };
};

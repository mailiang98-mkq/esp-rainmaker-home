/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { CameraView } from "expo-camera";
import { useTranslation } from "react-i18next";

import { ScreenWrapper, Header } from "@shared/components";
import { globalStyles } from "@shared/theme/globalStyleSheet";

export interface ConfigScanScannerViewProps {
  title: string;
  onScan: (data: string) => void;
  onBack: () => void;
}

export function ConfigScanScannerView({
  title,
  onScan,
  onBack,
}: ConfigScanScannerViewProps) {
  const { t } = useTranslation();

  return (
    <ScreenWrapper style={globalStyles.configScanContainerNoPadding}>
      <Header label={title} showBack onBackPress={onBack} />
      <View
        style={[
          globalStyles.scannerContainer,
          globalStyles.configScanScannerView,
        ]}
      >
        <CameraView
          style={globalStyles.scanner}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => onScan(data)}
        />
        <View style={globalStyles.configScanOverlay}>
          <Text style={globalStyles.configScanOverlayText}>
            {t("config.scan.scanOverlay")}
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";

// Components
import { CollapsibleCard, InfoRow, ActionButton } from "@shared/components";

// Styles
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Types
import { OTAProps } from "@src/types/global";

/**
 * OTA Component
 *
 * Manages over-the-air updates for the device.
 * Shows current version, available updates, and update controls.
 *
 * Features:
 * - Version comparison
 * - Update checking
 * - Update initiation
 * - Progress indication
 * @param props - Component properties for OTA functionality
 */
const OTA: React.FC<OTAProps> = ({
  otaInfo,
  onCheckUpdates,
  onStartUpdate,
  isChecking,
}) => {
  const { t } = useTranslation();

  return (
    <CollapsibleCard
      title={t("device.settings.otaTitle")}
      defaultExpanded={false}
      style={{
        ...globalStyles.shadowElevationForLightTheme,
        backgroundColor: tokens.colors.white,
      }}
    >
      <View style={globalStyles.infoContainer}>
        <InfoRow
          label={t("device.settings.otaCurrentVersionLabel")}
          value={otaInfo.currentVersion}
        />
        <InfoRow
          label={t("device.settings.otaNewVersionLabel")}
          value={otaInfo.newVersion || "--"}
        />
      </View>

      <View style={{ marginTop: 15 }}>
        {!otaInfo.isUpdateAvailable && !otaInfo.isUpdating && (
          <ActionButton
            onPress={onCheckUpdates}
            disabled={isChecking}
            variant="secondary"
          >
            {isChecking ? (
              <ActivityIndicator size="small" color={tokens.colors.primary} />
            ) : (
              <Text style={globalStyles.buttonTextSecondary}>
                {t("device.settings.otaCheckForUpdates")}
              </Text>
            )}
          </ActionButton>
        )}

        {otaInfo.isUpdateAvailable && !otaInfo.isUpdating && (
          <ActionButton onPress={onStartUpdate} variant="primary">
            <Text style={globalStyles.buttonTextPrimary}>
              {t("device.settings.otaUpdateNow")}
            </Text>
          </ActionButton>
        )}

        {otaInfo.isUpdating && (
          <View style={globalStyles.loadingContainer}>
            <ActivityIndicator size="small" color={tokens.colors.primary} />
            <Text style={globalStyles.loadingText}>
              {t("device.settings.otaUpdating")}
            </Text>
          </View>
        )}
      </View>
    </CollapsibleCard>
  );
};

export default OTA;

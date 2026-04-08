/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";

// Styles
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Hooks
import { useTranslation } from "react-i18next";
import { useClaiming } from "@features/provision/hooks";
import { ESPCDFClaimStatus } from "@store";

// Components
import { ScreenWrapper, Header, Button } from "@shared/components";

// Utils
import { testProps } from "@shared/utils/testProps";

// Icons
import { AlertCircle, CheckCircle } from "lucide-react-native";

/**
 * ClaimingScreen component for device assisted claiming.
 *
 * This component handles the assisted claiming process for ESP devices
 * that require claiming before provisioning.
 */
const ClaimingScreen = () => {
  const { t } = useTranslation();
  const { status, progressMessage, errorMessage, spin, handleOkPress } =
    useClaiming();

  // Render
  return (
    <>
      <Header
        showBack
        label={t("device.claiming.title") || "Claiming"}
        qaId="header_claiming"
      />
      <ScreenWrapper
        style={{
          ...globalStyles.screenWrapper,
          backgroundColor: tokens.colors.bg5,
        }}
        qaId="screen_wrapper_claiming"
      >
        <View style={styles.container} {...testProps("view_claiming")}>
          {/* Icon with animation */}
          <View
            style={styles.iconContainer}
            {...testProps("view_claiming_icon")}
          >
            {status === ESPCDFClaimStatus.inProgress && (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <ActivityIndicator size={80} color={tokens.colors.primary} />
              </Animated.View>
            )}
            {status === ESPCDFClaimStatus.success && (
              <CheckCircle size={80} color={tokens.colors.green} />
            )}
            {status === ESPCDFClaimStatus.failed && (
              <AlertCircle size={80} color={tokens.colors.red} />
            )}
          </View>

          {/* Progress message */}
          <Text
            style={[
              styles.progressText,
              status === ESPCDFClaimStatus.failed && styles.errorText,
            ]}
            {...testProps("text_claiming_progress")}
          >
            {progressMessage}
          </Text>

          {/* Error message */}
          {status === ESPCDFClaimStatus.failed && errorMessage && (
            <Text
              style={styles.errorDetail}
              {...testProps("text_claiming_error")}
            >
              {errorMessage}
            </Text>
          )}

          {/* Subtitle for in-progress */}
          {status === ESPCDFClaimStatus.inProgress && (
            <Text style={styles.subtitle} {...testProps("text_claiming_wait")}>
              {t("device.claiming.pleaseWait") ||
                "This process may take a few moments..."}
            </Text>
          )}

          {/* OK button for error state */}
          {status === ESPCDFClaimStatus.failed && (
            <Button
              label={t("common.ok") || "OK"}
              onPress={handleOkPress}
              style={{
                ...globalStyles.btn,
                ...globalStyles.bgBlue,
                marginTop: tokens.spacing._30,
              }}
              qaId="button_claiming_ok"
            />
          )}
        </View>
      </ScreenWrapper>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: tokens.spacing._20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: tokens.spacing._30,
  },
  progressText: {
    fontSize: tokens.fontSize.lg,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_primary,
    textAlign: "center",
    marginBottom: tokens.spacing._10,
  },
  errorText: {
    color: tokens.colors.red,
  },
  errorDetail: {
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.fonts.regular,
    color: tokens.colors.gray,
    textAlign: "center",
    marginTop: tokens.spacing._10,
  },
  subtitle: {
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.fonts.regular,
    color: tokens.colors.gray,
    textAlign: "center",
  },
});

export default ClaimingScreen;

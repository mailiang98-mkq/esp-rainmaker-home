/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet, ViewStyle } from "react-native";
import { tokens } from "@shared/theme/tokens";

export const userStyles = StyleSheet.create({
  section: {
    marginTop: tokens.spacing._15,
    backgroundColor: tokens.colors.bg5,
  } as ViewStyle,
  integrationsContainer: {
    paddingTop: tokens.spacing._10,
    paddingBottom: tokens.spacing._10,
  } as ViewStyle,
});

export const deleteAccountStyles = StyleSheet.create({
  warningTitle: {
    color: tokens.colors.red,
  },
  contentContainer: {
    width: "100%",
    paddingHorizontal: tokens.spacing._20,
    maxWidth: 400,
  },
  verificationContent: {
    paddingHorizontal: tokens.spacing._20,
    width: "100%",
    maxWidth: 400,
  },
  codeInput: {
    textAlign: "center",
    fontSize: tokens.fontSize.lg,
    letterSpacing: 8,
    paddingVertical: 0,
  },
  buttonContainer: {
    marginTop: tokens.spacing._20,
    width: "100%",
  },
  resendButton: {
    marginTop: tokens.spacing._10,
    paddingVertical: tokens.spacing._10,
    paddingHorizontal: tokens.spacing._15,
  },
});

export const guideStyles = StyleSheet.create({
  mainContent: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.sm,
    flex: 1,
    padding: tokens.spacing._20,
  },
  scrollView: {
    flex: 1,
  },
  descriptionContainer: {
    marginTop: tokens.spacing._20,
    paddingHorizontal: tokens.spacing._15,
    minHeight: 80,
  },
  description: {
    fontFamily: tokens.fonts.regular,
    fontSize: 16,
    color: tokens.colors.primary,
    textAlign: "left",
    lineHeight: 24,
  },
  pageIndicators: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: tokens.spacing._15,
    marginBottom: tokens.spacing._10,
    gap: tokens.spacing._5,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.bg2,
  },
  activePageIndicator: {
    backgroundColor: tokens.colors.primary,
    width: 20,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    padding: tokens.spacing._10,
  },
  previewScrollView: {
    width: "100%",
    height: "80%",
  },
  previewImageContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: tokens.spacing._20,
  },
  previewImage: {
    width: "100%",
    height: "90%",
  },
  previewIndex: {
    fontFamily: tokens.fonts.regular,
    fontSize: 16,
    color: tokens.colors.white,
    textAlign: "center",
    marginTop: tokens.spacing._10,
  },
});

export const personalInfoStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: tokens.colors.bg5,
    boxSizing: "border-box",
    overflow: "hidden",
    padding: tokens.spacing._15,
    fontFamily: tokens.fonts.regular,
  } as ViewStyle,
  contentWrapper: {
    marginTop: tokens.spacing._15,
  },
});

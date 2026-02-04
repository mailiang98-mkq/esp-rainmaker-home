/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet } from "react-native";
import { tokens } from "@shared/theme/tokens";
import type { AgentTermsBottomSheetStyles } from "@src/types/global";

// Agent Terms Bottom Sheet Styles
export const agentTermsBottomSheetStyles: AgentTermsBottomSheetStyles =
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      justifyContent: "flex-end",
    },
    keyboardView: {
      flexGrow: 0,
    },
    bottomSheet: {
      backgroundColor: tokens.colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: tokens.spacing._20,
      paddingTop: tokens.spacing._15,
      paddingBottom: tokens.spacing._30,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: -4 },
      shadowRadius: 12,
      elevation: 10,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: tokens.spacing._10,
    },
    title: {
      fontSize: tokens.fontSize.lg,
      fontWeight: "bold",
      color: tokens.colors.text_primary,
      flex: 1,
    },
    closeButton: {
      padding: tokens.spacing._5,
    },
    handle: {
      width: 48,
      height: 5,
      backgroundColor: tokens.colors.bg2,
      borderRadius: 3,
      alignSelf: "center",
      marginTop: tokens.spacing._10,
      marginBottom: tokens.spacing._10,
    },
    content: {
      gap: tokens.spacing._20,
      marginTop: tokens.spacing._20,
    },
    subtitle: {
      fontSize: tokens.fontSize.sm,
      color: tokens.colors.text_secondary,
      textAlign: "center",
      marginBottom: tokens.spacing._5,
    },
    inputContainer: {
      marginTop: 0,
    },
    consentContainer: {
      width: "100%",
      marginTop: tokens.spacing._10,
      marginBottom: tokens.spacing._5,
      flexDirection: "row",
      alignItems: "center",
    },
    consentTextContainer: {
      flex: 1,
      paddingTop: 2,
    },
    consentText: {
      fontSize: tokens.fontSize.sm,
      color: tokens.colors.gray,
      lineHeight: 20,
    },
    linkText: {
      fontSize: tokens.fontSize.sm,
      color: tokens.colors.primary,
      textDecorationLine: "underline",
    },
    continueButton: {
      marginTop: tokens.spacing._15,
      marginBottom: 0,
    },
  });

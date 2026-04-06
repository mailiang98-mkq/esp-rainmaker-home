/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet } from "react-native";
import { tokens } from "@shared/theme/tokens";

// Agent Selection Bottom Sheet Styles
export const agentSelectionSheetStyles = StyleSheet.create({
  content: {
    backgroundColor: tokens.colors.white,
    borderTopLeftRadius: tokens.radius.md,
    borderTopRightRadius: tokens.radius.md,
    padding: tokens.spacing._20,
    paddingTop: tokens.spacing._15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing._20,
    paddingBottom: tokens.spacing._20,
    paddingTop: tokens.spacing._10,
  },
  title: {
    fontSize: tokens.fontSize.lg,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_primary,
    flex: 1,
  },
  closeButton: {
    padding: tokens.spacing._5,
  },
  scrollContent: {
    paddingBottom: tokens.spacing._30,
    paddingTop: tokens.spacing._10,
  },
  section: {
    paddingHorizontal: tokens.spacing._20,
    marginBottom: tokens.spacing._5,
  },
  sectionTitle: {
    fontSize: tokens.fontSize.xs,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_secondary,
    marginBottom: tokens.spacing._15,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  agentItem: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing._10,
    borderWidth: 1,
    borderColor: tokens.colors.bg2,
    padding: tokens.spacing._15,
  },
  agentItemSelected: {
    backgroundColor: tokens.colors.primary + "10",
    borderColor: tokens.colors.primary,
    borderWidth: 2,
  },
  agentItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  agentInfo: {
    flex: 1,
    marginRight: tokens.spacing._15,
  },
  agentName: {
    fontSize: tokens.fontSize.md,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_primary,
    marginBottom: tokens.spacing._5,
  },
  agentNameSelected: {
    color: tokens.colors.primary,
  },
  agentId: {
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.fonts.regular,
    color: tokens.colors.text_secondary,
  },
  agentIdSelected: {
    color: tokens.colors.primary,
  },
  loadingContainer: {
    padding: tokens.spacing._40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  loadingText: {
    marginTop: tokens.spacing._20,
    fontSize: tokens.fontSize.md,
    fontFamily: tokens.fonts.regular,
    color: tokens.colors.text_secondary,
  },
  errorContainer: {
    padding: tokens.spacing._40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  errorText: {
    fontSize: tokens.fontSize.md,
    fontFamily: tokens.fonts.regular,
    color: tokens.colors.red,
    marginBottom: tokens.spacing._20,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: tokens.spacing._10,
    paddingHorizontal: tokens.spacing._20,
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.md,
  },
  retryButtonText: {
    fontSize: tokens.fontSize.md,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.white,
  },
  emptyContainer: {
    padding: tokens.spacing._40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  emptyText: {
    fontSize: tokens.fontSize.md,
    fontFamily: tokens.fonts.regular,
    color: tokens.colors.text_secondary,
    textAlign: "center",
  },
  // Device Params Selection Styles
  deviceParamsParamItem: {
    marginBottom: tokens.spacing._10,
    paddingBottom: tokens.spacing._15,
    borderWidth: tokens.border.defaultWidth,
    borderColor: tokens.colors.borderColor,
  },
  deviceParamsButtonContainer: {
    marginTop: "auto",
    flexDirection: "column",
    alignItems: "center",
  },
  deviceParamsButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing._10,
  },
});

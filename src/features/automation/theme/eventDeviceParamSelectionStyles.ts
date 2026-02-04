/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet } from "react-native";
import { tokens } from "@shared/theme/tokens";

export const eventDeviceParamSelectionStyles = StyleSheet.create({
  buttonContainer: {
    marginTop: "auto",
    flexDirection: "column",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing._10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: tokens.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    maxHeight: "80%",
    borderWidth: tokens.border.defaultWidth,
    borderColor: tokens.colors.borderColor,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: tokens.colors.bg2,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  paramUIContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: tokens.spacing._10,
  },
  actionButton: {
    flex: 1,
  },
  bottomSafeArea: {
    height: 34,
  },
  conditionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderColor,
  },
  conditionLabel: {
    fontSize: tokens.fontSize.md,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_primary,
    marginBottom: 12,
  },
  conditionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  conditionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.borderColor,
    backgroundColor: tokens.colors.white,
  },
  conditionButtonActive: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  conditionButtonText: {
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_primary,
  },
  conditionButtonTextActive: {
    color: tokens.colors.white,
  },
});

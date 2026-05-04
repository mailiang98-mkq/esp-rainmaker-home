/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet } from "react-native";

import { globalStyles } from "@shared/theme/globalStyleSheet";
import { tokens } from "@shared/theme/tokens";

/** Same as UpdateDeviceName: flex column, padding, bg5 — footer sits below scroll. */
export const selectDeviceRoomScreenWrapperStyle = globalStyles.container;

export const selectDeviceRoomStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: "100%",
  },
  emptyHint: {
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.fonts.regular,
    color: tokens.colors.text_secondary,
    marginBottom: tokens.spacing._10,
  },
  createRoomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing._10,
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing._15,
    paddingHorizontal: tokens.spacing._15,
  },
  createRoomRowAfterList: {
    marginTop: tokens.spacing._10,
  },
  createRoomRowText: {
    flex: 1,
    fontSize: tokens.fontSize.md,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_primary,
  },
  sectionTitle: {
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_secondary,
    marginBottom: tokens.spacing._10,
    marginTop: tokens.spacing._5,
  },
  roomRow: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing._15,
    paddingHorizontal: tokens.spacing._15,
    marginBottom: tokens.spacing._5,
  },
  roomRowSelected: {
    backgroundColor: tokens.colors.bg5,
    borderWidth: 1,
    borderColor: tokens.colors.blue,
  },
  roomRowText: {
    fontSize: tokens.fontSize.md,
    fontFamily: tokens.fonts.regular,
    color: tokens.colors.text_primary,
  },
  roomRowTextSelected: {
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.blue,
  },
  continueButton: {
    width: "100%",
    minHeight: 48,
    justifyContent: "center",
  },
  /** Pinned footer: marginTop "auto" like UpdateDeviceName. */
  footer: {
    marginTop: "auto",
    width: "100%",
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: tokens.spacing._10,
    paddingBottom: tokens.spacing._20,
  },
});

export const selectDeviceRoomContinueButtonStyle = StyleSheet.flatten([
  globalStyles.btn,
  globalStyles.bgBlue,
  globalStyles.shadowElevationForLightTheme,
  selectDeviceRoomStyles.continueButton,
]);

/** Icon stroke colors (lucide-react-native) */
export const selectDeviceRoomIconColors = {
  createRoomPlus: tokens.colors.text_secondary,
  chevron: tokens.colors.text_secondary,
} as const;

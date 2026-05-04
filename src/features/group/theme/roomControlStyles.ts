/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet } from "react-native";
import { tokens } from "@shared/theme/tokens";

export const roomControlSwitchStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: tokens.colors.white,
    marginTop: tokens.spacing._10,
    marginBottom: tokens.spacing._5,
    borderRadius: tokens.radius.md,
    overflow: "hidden",
    borderWidth: tokens.border.defaultWidth,
    borderColor: tokens.colors.borderColor,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: tokens.spacing._10,
    gap: tokens.spacing._5,
  },
  controlButtonLeft: {
    borderTopLeftRadius: tokens.radius.md,
    borderBottomLeftRadius: tokens.radius.md,
  },
  controlButtonRight: {
    borderTopRightRadius: tokens.radius.md,
    borderBottomRightRadius: tokens.radius.md,
  },
  controlButtonText: {
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.primary,
  },
  divider: {
    width: 1,
    backgroundColor: tokens.colors.borderColor,
    marginVertical: tokens.spacing._10,
  },
});

export const deviceTypeFilterTabsStyles = StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing._5,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing._5,
    paddingHorizontal: tokens.spacing._15,
    paddingVertical: tokens.spacing._5,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.borderColor,
    marginRight: tokens.spacing._10,
    backgroundColor: tokens.colors.white,
  },
  tabActive: {
    backgroundColor: tokens.colors.blue,
    borderColor: tokens.colors.blue,
  },
  tabText: {
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_secondary,
  },
  tabTextActive: {
    color: tokens.colors.white,
  },
});

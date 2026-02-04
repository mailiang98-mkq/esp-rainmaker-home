/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet } from "react-native";
import { tokens } from "@shared/theme/tokens";
import type { AgentConversationsSheetStyles } from "@src/types/global";

// Agent Conversations Bottom Sheet Styles
export const agentConversationsSheetStyles: AgentConversationsSheetStyles =
  StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: tokens.colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderRadius: tokens.radius.md,
    borderWidth: tokens.border.defaultWidth,
    borderColor: tokens.colors.borderColor,
    shadowColor: tokens.colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: tokens.fontSize.lg,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_primary,
  },
  closeText: {
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_secondary,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text_secondary,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text_secondary,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  itemContainerActive: {
    backgroundColor: tokens.colors.bg3,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: tokens.fontSize.md,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.text_primary,
  },
  itemSubtitle: {
    marginTop: 2,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.text_secondary,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeBadge: {
    fontSize: tokens.fontSize.xs,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.success,
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    fontSize: tokens.fontSize.xs,
    fontFamily: tokens.fonts.medium,
    color: tokens.colors.red,
  },
});

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { tokens } from "@shared/theme/tokens";

// Chat Markdown Styles Helper
// Returns markdown styles configurable by user type and font sizes
export const getChatMarkdownStyles = (
  isUser: boolean,
  fontSizes: {
    base: number;
    lineHeight: number;
    heading1: number;
    heading2: number;
    heading3: number;
  }
) => {
  return {
    body: {
      color: isUser ? tokens.colors.bg1 : tokens.colors.text_primary,
      fontSize: fontSizes.base,
      lineHeight: fontSizes.lineHeight,
      fontFamily: tokens.fonts.regular,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 8,
    },
    heading1: {
      fontSize: fontSizes.heading1,
      fontWeight: "bold" as const,
      marginBottom: 8,
      color: isUser ? tokens.colors.bg1 : tokens.colors.text_primary,
    },
    heading2: {
      fontSize: fontSizes.heading2,
      fontWeight: "bold" as const,
      marginBottom: 6,
      color: isUser ? tokens.colors.bg1 : tokens.colors.text_primary,
    },
    heading3: {
      fontSize: fontSizes.heading3,
      fontWeight: "bold" as const,
      marginBottom: 4,
      color: isUser ? tokens.colors.bg1 : tokens.colors.text_primary,
    },
    code_inline: {
      backgroundColor: isUser ? "rgba(255,255,255,0.2)" : tokens.colors.bg3,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: "monospace",
    },
    code_block: {
      backgroundColor: isUser ? "rgba(255,255,255,0.2)" : tokens.colors.bg3,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
      fontFamily: "monospace",
    },
    link: {
      color: isUser ? tokens.colors.bg1 : tokens.colors.primary,
      textDecorationLine: "underline" as const,
    },
    list_item: {
      marginBottom: 4,
    },
  };
};

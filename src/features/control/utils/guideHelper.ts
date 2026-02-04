/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from "marked";
import { tokens } from "@shared/theme/tokens";
import type { GuideStep } from "@src/types/global";

/**
 * Converts markdown string to HTML for use with react-native-render-html.
 */
export const convertMarkdownToHTML = (markdown: string): string => {
  if (!markdown || typeof markdown !== "string") return "";
  return marked.parse(markdown, { breaks: true }) as string;
};

/**
 * Normalizes image URL from raw src (e.g. from markdown/HTML).
 * Returns trimmed string; for relative URLs the caller should resolve against the guide base URL.
 */
export const transformImageUrl = (rawSrc: string | undefined): string => {
  if (rawSrc == null) return "";
  return String(rawSrc).trim();
};

/**
 * Returns tag styles for guide HTML content (used by RenderHTML tagsStyles).
 */
export const getGuideHTMLStyles = (): Record<string, object> => ({
  body: {
    color: tokens.colors.text_primary,
    fontSize: 16,
    lineHeight: 24,
  },
  p: {
    marginVertical: 8,
    color: tokens.colors.text_primary,
  },
  a: {
    color: tokens.colors.primary,
  },
  h1: { fontSize: 24, fontWeight: "700", marginVertical: 12 },
  h2: { fontSize: 20, fontWeight: "600", marginVertical: 10 },
  h3: { fontSize: 18, fontWeight: "600", marginVertical: 8 },
  ul: { marginVertical: 8 },
  ol: { marginVertical: 8 },
  li: { marginVertical: 4 },
  code: {
    backgroundColor: tokens.colors.bg3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  pre: {
    backgroundColor: tokens.colors.bg3,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    overflow: "scroll" as const,
  },
});

/**
 * Builds a flat array of images from guide steps and image map.
 * Pure function - no side effects.
 */
export const buildGuideImages = (
  steps: GuideStep[],
  imageMap: Record<string, number>
): number[] => {
  const imageList: number[] = [];
  steps.forEach((item) => {
    imageList.push(imageMap[item.icon1] ?? 0);
    imageList.push(imageMap[item.icon2] ?? 0);
  });
  return imageList;
};

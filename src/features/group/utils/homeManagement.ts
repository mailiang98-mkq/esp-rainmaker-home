/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ESPCDFGroup, ESPCDFNode } from "@store";
import { HOME_NAME_MAX_LENGTH } from "@shared/utils/constants";

export type HomeNameValidationError = "empty" | "tooLong" | "duplicate";
export type HomeNameValidationErrorKey =
  | "group.validation.homeNameCannotBeEmpty"
  | "group.validation.homeNameTooLong"
  | "group.validation.homeNameAlreadyExists";

export interface ValidateHomeNameResult {
  valid: boolean;
  errorKey?: HomeNameValidationError;
}

/**
 * Validates a home name for creation (pure; no side effects).
 * @param name - Raw input name
 * @param existingHomes - List of existing homes to check uniqueness
 * @returns Validation result with optional error key for i18n
 */
export function validateHomeNameForCreation(
  name: string,
  existingHomes: { name?: string }[]
): ValidateHomeNameResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, errorKey: "empty" };
  }

  if (trimmed.length > HOME_NAME_MAX_LENGTH) {
    return { valid: false, errorKey: "tooLong" };
  }

  const normalized = trimmed.toLowerCase();
  const isDuplicate = existingHomes.some(
    (h) => (h.name?.trim().toLowerCase() ?? "") === normalized
  );
  if (isDuplicate) {
    return { valid: false, errorKey: "duplicate" };
  }

  return { valid: true };
}

export interface HomeDescriptionCounts {
  devicesCount: number;
  roomsCount: number;
}

/**
 * Maps validation error codes to i18n translation keys.
 * Screen uses this with t() to show localized messages.
 */
export const HOME_NAME_VALIDATION_ERROR_KEYS: Record<
  HomeNameValidationError,
  HomeNameValidationErrorKey
> = {
  empty: "group.validation.homeNameCannotBeEmpty",
  tooLong: "group.validation.homeNameTooLong",
  duplicate: "group.validation.homeNameAlreadyExists",
};

/**
 * Formats device and room counts into a display string (pure).
 * Caller provides already-translated labels so this util has no i18n dependency.
 */
export function formatHomeDescription(
  counts: HomeDescriptionCounts,
  deviceLabel: string,
  roomLabel: string
): string {
  return `${counts.devicesCount} ${deviceLabel}, ${counts.roomsCount} ${roomLabel}`;
}

/**
 * Computes device and room counts for a home (pure).
 * @param home - The home group
 * @param nodesList - All nodes (used to count devices per home)
 * @returns Counts for devices and rooms
 */
export function getHomeDescriptionCounts(
  home: ESPCDFGroup,
  nodesList: ESPCDFNode[]
): HomeDescriptionCounts {
  const homeNodeIds = new Set(home.nodeIds ?? []);
  const devicesCount = nodesList
    .filter((node) => homeNodeIds.has(node.id))
    .reduce((acc, node) => acc + (node.devices?.length ?? 0), 0);
  const roomsCount = home.subGroups?.length ?? 0;
  return { devicesCount, roomsCount };
}

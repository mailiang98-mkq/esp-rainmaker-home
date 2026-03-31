/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TFunction } from "i18next";
import { ActiveSDK, SDK_FEATURE_MAP } from "@config/sdk.config";
import { runtimeConfigManager } from "@config/runtime.config";
import { validateEmail } from "@shared/utils/validations";

export { validateEmail } from "@shared/utils/validations";

/** Invite identifier kinds for group sharing (`SDK_FEATURE_MAP.groupSharingAllowedTypes`). */
export type GroupSharingInviteType = "email" | "userCode";

const GROUP_SHARING_FALLBACK: readonly GroupSharingInviteType[] = ["email"];

const RMNG_USER_CODE_LENGTH = 6;

/**
 * Allowed invite kinds for the active SDK (`SDK_FEATURE_MAP.groupSharingAllowedTypes`;
 * runtime active SDK wins, else compile-time ActiveSDK).
 */
export function getGroupSharingAllowedTypes(): readonly GroupSharingInviteType[] {
  const sdk = runtimeConfigManager.activeSdk ?? ActiveSDK;
  const raw = SDK_FEATURE_MAP[sdk]?.groupSharingAllowedTypes;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw as readonly GroupSharingInviteType[];
  }
  return GROUP_SHARING_FALLBACK;
}

/** RMNG user code: exactly 6 alphanumeric characters (e.g. 2GZHIU). */
export function validateRmngUserCode(value: string): boolean {
  const v = value.trim();
  return new RegExp(`^[A-Za-z0-9]{${RMNG_USER_CODE_LENGTH}}$`).test(v);
}

export function isGroupSharingInviteAllowed(
  value: string,
  allowed: readonly GroupSharingInviteType[]
): boolean {
  const v = value.trim();
  if (!v) return false;
  if (allowed.includes("email") && validateEmail(v)) return true;
  if (allowed.includes("userCode") && validateRmngUserCode(v)) return true;
  return false;
}

export type GroupSharingInviteValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * Validator for group share / transfer invite field (email and/or RMNG user code).
 */
export const createGroupSharingInviteValidator =
  (allowed: readonly GroupSharingInviteType[], t: TFunction) =>
  (value: string): GroupSharingInviteValidationResult => {
    const v = value.trim();
    if (!v) {
      return { isValid: false };
    }
    if (isGroupSharingInviteAllowed(value, allowed)) {
      return { isValid: true };
    }
    const emailOnly = allowed.length === 1 && allowed[0] === "email";
    if (emailOnly) {
      return {
        isValid: false,
        error: t("group.validation.pleaseEnterValidEmail"),
      };
    }
    const userCodeOnly = allowed.length === 1 && allowed[0] === "userCode";
    if (userCodeOnly) {
      return {
        isValid: false,
        error: t("group.validation.invalidUserCode"),
      };
    }
    if (v.includes("@")) {
      return {
        isValid: false,
        error: t("group.validation.pleaseEnterValidEmail"),
      };
    }
    return {
      isValid: false,
      error: t("group.validation.invalidEmailOrUserCode"),
    };
  };

/** Normalize value sent as `toUserName` (uppercase user codes for RMNG). */
export function normalizeGroupSharingInviteForApi(
  value: string,
  allowed: readonly GroupSharingInviteType[]
): string {
  const v = value.trim();
  if (allowed.includes("userCode") && validateRmngUserCode(v)) {
    return v.toUpperCase();
  }
  return v;
}

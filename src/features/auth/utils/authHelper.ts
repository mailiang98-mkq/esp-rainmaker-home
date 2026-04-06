/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TFunction } from "i18next";
import { validateEmail } from "@shared/utils/validations";

const VERIFICATION_CODE_LENGTH = 6;
const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 30;

export type AuthValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * Creates an email validator. Pure function - no side effects.
 */
export const createEmailValidator =
  (t: TFunction) =>
  (email: string): AuthValidationResult => {
    if (!email.trim()) {
      return { isValid: false };
    }
    if (!validateEmail(email)) {
      return { isValid: false, error: t("auth.validation.invalidEmail") };
    }
    return { isValid: true };
  };

/**
 * Creates a simple password validator (non-empty). Pure function - no side effects.
 */
export const createPasswordValidator =
  (_t: TFunction) =>
  (password: string): AuthValidationResult => {
    if (!password?.trim()) {
      return { isValid: false };
    }
    return { isValid: true };
  };

/**
 * Creates a confirm password validator. Pure function - no side effects.
 */
export const createConfirmPasswordValidator =
  (getPasswordToMatch: () => string, t: TFunction) =>
  (confirmPwd: string): AuthValidationResult => {
    if (!confirmPwd.trim()) {
      return { isValid: false };
    }
    if (confirmPwd !== getPasswordToMatch()) {
      return {
        isValid: false,
        error: t("auth.validation.passwordsDoNotMatch"),
      };
    }
    return { isValid: true };
  };

/**
 * Creates a verification code validator with configurable error message.
 * Pure function - no side effects.
 */
export const createCodeValidator =
  (invalidCodeMessage: string) =>
  (inputCode: string): AuthValidationResult => {
    if (!inputCode.trim()) {
      return { isValid: false };
    }
    if (inputCode.trim().length !== VERIFICATION_CODE_LENGTH) {
      return {
        isValid: false,
        error: invalidCodeMessage,
      };
    }
    return { isValid: true };
  };

/**
 * Creates a nickname validator for Agent terms. Pure function - no side effects.
 */
export const createNicknameValidator =
  (t: TFunction) =>
  (value: string): AuthValidationResult => {
    if (!value.trim()) {
      return { isValid: false };
    }
    if (value.trim().length < NICKNAME_MIN_LENGTH) {
      return {
        isValid: false,
        error: t("auth.validation.nameMinLength"),
      };
    }
    if (value.trim().length > NICKNAME_MAX_LENGTH) {
      return {
        isValid: false,
        error: t("auth.validation.nameMaxLength"),
      };
    }
    return { isValid: true };
  };

/**
 * Creates a new password validator for change password flow.
 * Ensures new password is different from old password.
 */
export const createNewPasswordValidator =
  (getOldPassword: () => string, t: TFunction) =>
  (password: string): AuthValidationResult => {
    if (!password.trim()) {
      return { isValid: false };
    }
    if (password === getOldPassword()) {
      return {
        isValid: false,
        error: t("auth.validation.newPasswordSameAsCurrent"),
      };
    }
    return { isValid: true };
  };

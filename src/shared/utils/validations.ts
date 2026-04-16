/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validates the email input.
 *
 * This function checks if the email input is a valid email address.
 * @param email - The email to validate.
 * @returns - True if the email is valid, false otherwise.
 */
export const validateEmail = (email: string): boolean => {
  if (!email?.trim()) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * E.164 phone (Cognito-style): leading +, country code 1–9, total length ≤ 15 digits.
 */
export const validatePhoneE164 = (phone: string): boolean => {
  if (!phone?.trim()) return false;
  const normalized = phone.trim().replace(/\s/g, "");
  return /^\+[1-9]\d{1,14}$/.test(normalized);
};

/**
 * True when input looks like a phone (enough digits) but does not start with + — used for UX validation only.
 */
export const isPhoneLikeMissingLeadingPlus = (value: string): boolean => {
  const t = value.trim().replace(/\s/g, "");
  if (!t || t.startsWith("+")) return false;
  if (t.includes("@")) return false;
  if (validateEmail(value)) return false;
  const digits = t.replace(/\D/g, "");
  return digits.length >= 6;
};

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import StorageAdapter from "@native-adaptors/implementations/ESPAsyncStorage";

/** Storage key for the ID token (matches Base_SDK StorageKeys.IDTOKEN) */
const ID_TOKEN_STORAGE_KEY = "com.esprmbase.idToken";

/** Default AWS region fallback */
const DEFAULT_AWS_REGION = "us-east-1";

/**
 * Regex to extract AWS region from the JWT issuer URL.
 * Supports multiple patterns:
 * 1. https://cognito-idp.us-east-1.amazonaws.com/...
 * 2. https://esp-rainmaker-oauth-*-dev.s3.us-east-1.amazonaws.com
 * 3. https://esp-rainmaker-oauth-*-dev.s3.cn-north-1.amazonaws.com.cn
 */
const AWS_REGION_REGEX =
  /(?:cognito-idp\.|\bs3\.)([^.]+)\.amazonaws\.com(?:\.cn)?/;

/**
 * Decodes the payload of a JWT token without verifying the signature.
 * JWTs are base64url-encoded: header.payload.signature
 * @param token - The JWT token string
 * @returns The decoded payload object, or null if decoding fails
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Base64url -> Base64 -> decode
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // Pad with '=' to make length a multiple of 4
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }

    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extracts the AWS region from the stored ID token's `iss` (issuer) claim.
 * This mirrors the Android native app logic:
 * - Reads the ID token from storage
 * - Decodes the JWT payload to get the `iss` claim
 * - Extracts the region from the issuer URL using a regex
 * @returns The AWS region string (e.g. "us-east-1"), or the default region if extraction fails
 */
export async function getAwsRegionFromToken(): Promise<string> {
  try {
    const idToken = await StorageAdapter.getItem(ID_TOKEN_STORAGE_KEY);
    if (!idToken) {
      return DEFAULT_AWS_REGION;
    }

    const payload = decodeJwtPayload(idToken);
    if (!payload?.iss) {
      return DEFAULT_AWS_REGION;
    }

    const match = AWS_REGION_REGEX.exec(payload.iss);
    if (match && match[1]) {
      return match[1];
    }

    return DEFAULT_AWS_REGION;
  } catch {
    return DEFAULT_AWS_REGION;
  }
}

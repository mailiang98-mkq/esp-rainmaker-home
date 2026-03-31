/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ESPCDFUserCustomDataRequest } from "@store";
import { decodeToken, ESPRMNGStorage, type ESPRMNGUser } from "@espressif/rmng-base-sdk";

const STORAGE_KEY_PREFIX = "rmng.cdf.v1.userCustomData";

/** Stored map shape (same as Rainmaker UserCustomDataResponse / DataEntry in input.d.ts). */
type StoredCustomDataEntry = Exclude<ESPCDFUserCustomDataRequest[string], null>;
type StoredUserCustomData = Record<string, StoredCustomDataEntry>;

function storageKeyForUser(userId: string): string {
  return `${STORAGE_KEY_PREFIX}:${encodeURIComponent(userId)}`;
}

function parseStoredCustomData(raw: string | null): StoredUserCustomData {
  if (raw == null || raw === "") {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as StoredUserCustomData;
  } catch {
    return {};
  }
}

function mergeUserCustomData(
  current: StoredUserCustomData,
  patch: ESPCDFUserCustomDataRequest,
): StoredUserCustomData {
  const next: StoredUserCustomData = { ...current };
  for (const key of Object.keys(patch)) {
    const entry = patch[key];
    if (entry === null) {
      delete next[key];
    } else {
      next[key] = { ...next[key], ...entry };
    }
  }
  return next;
}

/**
 * Resolves a stable per-user id for namespacing local custom data in ESPRMNGStorage.
 */
export async function resolveRmngUserIdForCustomDataStorage(
  user: ESPRMNGUser,
): Promise<string> {
  try {
    const decoded = decodeToken(user.idToken);
    const id = decoded["cognito:username"] ?? decoded.sub;
    if (typeof id === "string" && id.length > 0) {
      return id;
    }
  } catch {
    /* fall through */
  }
  const info = await user.getUserInfo();
  const fallback =
    (typeof info.username === "string" && info.username) ||
    (typeof info.userAttributes?.email === "string" && info.userAttributes.email) ||
    "";
  return fallback;
}

export async function getRmngAdaptorUserCustomData(
  userId: string,
): Promise<StoredUserCustomData> {
  const raw = await ESPRMNGStorage.getItem(storageKeyForUser(userId));
  return parseStoredCustomData(raw);
}

export async function applyRmngAdaptorUserCustomDataPatch(
  userId: string,
  patch: ESPCDFUserCustomDataRequest,
): Promise<void> {
  const current = await getRmngAdaptorUserCustomData(userId);
  const merged = mergeUserCustomData(current, patch);
  await ESPRMNGStorage.setItem(
    storageKeyForUser(userId),
    JSON.stringify(merged),
  );
}

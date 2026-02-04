/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import Joi from "joi";
import type { ScannedConfigPayload } from "@config/runtime.config";
import { CONFIG_FETCH_TIMEOUT_MS } from "@shared/utils/constants";

// Validation schema (Single Responsibility: config validation)
// Keys: baseUrl, version, authUrl, clientId, redirectUrl
const CONFIG_SCHEMA = Joi.object({
  version: Joi.number().valid(1).optional().default(1),
  sdk: Joi.string().valid("rainmaker-base-sdk").required(),
  config: Joi.object({
    baseUrl: Joi.string().uri({ scheme: ["https"] }),
    version: Joi.string(),
    authUrl: Joi.string().uri({ scheme: ["https"] }).optional(),
    clientId: Joi.string().min(1).optional(),
    redirectUrl: Joi.string().uri().optional(),
    authProviders: Joi.array().items(Joi.string()).optional(),
  })
    .required()
    .unknown(false),
}).unknown(false);

/** Parses scanned value as JSON. Returns null if not valid JSON. */
function parseAsJson(value: string): ScannedConfigPayload | null {
  try {
    return JSON.parse(value) as ScannedConfigPayload;
  } catch {
    return null;
  }
}

/** Fetches config from URL. Throws on error. */
async function fetchConfigFromUrl(url: string): Promise<ScannedConfigPayload> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.trim(), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return (await res.json()) as ScannedConfigPayload;
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Config fetch timeout (10s)");
    }
    throw e;
  }
}

/** Validates config payload. Returns validated payload or throws with message. */
export function validateConfig(
  payload: ScannedConfigPayload
): ScannedConfigPayload {
  const { error, value } = CONFIG_SCHEMA.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    throw new Error(`Invalid config format: ${messages}`);
  }

  return value as ScannedConfigPayload;
}

/**
 * Resolves config from scanned value (JSON string or URL).
 * Returns validated ScannedConfigPayload. Throws on error.
 * @param onFetching - Optional callback when fetching from URL (e.g. to show loading)
 */
export async function resolveConfigFromScan(
  scannedValue: string,
  onFetching?: () => void
): Promise<ScannedConfigPayload> {
  const json = parseAsJson(scannedValue);

  if (json) {
    return validateConfig(json);
  }

  onFetching?.();

  const fetched = await fetchConfigFromUrl(scannedValue);
  return validateConfig(fetched);
}

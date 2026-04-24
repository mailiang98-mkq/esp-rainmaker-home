/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * In-memory cache for KVS signaling channel info and ICE server credentials.
 *
 * Channel info (ARN + WSS/HTTPS endpoints) practically never changes for the lifetime
 * of a device, so we cache it for CHANNEL_INFO_TTL_MS. If the TTL returned by
 * DescribeSignalingChannel is available it should be preferred, but KVS currently
 * doesn't surface it in the endpoint response, so we default to 24 h.
 *
 * ICE server credentials from GetIceServerConfig expire after 300 s by default.
 * We cache them for ICE_TTL_MS (240 s) to avoid serving near-expired credentials.
 *
 * In-flight deduplication:
 * If two callers request the same channel simultaneously (e.g. the pre-warm
 * effect and startStreaming racing on a fresh launch), only one network request
 * is made. The second caller receives the same Promise and both resolve from
 * the single response.
 */

const CHANNEL_INFO_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const ICE_TTL_MS = 240 * 1000; // 240 seconds (credentials expire at 300 s)

export interface CachedChannelInfo {
  channelARN: string;
  wssEndpoint: string;
  httpsEndpoint: string;
}

interface ChannelInfoEntry {
  data: CachedChannelInfo;
  expiresAt: number;
}

export interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

interface IceServersEntry {
  data: IceServer[];
  expiresAt: number;
}

const channelInfoCache = new Map<string, ChannelInfoEntry>();
const iceServersCache = new Map<string, IceServersEntry>();

// In-flight promise maps prevent duplicate network requests when multiple
// callers arrive before the first response has been written to the cache.
const channelInfoInFlight = new Map<string, Promise<CachedChannelInfo>>();
const iceServersInFlight = new Map<string, Promise<IceServer[]>>();

// ---------------------------------------------------------------------------
// Channel info
// ---------------------------------------------------------------------------

/**
 * Returns cached channel info if still valid, otherwise null.
 */
export function getCachedChannelInfo(channelName: string): CachedChannelInfo | null {
  const entry = channelInfoCache.get(channelName);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    channelInfoCache.delete(channelName);
    return null;
  }
  return entry.data;
}

/**
 * Stores channel info in the cache.
 * An optional customTtlMs overrides the default 24 h TTL.
 */
export function setCachedChannelInfo(
  channelName: string,
  info: CachedChannelInfo,
  customTtlMs?: number
): void {
  channelInfoCache.set(channelName, {
    data: info,
    expiresAt: Date.now() + (customTtlMs ?? CHANNEL_INFO_TTL_MS),
  });
}

/**
 * Returns cached channel info if available, otherwise calls `fetcher` exactly
 * once even if multiple callers arrive simultaneously.
 *
 * - Cache hit  → resolves immediately from memory.
 * - In-flight  → joins the existing Promise; no duplicate request.
 * - Cache miss → starts a new fetch, deduplicates it, caches the result.
 */
export function getOrFetchChannelInfo(
  channelName: string,
  fetcher: () => Promise<CachedChannelInfo>
): Promise<CachedChannelInfo> {
  const cached = getCachedChannelInfo(channelName);
  if (cached) return Promise.resolve(cached);

  const existing = channelInfoInFlight.get(channelName);
  if (existing) return existing;

  const promise = fetcher()
    .then((info) => {
      setCachedChannelInfo(channelName, info);
      channelInfoInFlight.delete(channelName);
      return info;
    })
    .catch((err) => {
      channelInfoInFlight.delete(channelName);
      throw err;
    });

  channelInfoInFlight.set(channelName, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// ICE servers
// ---------------------------------------------------------------------------

/**
 * Returns cached ICE servers if still valid, otherwise null.
 */
export function getCachedIceServers(channelName: string): IceServer[] | null {
  const entry = iceServersCache.get(channelName);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    iceServersCache.delete(channelName);
    return null;
  }
  return entry.data;
}

/**
 * Stores ICE servers in the cache.
 * An optional customTtlMs overrides the default 240 s TTL.
 */
export function setCachedIceServers(
  channelName: string,
  servers: IceServer[],
  customTtlMs?: number
): void {
  iceServersCache.set(channelName, {
    data: servers,
    expiresAt: Date.now() + (customTtlMs ?? ICE_TTL_MS),
  });
}

/**
 * Return type for the ICE servers fetcher.
 * `ttlMs` is optional – when provided it overrides the default 240 s TTL so the
 * cache entry expires before AWS credentials do (AWS returns TTL in the response).
 */
export interface IceServersFetchResult {
  servers: IceServer[];
  ttlMs?: number;
}

/**
 * Returns cached ICE servers if available, otherwise calls `fetcher` exactly
 * once even if multiple callers arrive simultaneously.
 *
 * - Cache hit  → resolves immediately from memory.
 * - In-flight  → joins the existing Promise; no duplicate request.
 * - Cache miss → starts a new fetch, deduplicates it, caches the result.
 */
export function getOrFetchIceServers(
  channelName: string,
  fetcher: () => Promise<IceServersFetchResult>
): Promise<IceServer[]> {
  const cached = getCachedIceServers(channelName);
  if (cached) return Promise.resolve(cached);

  const existing = iceServersInFlight.get(channelName);
  if (existing) return existing;

  const promise = fetcher()
    .then(({ servers, ttlMs }) => {
      setCachedIceServers(channelName, servers, ttlMs);
      iceServersInFlight.delete(channelName);
      return servers;
    })
    .catch((err) => {
      iceServersInFlight.delete(channelName);
      throw err;
    });

  iceServersInFlight.set(channelName, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Clears all cached and in-flight entries for a channel.
 * Call this when a connection error suggests cached data may be stale.
 */
export function clearChannelCache(channelName: string): void {
  channelInfoCache.delete(channelName);
  iceServersCache.delete(channelName);
  channelInfoInFlight.delete(channelName);
  iceServersInFlight.delete(channelName);
}

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Type definitions for KVS Signaling Client
 */

/**
 * AWS credentials for SigV4 authentication
 */
export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

/**
 * Configuration for KVS Signaling Client
 */
export interface SignalingClientConfig {
  channelARN: string;
  channelEndpoint: string;
  clientId: string;
  region: string;
  credentials: AWSCredentials;
}

/**
 * Event types emitted by the signaling client
 */
export type SignalingEventType = "open" | "close" | "error" | "sdpAnswer" | "iceCandidate";

/**
 * Event handler function signature
 */
export type SignalingEventHandler = (...args: any[]) => void;

/**
 * Incoming signaling message structure
 */
export type SignalingMessage = {
  messageType?: string;
  action?: string;
  messagePayload?: string;
};

/**
 * Message handler function signature
 */
export type MessageHandler = (message: SignalingMessage) => void;

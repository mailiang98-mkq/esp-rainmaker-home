/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import "react-native-get-random-values";
import { RTCSessionDescription, RTCIceCandidate } from "react-native-webrtc";

import type {
  AWSCredentials,
  SignalingClientConfig,
  SignalingEventType,
  SignalingEventHandler,
  SignalingMessage,
  MessageHandler,
} from "./types";


const LOG_PREFIX = "[KVSSignalingClient]";
/**
 * KVS Signaling Client
 * Implements the KVS WebRTC signaling protocol over WebSocket
 */
export class KVSSignalingClient {
  private ws: WebSocket | null = null;
  private config: SignalingClientConfig;
  private eventHandlers: Map<SignalingEventType, SignalingEventHandler[]> = new Map();
  private signedUrl: string | null = null;
  private isConnected: boolean = false;

  /**
   * Creates a KVS signaling client for WebRTC viewer signaling over WebSocket.
   * @param config - Signaling client configuration (endpoint, channel ARN, region, credentials, client ID)
   */
  constructor(config: SignalingClientConfig) {
    this.validateSigningConfig(config);
    this.config = config;
  }

  /**
   * Add event listener
   */
  on(event: SignalingEventType, handler: SignalingEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove event listener
   */
  off(event: SignalingEventType, handler: SignalingEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: SignalingEventType, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch {
          // Error in event handler - silently handle
        }
      });
    }
  }

  /**
   * Validates required configuration parameters for WebSocket URL signing.
   * Checks channelEndpoint (non-empty URL), region, and credential fields (access key, secret, session token).
   * @throws If any required parameter is missing, empty, or invalid.
   */
  private validateSigningConfig(config?: SignalingClientConfig): void {
    const {
      channelEndpoint,
      region,
      credentials,
    } = config || this.config;

    // Validate channelEndpoint
    if (!channelEndpoint || typeof channelEndpoint !== "string" || channelEndpoint.trim() === "") {
      throw new Error("channelEndpoint is required and must be a non-empty string");
    }

    // Validate channelEndpoint is a valid URL
    try {
      new URL(channelEndpoint);
    } catch (err) {
      throw new Error(`Invalid channelEndpoint URL: ${channelEndpoint}. ${err instanceof Error ? err.message : String(err)}`);
    }

    // Validate region
    if (!region || typeof region !== "string" || region.trim() === "") {
      throw new Error("region is required and must be a non-empty string");
    }

    // Validate credentials object exists
    if (!credentials || typeof credentials !== "object") {
      throw new Error("credentials is required and must be an object");
    }

    // Validate accessKeyId
    if (!credentials.accessKeyId || typeof credentials.accessKeyId !== "string" || credentials.accessKeyId.trim() === "") {
      throw new Error("credentials.accessKeyId is required and must be a non-empty string");
    }

    // Validate secretAccessKey
    if (!credentials.secretAccessKey || typeof credentials.secretAccessKey !== "string" || credentials.secretAccessKey.trim() === "") {
      throw new Error("credentials.secretAccessKey is required and must be a non-empty string");
    }

    // Validate sessionToken
    if (!credentials.sessionToken || typeof credentials.sessionToken !== "string" || credentials.sessionToken.trim() === "") {
      throw new Error("credentials.sessionToken is required and must be a non-empty string");
    }
  }

  /**
   * Signs the WebSocket URL using AWS Signature Version 4 (SigV4) for KVS signaling.
   * Builds canonical query parameters, canonical request, string to sign, and HMAC signature; appends X-Amz-Signature (299s expiry).
   * @returns A fully signed wss URL with SigV4 query parameters.
   * @throws If configuration is invalid, signing fails, or crypto helpers are unavailable (ensure crypto polyfill in app layout).
   */
  private async signWebSocketURL(): Promise<string> {
    // Validate required configuration parameters
    this.validateSigningConfig();

    const {
      channelEndpoint,
      channelARN,
      clientId,
      region,
      credentials: { accessKeyId, secretAccessKey, sessionToken },
    } = this.config;
  
    const url = new URL(channelEndpoint);
    const host = url.hostname;
    const path = url.pathname || "/";
  
    const amzDate = this.getAmzDate();
    const dateStamp = this.getDateStamp();
  
    const queryParams: Record<string, string> = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": this.buildCredentialScope(accessKeyId, region),
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": "299",
      "X-Amz-SignedHeaders": "host",
      "X-Amz-Security-Token": sessionToken,
      ...(channelARN && { "X-Amz-ChannelARN": channelARN }),
      ...(clientId && { "X-Amz-ClientId": clientId }),
    };
  
    const canonicalQueryString = Object.keys(queryParams)
      .sort()
      .map((k) => `${this.encodeURIComponent(k)}=${this.encodeURIComponent(queryParams[k])}`)
      .join("&");
  
    const canonicalRequest = [
      "GET",
      path,
      canonicalQueryString,
      `host:${host}\n`,
      "host",
      this.sha256(""),
    ].join("\n");
  
    const credentialScope = `${dateStamp}/${region}/kinesisvideo/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      this.sha256(canonicalRequest),
    ].join("\n");
  
    const signature = this.calculateSignature(
      secretAccessKey,
      dateStamp,
      region,
      stringToSign
    );
  
    return `${url.protocol}//${host}${path}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
  }
  

  /**
   * Build credential scope for SigV4
   */
  private buildCredentialScope(accessKeyId: string, region: string): string {
    const dateStamp = this.getDateStamp();
    return `${accessKeyId}/${dateStamp}/${region}/kinesisvideo/aws4_request`;
  }

  /**
   * Get AWS date string (YYYYMMDDTHHMMSSZ)
   */
  private getAmzDate(): string {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  /**
   * Get date stamp (YYYYMMDD)
   */
  private getDateStamp(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  /**
   * Encode URI component (handles special characters)
   */
  private encodeURIComponent(str: string): string {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
      return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  /**
   * SHA256 hash using Node.js-style crypto API (crypto.createHash)
   * Matches the pattern used in TestProjectStable and esp-rainmaker-ng-app-sdk-ts
   */
  private sha256(message: string): string {
    const cryptoObj = global.crypto as any;
    if (!cryptoObj?.createHmac) {
      throw new Error(
        "crypto.createHmac is not available. Ensure the crypto polyfill is initialized before using AWS SigV4."
       );
     }
    return cryptoObj.createHash("sha256").update(message).digest("hex");
  }

  /**
   * Calculate SigV4 signature
   * Uses Node.js-style crypto API (crypto.createHmac)
   */
  private calculateSignature(
    secretAccessKey: string,
    dateStamp: string,
    region: string,
    stringToSign: string
  ): string {
    // SigV4 signing key derivation (all steps use binary output except final signature)
    const cryptoObj = global.crypto as any;
    if (!cryptoObj?.createHmac) {
      throw new Error(
        "crypto.createHmac is not available. Ensure the crypto polyfill is initialized before using AWS SigV4."
      );
    }

    /**
     * Creates HMAC-SHA256 binary output for SigV4 key derivation steps.
     * @param key - HMAC key material
     * @param data - Data to sign
     * @returns Binary digest from HMAC-SHA256
     */
    const hmacBinary = (key: any, data: string): any => {
      return cryptoObj.createHmac("sha256", key).update(data).digest("binary");
    };
 
    // Step-by-step SigV4 key derivation
    const kDate = hmacBinary(`AWS4${secretAccessKey}`, dateStamp); 
    const kRegion = hmacBinary(kDate, region);
    const kService = hmacBinary(kRegion, "kinesisvideo");
    const kSigning = hmacBinary(kService, "aws4_request");
 
    // Final signature (hex string)
    return cryptoObj
      .createHmac("sha256", kSigning)
      .update(stringToSign)
      .digest("hex");
  }

  /**
   * Open WebSocket connection
   */
  async open(): Promise<void> {
    if (this.isConnected || this.ws) {
      return;
    }

    try {
      this.signedUrl = await this.signWebSocketURL();
      this.ws = new WebSocket(this.signedUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.emit("open");
        if(__DEV__) {
          console.log(`${LOG_PREFIX} WebSocket connected to: ${this.signedUrl}`);
        }
      };

      this.ws.onmessage = (event) =>{
         this.handleMessage(event.data);
         if(__DEV__) {
          console.log(`${LOG_PREFIX} WebSocket message received: ${event.data.toString()}`);
         }
      }

      this.ws.onerror = (event) => {
        this.emit("error", new Error("WebSocket error occurred"));
        if(__DEV__) {
          console.error(`${LOG_PREFIX} WebSocket error occurred: ${event.toString()}`);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.ws = null;
        this.emit("close");
        if(__DEV__) {
          console.log(`${LOG_PREFIX} WebSocket closed`);
        }
      };
    } catch (err) {
      this.emit("error", err);
      if(__DEV__) {
        console.error(`${LOG_PREFIX} WebSocket error occurred: ${err}`);
      }
      throw err;
    }
  }

  /**
   * Decode WebSocket data to string
   * Handles both string and ArrayBuffer inputs, returning null for empty/invalid data
   * @param data - WebSocket message data (string or ArrayBuffer)
   * @returns Decoded string or null if empty/invalid
   */
  private decodeWebSocketData(data: string | ArrayBuffer): string | null {
    if (typeof data === "string") {
      return data.trim() || null;
    }

    try {
      return new TextDecoder().decode(data).trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * Safely parse JSON with type checking
   * Returns null for invalid JSON or non-object values (matching AWS SDK silent behavior)
   * @param value - JSON string to parse
   * @returns Parsed object or null if invalid
   */
  private safeJsonParse<T>(value: string): T | null {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed !== null ? parsed : null;
    } catch {
      return null;
    }
  }

  /**
   * Safely decode Base64 payload to UTF-8 JSON object
   * Fixes potential UTF-8 encoding issues with atob by using TextDecoder
   * @param base64 - Base64 encoded string
   * @returns Parsed JSON object or null if invalid
   */
  private decodeBase64Payload<T>(base64?: string): T | null {
    if (!base64) return null;

    try {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      const text = new TextDecoder("utf-8").decode(bytes);
      return this.safeJsonParse<T>(text);
    } catch {
      return null;
    }
  }

  /**
   * Handle SDP_ANSWER message type
   * Processes SDP answer payload and emits sdpAnswer event
   * @param message - Signaling message containing SDP answer payload
   */
  private handleSdpAnswer(message: SignalingMessage): void {
    const payload = this.decodeBase64Payload<{ sdp: string }>(message.messagePayload);
    if (!payload?.sdp) return;

    let sdp = payload.sdp;

    // Fix escaped newlines (iOS sends \r\n as literal string)
    if (sdp.includes("\\r\\n")) {
      sdp = sdp.replace(/\\r\\n/g, "\r\n");
    }

    const answer = new RTCSessionDescription({
      type: "answer",
      sdp,
    });

    this.emit("sdpAnswer", answer);
  }

  /**
   * Handle ICE_CANDIDATE message type
   * Processes ICE candidate payload and emits iceCandidate event
   * @param message - Signaling message containing ICE candidate payload
   */
  private handleIceCandidate(message: SignalingMessage): void {
    const payload = this.decodeBase64Payload<{
      candidate: string;
      sdpMLineIndex?: number;
      sdpMid?: string;
    }>(message.messagePayload);

    if (!payload?.candidate) return;

    const candidate = new RTCIceCandidate({
      candidate: payload.candidate,
      sdpMLineIndex: payload.sdpMLineIndex ?? null,
      sdpMid: payload.sdpMid ?? null,
    });

    this.emit("iceCandidate", candidate);
  }

  /**
   * Handle STATUS_RESPONSE message type
   * Processes status response and emits error if status code is not 200
   * @param message - Signaling message containing status response payload
   */
  private handleStatusResponse(message: SignalingMessage): void {
    const payload = this.decodeBase64Payload<{
      statusCode?: string;
      statusDescription?: string;
    }>(message.messagePayload);

    if (!payload || payload.statusCode === "200") return;

    this.emit(
      "error",
      new Error(`Status error: ${payload.statusDescription || payload.statusCode}`)
    );
  }

  /**
   * Handle incoming WebSocket messages
   * WebSocket can receive empty messages, keep-alive pings, or fragmented frames.
   * Silently ignores messages that cannot be parsed (matching AWS SDK behavior).
   * Delegates SDP_ANSWER, ICE_CANDIDATE, and STATUS_RESPONSE to focused handlers.
   * @param data - WebSocket message data (string or ArrayBuffer)
   */
  private handleMessage(data: string | ArrayBuffer): void {
    const messageText = this.decodeWebSocketData(data);
    if (!messageText) return;

    const message = this.safeJsonParse<SignalingMessage>(messageText);
    if (!message) return;

    const messageType = message.messageType ?? message.action;
    if (!messageType) return;

    const handlers: Record<string, MessageHandler> = {
      SDP_ANSWER: this.handleSdpAnswer.bind(this),
      ICE_CANDIDATE: this.handleIceCandidate.bind(this),
      STATUS_RESPONSE: this.handleStatusResponse.bind(this),
    };

    handlers[messageType]?.(message);
  }

  /**
   * Send SDP offer
   */
  sendSdpOffer(offer: RTCSessionDescription): void {
    if (!this.ws || !this.isConnected) {
      throw new Error("WebSocket not connected");
    }

    // Escape SDP newlines for JSON (iOS does: sdp.replacingOccurrences(of: "\r\n", with: "\\r\\n"))
    // const escapedSdp = offer.sdp.replace(/\r\n/g, "\\r\\n");
    const escapedSdp = offer.sdp;
    const payload = JSON.stringify({ type: "offer", sdp: escapedSdp });
    const encodedPayload = btoa(payload);

    // Message structure matches iOS: action, recipientClientId (empty for master), senderClientId, messagePayload
    const message = {
      action: "SDP_OFFER",
      recipientClientId: "", // Empty when sending to master
      senderClientId: this.config.clientId,
      messagePayload: encodedPayload,
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Send ICE candidate
   */
  sendIceCandidate(candidate: RTCIceCandidate): void {
    if (!this.ws || !this.isConnected) {
      throw new Error("WebSocket not connected");
    }

    // Escape candidate string if it contains newlines
    // const escapedCandidate = candidate.candidate.replace(/\r\n/g, "\\r\\n");
    const escapedCandidate = candidate.candidate;
    const payload = JSON.stringify({
      candidate: escapedCandidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
    });
    const encodedPayload = btoa(payload);

    // For viewer mode: recipientClientId is empty (sending to master), senderClientId is set
    const message = {
      action: "ICE_CANDIDATE",
      recipientClientId: "", // Empty when sending to master
      senderClientId: this.config.clientId,
      messagePayload: encodedPayload,
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Close WebSocket connection
   */
  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}

// Re-export types for convenience
export type {
  AWSCredentials,
  SignalingClientConfig,
  SignalingEventType,
  SignalingEventHandler,
  SignalingMessage,
  MessageHandler,
};
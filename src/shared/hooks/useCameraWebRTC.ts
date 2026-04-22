/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { ESPCDFAssumeRoleResponse } from "@store";
import { useCDF } from "./useCDF";
import { useToast } from "./useToast";
import { useTranslation } from "react-i18next";
import {
  WEBRTC_CONNECTION_STATE,
  WEBRTC_TRANSLATION_KEYS,
  WEBRTC_DEFAULT_MESSAGES,
  WEBRTC_SIGNALING_EVENTS,
} from "@shared/utils/constants";

// WebRTC and AWS KVS imports
import {
  KinesisVideoClient,
  DescribeSignalingChannelCommand,
  GetSignalingChannelEndpointCommand,
} from "@aws-sdk/client-kinesis-video";
import {
  KinesisVideoSignalingClient,
  GetIceServerConfigCommand,
} from "@aws-sdk/client-kinesis-video-signaling";
import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from "react-native-webrtc";
import { KVSSignalingClient, type AWSCredentials } from "@shared/utils/camera/kvsSignalingClient";
import {
  getOrFetchChannelInfo,
  getOrFetchIceServers,
  type IceServer,
  type IceServersFetchResult,
} from "@shared/utils/camera/kvsChannelCache";
import { getVideoStats } from "@shared/utils/camera/getVideoStats";
import { getAwsRegionFromToken } from "@shared/utils/camera/getAwsRegion";
import type { VideoStats } from "@src/types/global";

/**
 * Extended RTCPeerConnection type with event handler properties
 * These are defined via defineEventAttribute in react-native-webrtc but not in TypeScript types
 */
interface ExtendedRTCPeerConnection extends RTCPeerConnection {
  onicecandidate: ((event: { candidate: RTCIceCandidate | null }) => void) | null;
  onconnectionstatechange: (() => void) | null;
  ontrack: ((event: { streams: MediaStream[]; track: any; transceiver: any; receiver: any }) => void) | null;
}

/**
 * Waits for the signaling client WebSocket to open.
 * Resolves immediately on open, rejects on error, so it can be raced
 * in parallel with ICE server credential fetching.
 */
function waitForSignalingOpen(signalingClient: KVSSignalingClient): Promise<void> {
  return new Promise((resolve, reject) => {
    const onOpen = () => {
      signalingClient.off(WEBRTC_SIGNALING_EVENTS.OPEN, onOpen);
      signalingClient.off(WEBRTC_SIGNALING_EVENTS.ERROR, onError);
      resolve();
    };
    const onError = (err: Error) => {
      signalingClient.off(WEBRTC_SIGNALING_EVENTS.OPEN, onOpen);
      signalingClient.off(WEBRTC_SIGNALING_EVENTS.ERROR, onError);
      reject(err);
    };
    signalingClient.on(WEBRTC_SIGNALING_EVENTS.OPEN, onOpen);
    signalingClient.on(WEBRTC_SIGNALING_EVENTS.ERROR, onError);
  });
}

/**
 * Hook for managing WebRTC video streaming for camera devices
 *
 * This hook handles:
 * - Getting AWS credentials via assume role API
 * - Setting up WebRTC connection with AWS Kinesis Video Streams
 * - Managing video stream state
 * - Error handling
 * @param nodeId - The node ID of the camera device
 * @param channelName - The channel name for video streaming
 * @returns Object containing streaming state and control functions
 */
export const useCameraWebRTC = (nodeId: string, channelName: string | null) => {
  const { espCDFUser } = useCDF();
  const toast = useToast();
  const { t } = useTranslation();

  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [credentials, setCredentials] = useState<ESPCDFAssumeRoleResponse | null>(null);
  const [stats, setStats] = useState<VideoStats | null>(null);
  const statsUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const peerConnectionRef = useRef<ExtendedRTCPeerConnection | null>(null);
  const signalingClientRef = useRef<KVSSignalingClient | null>(null);
  const channelARNRef = useRef<string | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const remoteDescriptionSetRef = useRef<boolean>(false);
  const videoStreamSetRef = useRef<boolean>(false);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const awsRegionRef = useRef<string>("us-east-1");

  /** Returns true when temporary AWS keys from assume_role are present. */
  const validateCredentials = (creds: ESPCDFAssumeRoleResponse | null): boolean => {
    if (!creds) return false;
    return Boolean(
      creds.accessKey && creds.secretKey && creds.sessionToken
    );
  };

  /**
   * This function gets the AWS credentials
   * @returns AWS credentials from assume role, or null on failure
   * @throws If the user is not authenticated
   */
  const getCredentials = useCallback(async (): Promise<ESPCDFAssumeRoleResponse | null> => {
    if (!espCDFUser) {
      throw new Error("User not authenticated");
    }
    try {
      const creds = await espCDFUser.assumeRole({
        userRole: "videostream",
        nodeIds: [nodeId],
      });
      setCredentials(creds);
      return creds;
    } catch (err: any) {
      const errorHeader = t("layout.shared.errorHeader") || "Error";
      const errorMessage = err.message || t("device.camera.errors.failedToGetCredentials") || "Failed to get AWS credentials";
      toast.showError(
        errorHeader,
        errorMessage
      );
      setError(errorMessage);
      if (__DEV__) {
        console.error(errorMessage);
      }
      return null;
    }
  }, [espCDFUser, nodeId, toast, t]);

  /**
   * This function validates the channel name
   * @returns True if the channel name is valid, false otherwise
   */
  const validateChannelName = useCallback((): boolean => {
    if (!channelName) {
      const errorMsg = t("device.camera.errors.channelNameRequired") || "Channel name is required";
      const errorHeader = t("layout.shared.errorHeader") || "Error";

      toast.showError(
        errorHeader,
        errorMsg
      );

      setError(errorMsg);
      return false;
    }
    return true;
  }, [channelName, toast, t]);

  /**
   * Reset state for a new stream
   */
  const resetStreamState = useCallback(() => {
    pendingIceCandidatesRef.current = [];
    remoteDescriptionSetRef.current = false;
    videoStreamSetRef.current = false;
  }, []);

  /**
   * Obtain and validate AWS credentials
   */
  const ensureValidCredentials = useCallback(async (): Promise<AWSCredentials | null> => {
    let creds = credentials;
    if (!creds || !validateCredentials(creds)) {
      creds = await getCredentials();
      if (!creds) {
        return null;
      }
    }

    return {
      accessKeyId: creds.accessKey,
      secretAccessKey: creds.secretKey,
      sessionToken: creds.sessionToken,
    };
  }, [credentials, getCredentials]);

  /**
   * Get signaling channel ARN
   * Responsibility: Retrieve the channel ARN for a given channel name
   * @param channelName - The name of the channel
   * @param kinesisVideoClient - The Kinesis Video client instance
   * @returns The channel ARN
   * @throws If the channel ARN is not found
   */
  const getSignalingChannelARN = useCallback(async (
    channelName: string,
    kinesisVideoClient: KinesisVideoClient
  ): Promise<string> => {
    const describeSignalingChannelResponse = await kinesisVideoClient.send(
      new DescribeSignalingChannelCommand({ ChannelName: channelName })
    );
    const channelARN = describeSignalingChannelResponse.ChannelInfo?.ChannelARN;

    if (!channelARN) {
      throw new Error("Failed to get KVS signaling channel ARN. Channel may not exist.");
    }

    channelARNRef.current = channelARN;
    return channelARN;
  }, []);

  /**
   * Get signaling channel endpoints
   * Responsibility: Retrieve WSS and HTTPS endpoints for a given channel ARN
   * @param channelARN - The channel ARN
   * @param kinesisVideoClient - The Kinesis Video client instance
   * @returns WSS and HTTPS signaling endpoints
   * @throws If the endpoints are not found
   */
  const getSignalingChannelEndpoints = useCallback(async (
    channelARN: string,
    kinesisVideoClient: KinesisVideoClient
  ): Promise<{ wssEndpoint: string; httpsEndpoint: string }> => {
    const getSignalingChannelEndpointResponse = await kinesisVideoClient.send(
      new GetSignalingChannelEndpointCommand({
        ChannelARN: channelARN,
        SingleMasterChannelEndpointConfiguration: {
          Protocols: ["WSS", "HTTPS"],
          Role: "VIEWER",
        },
      })
    );

    const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList?.reduce(
      (endpoints, endpoint) => {
        if (endpoint.Protocol && endpoint.ResourceEndpoint) {
          endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
        }
        return endpoints;
      },
      {} as Record<string, string>
    );

    const wssEndpoint = endpointsByProtocol?.WSS;
    const httpsEndpoint = endpointsByProtocol?.HTTPS;

    if (!wssEndpoint || !httpsEndpoint) {
      throw new Error("Failed to get KVS signaling endpoints.");
    }

    return { wssEndpoint, httpsEndpoint };
  }, []);

  /**
   * Discover KVS channel
   * Responsibility: Orchestrate channel discovery by getting ARN and endpoints.
   * Results are cached with a 24 h TTL. Concurrent callers for the same channel
   * are deduplicated – only one DescribeSignalingChannel + endpoint request is
   * made even if startStreaming and the pre-warm effect race on a fresh launch.
   * @param channelName - The name of the channel to discover
   * @param awsCredentials - The AWS credentials to use for the discovery
   * @returns Channel ARN and signaling endpoints
   * @throws If the KVS channel information is not found
   */
  const discoverKVSChannel = useCallback(async (
    channelName: string,
    awsCredentials: AWSCredentials
  ): Promise<{ channelARN: string; wssEndpoint: string; httpsEndpoint: string }> => {
    const info = await getOrFetchChannelInfo(channelName, async () => {
      const kinesisVideoClient = new KinesisVideoClient({
        region: awsRegionRef.current,
        credentials: awsCredentials,
      });

      const channelARN = await getSignalingChannelARN(channelName, kinesisVideoClient);
      const { wssEndpoint, httpsEndpoint } = await getSignalingChannelEndpoints(channelARN, kinesisVideoClient);

      return { channelARN, wssEndpoint, httpsEndpoint };
    });

    channelARNRef.current = info.channelARN;
    return info;
  }, [getSignalingChannelARN, getSignalingChannelEndpoints]);

  /**
   * Get ICE server configuration
   * Responsibility: Configure ICE servers for WebRTC.
   * Results are cached for 240 s (AWS credentials expire at 300 s). Concurrent
   * callers for the same channel are deduplicated – only one GetIceServerConfig
   * request is made even if startStreaming and the pre-warm effect race.
   */
  const getIceServerConfiguration = useCallback(async (
    channelName: string,
    channelARN: string,
    httpsEndpoint: string,
    awsCredentials: AWSCredentials
  ): Promise<IceServer[]> => {
    return getOrFetchIceServers(channelName, async (): Promise<IceServersFetchResult> => {
      const kinesisVideoSignalingChannelsClient = new KinesisVideoSignalingClient({
        region: awsRegionRef.current,
        credentials: awsCredentials,
        endpoint: httpsEndpoint,
      });

      const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient.send(
        new GetIceServerConfigCommand({ ChannelARN: channelARN })
      );

      const servers: IceServer[] = getIceServerConfigResponse.IceServerList?.map((iceServer) => ({
        urls: iceServer.Uris || [],
        username: iceServer.Username,
        credential: iceServer.Password,
      })) || [];

      servers.push({
        urls: [`stun:stun.kinesisvideo.${awsRegionRef.current}.amazonaws.com:443`],
      });

      // Derive TTL from the API response so the cache expires 60 s before credentials do
      const responseTtl = getIceServerConfigResponse.IceServerList?.[0]?.Ttl;
      const ttlMs = responseTtl ? (responseTtl - 60) * 1000 : undefined;

      return { servers, ttlMs };
    });
  }, []);

  /**
   * Generate UUID v4
   * Responsibility: Generate unique client ID
   */
  const generateUUID = useCallback((): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  /**
   * Create signaling client only (without a peer connection).
   * Called before ICE server fetch so the WebSocket handshake can overlap
   * with the GetIceServerConfig round-trip.
   */
  const createSignalingClient = useCallback((
    channelARN: string,
    wssEndpoint: string,
    awsCredentials: AWSCredentials
  ): KVSSignalingClient => {
    const localSenderClientID = generateUUID();
    const signalingClient = new KVSSignalingClient({
      channelARN,
      channelEndpoint: wssEndpoint,
      clientId: localSenderClientID,
      region: awsRegionRef.current,
      credentials: awsCredentials,
    });
    signalingClientRef.current = signalingClient;
    return signalingClient;
  }, [generateUUID]);

  /**
   * Create peer connection with resolved ICE servers.
   * Called after both the signaling WebSocket is open and ICE servers are ready.
   */
  const createPeerConnection = useCallback((
    iceServers: IceServer[]
  ): ExtendedRTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({ iceServers }) as ExtendedRTCPeerConnection;
    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, []);

  /**
   * Setup signaling client event handlers
   * Responsibility: Handle signaling protocol events (SDP_ANSWER, ICE_CANDIDATE, CLOSE, ERROR).
   * NOTE: The OPEN handler is intentionally omitted – offer creation is done
   * explicitly in startStreaming after the parallel ICE + connect phase.
   */
  const setupSignalingClientHandlers = useCallback((
    signalingClient: KVSSignalingClient,
    peerConnection: ExtendedRTCPeerConnection
  ) => {
    signalingClient.on(WEBRTC_SIGNALING_EVENTS.SDP_ANSWER, async (answer: RTCSessionDescription) => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("setRemoteDescription timeout after 10 seconds")), 10000);
        });

        await Promise.race([
          peerConnection.setRemoteDescription(answer),
          timeoutPromise,
        ]);

        remoteDescriptionSetRef.current = true;

        // Flush ICE candidates that arrived before the SDP answer
        const pendingCandidates = pendingIceCandidatesRef.current;
        if (pendingCandidates.length > 0) {
          for (let i = 0; i < pendingCandidates.length; i++) {
            try {
              await peerConnection.addIceCandidate(pendingCandidates[i]);
            } catch {
              // ICE candidate errors are often non-fatal
            }
          }
          pendingIceCandidatesRef.current = [];
        }
      } catch (err: any) {
        setError(err?.message || "Failed to set remote description");
        setIsLoading(false);
      }
    });

    signalingClient.on(WEBRTC_SIGNALING_EVENTS.ICE_CANDIDATE, async (candidate: RTCIceCandidate) => {
      if (!remoteDescriptionSetRef.current) {
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch {
        // ICE candidate errors are often non-fatal
      }
    });

    signalingClient.on(WEBRTC_SIGNALING_EVENTS.CLOSE, () => {
      setIsStreaming(false);
    });

    signalingClient.on(WEBRTC_SIGNALING_EVENTS.ERROR, (err: Error) => {
      const errorMessage = err.message || t("device.camera.errors.signalingError") || "Signaling error occurred";
      setError(errorMessage);
      setIsStreaming(false);
      setIsLoading(false);
      toast.showError(
        t("layout.shared.errorHeader") || "Error",
        errorMessage
      );
    });
  }, [toast, t]);

  /**
   * Create ICE candidate handler
   * Responsibility: Create handler function for ICE candidate events
   * @param signalingClient - The signaling client to send candidates through
   * @returns Handler function for onicecandidate event
   */
  const createIceCandidateHandler = useCallback((
    signalingClient: KVSSignalingClient
  ): ((event: { candidate: RTCIceCandidate | null }) => void) => {
    return ({ candidate }: { candidate: RTCIceCandidate | null }) => {
      if (candidate && candidate.candidate) {
        signalingClient.sendIceCandidate(candidate);
      }
    };
  }, []);

  /**
   * Create connection state change handler
   * Responsibility: Create handler function for connection state changes
   * @param peerConnection - The RTCPeerConnection instance to track state
   * @returns Handler function for onconnectionstatechange event
   */
  const createConnectionStateChangeHandler = useCallback((
    peerConnection: ExtendedRTCPeerConnection
  ): (() => void) => {
    let previousState = peerConnection.connectionState;

    return () => {
      const state = peerConnection.connectionState;

      if (state !== previousState) {
        previousState = state;

        if (state === WEBRTC_CONNECTION_STATE.CONNECTED || state === WEBRTC_CONNECTION_STATE.CONNECTING) {
          setIsStreaming(true);
        } else if (state === WEBRTC_CONNECTION_STATE.DISCONNECTED || state === WEBRTC_CONNECTION_STATE.CLOSED) {
          setIsStreaming(false);
        } else if (state === WEBRTC_CONNECTION_STATE.FAILED) {
          const errorHeader = t(WEBRTC_TRANSLATION_KEYS.ERROR_HEADER) || WEBRTC_DEFAULT_MESSAGES.ERROR;
          const errorMsg = t(WEBRTC_TRANSLATION_KEYS.CONNECTION_FAILED) || WEBRTC_DEFAULT_MESSAGES.CONNECTION_FAILED;

          setError(errorMsg);
          setIsLoading(false);
          setIsStreaming(false);
          toast.showError(errorHeader, errorMsg);
        }
      }
    };
  }, [toast, t]);

  /**
   * Create track handler
   * Responsibility: Create handler function for incoming media tracks
   * @returns Handler function for ontrack event
   */
  const createTrackHandler = useCallback((): ((event: { streams: MediaStream[]; track: any; transceiver: any; receiver: any }) => void) => {
    return (event: { streams: MediaStream[]; track: any; transceiver: any; receiver: any }) => {
      if (videoStreamSetRef.current) return;

      if (event.streams && event.streams.length > 0) {
        const stream = event.streams[0] as MediaStream;
        if (stream.getVideoTracks().length > 0) {
          videoStreamSetRef.current = true;
          videoStreamRef.current = stream;
          setVideoStream(stream);
          setIsStreaming(true);
          setIsLoading(false);
        }
      }
    };
  }, []);

  /**
   * Setup peer connection event handlers
   * Responsibility: Attach all peer connection event handlers inline
   * @param peerConnection - The RTCPeerConnection instance
   * @param signalingClient - The signaling client instance
   */
  const setupPeerConnectionHandlers = useCallback((
    peerConnection: ExtendedRTCPeerConnection,
    signalingClient: KVSSignalingClient
  ) => {
    peerConnection.onicecandidate = createIceCandidateHandler(signalingClient);
    peerConnection.onconnectionstatechange = createConnectionStateChangeHandler(peerConnection);
    peerConnection.ontrack = createTrackHandler();
  }, [createIceCandidateHandler, createConnectionStateChangeHandler, createTrackHandler]);

  /**
   * Reusable cleanup function for WebRTC resources
   * @param updateState - Whether to update React state (set to false for unmount cleanup)
   */
  const cleanupResources = useCallback((updateState: boolean = true) => {
    try {
      if (updateState) {
        setIsStreaming(false);
        setVideoStream(null);
        setError(null);
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.onconnectionstatechange = null;
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (signalingClientRef.current) {
        signalingClientRef.current.close();
        signalingClientRef.current = null;
      }

      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
        videoStreamRef.current = null;
      }

      channelARNRef.current = null;
      pendingIceCandidatesRef.current = [];
      remoteDescriptionSetRef.current = false;
      videoStreamSetRef.current = false;
    } catch (err) {
      if (__DEV__) {
        console.error("Error during cleanup:", err);
      }
    }
  }, []);

  /**
   * Handle streaming errors
   * Responsibility: Handle errors and cleanup
   */
  const handleStreamingError = useCallback((err: any) => {
    const errorMessage = err?.message || t("device.camera.errors.failedToStartStreaming") || "Failed to start streaming";
    setError(errorMessage);
    setIsStreaming(false);
    setIsLoading(false);
    toast.showError(
      t("layout.shared.errorHeader") || "Error",
      errorMessage
    );
    if (__DEV__) {
      console.error(err);
    }
    cleanupResources(true);
  }, [toast, t, cleanupResources]);

  /**
   * Start video streaming
   * Flow:
   * 1. Region + credentials resolved in parallel.
   * 2. Channel info fetched (from cache or API).
   * 3. Signaling WebSocket opened AND ICE credentials fetched in parallel.
   * 4. Peer connection created with ICE servers (already available by step 3).
   * 5. SDP offer created and sent immediately
   */
  const startStreaming = useCallback(async () => {
    if (!validateChannelName()) return;

    try {
      setIsLoading(true);
      setError(null);
      resetStreamState();

      // Resolve region + credentials in parallel
      const [, awsCredentials] = await Promise.all([
        getAwsRegionFromToken().then((r) => {
          awsRegionRef.current = r;
          return r;
        }),
        ensureValidCredentials(),
      ]);
      if (!awsCredentials) return;

      // Channel discovery (cache hit skips two API calls)
      const { channelARN, wssEndpoint, httpsEndpoint } = await discoverKVSChannel(
        channelName!,
        awsCredentials
      );

      // Create signaling client early so the WebSocket handshake starts
      // immediately, overlapping with the ICE credential fetch below.
      const signalingClient = createSignalingClient(channelARN, wssEndpoint, awsCredentials);

      // ICE credential fetch and signaling connect run in parallel.
      // By the time both settle, ICE servers are ready and the WebSocket is open.
      const [iceServers] = await Promise.all([
        getIceServerConfiguration(channelName!, channelARN, httpsEndpoint, awsCredentials),
        (async () => {
          signalingClient.open();
          await waitForSignalingOpen(signalingClient);
        })(),
      ]);

      // Create peer connection with the ICE servers that are now available
      const peerConnection = createPeerConnection(iceServers);

      // Attach signaling handlers (SDP_ANSWER, ICE_CANDIDATE, CLOSE, ERROR)
      setupSignalingClientHandlers(signalingClient, peerConnection);

      // Attach peer connection handlers
      setupPeerConnectionHandlers(peerConnection, signalingClient);

      // Send offer immediately – WebSocket is already open, no onopen wait needed
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peerConnection.setLocalDescription(offer);
      signalingClient.sendSdpOffer(offer);
    } catch (err: any) {
      handleStreamingError(err);
    }
  }, [
    channelName,
    validateChannelName,
    resetStreamState,
    ensureValidCredentials,
    discoverKVSChannel,
    getIceServerConfiguration,
    createSignalingClient,
    createPeerConnection,
    setupSignalingClientHandlers,
    setupPeerConnectionHandlers,
    handleStreamingError,
  ]);

  /**
   * Stop video streaming
   */
  const stopStreaming = useCallback(() => {
    cleanupResources(true);
  }, [cleanupResources]);

  // Cleanup WebRTC resources on unmount
  useEffect(() => {
    return () => {
      cleanupResources(false);
    };
  }, [cleanupResources]);

  /**
   * Credentials + channel info + ICE server fetch when the
   * hook mounts so credentials, channel info, and ICE servers are resolved before the user taps play.
   */
  useEffect(() => {
    if (!channelName?.trim() || !nodeId || !espCDFUser) return;
    let cancelled = false;

    (async () => {
      try {
        const [region, creds] = await Promise.all([
          getAwsRegionFromToken(),
          ensureValidCredentials(),
        ]);
        if (cancelled || !creds) return;
        awsRegionRef.current = region;

        const channelInfo = await discoverKVSChannel(channelName.trim(), creds);
        if (cancelled) return;

        await getIceServerConfiguration(
          channelName.trim(),
          channelInfo.channelARN,
          channelInfo.httpsEndpoint,
          creds
        );
      } catch {
        if (__DEV__) {
          console.error("Error fetching credentials, channel info, and ICE servers");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [channelName, nodeId, espCDFUser, ensureValidCredentials, discoverKVSChannel, getIceServerConfiguration]);

  /**
   * Get stats from peer connection
   * Uses the shared getVideoStats utility function
   * @param peerConnection - The RTCPeerConnection instance to get stats from
   * @returns Parsed video stats or null if unavailable
   */
  const getStats = useCallback(async (
    peerConnection: ExtendedRTCPeerConnection | null
  ): Promise<VideoStats | null> => {
    return getVideoStats(peerConnection);
  }, []);

  /**
   * Enable or disable periodic stats updates
   * Responsibility: Manage stats update interval based on visibility and playing state
   * @param enabled - Whether to enable stats updates
   * @param isPlaying - Whether video is currently playing
   */
  const setStatsUpdatesEnabled = useCallback((enabled: boolean, isPlaying: boolean) => {
    if (statsUpdateTimerRef.current) {
      clearInterval(statsUpdateTimerRef.current);
      statsUpdateTimerRef.current = null;
    }

    if (enabled && isPlaying && peerConnectionRef.current) {
      getStats(peerConnectionRef.current)
        .then((statsData) => {
          setStats(statsData);
        })
        .catch(() => {
          // Error fetching stats - silently handle
        });

      statsUpdateTimerRef.current = setInterval(() => {
        if (peerConnectionRef.current) {
          getStats(peerConnectionRef.current).then(setStats);
        }
      }, 1000);
    } else {
      if (!enabled) {
        setStats(null);
      }
    }
  }, [getStats]);

  // Cleanup stats timer on unmount
  useEffect(() => {
    return () => {
      if (statsUpdateTimerRef.current) {
        clearInterval(statsUpdateTimerRef.current);
        statsUpdateTimerRef.current = null;
      }
    };
  }, []);

  const getConnectionState = (): "connected" | "disconnected" | "live" | "error" => {
    if (error) return "error";
    if (isStreaming && videoStream) return "live";
    if (isStreaming || isLoading) return "connected";
    return "disconnected";
  };

  return {
    isStreaming,
    isLoading,
    error,
    videoStream,
    startStreaming,
    stopStreaming,
    peerConnection: peerConnectionRef.current,
    connectionState: getConnectionState(),
    stats,
    getStats,
    setStatsUpdatesEnabled,
  };
};

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { RTCPeerConnection } from "react-native-webrtc";
import type { VideoStats } from "@src/types/global";

/**
 * Extended RTCPeerConnection type with event handler properties
 * These are defined via defineEventAttribute in react-native-webrtc but not in TypeScript types
 */
interface ExtendedRTCPeerConnection extends RTCPeerConnection {
  onicecandidate: ((event: { candidate: any | null }) => void) | null;
  onconnectionstatechange: (() => void) | null;
  ontrack: ((event: { streams: any[]; track: any; transceiver: any; receiver: any }) => void) | null;
}

/**
 * Get stats from peer connection
 * Responsibility: Fetch and parse WebRTC stats from RTCPeerConnection
 * This function extracts video and network statistics from WebRTC stats reports.
 * It handles both Map and Array responses from getStats() and parses:
 * - Video stats: resolution, FPS, frames dropped, codec
 * - Network stats: bitrate, total data, packets, loss percentage, jitter
 * @param peerConnection - The RTCPeerConnection instance to get stats from
 * @returns Parsed video stats or null if unavailable
 */
export const getVideoStats = async (
  peerConnection: ExtendedRTCPeerConnection | RTCPeerConnection | null
): Promise<VideoStats | null> => {
  if (!peerConnection) {
    return null;
  }

  try {
    const statsReport = await peerConnection.getStats();

    // Handle both Map and Array responses
    let reportsArray: any[] = [];
    if (statsReport instanceof Map) {
      reportsArray = Array.from(statsReport.values());
    } else if (Array.isArray(statsReport)) {
      reportsArray = statsReport;
    } else {
      return null;
    }

    if (reportsArray.length === 0) {
      return null;
    }

    const statsMap: any = {};
    reportsArray.forEach((report: any) => {
      statsMap[report.id] = report;
    });

    // Find video track stats
    let videoStats: any = null;
    let inboundRtpStats: any = null;

    for (const report of reportsArray) {
      if (report.type === "track" && report.kind === "video") {
        videoStats = report;
      }
      if (report.type === "inbound-rtp" && report.mediaType === "video") {
        inboundRtpStats = report;
      }
    }

    if (!videoStats && !inboundRtpStats) {
      return null;
    }

    // Extract stats similar to iOS implementation
    const frameWidth = videoStats?.frameWidth || inboundRtpStats?.frameWidth || 0;
    const frameHeight = videoStats?.frameHeight || inboundRtpStats?.frameHeight || 0;
    const framesPerSecond =
      videoStats?.framesPerSecond || inboundRtpStats?.framesPerSecond || 0;
    const framesDropped =
      inboundRtpStats?.framesDropped || videoStats?.framesDropped || 0;
    const bytesReceived = inboundRtpStats?.bytesReceived || 0;
    const packetsReceived = inboundRtpStats?.packetsReceived || 0;
    const packetsLost = inboundRtpStats?.packetsLost || 0;
    const jitter = inboundRtpStats?.jitter || 0;
    const codecId = inboundRtpStats?.codecId;

    // Find codec info
    let codecName = "Unknown";
    if (codecId) {
      const codecReport = statsMap[codecId];
      if (codecReport) {
        codecName = codecReport.mimeType || codecReport.name || "Unknown";
      }
    }

    // Calculate bitrate (simplified - using current bytes received)
    // In a real implementation, we'd track bytes over time
    const durationSeconds = 1; // For per-second calculation
    const bitrate =
      durationSeconds > 0 ? (bytesReceived * 8) / durationSeconds / 1000 : 0; // kbps

    // Calculate packet loss percentage
    const totalPackets = packetsReceived + packetsLost;
    const packetLossPercent =
      totalPackets > 0 ? (packetsLost * 100.0) / totalPackets : 0;

    // Calculate bytes in MB
    const bytesReceivedMB = bytesReceived / (1024.0 * 1024.0);

    // Calculate FPS metrics (simplified - would need to track over time for accurate received/dropped FPS)
    const receivedFps = framesPerSecond;
    const droppedFps = framesDropped; // This would need to be calculated as delta

    const statsData: VideoStats = {
      // VIDEO
      resolution: `${frameWidth} x ${frameHeight}`,
      currentFps: framesPerSecond.toFixed(1),
      receivedFps: receivedFps.toFixed(1),
      droppedFps: droppedFps.toFixed(1),
      framesDropped: framesDropped.toString(),
      codec: codecName,
      // NETWORK
      bitrate: `${Math.round(bitrate)} kbps`,
      totalData: `${bytesReceivedMB.toFixed(2)} MB`,
      packetsRx: packetsReceived.toString(),
      packetsLost: packetsLost.toString(),
      lossPercent: `${packetLossPercent.toFixed(2)}%`,
      jitter: `${(jitter * 1000).toFixed(2)} ms`,
    };

    return statsData;
  } catch {
    return null;
  }
};

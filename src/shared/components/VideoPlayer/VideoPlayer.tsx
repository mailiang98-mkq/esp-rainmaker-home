/*
 * SPDX-FileCopyrightText: 2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from "react";
import { View, Text } from "react-native";
import { Portal } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

// WebRTC
import { RTCView } from "react-native-webrtc";

// Styles
import { videoPlayerStyles } from "@shared/theme/VideoPlayerStyle";

// Components
import Controls from "./Controls";
import Stats from "./Stats";

// Utils
import { testProps } from "@shared/utils/testProps";

// Types
import type { VideoPlayerProps } from "@src/types/global";

/**
 * VideoPlayer Component
 * A YouTube-style video player component that displays:
 * - Video preview/placeholder with centered play button
 * - Fullscreen toggle button when playing
 * - Fullscreen mode with device orientation handled by expo-screen-orientation
 * @param props - VideoPlayer component props
 * @returns JSX component for video player
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  isPlaying,
  onPlayPress,
  onFullscreenPress,
  isFullscreen,
  videoStream,
  isLoading = false,
  error = null,
  connectionState = "disconnected",
  stats = null,
  setStatsUpdatesEnabled,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [showStats, setShowStats] = useState(false);
  const insets = useSafeAreaInsets();

  // Handle stats button press (info icon)
  const handleStatsPress = useCallback(() => {
    setShowStats(prev => !prev);
  }, []);

  // Handle tap to dismiss stats
  const handleTapToDismiss = useCallback(() => {
    if (showStats) {
      setShowStats(false);
    }
  }, [showStats]);

  // Portrait mode video player (fits to parent container) - Only show when not fullscreen
  const portraitPlayer = !isFullscreen ? (
    <View {...testProps("view_video_player")}>
      {/* Video Container */}
      <View style={videoPlayerStyles.container}>
        <View style={videoPlayerStyles.videoContainer}>
          {!isPlaying && !error && (
            <View style={videoPlayerStyles.placeholderContainer}>
              <View style={videoPlayerStyles.placeholderBackground} />
            </View>
          )}

          {isLoading && (
            <View style={videoPlayerStyles.loadingContainer}>
              <Text style={videoPlayerStyles.loadingText}>{t("device.camera.loading")}</Text>
            </View>
          )}

          {error && (
            <View style={videoPlayerStyles.errorContainer}>
              {/* Error message can be added here */}
            </View>
          )}

          {isPlaying && videoStream && (
            <RTCView
              streamURL={videoStream.toURL()}
              style={videoPlayerStyles.videoElement}
              objectFit="contain"
              mirror={false}
              zOrder={0}
            />
          )}
        </View>
      </View>

      {/* Controls Component - outside video container, right-aligned */}
      <Controls
        isPlaying={isPlaying}
        isFullscreen={false}
        hasVideoStream={!!videoStream}
        isLoading={isLoading}
        error={error}
        connectionState={connectionState}
        disabled={disabled}
        onPlayPress={onPlayPress}
        onFullscreenPress={onFullscreenPress}
        onLongPress={undefined}
        onStatsPress={handleStatsPress}
      />

      {/* Stats Component - inline in portrait mode */}
      <Stats
        isVisible={showStats}
        isFullscreen={false}
        isPlaying={isPlaying}
        stats={stats}
        setStatsUpdatesEnabled={setStatsUpdatesEnabled}
        onDismiss={handleTapToDismiss}
      />
    </View>
  ) : null;

  // Fullscreen mode video player (using Portal)
  // Device orientation is handled by expo-screen-orientation, so no manual rotation needed
  // Hide status bar and extend into safe areas for true fullscreen
  const fullscreenPlayer = isFullscreen ? (
    <Portal>
      <View
        style={[
          videoPlayerStyles.fullscreenContainer,
          {
            // Extend into safe areas to cover entire screen including status bar and notch areas
            top: -insets.top,
            left: -insets.left,
            bottom: -insets.bottom,
            right: -insets.right,
          },
        ]}
      >
        {/* Video Container - fills entire screen */}
        {!isPlaying && !error && (
          <View style={videoPlayerStyles.placeholderContainer}>
            <View style={videoPlayerStyles.placeholderBackground} />
          </View>
        )}

        {isLoading && (
          <View style={videoPlayerStyles.loadingContainer}>
            <Text style={videoPlayerStyles.loadingText}>{t("device.camera.loading")}</Text>
          </View>
        )}

        {error && (
          <View style={videoPlayerStyles.errorContainer}>
            {/* Error message can be added here */}
          </View>
        )}

        {isPlaying && videoStream && (
          <RTCView
            streamURL={videoStream.toURL()}
            style={videoPlayerStyles.videoElement}
            objectFit="contain"
            mirror={false}
            zOrder={0}
          />
        )}

        {/* Controls Component - overlay in fullscreen */}
        <Controls
          isPlaying={isPlaying}
          isFullscreen={true}
          hasVideoStream={!!videoStream}
          isLoading={isLoading}
          error={error}
          connectionState={connectionState}
          disabled={disabled}
          onPlayPress={onPlayPress}
          onFullscreenPress={onFullscreenPress}
          onLongPress={undefined}
          onStatsPress={handleStatsPress}
        />

        {/* Stats Component */}
        <Stats
          isVisible={showStats}
          isFullscreen={isFullscreen}
          isPlaying={isPlaying}
          stats={stats}
          setStatsUpdatesEnabled={setStatsUpdatesEnabled}
          onDismiss={handleTapToDismiss}
        />
      </View>
    </Portal>
  ) : null;

  return (
    <>
      {/* Hide status bar when in fullscreen */}
      {isFullscreen && <StatusBar hidden={true} />}
      {portraitPlayer}
      {fullscreenPlayer}
    </>
  );
};

export default VideoPlayer;
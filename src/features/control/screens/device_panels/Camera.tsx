/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";


// Hooks
import { useTranslation } from "react-i18next";
import { useCameraWebRTC } from "@shared/hooks/useCameraWebRTC";

// State Management
import { observer } from "mobx-react-lite";

// Components
import { VideoPlayer, DeviceParamsRenderer, WarningBanner } from "@shared/components";

// Utils
import { testProps } from "@shared/utils/testProps";
import { filterDeviceParamsByType, buildParamsMap } from "@shared/utils/deviceParams";

// Types
import { ControlPanelProps } from "@src/types/global";

// Constants
import {
  ESPRM_NAME_PARAM_TYPE,
  ESPRM_UI_HIDDEN_PARAM_TYPE,
  ESPRM_CHANNEL_PARAM_TYPE,
} from "@shared/utils/constants";
import { tokens } from "@shared/theme/tokens";

/**
 * Camera Control Panel Component
 * A control panel for camera devices that supports:
 * - YouTube-style video player with play button
 * - Fullscreen toggle (portrait ↔ landscape)
 * - WebRTC video streaming via AWS Kinesis Video Streams
 * - Display of all other device parameters
 * - Warning banner for connection and channel name issues
 * @param props - Component props
 * @param props.node - The ESPRMNode representing the camera device
 * @param props.device - The ESPRMDevice representing the camera device
 * @returns The rendered camera control panel component
 */
const Camera: React.FC<ControlPanelProps> = ({ node, device }) => {
  // Hooks
  const { t } = useTranslation();

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Computed Values
  const isConnected = node.connectivityStatus?.isConnected || false ;
  const nodeId = node.id;

  // Get channel parameter for video streaming
  const channelParam = device?.params?.find(
    (param) => param.type === ESPRM_CHANNEL_PARAM_TYPE
  );
  const channelName = channelParam?.value as string | null;

  // WebRTC hook
  const {
    isStreaming,
    isLoading,
    error,
    videoStream,
    startStreaming,
    stopStreaming,
    connectionState,
    stats,
    setStatsUpdatesEnabled,
  } = useCameraWebRTC(nodeId, channelName);

  // filtered params (excluding channel and hidden params)
  const filteredParams = useMemo(() => {
    return filterDeviceParamsByType(device?.params, [
      ESPRM_CHANNEL_PARAM_TYPE,
      ESPRM_NAME_PARAM_TYPE,
      ESPRM_UI_HIDDEN_PARAM_TYPE,
    ]);
  }, [device?.params]);

  // Create params map for rendering (memoized for performance)
  const paramsMap = useMemo(() => buildParamsMap(), []);

  // Warning message computation
  const warningMessage = useMemo(() => {
    if (!isConnected) {
      return t("device.errors.deviceNotConnected");
    }
    if (!channelName) {
      return t("device.camera.errors.channelNameRequired");
    }
    return null;
  }, [isConnected, channelName, t]);

  // Handlers
  /**
   * Handles the refresh action for device parameters.
   * Fetches the latest device parameters from the device and updates
   * the local device state. Manages the refreshing state during the operation.
   * @returns Promise that resolves when the refresh operation completes
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const params = await device?.getParams();
      if (device && params) {
        device.params = params;
      }
    } catch (error) {
      if(__DEV__) {
        console.error("Failed to refresh device state:", error);
      }
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Handles the play/pause button press for video streaming.
   * Toggles between starting and stopping the video stream. If the device
   * is not connected or channel name is missing, the function returns early
   * (a warning banner will be displayed in the UI).
   */
  const handlePlayPress = () => {
    // Early return if conditions are not met (warning will be shown in UI)
    if (!isConnected || !channelName) {
      return;
    }

    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  /**
   * Toggles the fullscreen mode state.
   * Switches between fullscreen and normal view modes for the video player.
   * Locks screen orientation to landscape when entering fullscreen,
   * and unlocks it when exiting fullscreen.
   * Uses functional state update to ensure correct state transitions.
   * @returns Promise that resolves when orientation change completes
   */
  const toggleFullscreen = async () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);

    try {
      if (newFullscreenState) {
        // Lock to landscape when entering fullscreen
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        NavigationBar.setBackgroundColorAsync(tokens.colors.black);
      } else {
        // Lock to portrait orientation when exiting fullscreen
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        NavigationBar.setBackgroundColorAsync(tokens.colors.white);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Failed to change screen orientation:", error);
      }
    }
  };

  // Cleanup: restore portrait orientation and white navigation bar when component unmounts
  useEffect(() => {
    return () => {
      // Restore portrait orientation and white navigation bar on unmount
      Promise.all([
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP),
        NavigationBar.setBackgroundColorAsync(tokens.colors.white),
      ]).catch((error) => {
        if (__DEV__) {
          console.error("Failed to restore orientation and navigation bar on unmount:", error);
        }
      });
    };
  }, []);

  return (
    <View
      style={styles.container}
      {...testProps("view_camera")}
    >
      <ScrollView
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            enabled={isConnected}
          />
        }
        {...testProps("scroll_camera")}
      >
        {/* Warning Banner */}
        {warningMessage && (
          <WarningBanner
            message={warningMessage}
            qaId="camera_warning"
          />
        )}

        {/* Video Player */}
        <View>
          <VideoPlayer
            isPlaying={isStreaming}
            onPlayPress={handlePlayPress}
            onFullscreenPress={toggleFullscreen}
            isFullscreen={isFullscreen}
            videoStream={videoStream}
            isLoading={isLoading}
            error={error}
            connectionState={connectionState}
            stats={stats}
            setStatsUpdatesEnabled={setStatsUpdatesEnabled}
            disabled={!isConnected}
          />
        </View>

        {/* Other Parameters */}
        <DeviceParamsRenderer
          params={filteredParams}
          allParams={device?.params || []}
          isConnected={isConnected}
          onSetUpdating={(s) => {
            setScrollEnabled(!s);
          }}
          paramsMap={paramsMap}
        />
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
});


export default observer(Camera);


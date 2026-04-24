/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, Pressable, TouchableOpacity, ScrollView, Animated } from "react-native";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { tokens } from "@shared/theme/tokens";
import { videoPlayerStyles } from "@shared/theme/VideoPlayerStyle";
import { testProps } from "@shared/utils/testProps";
import type { StatsProps } from "@src/types/global";
import { StatsContent } from "./StatsContent";

/**
 * Stats Component
 *
 * Handles video statistics display:
 * - Receives stats from useCameraWebRTC hook via props
 * - Manages stats updates by calling setStatsUpdatesEnabled when visibility changes
 * - Displays video and network statistics using StatsContent component
 * - Handles tap to dismiss and animations
 *
 * Follows Single Responsibility Principle - only responsible for stats display and layout
 */
const Stats: React.FC<StatsProps> = ({
  isVisible,
  isFullscreen,
  isPlaying,
  stats,
  setStatsUpdatesEnabled,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(-300)).current; // Start off-screen to the left
  const backdropOpacity = useRef(new Animated.Value(0)).current; // Start transparent

  // Enable/disable stats updates when visibility changes
  useEffect(() => {
    if (setStatsUpdatesEnabled) {
      setStatsUpdatesEnabled(isVisible, isPlaying);
    }
  }, [isVisible, isPlaying, setStatsUpdatesEnabled]);

  // Animate drawer slide in/out and backdrop opacity
  useEffect(() => {
    if (isVisible && isFullscreen) {
      // Slide in from left and fade in backdrop
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out to left and fade out backdrop
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, isFullscreen, slideAnim, backdropOpacity]);


  // Portrait mode: Inline stats display (no background, no close button, full height)
  if (!isFullscreen) {
    if (!isVisible) {
      return null;
    }

    return (
      <View style={videoPlayerStyles.statsPortraitWrapper}>
        <StatsContent stats={stats} />
      </View>
    );
  }

  // Fullscreen mode: Drawer from left
  return (
    <>
      {/* Backdrop overlay - tap to dismiss - animated opacity */}
      <Animated.View
        style={[
          videoPlayerStyles.statsOverlay,
          {
            opacity: backdropOpacity,
          },
        ]}
        pointerEvents={isVisible ? "auto" : "none"}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          hitSlop={0}
        />
      </Animated.View>

      {/* Stats Drawer from left - animated */}
      <Animated.View
        style={[
          videoPlayerStyles.statsDrawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header with title and close button */}
        <View style={videoPlayerStyles.statsHeader}>
          <Text style={videoPlayerStyles.statsTitle}>{t("device.camera.stats.title")}</Text>
          <TouchableOpacity
            style={videoPlayerStyles.statsCloseButton}
            onPress={onDismiss}
            {...testProps("button_stats_close")}
          >
            <X size={18} color={tokens.colors.black} />
          </TouchableOpacity>
        </View>

        {/* Scrollable stats content */}
        <ScrollView 
          style={videoPlayerStyles.statsContainer}
          showsVerticalScrollIndicator={false}
        >
          <StatsContent stats={stats} />
        </ScrollView>
      </Animated.View>
    </>
  );
};

export default Stats;

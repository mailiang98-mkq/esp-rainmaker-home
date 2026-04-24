/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { videoPlayerStyles as s } from "@shared/theme/VideoPlayerStyle";
import type { VideoStats } from "@src/types/global";

/**
 * Stat Row Component
 * Displays a single stat label-value pair
 */
const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={s.statItem}>
    <Text style={s.statLabel}>{label}</Text>
    <Text style={s.statValue}>{value}</Text>
  </View>
);

/**
 * StatsContent Component
 * 
 * Reusable component that displays video and network statistics.
 * Follows Open/Closed Principle - open for extension, closed for modification.
 * @param stats - Video statistics to display, or null if loading
 */
export const StatsContent = ({ stats }: { stats: VideoStats | null }) => {
  const { t } = useTranslation();

  if (!stats) {
    return (
      <View style={s.statsSection}>
        <Text style={s.statValue}>{t("device.camera.stats.loading")}</Text>
      </View>
    );
  }

  return (
    <>
      {/* VIDEO Section */}
      <View style={s.statsSection}>
        <Text style={s.statsSectionTitle}>{t("device.camera.stats.sections.video")}</Text>
        <View style={s.statsRow}>
          <Row label={t("device.camera.stats.labels.resolution")} value={stats.resolution} />
          <Row label={t("device.camera.stats.labels.currentFps")} value={stats.currentFps} />
        </View>
        <View style={s.statsRow}>
          <Row label={t("device.camera.stats.labels.receivedFps")} value={stats.receivedFps} />
          <Row label={t("device.camera.stats.labels.droppedFps")} value={stats.droppedFps} />
        </View>
        <View style={s.statsRow}>
          <Row label={t("device.camera.stats.labels.framesDropped")} value={stats.framesDropped} />
          <Row label={t("device.camera.stats.labels.codec")} value={stats.codec} />
        </View>
      </View>

      {/* NETWORK Section */}
      <View style={s.statsSection}>
        <Text style={s.statsSectionTitle}>{t("device.camera.stats.sections.network")}</Text>
        <View style={s.statsRow}>
          <Row label={t("device.camera.stats.labels.bitrate")} value={stats.bitrate} />
          <Row label={t("device.camera.stats.labels.totalData")} value={stats.totalData} />
        </View>
        <View style={s.statsRow}>
          <Row label={t("device.camera.stats.labels.packetsRx")} value={stats.packetsRx} />
          <Row label={t("device.camera.stats.labels.packetsLost")} value={stats.packetsLost} />
        </View>
        <View style={s.statsRow}>
          <Row label={t("device.camera.stats.labels.lossPercent")} value={stats.lossPercent} />
          <Row label={t("device.camera.stats.labels.jitter")} value={stats.jitter} />
        </View>
      </View>
    </>
  );
};

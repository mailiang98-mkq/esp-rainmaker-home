/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text } from "react-native";
import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";
import type { CreateAutomationEventInfo } from "@features/automation/utils/automationManagement";

const styles = {
  eventSummaryCard: {
    margin: tokens.spacing._15,
    marginBottom: tokens.spacing._10,
    padding: tokens.spacing._15,
    backgroundColor: tokens.colors.bg1,
    borderRadius: tokens.radius.sm,
    borderWidth: tokens.border.defaultWidth,
    borderColor: tokens.colors.borderColor,
  },
  eventSummaryHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: tokens.spacing._5,
    marginBottom: tokens.spacing._10,
  },
  eventSummaryTitle: {
    fontSize: tokens.fontSize.sm,
  },
  eventSummaryContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flexWrap: "wrap" as const,
  },
  eventSummaryText: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text_primary,
    lineHeight: 22,
  },
  eventSummaryLabel: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text_secondary,
  },
  eventSummaryDevice: {
    fontSize: tokens.fontSize.sm,
  },
  eventSummaryParam: {
    fontSize: tokens.fontSize.sm,
  },
  eventSummaryCondition: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text_secondary,
    fontStyle: "italic" as const,
  },
  eventSummaryValue: {
    fontSize: tokens.fontSize.sm,
  },
};

export interface ActionDeviceSelectionEventSummaryProps {
  eventInfo: CreateAutomationEventInfo | null;
  eventDeviceDisplayName: string;
  conditionLabel: string;
  valueDisplay: string;
  titleLabel: string;
  whenLabel: string;
}

/**
 * Renders the action device selection event summary UI section.
 */
export const ActionDeviceSelectionEventSummary: React.FC<
  ActionDeviceSelectionEventSummaryProps
> = ({
  eventInfo,
  eventDeviceDisplayName,
  conditionLabel,
  valueDisplay,
  titleLabel,
  whenLabel,
}) => {
  if (!eventInfo) return null;

  return (
    <View {...testProps("view_event_summary_action")} style={styles.eventSummaryCard}>
      <View style={styles.eventSummaryHeader}>
        <Text {...testProps("text_event_summary_title")} style={styles.eventSummaryTitle}>
          {titleLabel}
        </Text>
      </View>
      <View style={styles.eventSummaryContent}>
        <Text style={styles.eventSummaryText}>
          <Text style={styles.eventSummaryLabel}>{whenLabel}</Text>
          <Text style={styles.eventSummaryDevice}> {eventDeviceDisplayName}</Text>
          <Text style={styles.eventSummaryParam}> {eventInfo.parameter} </Text>
          <Text style={styles.eventSummaryCondition}>{conditionLabel}</Text>
          <Text style={styles.eventSummaryValue}> {valueDisplay}</Text>
        </Text>
      </View>
    </View>
  );
};

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

// Styles
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Types
import type { ChartPeriodSelectorProps, PeriodTabProps, TimeSeriesPeriod } from "@src/types/global";

/**
 * Renders the period tab UI component.
 */
const PeriodTab = ({ period, isActive, loading, onPress }: PeriodTabProps) => {
  const styles = useMemo(() => {
    return {
      periodTab: globalStyles.periodTab,
      periodTabActive: globalStyles.periodTabActive,
      periodTabDisabled: globalStyles.periodTabDisabled,
      periodTabTextActive: globalStyles.periodTabTextActive,
      periodTabTextInactive: globalStyles.periodTabTextInactive,
    };
  }, []);

  if (!period) return null;

  return (
    <TouchableOpacity
      disabled={loading}
      style={[
        styles.periodTab,
        isActive && styles.periodTabActive,
        loading && styles.periodTabDisabled,
      ]}
      onPress={onPress}
    >
      <Text
        style={
          isActive ? 
          styles.periodTabTextActive : 
          styles.periodTabTextInactive
          }
      >
        {period}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Renders the chart period selector UI section.
 */
const ChartPeriodSelector = ({  
  periods,
  selectedPeriod,
  customDateRange,
  loading,
  onSelect,
}: ChartPeriodSelectorProps) => {
  const { t } = useTranslation();

  /**
   * Checks if the period is active
   * @param period - The period to check
   * @returns True if the period is active, false otherwise
   */
  const isActive = (period: TimeSeriesPeriod) => !customDateRange && selectedPeriod === period;

  return (
    <View style={globalStyles.intervalSection}>
      <Text style={globalStyles.sectionLabelSecondary}>
        {t("device.chart.interval")}
      </Text>

      <View style={globalStyles.periodTabs}>
        {periods.map((period) => {
          return (
            <PeriodTab
              key={period}
              period={period}
              isActive={isActive(period)}
              loading={loading}
              onPress={() => onSelect(period)}
            />
          );
        })}
      </View>
    </View>
  );
};

export default ChartPeriodSelector;


/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Calendar as CalendarIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";

// Components
import { Header } from "@shared/components";
import {
  AggregationDropdown,
  BadgeText,
  ChartHeader,
  ChartMessage,
  ChartPeriodSelector,
  ChartTypeToggle,
  DateRangeCalendarBottomSheet,
  GenericChart,
  TimeNavigator,
} from "@features/control/components";

// Hooks
import { useChart } from "@features/control/hooks";

// Styles
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Types
import type { ChartState } from "@src/types/global";

/**
 * Chart Component
 *
 * A generic time series chart component for visualizing device parameter data.
 */
const Chart = () => {
  const { t } = useTranslation();
  const { nodeId, deviceName, paramName } = useLocalSearchParams<{
    nodeId?: string;
    deviceName?: string;
    paramName?: string;
  }>();

  const {
    param,
    isWriteableParam,
    isSimpleTimeSeriesParam,
    timeSeriesData,
    chartState,
    chartStateLabelMap,
    selectedPeriod,
    customDateRange,
    calendarVisible,
    chartType,
    aggregation,
    tooltipVisible,
    tooltipPosition,
    loading,
    canNavigateNext,
    timeNavigatorLabel,
    periods,
    aggregations,
    buttonRef,
    calendarButtonRef,
    chartContainerRef,
    scrollViewRef,
    calendarBottomSheetRef,
    handleSelectAggregation,
    handlePreviousPeriod,
    handleNextPeriod,
    handleDateRangeSelect,
    handleCalendarToggle,
    handlePeriodSelect,
    setChartType,
    setCalendarVisible,
    setTooltipVisible,
    setTooltipPosition,
    timeOffset,
  } = useChart({ nodeId, deviceName, paramName });

  return (
    <>
      <Header
        label={t("device.chart.title")}
        showBack={true}
        rightSlot={<View style={globalStyles.headerSpacer} />}
      />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {!loading && isWriteableParam && (
          <ChartHeader
            label={paramName || t("device.chart.value")}
            param={param}
            isWriteable={isWriteableParam}
            disabled={loading}
          />
        )}

        <View style={globalStyles.timeNavigatorContainer}>
          <TimeNavigator
            period={selectedPeriod}
            offset={timeOffset}
            loading={loading}
            onPrevious={handlePreviousPeriod}
            onNext={handleNextPeriod}
            canNavigateNext={canNavigateNext}
            label={timeNavigatorLabel}
          />
          <TouchableOpacity
            ref={calendarButtonRef}
            onPress={handleCalendarToggle}
            disabled={loading}
            style={[
              globalStyles.timeNavigatorButton,
              loading && globalStyles.timeNavigatorButtonDisabled,
            ]}
          >
            <CalendarIcon
              size={tokens.iconSize._20}
              color={tokens.colors.primary}
            />
          </TouchableOpacity>

          <DateRangeCalendarBottomSheet
            ref={calendarBottomSheetRef}
            visible={calendarVisible}
            onClose={() => setCalendarVisible(false)}
            onSelect={handleDateRangeSelect}
            range={customDateRange || undefined}
            aggregation={aggregation}
            isSimpleTimeSeries={isSimpleTimeSeriesParam}
          />
        </View>

        <View style={globalStyles.chartSection}>
          {!isSimpleTimeSeriesParam && (
            <AggregationDropdown
              aggregation={aggregation}
              aggregations={aggregations}
              loading={loading}
              tooltipVisible={tooltipVisible}
              tooltipPosition={tooltipPosition}
              setTooltipVisible={setTooltipVisible}
              setTooltipPosition={setTooltipPosition}
              buttonRef={buttonRef}
              chartContainerRef={chartContainerRef}
              onSelectAggregation={handleSelectAggregation}
            />
          )}
          {isSimpleTimeSeriesParam && (
            <View style={globalStyles.badgeContainer}>
              <BadgeText>{t(`device.chart.simpleTimeSeries`)}</BadgeText>
            </View>
          )}

          <View ref={chartContainerRef} style={globalStyles.chartContainer}>
            {chartState === "ready" ? (
              <GenericChart
                key={`genericChart-${selectedPeriod || "custom"}-${aggregation}-${chartType}`}
                data={timeSeriesData}
                height={300}
                startTime={timeSeriesData?.[0]?.timestamp || null}
                endTime={
                  timeSeriesData?.[timeSeriesData.length - 1]?.timestamp || null
                }
                type={chartType}
              />
            ) : (
              <ChartMessage
                text={
                  chartStateLabelMap[chartState as Exclude<ChartState, "ready">]
                }
              />
            )}
          </View>

          <View style={globalStyles.chartHeaderWithMargin}>
            <ChartPeriodSelector
              periods={periods}
              selectedPeriod={selectedPeriod}
              customDateRange={customDateRange}
              loading={loading}
              onSelect={handlePeriodSelect}
            />

            <ChartTypeToggle
              chartType={chartType}
              loading={loading}
              onChange={setChartType}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default Chart;

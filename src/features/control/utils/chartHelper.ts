/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  TimeSeriesPeriod,
  AggregationMethod,
} from "@src/types/global";
import {
  TIME_SERIES_PERIOD_1Y,
  TIME_SERIES_PERIOD_4W,
  AGGREGATION_RAW,
  AGGREGATION_LATEST,
} from "@shared/utils/constants";
import { DATE_RANGE_CONSTANTS } from "@features/control/utils/dateRangeHelper";

/**
 * Unsupported periods by aggregation method
 */
export const UNSUPPORTED_PERIODS_BY_AGGREGATION: Partial<
  Record<AggregationMethod, readonly TimeSeriesPeriod[]>
> = {
  [AGGREGATION_RAW]: [TIME_SERIES_PERIOD_1Y],
  [AGGREGATION_LATEST]: [TIME_SERIES_PERIOD_4W, TIME_SERIES_PERIOD_1Y],
} as const;

/**
 * Check if aggregation and period combination is unsupported
 * @param aggregation - Aggregation method
 * @param period - Selected time period
 * @param customDateRange - Custom date range
 * @param isSimpleTimeSeriesParam - Whether this is a simple time series parameter
 * @returns True if combination is unsupported
 */
export const isUnsupportedCombination = (
  aggregation: AggregationMethod,
  period: TimeSeriesPeriod | null,
  customDateRange: { start: number; end: number } | null,
  isSimpleTimeSeriesParam: boolean
): boolean => {
  // Skip all duration restrictions for simple time series
  if (isSimpleTimeSeriesParam) {
    return false;
  }

  if (period) {
    return !!UNSUPPORTED_PERIODS_BY_AGGREGATION[aggregation]?.includes(period);
  }

  if (customDateRange && aggregation === AGGREGATION_RAW) {
    const duration = customDateRange.end - customDateRange.start;
    return duration > DATE_RANGE_CONSTANTS.RAW_DATA_MAX_INTERVAL;
  }

  return false;
};

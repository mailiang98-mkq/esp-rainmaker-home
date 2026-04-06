/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from "react";

export interface MultiTapTrigger {
  /** Exact number of taps to trigger this action */
  count: number;
  /** Action to execute when tap count is reached */
  action: () => void;
}

export interface UseMultiTapOptions {
  /** Time window in milliseconds for counting taps */
  windowMs: number;
  /** Array of triggers, each with exact tap count */
  triggers: MultiTapTrigger[];
}

/**
 * useMultiTap
 *
 * A reusable hook for detecting multi-tap gestures with configurable triggers.
 * Supports multiple tap thresholds with exact-count matching.
 *
 * @example
 * ```ts
 * const handleTap = useMultiTap({
 *   windowMs: 3000,
 *   triggers: [
 *     { count: 15, action: () => console.log('15 taps') },
 *     { count: 10, action: () => console.log('10 taps') },
 *   ],
 * });
 * ```
 */
export function useMultiTap({
  windowMs,
  triggers,
}: UseMultiTapOptions): () => void {
  const tapCount = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = () => {
    tapCount.current += 1;

    // Clear existing timer
    if (timer.current) {
      clearTimeout(timer.current);
    }

    // Check for matching trigger when window expires (user stops tapping)
    timer.current = setTimeout(() => {
      // Find matching trigger (sorted by count descending for priority)
      const match = triggers.find((t) => tapCount.current === t.count);

      if (match) {
        match.action();
      }

      // Reset tap count after checking triggers
      tapCount.current = 0;
      timer.current = null;
    }, windowMs);
  };

  return handleTap;
}

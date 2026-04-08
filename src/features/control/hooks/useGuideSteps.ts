/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";

// Types
import type { GuideStep } from "@src/types/global";

// Utils
import { buildGuideImages } from "@features/control/utils/guideHelper";

type UseGuideStepsParams = {
  steps: GuideStep[];
  imageMap: Record<string, number>;
};

export const useGuideSteps = ({ steps, imageMap }: UseGuideStepsParams) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [allImages, setAllImages] = useState<number[]>([]);

  useEffect(() => {
    if (steps.length > 0) {
      setTitle(steps[0].title);
      setAllImages(buildGuideImages(steps, imageMap));
    }
  }, [steps, imageMap]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    if (pageNum !== currentIndex && pageNum >= 0 && pageNum < steps.length) {
      setCurrentIndex(pageNum);
      setTitle(steps[pageNum].title);
    }
  };

  const handleImagePress = (stepIndex: number, imageIndex: number) => {
    const globalIndex = stepIndex * 2 + imageIndex;
    setPreviewIndex(globalIndex);
    setShowImagePreview(true);
  };

  return {
    currentIndex,
    title,
    showImagePreview,
    setShowImagePreview,
    previewIndex,
    allImages,
    handleScroll,
    handleImagePress,
  };
};

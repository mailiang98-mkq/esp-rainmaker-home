/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { View, Text, ScrollView } from "react-native";

import { Header, ScreenWrapper } from "@shared/components";
import PhonePair from "./PhonePair";
import GuideImagePreviewModal from "./GuideImagePreviewModal";
import { useGuideSteps } from "@features/control/hooks";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { guideStyles } from "@features/user/theme/userStyleSheet";
import type { GuideStep } from "@src/types/global";

type VoiceAssistantGuideProps = {
  headerLabel: string;
  steps: GuideStep[];
  imageMap: Record<string, number>;
};

/**
 * Renders the voice assistant guide UI section.
 */
const VoiceAssistantGuide: React.FC<VoiceAssistantGuideProps> = ({
  headerLabel,
  steps,
  imageMap,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    currentIndex,
    title,
    showImagePreview,
    setShowImagePreview,
    previewIndex,
    allImages,
    handleScroll,
    handleImagePress,
  } = useGuideSteps({ steps, imageMap });

  return (
    <>
      <Header label={headerLabel} showBack />
      <ScreenWrapper style={globalStyles.container}>
        <View style={guideStyles.mainContent}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            style={guideStyles.scrollView}
          >
            {steps.map((item, index) => (
              <PhonePair
                key={`step-${index}`}
                leftImage={imageMap[item.icon1]}
                rightImage={imageMap[item.icon2]}
                onLeftImagePress={() => handleImagePress(index, 0)}
                onRightImagePress={() => handleImagePress(index, 1)}
              />
            ))}
          </ScrollView>

          <View style={guideStyles.descriptionContainer}>
            <Text style={guideStyles.description}>{title}</Text>
          </View>

          <View style={guideStyles.pageIndicators}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  guideStyles.pageIndicator,
                  currentIndex === index && guideStyles.activePageIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        <GuideImagePreviewModal
          visible={showImagePreview}
          images={allImages}
          previewIndex={previewIndex}
          onClose={() => setShowImagePreview(false)}
        />
      </ScreenWrapper>
    </>
  );
};

export default VoiceAssistantGuide;

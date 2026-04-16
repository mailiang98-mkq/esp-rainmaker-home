/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Modal,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { X } from "lucide-react-native";

import { tokens } from "@shared/theme/tokens";
import { guideStyles } from "@features/user/theme/userStyleSheet";

type GuideImagePreviewModalProps = {
  visible: boolean;
  images: number[];
  previewIndex: number;
  onClose: () => void;
};

/**
 * Renders the guide image preview modal UI section.
 */
const GuideImagePreviewModal: React.FC<GuideImagePreviewModalProps> = ({
  visible,
  images,
  previewIndex,
  onClose,
}) => {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={guideStyles.previewOverlay}>
        <Pressable style={guideStyles.closeButton} onPress={onClose}>
          <X size={24} color={tokens.colors.white} />
        </Pressable>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={[guideStyles.previewScrollView, { width: screenWidth }]}
          contentOffset={{ x: previewIndex * screenWidth, y: 0 }}
        >
          {images.map((image, index) => (
            <View
              key={index}
              style={[
                guideStyles.previewImageContainer,
                { width: screenWidth },
              ]}
            >
              <Image
                source={image}
                style={guideStyles.previewImage}
                resizeMode="contain"
              />
              <Text style={guideStyles.previewIndex}>
                {index + 1} / {images.length}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default GuideImagePreviewModal;

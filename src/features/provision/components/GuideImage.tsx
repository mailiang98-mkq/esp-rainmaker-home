/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { tokens } from "@shared/theme/tokens";

interface GuideImageProps {
  src: string;
  width: number;
  height: number;
}

/**
 * GuideImage Component
 *
 * Displays an image with loading state and error handling
 */
export const GuideImage: React.FC<GuideImageProps> = ({
  src,
  width,
  height,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View
        style={{
          alignItems: "center",
          marginVertical: 12,
          width,
          height,
          backgroundColor: tokens.colors.bg1,
          borderRadius: 8,
          justifyContent: "center",
        }}
      >
        <Text style={{ color: tokens.colors.text_secondary, fontSize: 12 }}>
          Image unavailable
        </Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center", marginVertical: 12 }}>
      {isLoading && (
        <View
          style={{
            position: "absolute",
            width,
            height,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: tokens.colors.bg1,
            borderRadius: 8,
          }}
        >
          <ActivityIndicator size="small" color={tokens.colors.primary} />
        </View>
      )}
      <Image
        source={{ uri: src }}
        style={{
          width,
          height,
          resizeMode: "contain",
          borderRadius: 8,
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </View>
  );
};

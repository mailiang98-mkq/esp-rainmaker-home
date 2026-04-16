/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  View,
  ActivityIndicator,
  ScrollView,
  Text,
  Pressable,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import RenderHTML from "react-native-render-html";
import { Header, ScreenWrapper } from "@shared/components";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { useGuide } from "@features/control/hooks";

/**
 * Renders the guide UI section.
 */
export default function Guide() {
  const params = useLocalSearchParams<{
    url: string;
    title?: string;
    deviceName?: string;
    fromProvision?: string;
  }>();
  const {
    isLoading,
    error,
    htmlContent,
    htmlStyles,
    customRenderers,
    renderersProps,
    systemFonts,
    screenWidth,
    handleBackPress,
  } = useGuide();

  return (
    <>
      <Header
        label={params.title || "Guide"}
        showBack={true}
        onBackPress={handleBackPress}
      />

      <ScreenWrapper>
        {isLoading ? (
          <View style={globalStyles.chatSettingsCenterContainer}>
            <ActivityIndicator size="large" color={tokens.colors.primary} />
          </View>
        ) : error ? (
          <View
            style={[globalStyles.chatSettingsCenterContainer, { padding: 20 }]}
          >
            <Text
              style={[globalStyles.textCenter, { color: tokens.colors.error }]}
            >
              {error}
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            <Pressable onPress={() => {}}>
              <RenderHTML
                contentWidth={screenWidth - 32}
                source={{ html: htmlContent }}
                tagsStyles={htmlStyles}
                renderers={customRenderers}
                renderersProps={renderersProps}
                systemFonts={systemFonts}
                enableExperimentalBRCollapsing={true}
                enableExperimentalMarginCollapsing={true}
                baseStyle={{
                  color: tokens.colors.text_primary,
                  fontSize: 16,
                  lineHeight: 24,
                }}
              />
            </Pressable>
          </ScrollView>
        )}
      </ScreenWrapper>
    </>
  );
}

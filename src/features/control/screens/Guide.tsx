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
import { useTranslation } from "react-i18next";
import RenderHTML from "react-native-render-html";
import { Header, ScreenWrapper, Button } from "@shared/components";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { guideScreenStyleSheet } from "@features/control/theme";
import { useGuide } from "@features/control/hooks";

/**
 * Renders the guide UI section.
 */
export default function Guide() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    url: string;
    title?: string;
    deviceName?: string;
    fromProvisionFlow?: string;
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
    handleBackPress: handleNavigationAction,
    fromProvisionFlow,
  } = useGuide();

  return (
    <>
      <Header
        label={params.title || "Guide"}
        showBack={!fromProvisionFlow}
        onBackPress={!fromProvisionFlow ? handleNavigationAction : undefined}
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
          <View style={guideScreenStyleSheet.contentWrapper}>
            <ScrollView
              style={guideScreenStyleSheet.scrollView}
              contentContainerStyle={
                fromProvisionFlow
                  ? guideScreenStyleSheet.scrollContentWithBottomPadding
                  : undefined
              }
            >
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

            {fromProvisionFlow && (
              <Button
                label={t("layout.shared.continue")}
                onPress={handleNavigationAction}
                style={{
                  ...globalStyles.btn,
                  ...globalStyles.bgBlue,
                  ...globalStyles.shadowElevationForLightTheme,
                  ...guideScreenStyleSheet.continueButtonContainer,
                }}
                qaId="button_continue_guide"
              />
            )}
          </View>
        )}
      </ScreenWrapper>
    </>
  );
}

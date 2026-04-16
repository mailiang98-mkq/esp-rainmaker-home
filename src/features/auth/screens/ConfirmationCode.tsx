/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { globalStyles } from "@shared/theme/globalStyleSheet";

import { useConfirmationCode } from "@features/auth/hooks";

import { ScreenWrapper, Header, Input, Button } from "@shared/components";
import { ResendCodeButton, AppVersionText } from "@features/auth/components";
import { testProps } from "@shared/utils/testProps";

/**
 * Renders the confirmation code screen UI section.
 */
export function ConfirmationCodeScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams();
  const {
    code,
    isCodeValid,
    isLoading,
    countdown,
    codeValidator,
    handleCodeChange,
    handleResendCode,
    handleVerify,
  } = useConfirmationCode();

  return (
    <>
      <Header
        showBack
        label={t("auth.verification.title")}
        qaId="header_confirmation_code"
      />
      <ScreenWrapper
        style={globalStyles.screenWrapper}
        qaId="screen_wrapper_confirmation_code"
      >
        <ScrollView
          {...testProps("scroll_confirmation_code")}
          contentContainerStyle={globalStyles.scrollViewContent}
        >
          <Text
            {...testProps("text_title_confirmation_code")}
            style={[globalStyles.heading, globalStyles.verificationTitle]}
          >
            {t("auth.verification.heading")}
          </Text>
          <Text
            {...testProps("text_subtitle_confirmation_code")}
            style={[globalStyles.subHeading, globalStyles.verificationSubtitle]}
          >
            {t("auth.verification.subtitle", { username: email as string })}
          </Text>

          <View
            {...testProps("view_confirmation_code")}
            style={globalStyles.verificationContainer}
          >
            <Input
              initialValue={code}
              onFieldChange={handleCodeChange}
              validator={codeValidator}
              validateOnChange={true}
              debounceDelay={500}
              style={[
                globalStyles.verificationInput,
                globalStyles.verificationInputWithLetterSpacing,
              ]}
              keyboardType="numeric"
              maxLength={6}
              autoFocus
              qaId="confirmation_code"
            />
          </View>

          <Button
            label={t("auth.verification.verifyButton")}
            onPress={handleVerify}
            style={globalStyles.verificationButton}
            disabled={!isCodeValid || isLoading}
            isLoading={isLoading}
            qaId="button_verify_confirmation_code"
          />

          <ResendCodeButton
            countdown={countdown}
            onPress={handleResendCode}
            disabled={isLoading}
            resendLabel={t("auth.verification.resendCode")}
            testId="button_resend_confirmation_code"
          />
        </ScrollView>
        <AppVersionText testId="text_app_version_settings" />
      </ScreenWrapper>
    </>
  );
}

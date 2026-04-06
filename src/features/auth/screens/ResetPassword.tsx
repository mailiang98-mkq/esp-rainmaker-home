/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { globalStyles } from "@shared/theme/globalStyleSheet";

import { useResetPassword } from "@features/auth/hooks";

import { ScreenWrapper, Header, Input, Button } from "@shared/components";
import { ResendCodeButton, AppVersionText } from "@features/auth/components";
import { testProps } from "@shared/utils/testProps";

export function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams();
  const {
    code,
    newPassword,
    confirmPassword,
    isCodeValid,
    isPasswordValid,
    isConfirmPasswordValid,
    isLoading,
    countdown,
    codeValidator,
    passwordValidator,
    confirmPasswordValidator,
    handleCodeChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleResendCode,
    handleResetPassword,
  } = useResetPassword();

  const isFormValid =
    isCodeValid && isPasswordValid && isConfirmPasswordValid && !isLoading;

  return (
    <>
      <Header
        showBack
        label={t("auth.forgotPassword.resetTitle")}
        qaId="header_reset_password"
      />
      <ScreenWrapper
        style={globalStyles.screenWrapper}
        qaId="screen_wrapper_reset_password"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={globalStyles.authKeyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            {...testProps("scroll_reset_password")}
            contentContainerStyle={globalStyles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              {...testProps("text_title_reset_password")}
              style={[globalStyles.heading, globalStyles.verificationTitle]}
            >
              {t("auth.forgotPassword.resetHeading")}
            </Text>
            <Text
              {...testProps("text_subtitle_reset_password")}
              style={[
                globalStyles.subHeading,
                globalStyles.verificationSubtitle,
              ]}
            >
              {t("auth.verification.subtitle", { email: email as string })}
            </Text>

            <View
              {...testProps("view_reset_password")}
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
                qaId="reset_password_code"
              />
            </View>

            <View
              {...testProps("view_input_reset_password")}
              style={globalStyles.inputContainer}
            >
              <Input
                isPassword
                icon="lock-closed"
                placeholder={t("auth.shared.newPasswordPlaceholder")}
                onFieldChange={handlePasswordChange}
                validator={passwordValidator}
                validateOnChange={true}
                debounceDelay={500}
                qaId="new_password_reset_password"
              />

              <Input
                key={newPassword}
                isPassword
                icon="lock-closed"
                placeholder={t("auth.shared.confirmPasswordPlaceholder")}
                initialValue={confirmPassword}
                onFieldChange={handleConfirmPasswordChange}
                validator={confirmPasswordValidator}
                validateOnChange={true}
                debounceDelay={500}
                qaId="confirm_password_reset_password"
              />

              <Button
                label={t("auth.forgotPassword.confirmButton")}
                onPress={handleResetPassword}
                style={globalStyles.verificationButtonWithMarginTop}
                disabled={!isFormValid}
                isLoading={isLoading}
                qaId="button_reset_password"
              />

              <ResendCodeButton
                countdown={countdown}
                onPress={handleResendCode}
                disabled={isLoading}
                resendLabel={t("auth.verification.resendCode")}
                testId="button_resend_reset_password"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <AppVersionText testId="text_app_version_reset_password" />
      </ScreenWrapper>
    </>
  );
}

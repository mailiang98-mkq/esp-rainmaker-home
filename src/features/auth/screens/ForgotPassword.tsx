/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useTranslation } from "react-i18next";

import { globalStyles } from "@shared/theme/globalStyleSheet";

import { useForgotPassword } from "@features/auth/hooks";
import { getAuthAllowedUsernameTypes } from "@features/auth/utils/authHelper";

import {
  Input,
  Button,
  ScreenWrapper,
  Header,
  Logo,
} from "@shared/components";
import { AppVersionText } from "@features/auth/components";
import { testProps } from "@shared/utils/testProps";

/**
 * Renders the forgot password screen UI section.
 */
export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const {
    email,
    isEmailValid,
    isLoading,
    emailValidator,
    handleEmailChange,
    sendVerificationCode,
  } = useForgotPassword();

  const usernameFieldProps = useMemo(() => {
    const allowsPhone = getAuthAllowedUsernameTypes().includes("phone");
    return {
      placeholder: allowsPhone
        ? t("auth.shared.emailOrPhonePlaceholder")
        : t("auth.shared.emailPlaceholder"),
      inputMode: (allowsPhone ? "text" : "email") as "text" | "email",
      keyboardType: allowsPhone ? ("default" as const) : ("email-address" as const),
      subtitle: allowsPhone
        ? t("auth.forgotPassword.subtitleEmailOrPhone")
        : t("auth.forgotPassword.subtitle"),
    };
  }, [t]);

  return (
    <>
      <Header
        showBack
        label={t("auth.forgotPassword.title")}
        qaId="header_forgot_password"
      />
      <ScreenWrapper
        style={globalStyles.screenWrapper}
        qaId="screen_wrapper_forgot"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={globalStyles.authKeyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View
            {...testProps("view_forgot")}
            style={[
              globalStyles.scrollViewContent,
              globalStyles.authScrollViewContentWithPadding,
            ]}
          >
            <Logo qaId="logo_forgot_password" />

            <Text
              {...testProps("text_forgot_heading")}
              style={[globalStyles.heading, globalStyles.verificationTitle]}
            >
              {t("auth.forgotPassword.heading")}
            </Text>
            <Text
              {...testProps("text_forgot_subtitle")}
              style={[
                globalStyles.subHeading,
                globalStyles.verificationSubtitle,
              ]}
            >
              {usernameFieldProps.subtitle}
            </Text>
            <View
              {...testProps("view_input_forgot")}
              style={globalStyles.inputContainer}
            >
              <Input
                icon="mail-open"
                placeholder={usernameFieldProps.placeholder}
                onFieldChange={handleEmailChange}
                validator={emailValidator}
                validateOnChange={true}
                debounceDelay={500}
                inputMode={usernameFieldProps.inputMode}
                keyboardType={usernameFieldProps.keyboardType}
                autoFocus
                qaId="email_forgot"
              />

              <Button
                label={t("auth.forgotPassword.sendCodeButton")}
                disabled={!isEmailValid || !email || isLoading}
                onPress={sendVerificationCode}
                style={globalStyles.signInButton}
                isLoading={isLoading}
                qaId="button_send_code"
              />
            </View>
          </View>
        </KeyboardAvoidingView>

        <AppVersionText testId="text_app_version_forgot_password" />
      </ScreenWrapper>
    </>
  );
}

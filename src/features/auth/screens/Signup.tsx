/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { getAuthAllowedUsernameTypes } from "@features/auth/utils/authHelper";
import { globalStyles } from "@shared/theme/globalStyleSheet";

import { useSignup } from "@features/auth/hooks";

import {
  Input,
  Button,
  Logo,
  Header,
  ScreenWrapper,
} from "@shared/components";
import { ConsentCheckbox, AppVersionText } from "@features/auth/components";
import { testProps } from "@shared/utils/testProps";

/**
 * Renders the signup screen UI section.
 */
export function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    email,
    password,
    confirmPassword,
    isEmailValid,
    isPasswordValid,
    isConfirmPasswordValid,
    consentChecked,
    setConsentChecked,
    isLoading,
    emailValidator,
    passwordValidator,
    confirmPasswordValidator,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    signup,
  } = useSignup();

  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const usernameFieldProps = useMemo(() => {
    const allowsPhone = getAuthAllowedUsernameTypes().includes("phone");
    return {
      placeholder: allowsPhone
        ? t("auth.shared.emailOrPhonePlaceholder")
        : t("auth.shared.emailPlaceholder"),
      inputMode: (allowsPhone ? "text" : "email") as "text" | "email",
      keyboardType: allowsPhone ? ("default" as const) : ("email-address" as const),
    };
  }, [t]);

  const isFormValid =
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    !!email &&
    !!password &&
    !!confirmPassword &&
    consentChecked &&
    !isLoading;

  return (
    <>
      <Header showBack label={t("auth.signup.title")} qaId="header_signup" />
      <ScreenWrapper
        style={globalStyles.screenWrapper}
        qaId="screen_wrapper_signup"
      >
        <View
          {...testProps("view_signup")}
          style={globalStyles.scrollViewContent}
        >
          <Logo qaId="logo_signup" />

          <View
            {...testProps("view_input_signup")}
            style={globalStyles.inputContainer}
          >
            <Input
              icon="mail-open"
              placeholder={usernameFieldProps.placeholder}
              onFieldChange={handleEmailChange}
              validator={emailValidator}
              validateOnBlur={true}
              inputMode={usernameFieldProps.inputMode}
              keyboardType={usernameFieldProps.keyboardType}
              returnKeyType="next"
              onSubmitEditing={() => {
                if (isEmailValid) {
                  passwordInputRef.current?.focus();
                }
              }}
              qaId="email"
            />

            <Input
              ref={passwordInputRef}
              isPassword
              icon="lock-closed"
              placeholder={t("auth.shared.passwordPlaceholder")}
              onFieldChange={handlePasswordChange}
              validator={passwordValidator}
              validateOnBlur={true}
              returnKeyType="next"
              onSubmitEditing={() => {
                if (isPasswordValid) {
                  confirmPasswordInputRef.current?.focus();
                }
              }}
              qaId="password"
            />

            <Input
              ref={confirmPasswordInputRef}
              isPassword
              icon="lock-closed"
              placeholder={t("auth.shared.confirmPasswordPlaceholder")}
              onFieldChange={handleConfirmPasswordChange}
              validator={confirmPasswordValidator}
              validateOnBlur={true}
              returnKeyType="go"
              onSubmitEditing={() => {
                if (isFormValid) {
                  void signup();
                }
              }}
              qaId="confirm_password"
            />

            <ConsentCheckbox
              checked={consentChecked}
              onToggle={() => setConsentChecked(!consentChecked)}
              consentText={t("auth.signup.consentText")}
              termsLabel={t("layout.shared.termsOfUse")}
              andLabel={t("auth.signup.consentAnd")}
              privacyLabel={t("layout.shared.privacyPolicy")}
            />

            <Button
              label={t("auth.signup.confirmButton")}
              disabled={!isFormValid}
              onPress={signup}
              style={globalStyles.signInButton}
              isLoading={isLoading}
              qaId="button_signup"
            />
          </View>

          <TouchableOpacity
            {...testProps("button_signin")}
            onPress={() => router.dismissTo("/(auth)/Login")}
          >
            <Text
              {...testProps("text_navigate_to_signin")}
              style={globalStyles.linkText}
            >
              {t("auth.signup.navigateToSignIn")}
            </Text>
          </TouchableOpacity>
        </View>
        <AppVersionText testId="text_app_version_signup" />
      </ScreenWrapper>
    </>
  );
}

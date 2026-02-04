/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

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
              placeholder={t("auth.shared.emailPlaceholder")}
              onFieldChange={handleEmailChange}
              validator={emailValidator}
              validateOnChange={true}
              debounceDelay={500}
              inputMode="email"
              qaId="email"
            />

            <Input
              isPassword
              icon="lock-closed"
              placeholder={t("auth.shared.passwordPlaceholder")}
              onFieldChange={handlePasswordChange}
              validator={passwordValidator}
              validateOnChange={true}
              debounceDelay={500}
              qaId="password"
            />

            <Input
              isPassword
              icon="lock-closed"
              placeholder={t("auth.shared.confirmPasswordPlaceholder")}
              onFieldChange={handleConfirmPasswordChange}
              validator={confirmPasswordValidator}
              validateOnChange={true}
              debounceDelay={500}
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

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { globalStyles } from "@shared/theme/globalStyleSheet";
import { tokens } from "@shared/theme/tokens";

import { useLogin } from "@features/auth/hooks";
import { getEnabledOAuthProviders } from "@/config/features.config";
import { runtimeConfigManager } from "@config/runtime.config";
import { cdfBootstrap } from "@integrations";
import asyncStorageAdapter from "@native-adaptors/implementations/ESPAsyncStorage";
import { AppRestartContext } from "@context/appRestart.context";

import {
  ScreenWrapper,
  Input,
  Button,
  Logo,
  ConfirmationDialog,
} from "@shared/components";
import { OAuthLoadingOverlay, AppVersionText } from "@features/auth/components";
import { testProps } from "@shared/utils/testProps";

import google from "@assets/images/google.png";
import signinwithapple from "@assets/images/apple.png";

const OAUTH_PROVIDER_IMAGES: Record<string, ImageSourcePropType> = {
  google,
  signinwithapple,
};

export function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const ENABLED_OAUTH_PROVIDERS = getEnabledOAuthProviders();
  const { restartApp } = useContext(AppRestartContext);

  const {
    emailParam,
    isEmailValid,
    isPasswordValid,
    isLoading,
    isOAuthLoading,
    showConfigResetDialog,
    isConfigResetting,
    setShowConfigResetDialog,
    setIsConfigResetting,
    emailValidator,
    passwordValidator,
    handleEmailChange,
    handlePasswordChange,
    login,
    forgotPwd,
    oauthLogin,
    handleCancelOAuth,
    handleConfigReset,
    getCurrentFriendlyMessage,
  } = useLogin();

  const handleConfigResetConfirm = async () => {
    setIsConfigResetting(true);
    try {
      await runtimeConfigManager.reset();
      await asyncStorageAdapter.clear();
      cdfBootstrap.reset();
      restartApp();
    } finally {
      setIsConfigResetting(false);
    }
  };

  return (
    <ScreenWrapper style={globalStyles.screenWrapper} excludeTop={false}>
      {isOAuthLoading ? (
        <OAuthLoadingOverlay
          onClose={handleCancelOAuth}
          message={t("auth.login.settingUpAccount")}
          progressMessage={getCurrentFriendlyMessage()}
        />
      ) : (
        <View
          style={globalStyles.scrollViewContent}
          {...testProps("view_login")}
        >
          <Logo
            qaId="logo_login"
            onConfigTrigger={() => router.push("/(config)/ConfigScan" as never)}
            onConfigReset={handleConfigReset}
          />
          <View
            style={globalStyles.inputContainer}
            {...testProps("view_input_login")}
          >
            <Input
              key={emailParam || "email-input"}
              icon="mail-open"
              placeholder={t("auth.shared.emailPlaceholder")}
              initialValue={emailParam}
              onFieldChange={handleEmailChange}
              validator={emailValidator}
              validateOnChange={true}
              debounceDelay={500}
              inputMode="email"
              qaId="email"
            />

            <Input
              icon="lock-closed"
              placeholder={t("auth.shared.passwordPlaceholder")}
              isPassword={true}
              onFieldChange={handlePasswordChange}
              validator={passwordValidator}
              validateOnChange={true}
              qaId="password"
            />

            <Button
              label={t("auth.login.signInButton")}
              disabled={!isEmailValid || !isPasswordValid || isLoading}
              onPress={login}
              style={globalStyles.signInButton}
              isLoading={isLoading}
              qaId="button_login"
            />

            <TouchableOpacity
              {...testProps("button_forgot_password")}
              onPress={forgotPwd}
            >
              <Text
                {...testProps("text_forgot_password")}
                style={globalStyles.forgotPasswordText}
              >
                {t("auth.login.forgotPassword")}
              </Text>
            </TouchableOpacity>
          </View>

          {ENABLED_OAUTH_PROVIDERS.length > 0 && (
            <>
              <Text
                {...testProps("text_3plogin")}
                style={globalStyles.thirdLoginText}
              >
                {t("auth.login.thirdPartyLogin")}
              </Text>
              <View
                {...testProps("view_3plogin")}
                style={globalStyles.oauthContainer}
              >
                {ENABLED_OAUTH_PROVIDERS.map((provider) => (
                  <TouchableOpacity
                    key={provider}
                    onPress={() => oauthLogin(provider)}
                    style={globalStyles.oauthButton}
                    {...testProps(`button_3p_${provider}`)}
                  >
                    <Image
                      {...testProps(`image_3p_${provider}`)}
                      source={
                        OAUTH_PROVIDER_IMAGES[provider.toLocaleLowerCase()]
                      }
                      style={globalStyles.oauthImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            {...testProps("button_signup")}
            onPress={() => router.push("/(auth)/Signup")}
          >
            <Text {...testProps("text_signup")} style={globalStyles.linkText}>
              {t("auth.login.navigateToSignUp")}
            </Text>
          </TouchableOpacity>

          <AppVersionText testId="text_app_version_login" />
        </View>
      )}

      <ConfirmationDialog
        open={showConfigResetDialog}
        title={t("config.reset.title")}
        description={t("config.reset.message")}
        confirmText={t("config.reset.confirmButton")}
        cancelText={t("layout.shared.cancel")}
        onConfirm={handleConfigResetConfirm}
        onCancel={() => setShowConfigResetDialog(false)}
        confirmColor={tokens.colors.red}
        isLoading={isConfigResetting}
        qaId="config_reset"
      />
    </ScreenWrapper>
  );
}

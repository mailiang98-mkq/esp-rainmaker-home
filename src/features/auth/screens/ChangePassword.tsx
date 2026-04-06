/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { globalStyles } from "@shared/theme/globalStyleSheet";

import { useChangePassword } from "@features/auth/hooks";

import {
  ScreenWrapper,
  Header,
  Input,
  Button,
  Logo,
} from "@shared/components";
import { testProps } from "@shared/utils/testProps";

export function ChangePasswordScreen() {
  const { t } = useTranslation();
  const {
    oldPassword,
    newPassword,
    confirmPassword,
    isOldPasswordValid,
    isNewPasswordValid,
    isConfirmPasswordValid,
    isLoading,
    oldPasswordValidator,
    newPasswordValidator,
    confirmPasswordValidator,
    handleOldPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  } = useChangePassword();

  const isFormValid =
    isOldPasswordValid &&
    isNewPasswordValid &&
    isConfirmPasswordValid &&
    !!oldPassword &&
    !!newPassword &&
    !!confirmPassword &&
    !isLoading;

  return (
    <>
      <Header
        label={t("auth.changePassword.title")}
        showBack
        qaId="header_change_password"
      />
      <ScreenWrapper
        style={globalStyles.screenWrapper}
        qaId="screen_wrapper_change_password"
      >
        <View
          {...testProps("view_change_password")}
          style={[
            globalStyles.scrollViewContent,
            globalStyles.authScrollViewContentWithPadding,
          ]}
        >
          <Logo qaId="logo_change_password" />
          <View
            {...testProps("view_input_change_password")}
            style={globalStyles.inputContainer}
          >
            <Input
              isPassword
              icon="lock-closed"
              placeholder={t("auth.changePassword.currentPasswordPlaceholder")}
              onFieldChange={handleOldPasswordChange}
              validator={oldPasswordValidator}
              validateOnChange={true}
              debounceDelay={500}
              qaId="current_password"
            />
            <Input
              isPassword
              icon="lock-closed"
              placeholder={t("auth.shared.newPasswordPlaceholder")}
              onFieldChange={handleNewPasswordChange}
              validator={newPasswordValidator}
              validateOnChange={true}
              debounceDelay={500}
              qaId="new_password"
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
              debounceDelay={50}
              qaId="confirm_password"
            />
            <Button
              label={t("auth.changePassword.updateButton")}
              onPress={handleSubmit}
              disabled={!isFormValid}
              style={globalStyles.signInButton}
              isLoading={isLoading}
              qaId="button_update_change_password"
            />
          </View>
        </View>
      </ScreenWrapper>
    </>
  );
}

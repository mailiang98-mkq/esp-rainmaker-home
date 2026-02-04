/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { Button, Input } from "@shared/components";
import { testProps } from "@shared/utils/testProps";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { deleteAccountStyles } from "@features/user/theme/userStyleSheet";

type CodeValidator = (inputCode: string) => {
  isValid: boolean;
  error?: string;
};

type DeleteAccountVerificationContentProps = {
  titleText: string;
  subtitleText: string;
  code: string;
  onCodeChange: (value: string, isValid: boolean) => void;
  codeValidator: CodeValidator;
  verifyButtonLabel: string;
  resendButtonLabel: string;
  resendCountdownLabel: string;
  onVerify: () => void;
  onResend: () => void;
  isCodeValid: boolean;
  isLoading: boolean;
  countdown: number;
};

const DeleteAccountVerificationContent: React.FC<
  DeleteAccountVerificationContentProps
> = ({
  titleText,
  subtitleText,
  code,
  onCodeChange,
  codeValidator,
  verifyButtonLabel,
  resendButtonLabel,
  resendCountdownLabel,
  onVerify,
  onResend,
  isCodeValid,
  isLoading,
  countdown,
}) => (
  <View
    {...testProps("view_verification_delete_account")}
    style={[globalStyles.flex1, globalStyles.itemCenter]}
  >
    <View
      {...testProps("view_content_delete_account")}
      style={[
        globalStyles.inputContainer,
        deleteAccountStyles.verificationContent,
      ]}
    >
      <Text
        {...testProps("text_title_delete_account")}
        style={[globalStyles.heading, globalStyles.textCenter]}
      >
        {titleText}
      </Text>
      <Text
        {...testProps("text_subtitle_delete_account")}
        style={[
          globalStyles.subHeading,
          globalStyles.textCenter,
          globalStyles.textGray,
        ]}
      >
        {subtitleText}
      </Text>

      <View
        {...testProps("view_input_delete_account")}
        style={globalStyles.inputWrapper}
      >
        <Input
          initialValue={code}
          onFieldChange={onCodeChange}
          validator={codeValidator}
          validateOnChange={true}
          debounceDelay={300}
          style={[globalStyles.input, deleteAccountStyles.codeInput]}
          keyboardType="numeric"
          maxLength={6}
          autoFocus
          qaId="code_delete_account"
        />
      </View>

      <View
        {...testProps("view_buttons_delete_account")}
        style={[globalStyles.btnWrap, deleteAccountStyles.buttonContainer]}
      >
        <Button
          label={verifyButtonLabel}
          onPress={onVerify}
          style={globalStyles.buttonPrimary}
          disabled={!isCodeValid || !code || code.length !== 6 || isLoading}
          isLoading={isLoading}
          qaId="button_verify_delete_account"
        />
        <TouchableOpacity
          {...testProps("button_resend_delete_account")}
          onPress={onResend}
          disabled={countdown > 0 || isLoading}
          style={deleteAccountStyles.resendButton}
        >
          <Text
            {...testProps("text_counter_delete_account")}
            style={[
              globalStyles.linkText,
              countdown > 0 && globalStyles.btnDisabled,
            ]}
          >
            {countdown > 0 ? resendCountdownLabel : resendButtonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default DeleteAccountVerificationContent;

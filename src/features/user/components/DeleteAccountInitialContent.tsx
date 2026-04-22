/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text } from "react-native";

import { Button } from "@shared/components";
import { testProps } from "@shared/utils/testProps";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { deleteAccountStyles } from "@features/user/theme/userStyleSheet";

type DeleteAccountInitialContentProps = {
  noticeText: string;
  descriptionText: string;
  buttonLabel: string;
  onProceed: () => void;
  isLoading: boolean;
};

/**
 * Renders the delete account initial content UI section.
 */
const DeleteAccountInitialContent: React.FC<
  DeleteAccountInitialContentProps
> = ({ noticeText, descriptionText, buttonLabel, onProceed, isLoading }) => (
  <View
    {...testProps("view_initial_delete_account")}
    style={[globalStyles.flex1, globalStyles.itemCenter]}
  >
    <View
      {...testProps("view_notice_delete_account")}
      style={deleteAccountStyles.contentContainer}
    >
      <Text
        {...testProps("text_title_notice")}
        style={[
          globalStyles.heading,
          globalStyles.textCenter,
          deleteAccountStyles.warningTitle,
        ]}
      >
        ⚠️ {noticeText}
      </Text>
      <Text
        {...testProps("text_subtitle_notice")}
        style={[
          globalStyles.subHeading,
          globalStyles.textCenter,
          globalStyles.textGray,
        ]}
      >
        {descriptionText}
      </Text>
      <View
        {...testProps("view_action_delete_account")}
        style={deleteAccountStyles.buttonContainer}
      >
        <Button
          label={buttonLabel}
          onPress={onProceed}
          style={globalStyles.buttonDanger}
          isLoading={isLoading}
          textStyle={globalStyles.buttonTextDanger}
          qaId="button_delete_account"
        />
      </View>
    </View>
  </View>
);

export default DeleteAccountInitialContent;

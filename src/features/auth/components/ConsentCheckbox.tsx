/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, StyleSheet } from "react-native";
import { Checkbox } from "react-native-paper";
import { Typo } from "@shared/components";
import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";
import { TERMS_OF_USE_LINK, PRIVACY_POLICY_LINK } from "@shared/utils/constants";
import * as WebBrowser from "expo-web-browser";

interface ConsentCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  consentText: string;
  termsLabel: string;
  andLabel: string;
  privacyLabel: string;
}

export function ConsentCheckbox({
  checked,
  onToggle,
  consentText,
  termsLabel,
  andLabel,
  privacyLabel,
}: ConsentCheckboxProps) {
  const showTerms = async () => {
    try {
      await WebBrowser.openBrowserAsync(TERMS_OF_USE_LINK);
    } catch (error) {
      console.error("Failed to open Terms of Use:", error);
    }
  };

  const showPrivacy = async () => {
    try {
      await WebBrowser.openBrowserAsync(PRIVACY_POLICY_LINK);
    } catch (error) {
      console.error("Failed to open Privacy Policy:", error);
    }
  };

  return (
    <View {...testProps("view_consent")} style={styles.consentContainer}>
      <Checkbox.Android
        status={checked ? "checked" : "unchecked"}
        onPress={onToggle}
        color={tokens.colors.primary}
        uncheckedColor={tokens.colors.gray}
        {...testProps("checkbox_terms_consent")}
      />
      <View
        {...testProps("view_consent_text")}
        style={styles.consentTextContainer}
      >
        <Typo style={styles.consentText} qaId="typo_consent">
          {consentText}{" "}
          <Typo
            style={styles.linkText}
            onPress={showTerms}
            qaId="typo_terms_of_use"
          >
            {termsLabel}
          </Typo>{" "}
          {andLabel}{" "}
          <Typo
            style={styles.linkText}
            onPress={showPrivacy}
            qaId="typo_privacy_policy"
          >
            {privacyLabel}
          </Typo>
        </Typo>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  consentContainer: {
    width: "100%",
    marginVertical: tokens.spacing._15,
    flexDirection: "row",
    alignItems: "center",
  },
  consentTextContainer: {
    flex: 1,
  },
  consentText: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.gray,
    lineHeight: 20,
  },
  linkText: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
    textDecorationLine: "underline",
  },
});

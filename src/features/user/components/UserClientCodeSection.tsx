/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import { Copy } from "lucide-react-native";

import ContentWrapper from "@shared/components/Layout/ContentWrapper";
import { useToast } from "@shared/hooks/useToast";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { tokens } from "@shared/theme/tokens";
import { testProps } from "@shared/utils/testProps";
import { userStyles } from "@features/user/theme/userStyleSheet";

type UserClientCodeSectionProps = {
  userCode?: string;
};

/**
 * Separate card below the profile header — not inside the profile Pressable border.
 */
const UserClientCodeSection: React.FC<UserClientCodeSectionProps> = ({
  userCode,
}) => {
  const { t } = useTranslation();
  const toast = useToast();

  const handleCopy = async () => {
    if (!userCode?.trim()) return;
    try {
      await Clipboard.setStringAsync(userCode);
      toast.showSuccess(t("layout.shared.copiedToClipboard"));
    } catch (error) {
      console.error("Error copying user code to clipboard:", error);
      toast.showError(t("layout.shared.copyFailed"));
    }
  };

  if (!userCode?.trim()) {
    return null;
  }

  return (
    <View
      {...testProps("view_user_client_code_section")}
      style={userStyles.section}
    >
      <ContentWrapper
        qaId="user_client_code_card"
        style={{
          ...globalStyles.shadowElevationForLightTheme,
          backgroundColor: tokens.colors.white,
        }}
      >
        <View
          style={[
            globalStyles.settingsSection,
            globalStyles.userClientCodeCardBody,
          ]}
        >
          <View style={globalStyles.infoRow}>
            <Text style={globalStyles.infoLabel}>
              {t("user.profile.userCode")}
            </Text>
            <View
              style={[
                globalStyles.infoValue,
                globalStyles.userClientCodeValueRow,
              ]}
            >
              <Text
                style={globalStyles.userClientCodeText}
                selectable
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {userCode}
              </Text>
              <TouchableOpacity
                {...testProps("user_client_code_copy")}
                onPress={handleCopy}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Copy size={20} color={tokens.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ContentWrapper>
    </View>
  );
};

export { UserClientCodeSection };
export default UserClientCodeSection;

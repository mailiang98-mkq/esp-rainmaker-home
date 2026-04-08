/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useRouter } from "expo-router";
import { Header, ScreenWrapper } from "@shared/components";
import { SettingsItem, SettingsSection } from "@features/user/components";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { useTranslation } from "react-i18next";
import { Info, Shield, User } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import {
  SettingItemConfig,
  ActionHandler,
  ActionHandlers,
} from "@src/types/global";

type RouteMap = {
  handlePersonalInfo: "/(user)/PersonalInfo";
  handleAccountSecurity: "/(user)/AccountSecurity";
  handleAboutUs: "/(user)/AboutUs";
};

const Settings: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const settingsItems: SettingItemConfig[] = [
    {
      id: "personal-info",
      icon: <User size={20} color={tokens.colors.primary} />,
      title: t("user.settings.personalInformation"),
      type: "navigation",
      action: "handlePersonalInfo",
    },
    {
      id: "account-security",
      icon: <Shield size={20} color={tokens.colors.primary} />,
      title: t("user.settings.accountSecurity"),
      type: "navigation",
      action: "handleAccountSecurity",
    },
    {
      id: "about-us",
      icon: <Info size={20} color={tokens.colors.primary} />,
      title: t("user.settings.aboutUs"),
      type: "navigation",
      action: "handleAboutUs",
      showSeparator: false,
    },
  ];

  const handleNavigation = (action: keyof RouteMap) => {
    const routes: RouteMap = {
      handlePersonalInfo: "/(user)/PersonalInfo",
      handleAccountSecurity: "/(user)/AccountSecurity",
      handleAboutUs: "/(user)/AboutUs",
    };
    router.push(routes[action]);
  };

  const getActionHandler = (action: string): ActionHandler | undefined => {
    const handlers: ActionHandlers = {
      handlePersonalInfo: () => handleNavigation("handlePersonalInfo"),
      handleAccountSecurity: () => handleNavigation("handleAccountSecurity"),
      handleAboutUs: () => handleNavigation("handleAboutUs"),
    };
    return handlers[action];
  };

  const renderSettingsItem = (item: (typeof settingsItems)[0]) => (
    <SettingsItem
      key={item.id}
      icon={item.icon}
      title={item.title}
      type={item.type}
      onPress={
        item.type === "navigation"
          ? (getActionHandler(item.action) as () => void)
          : undefined
      }
      showSeparator={item.showSeparator}
      qaId={`item_${item.id}_settings`}
    />
  );

  return (
    <>
      <Header
        label={t("user.settings.title")}
        showBack={true}
        qaId="header_settings"
      />
      <ScreenWrapper
        style={{
          ...globalStyles.container,
          backgroundColor: tokens.colors.bg5,
        }}
        qaId="screen_wrapper_settings"
      >
        <SettingsSection qaId="section_settings">
          {settingsItems.map(renderSettingsItem)}
        </SettingsSection>
      </ScreenWrapper>
    </>
  );
};

export { Settings };

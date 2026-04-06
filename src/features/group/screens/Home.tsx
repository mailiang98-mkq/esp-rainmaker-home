/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActivityIndicator } from "react-native";
import { Plus } from "lucide-react-native";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Hooks
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { useHomeScreen } from "@features/group/hooks";
import { getFeatures } from "@/config/features.config";

// Components
import { Header, Tabs, ScreenWrapper } from "@shared/components";
import {
  Banner,
  FloatingChatButton,
  HomeDeviceList,
  HomeEmptyState,
  HomeTooltip,
  MigrationPromptModal,
} from "@features/group/components";

// Utils
import { testProps } from "@shared/utils/testProps";

/**
 * Home Screen – first screen after login.
 * Shows header, home banner, room tabs, device list or empty state, and migration prompt.
 * Thin orchestration: uses useHomeScreen and Group UI components.
 */
const HomeScreen = () => {
  const { t } = useTranslation();
  const {
    isLoading,
    refreshing,
    selectedRoom,
    setSelectedRoom,
    roomTabs,
    roomDevices,
    homeList,
    selectedHome,
    tooltipVisible,
    tooltipPosition,
    handleDropdownPress,
    handleCloseTooltip,
    handleHomeSelect,
    onRefresh,
    redirectOperations,
    showMigrationPrompt,
    handleMigrationPromptUnderstood,
  } = useHomeScreen();

  return (
    <>
      <Header
        label={t("group.home.title")}
        showBack={false}
        rightSlot={
          <Plus
            {...testProps("button_add_device_header")}
            size={24}
            color={tokens.colors.primary}
            onPress={() => redirectOperations("AddDevice")}
          />
        }
        qaId="header_home"
      />
      <ScreenWrapper
        style={globalStyles.homeScreenContainer}
        qaId="screen_wrapper_home"
        excludeTop={true}
      >
        <Banner
          activeGroup={selectedHome}
          onDropdownPress={handleDropdownPress}
          image={require("@assets/images/home.png")}
        />
        <Tabs
          tabs={roomTabs}
          activeTab={selectedRoom}
          onSelectTab={(tab) => setSelectedRoom(tab)}
        />
        {isLoading ? (
          <ActivityIndicator
            {...testProps("activity_indicator_home")}
            style={globalStyles.homeActivityIndicator}
            size="large"
            color={tokens.colors.primary}
          />
        ) : roomDevices?.length > 0 ? (
          <HomeDeviceList
            roomDevices={roomDevices}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : (
          <HomeEmptyState
            onRedirect={redirectOperations}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </ScreenWrapper>

      {getFeatures().aiAgent && <FloatingChatButton />}

      <HomeTooltip
        visible={tooltipVisible}
        onClose={handleCloseTooltip}
        anchorPosition={tooltipPosition}
        selectedHome={selectedHome}
        homeList={homeList}
        onSelectHome={handleHomeSelect}
      />

      <MigrationPromptModal
        visible={showMigrationPrompt}
        onUnderstood={handleMigrationPromptUnderstood}
        title={t("group.home.migrationPromptTitle")}
        message={t("group.home.migrationPromptMessage")}
        buttonLabel={t("group.home.migrationPromptUnderstood")}
      />
    </>
  );
};

export default observer(HomeScreen);

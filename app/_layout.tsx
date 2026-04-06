/*
 * SPDX-FileCopyrightText: 2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Bootstrap
import "@src/bootstrap";

import { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator } from "react-native";

import { Stack, usePathname, RelativePathString } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui, TamaguiProvider } from "tamagui";

// providers
import { StoreProvider } from "@context/store.context";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { Provider as PaperProvider } from "react-native-paper";
import { SceneProvider } from "@context/scenes.context";
import { ScheduleProvider } from "@context/schedules.context";
import { AppRestartContext } from "@context/appRestart.context";

// hooks
import { useTranslation } from "react-i18next";

// components
import { FooterTabs, ToastContainer } from "@shared/components";

// icons
import { Home, Calendar, User, History, Zap } from "lucide-react-native";

// feature flags
import { getFeatures } from "@/config/features.config";

// theme
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// async SDK + runtime config init
import { initializeApp } from "@src/integrations";

const config = createTamagui(defaultConfig);

const stackScreenOptions = {
  headerShown: false,
  animation: "slide_from_right" as const,
  gestureEnabled: true,
  gestureDirection: "horizontal" as const,
};

/**
 * Renders the full provider tree (store, theme, toast, scenes, schedules)
 * and the Expo Router `<Stack>`. Also conditionally shows the bottom
 * `<FooterTabs>` when the active route is one of the top-level tab routes.
 *
 * This component owns zero async side-effects; all heavy lifting is done
 * in `AppInitGate` before this tree is ever mounted.
 */
const InnerLayout = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const features = getFeatures();

  const statusBarHeight = insets.top;

  const tabs = [
    {
      route: "/(group)/Home" as RelativePathString,
      label: t("layout.navigation.footer.home"),
      Icon: Home,
    },
    features.schedules && {
      route: "/(schedule)/Schedules" as RelativePathString,
      label: t("layout.navigation.footer.schedules"),
      Icon: History,
    },
    features.scenes && {
      route: "/(scene)/Scenes" as RelativePathString,
      label: t("layout.navigation.footer.scenes"),
      Icon: Calendar,
    },
    features.automations && {
      route: "/(automation)/Automations" as RelativePathString,
      label: t("layout.navigation.footer.automations"),
      Icon: Zap,
    },
    {
      route: "/(user)/User" as RelativePathString,
      label: t("layout.navigation.footer.user"),
      Icon: User,
    },
  ].filter(Boolean) as Array<{
    route: RelativePathString;
    label: string;
    Icon: any;
  }>;

  const isUserRoute = [
    "/Home",
    "/User",
    features.scenes && "/Scenes",
    features.automations && "/Automations",
    features.schedules && "/Schedules",
  ]
    .filter(Boolean)
    .some((route) => pathname === route);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <TamaguiProvider config={config}>
          <PaperProvider>
            <SceneProvider>
              {/* ToastProvider must wrap ScheduleProvider: ScheduleProvider uses useToast (Tamagui controller). */}
              <ToastProvider>
                <ScheduleProvider>
                  <Stack screenOptions={stackScreenOptions}>
                    {/* Other components */}
                  </Stack>
                  {isUserRoute && <FooterTabs tabs={tabs} />}
                  <ToastContainer />
                  <ToastViewport
                    multipleToasts
                    flexDirection="column-reverse"
                    top={statusBarHeight}
                    alignItems="center"
                    width="100%"
                    padding={16}
                  />
                </ScheduleProvider>
              </ToastProvider>
            </SceneProvider>
          </PaperProvider>
        </TamaguiProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
};

/**
 * Blocks the UI tree until `initializeApp()` resolves. While the promise
 * is pending a full-screen `<ActivityIndicator>` is shown; once settled
 * `<InnerLayout>` (and the whole provider tree) is mounted for the first
 * time, guaranteeing the SDK and runtime config are ready before any
 * feature screen can render.
 *
 * Receives a fresh `key` from `RootLayout` on every programmatic restart,
 * which unmounts and re-mounts this component — re-running the init gate
 * from scratch.
 */
const AppInitGate = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeApp().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={globalStyles.appLoadingContainer}>
        <ActivityIndicator size="large" color={tokens.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={tokens.colors.white} translucent={false} />
      <InnerLayout />
    </SafeAreaProvider>
  );
};

/**
 * Top-level component exported as the default Expo Router root layout.
 *
 * Owns a single `appKey` counter that acts as a "remount key" for the
 * entire app tree. Incrementing it (via `restartApp`) fully unmounts and
 * re-mounts `<AppInitGate>`, which re-runs the SDK init sequence — the
 * React-native equivalent of a soft app restart without leaving the process.
 *
 * `AppRestartContext` propagates `restartApp` down to any consumer that
 * needs to trigger a programmatic restart (e.g. after sign-out or a
 * critical config change).
 */
const RootLayout = () => {
  const [appKey, setAppKey] = useState(0);
  const restartApp = useCallback(() => setAppKey((k) => k + 1), []);

  return (
    <AppRestartContext.Provider value={{ restartApp }}>
      <AppInitGate key={appKey} />
    </AppRestartContext.Provider>
  );
};

export default RootLayout;

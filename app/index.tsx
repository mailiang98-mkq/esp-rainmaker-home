/*
 * SPDX-FileCopyrightText: 2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import "../i18n";
import { StyleSheet, View } from "react-native";
import { useCallback, useEffect } from "react";
// Initialize Matter adapter early
import "@native-adaptors/implementations/ESPMatterAdapter";
// hooks
import { useCDF } from "@shared/hooks/useCDF";
import { useRouter, usePathname, useFocusEffect } from "expo-router";
// components
import { Logo } from "@shared/components";
import { registerForNotification } from "@shared/utils/notifications";
import { executePostLoginPipeline } from "@features/auth/utils/postLoginPipeline";
// theme
import { tokens } from "@shared/theme/tokens";
import asyncStorageAdapter from "@native-adaptors/implementations/ESPAsyncStorage";
import { RUNTIME_CONFIG_STORAGE_KEYS } from "@config/runtime.config";

const index = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { store, isInitialized, syncHomeWithNodes, initUserCustomData } =
    useCDF();

  const user = store?.userStore.user;

  const authCheck = async () => {
    try {
      if (user) {
        await executePostLoginPipeline({
          store,
          router,
          syncHomeWithNodes,
          initUserCustomData,
        });
        return;
      }

      const validRoutes = ["/ConfirmationCode", "/Forgot", "/Login", "/Signup"];
      const isAuthRoute = validRoutes.some((route) => pathname.includes(route));
      if (!isAuthRoute) {
        router.replace("/(auth)/Login");
      }
    } catch (error) {
      await user?.logout();
      router.replace("/(auth)/Login");
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (store && isInitialized) {
        setTimeout(async () => {
          authCheck();
        }, 2000);
      }
    }, [store, isInitialized]),
  );

  // Initialize notification when user is logged in
  useEffect(() => {
    if (user && isInitialized) {
      initNotification();
    }
  }, [user, isInitialized]);

  const initNotification = async () => {
    try {
      await registerForNotification(store);
    } catch (err) {
      console.error(err);
      console.error("Failed to initialize notification");
    }
  };

  return (
    <View style={styles.splashScreen}>
      <Logo qaId="logo_index" />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: tokens.colors.white,
  },
});

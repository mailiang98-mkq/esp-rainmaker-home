/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useCDF } from "@shared/hooks/useCDF";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useToast } from "@shared/hooks/useToast";
import { executePostLoginPipeline } from "@features/auth/utils/postLoginPipeline";
import { CDF_EXTERNAL_PROPERTIES } from "@shared/utils/constants";
import { getAuthAllowedUsernameTypes } from "@features/auth/utils/authHelper";
import {
  createAuthUsernameValidator,
  createPasswordValidator,
  isUsernameAllowedForAuth,
} from "@features/auth/utils/authHelper";
export type PostSignupLoginCredentials = {
  username: string;
  password: string;
};

let pendingPostSignupLogin: PostSignupLoginCredentials | null = null;

/** Queue credentials for Login to consume and sign in (in-memory only; never in URL). */
export function setPendingPostSignupLogin(
  creds: PostSignupLoginCredentials
): void {
  pendingPostSignupLogin = creds;
}

export function peekPendingPostSignupLogin(): PostSignupLoginCredentials | null {
  return pendingPostSignupLogin;
}

export function consumePendingPostSignupLogin(): PostSignupLoginCredentials | null {
  const next = pendingPostSignupLogin;
  pendingPostSignupLogin = null;
  return next;
}

export type PipelineProgress = {
  currentStep: string;
  completed: number;
  total: number;
  steps: Array<{
    name: string;
    status: "pending" | "running" | "completed" | "failed";
  }>;
};

export function useLogin() {
  const { store, syncHomeWithNodes, initUserCustomData, setESPCDFUser } =
    useCDF();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const toast = useToast();

  const usernameParam =
    typeof params.username === "string" ? params.username : "";
  const [email, setEmail] = useState(usernameParam);
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgress | null>(null);
  const [showConfigResetDialog, setShowConfigResetDialog] = useState(false);
  const [isConfigResetting, setIsConfigResetting] = useState(false);
  const [authFieldsKey, setAuthFieldsKey] = useState(0);
  const postSignupAutoLoginStartedRef = useRef(false);

  const usernameValidator = useMemo(
    () => createAuthUsernameValidator(getAuthAllowedUsernameTypes(), t),
    [t]
  );
  const passwordValidator = useMemo(() => createPasswordValidator(t), [t]);

  const performLogin = useCallback(
    async (username: string, pwd: string) => {
      setIsLoading(true);
      try {
        await store?.userStore.auth.login({
          username,
          password: pwd,
        });

        if (!store?.userStore.user) return;

        setESPCDFUser(store.userStore.user ?? null);
        await executePostLoginPipeline({
          store,
          router,
          syncHomeWithNodes,
          initUserCustomData,
        });
      } catch (error: unknown) {
        const err = error as { description?: string };
        toast.showError(
          t("auth.errors.signInFailed"),
          err?.description || t("auth.errors.fallback")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      store,
      router,
      syncHomeWithNodes,
      initUserCustomData,
      setESPCDFUser,
      toast,
      t,
    ]
  );

  useEffect(() => {
    if (usernameParam) {
      setEmail(usernameParam);
      const validation = usernameValidator(usernameParam);
      setIsEmailValid(validation.isValid);
    }
  }, [usernameParam, usernameValidator]);

  useEffect(() => {
    if (postSignupAutoLoginStartedRef.current) return;
    const peeked = peekPendingPostSignupLogin();
    if (!peeked) return;

    const allowed = getAuthAllowedUsernameTypes();
    if (!isUsernameAllowedForAuth(peeked.username, allowed)) {
      consumePendingPostSignupLogin();
      return;
    }
    const uOk = usernameValidator(peeked.username).isValid;
    const pOk = passwordValidator(peeked.password).isValid;
    if (!uOk || !pOk) {
      consumePendingPostSignupLogin();
      return;
    }

    postSignupAutoLoginStartedRef.current = true;
    const creds = consumePendingPostSignupLogin();
    if (!creds) return;

    setEmail(creds.username);
    setPassword(creds.password);
    setIsEmailValid(true);
    setIsPasswordValid(true);
    setAuthFieldsKey((k) => k + 1);

    void performLogin(creds.username, creds.password);
  }, [performLogin, usernameValidator, passwordValidator]);

  const handleEmailChange = (value: string, isValid: boolean) => {
    setEmail(value.trim());
    setIsEmailValid(isValid);
  };

  const handlePasswordChange = (value: string, isValid: boolean) => {
    setPassword(value.trim());
    setIsPasswordValid(isValid);
  };

  const login = async () => {
    if (!isEmailValid || !isPasswordValid) return;

    const allowed = getAuthAllowedUsernameTypes();
    if (!isUsernameAllowedForAuth(email, allowed)) {
      return;
    }

    await performLogin(email, password);
  };

  const forgotPwd = () => {
    router.push("/(auth)/Forgot");
  };

  const oauthLogin = async (provider: string) => {
    setIsOAuthLoading(true);
    setPipelineProgress(null);
    try {
      const user = await store?.userStore.auth?.loginWithOauth({
        identityProvider: provider,
      });

      if (user) {
        store!.userStore[CDF_EXTERNAL_PROPERTIES.IS_OAUTH_LOGIN] = true;
        setESPCDFUser(store!.userStore.user ?? null);

        const pipelineSteps = [
          { name: "setUserTimeZone", status: "pending" as const },
          { name: "registerForNotification", status: "pending" as const },
          { name: "syncHomeWithNodes", status: "pending" as const },
          { name: "updateRefreshTokensForAllAIDevices", status: "pending" as const },
          { name: "initUserCustomData", status: "pending" as const },
          { name: "getUserProfileAndRoute", status: "pending" as const },
        ];

        setPipelineProgress({
          currentStep: "",
          completed: 0,
          total: pipelineSteps.length,
          steps: pipelineSteps,
        });

        await executePostLoginPipeline({
          store: store!,
          router,
          syncHomeWithNodes,
          initUserCustomData,
          onStepStart: (stepName) => {
            setPipelineProgress((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                currentStep: stepName,
                steps: prev.steps.map((step) =>
                  step.name === stepName ? { ...step, status: "running" as const } : step
                ),
              };
            });
          },
          onStepComplete: (stepName) => {
            setPipelineProgress((prev) => {
              if (!prev) return prev;
              const updatedSteps = prev.steps.map((step) =>
                step.name === stepName ? { ...step, status: "completed" as const } : step
              );
              const completed = updatedSteps.filter((s) => s.status === "completed").length;
              return {
                ...prev,
                currentStep: stepName,
                completed,
                steps: updatedSteps,
              };
            });
          },
          onProgress: (stepName, state) => {
            setPipelineProgress((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                currentStep: stepName,
                completed: state.completed,
                total: state.total,
              };
            });
          },
        });
      }
    } catch (error) {
      console.error(`OAuth login failed for provider ${provider}:`, error);
      let errorMessage = "OAuth login failed. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("OAUTH_CANCELLED")) {
          errorMessage = "OAuth login was cancelled.";
        } else if (error.message.includes("NO_BROWSER_FOUND")) {
          errorMessage = "No browser app found. Please install a browser.";
        } else {
          errorMessage = `OAuth error: ${error.message}`;
        }
      }
      toast.showError("OAuth Login Failed", errorMessage);
      setPipelineProgress(null);
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const handleCancelOAuth = () => {
    setIsOAuthLoading(false);
    setPipelineProgress(null);
  };

  const handleConfigReset = () => {
    setShowConfigResetDialog(true);
  };

  const getFriendlyStepName = (stepName: string): string => {
    const stepMap: Record<string, string> = {
      setUserTimeZone: t("auth.login.settingUpAccount") || "Setting up account",
      registerForNotification: t("auth.login.settingUpAccount") || "Setting up account",
      syncHomeWithNodes: t("auth.login.settingUpHomes") || "Setting up homes",
      updateRefreshTokensForAllAIDevices: t("auth.login.settingUpNodes") || "Setting up nodes",
      initUserCustomData: t("auth.login.settingUpNodes") || "Setting up nodes",
    };
    return stepMap[stepName] || stepName;
  };

  const getCurrentFriendlyMessage = (): string => {
    if (!pipelineProgress) {
      return t("auth.login.settingUpAccount") || "Setting up account";
    }
    if (pipelineProgress.currentStep === "getUserProfileAndRoute") {
      return t("auth.login.finishingUp") || "Finishing up";
    }
    if (!pipelineProgress.currentStep) {
      return t("auth.login.settingUpAccount") || "Setting up account";
    }
    return getFriendlyStepName(pipelineProgress.currentStep);
  };

  return {
    email,
    usernameParam,
    password,
    authFieldsKey,
    isEmailValid,
    isPasswordValid,
    isLoading,
    isOAuthLoading,
    pipelineProgress,
    showConfigResetDialog,
    isConfigResetting,
    setShowConfigResetDialog,
    setIsConfigResetting,
    emailValidator: usernameValidator,
    passwordValidator,
    handleEmailChange,
    handlePasswordChange,
    login,
    forgotPwd,
    oauthLogin,
    handleCancelOAuth,
    handleConfigReset,
    getCurrentFriendlyMessage,
  };
}

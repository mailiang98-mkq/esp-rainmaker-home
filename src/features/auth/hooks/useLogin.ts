/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useCDF } from "@shared/hooks/useCDF";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useToast } from "@shared/hooks/useToast";
import { executePostLoginPipeline } from "@features/auth/utils/postLoginPipeline";
import { CDF_EXTERNAL_PROPERTIES } from "@shared/utils/constants";
import {
  createEmailValidator,
  createPasswordValidator,
} from "@features/auth/utils/authHelper";

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

  const emailParam = typeof params.email === "string" ? params.email : "";
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgress | null>(null);
  const [showConfigResetDialog, setShowConfigResetDialog] = useState(false);
  const [isConfigResetting, setIsConfigResetting] = useState(false);

  const emailValidator = createEmailValidator(t);
  const passwordValidator = createPasswordValidator(t);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      const validation = emailValidator(emailParam);
      setIsEmailValid(validation.isValid);
    }
  }, [emailParam]);

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

    setIsLoading(true);
    try {
      await store?.userStore.auth.login({
        username: email,
        password: password,
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
    emailParam,
    password,
    isEmailValid,
    isPasswordValid,
    isLoading,
    isOAuthLoading,
    pipelineProgress,
    showConfigResetDialog,
    isConfigResetting,
    setShowConfigResetDialog,
    setIsConfigResetting,
    emailValidator,
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

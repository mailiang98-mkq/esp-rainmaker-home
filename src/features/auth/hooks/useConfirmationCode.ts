/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { useCDF } from "@shared/hooks/useCDF";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation } from "react-i18next";
import { createCodeValidator } from "@features/auth/utils/authHelper";
import { executePostLoginPipeline } from "@features/auth/utils/postLoginPipeline";
import { router } from "expo-router";

export function useConfirmationCode() {
  const { t } = useTranslation();
  const { store, initUserCustomData, setESPCDFUser, syncHomeWithNodes } =
    useCDF();
  const { email, password = "" } = useLocalSearchParams();
  const toast = useToast();

  const [code, setCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const codeValidator = createCodeValidator(t("auth.validation.invalidCode"));

  const handleCodeChange = (value: string, isValid: boolean) => {
    setCode(value);
    setIsCodeValid(isValid);
  };

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [countdown]);

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {
      const res = await store?.userStore.auth?.getSignUpCode({
        username: email as string,
        password: password as string,
      });
      if (res) {
        toast.showSuccess(t("auth.verification.heading"));
        setCountdown(60);
      }
    } catch (error: unknown) {
      const err = error as { description?: string };
      toast.showError(
        t("auth.errors.verificationCodeSendFailed"),
        err.description || t("auth.errors.fallback")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async () => {
    try {
      const res = await store?.userStore.auth?.login({
        username: email as string,
        password: password as string,
      });
      if (res) {
        router.dismissAll();
        setESPCDFUser(store!.userStore.user ?? null);
        await executePostLoginPipeline({
          router,
          syncHomeWithNodes,
          initUserCustomData,
          store: store!,
        });
      }
    } catch (error: unknown) {
      const err = error as { description?: string };
      toast.showError(
        t("auth.errors.autoSignInFailed"),
        err.description || t("auth.errors.fallback")
      );
      setTimeout(() => {
        router.dismissTo({
          pathname: "/(auth)/Login",
          params: { email },
        });
      }, 10000);
    }
  };

  const handleVerify = async () => {
    if (!isCodeValid || !code.trim()) return;

    setIsLoading(true);
    try {
      const res = await store?.userStore.auth?.confirmSignUp({
        username: email as string,
        verificationCode: code,
      });
      if (res) {
        toast.showSuccess(t("auth.signup.registrationSuccess"));
        await loginUser();
      }
    } catch (error: unknown) {
      const err = error as { description?: string };
      toast.showError(
        t("auth.errors.signupConfirmationFailed"),
        err.description || t("auth.errors.fallback")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    code,
    isCodeValid,
    isLoading,
    countdown,
    codeValidator,
    handleCodeChange,
    handleResendCode,
    handleVerify,
  };
}

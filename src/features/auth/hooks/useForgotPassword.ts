/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useCDF } from "@shared/hooks/useCDF";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useToast } from "@shared/hooks/useToast";
import { createEmailValidator } from "@features/auth/utils/authHelper";

export function useForgotPassword() {
  const { t } = useTranslation();
  const { store } = useCDF();
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailValidator = createEmailValidator(t);

  const handleEmailChange = (value: string, isValid: boolean) => {
    setEmail(value.trim());
    setIsEmailValid(isValid);
  };

  const sendVerificationCode = async () => {
    if (!isEmailValid || !email) return;

    setIsLoading(true);
    try {
      const res = await store?.userStore.auth?.forgotPassword({
        username: email,
      });
      if (res) {
        toast.showSuccess(t("auth.verification.heading"));
        router.push({
          pathname: "/(auth)/ResetPassword",
          params: { email },
        });
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

  return {
    email,
    isEmailValid,
    isLoading,
    emailValidator,
    handleEmailChange,
    sendVerificationCode,
  };
}

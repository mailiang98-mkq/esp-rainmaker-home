/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { VoiceAssistantGuide } from "@features/user/components";
import { useTranslation } from "react-i18next";
import { ALEXA_IMAGES } from "@features/user/constants/voiceAssistantImages";

const AlexaGuide: React.FC = () => {
  const { t } = useTranslation();

  const steps = useMemo(
    () => [
      { icon1: "nova-alexa-1", icon2: "nova-alexa-2", title: t("alexa.step1") },
      { icon1: "nova-alexa-3", icon2: "nova-alexa-4", title: t("alexa.step2") },
      { icon1: "nova-alexa-5", icon2: "nova-alexa-6", title: t("alexa.step3") },
      { icon1: "nova-alexa-7", icon2: "nova-alexa-8", title: t("alexa.step4") },
    ],
    [t],
  );

  return (
    <VoiceAssistantGuide
      headerLabel={t("alexa.guide")}
      steps={steps}
      imageMap={ALEXA_IMAGES}
    />
  );
};

export { AlexaGuide };

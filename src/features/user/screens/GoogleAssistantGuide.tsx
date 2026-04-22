/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { VoiceAssistantGuide } from "@features/user/components";
import { useTranslation } from "react-i18next";
import { GOOGLE_IMAGES } from "@features/user/constants/voiceAssistantImages";

/**
 * Renders the google assistant guide UI section.
 */
const GoogleAssistantGuide: React.FC = () => {
  const { t } = useTranslation();

  const steps = useMemo(
    () => [
      {
        icon1: "nova-google-1",
        icon2: "nova-google-2",
        title: t("googleAssistant.step1"),
      },
      {
        icon1: "nova-google-3",
        icon2: "nova-google-4",
        title: t("googleAssistant.step2"),
      },
      {
        icon1: "nova-google-5",
        icon2: "nova-google-6",
        title: t("googleAssistant.step3"),
      },
      {
        icon1: "nova-google-7",
        icon2: "nova-google-8",
        title: t("googleAssistant.step4"),
      },
    ],
    [t],
  );

  return (
    <VoiceAssistantGuide
      headerLabel={t("googleAssistant.guide")}
      steps={steps}
      imageMap={GOOGLE_IMAGES}
    />
  );
};

export { GoogleAssistantGuide };

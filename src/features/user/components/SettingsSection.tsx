/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View } from "react-native";

// Components
import ContentWrapper from "@shared/components/Layout/ContentWrapper";

// Styles
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { tokens } from "@shared/theme/tokens";

import { testProps } from "@shared/utils/testProps";
// Types
interface SettingsSectionProps {
  /** Child components to render */
  children: React.ReactNode;
  /** QA automation identifier */
  qaId?: string;
}

/**
 * SettingsSection
 *
 * A container component for grouping settings items.
 * Features:
 * - Consistent padding and spacing
 * - Content wrapping
 * - Section grouping
 */
const SettingsSection: React.FC<SettingsSectionProps> = ({
  children,
  qaId,
}) => {
  return (
    <ContentWrapper
      qaId={qaId}
      style={{
        ...globalStyles.shadowElevationForLightTheme,
        backgroundColor: tokens.colors.white,
      }}
    >
      <View
        {...(qaId ? testProps(`view_${qaId}`) : {})}
        style={globalStyles.settingsSection}
      >
        {children}
      </View>
    </ContentWrapper>
  );
};

export default SettingsSection;

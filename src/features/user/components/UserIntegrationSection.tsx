/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View } from "react-native";

import { ContentWrapper } from "@shared/components";
import IntegrationItem from "./IntegrationItem";
import { testProps } from "@shared/utils/testProps";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { userStyles } from "@features/user/theme/userStyleSheet";
import { IntegrationConfig } from "@src/types/global";

type UserIntegrationSectionProps = {
  title: string;
  integrations: IntegrationConfig[];
  onIntegrationPress: (action: string) => void;
};

const UserIntegrationSection: React.FC<UserIntegrationSectionProps> = ({
  title,
  integrations,
  onIntegrationPress,
}) => (
  <View
    {...testProps("view_user_integration")}
    style={[userStyles.section, globalStyles.shadowElevationForLightTheme]}
  >
    <ContentWrapper title={title} qaId="3p_integration">
      <View
        {...testProps("view_3p_integration")}
        style={[
          globalStyles.flex,
          globalStyles.alignCenter,
          userStyles.integrationsContainer,
        ]}
      >
        {integrations.map((integration) => (
          <IntegrationItem
            key={integration.id}
            icon={integration.icon}
            title={integration.title}
            onPress={() => onIntegrationPress(integration.action)}
          />
        ))}
      </View>
    </ContentWrapper>
  </View>
);

export default UserIntegrationSection;

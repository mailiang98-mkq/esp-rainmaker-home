/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { Header, ScreenWrapper } from "@shared/components";
import {
  ConfigureChatCard,
  ConfigureDeviceCard,
  AgentTermsBottomSheet,
} from "@features/agent/components";
import { useConfigure } from "@features/agent/hooks";
import { testProps } from "@shared/utils/testProps";

/**
 * Screen to link chat vs devices for an AI agent: pick devices, update agent id, and accept terms when required.
 */
export const ConfigureScreen = observer(() => {
  const { t } = useTranslation();
  const {
    id,
    aiDevices,
    selectedDevices,
    updatingDevices,
    isUpdating,
    agentName,
    isLoadingAgentName,
    agentNameError,
    showTermsBottomSheet,
    handleDeviceToggle,
    handleUpdateAgentId,
    getDeviceKey,
    handleChatPress,
    closeTermsBottomSheet,
    completeTermsBottomSheet,
  } = useConfigure();

  return (
    <>
      <Header
        label={t("agent.configure.title")}
        showBack={true}
        customBackUrl="/(group)/Home"
        qaId="header_configure"
      />
      <ScreenWrapper
        style={globalStyles.agentSettingsContainer}
        qaId="screen_wrapper_configure"
      >
        <ScrollView
          style={globalStyles.configureScrollView}
          contentContainerStyle={globalStyles.configureScrollContent}
        >
          {id && (
            <>
              <View style={globalStyles.configureAgentIdHeader}>
                <Text
                  {...testProps("text_agent_id_label")}
                  style={globalStyles.configureAgentIdLabel}
                >
                  {t("agent.configure.agentIdToSet")}
                </Text>
              </View>
              <View style={globalStyles.configureAgentIdValueContainer}>
                {isLoadingAgentName ? (
                  <ActivityIndicator
                    size="small"
                    color={tokens.colors.primary}
                  />
                ) : agentNameError ? (
                  <>
                    <Text
                      {...testProps("text_agent_id_note")}
                      style={globalStyles.configureAgentIdNote}
                    >
                      {t("agent.configure.agentConfigNotAvailable") ||
                        "Agent configuration not available"}
                    </Text>
                    <Text
                      {...testProps("text_agent_id_value")}
                      style={globalStyles.configureAgentIdValue}
                    >
                      {id}
                    </Text>
                  </>
                ) : (
                  <Text
                    {...testProps("text_agent_id_value")}
                    style={globalStyles.configureAgentIdValue}
                  >
                    {agentName || id}
                  </Text>
                )}
              </View>
            </>
          )}

          <View style={globalStyles.configureInstructionsContainer}>
            <Text style={globalStyles.configureInstructionsText}>
              {t("agent.configure.selectDevices")}
            </Text>
          </View>

          {id && <ConfigureChatCard onPress={handleChatPress} />}

          {aiDevices.map((deviceData, index) => {
            const deviceKey = getDeviceKey(
              deviceData.node.id,
              deviceData.device.name,
            );
            return (
              <ConfigureDeviceCard
                key={deviceKey}
                deviceData={deviceData}
                index={index}
                deviceKey={deviceKey}
                isSelected={selectedDevices.has(deviceKey)}
                isUpdating={updatingDevices.has(deviceKey)}
                onPress={() => handleDeviceToggle(deviceKey)}
              />
            );
          })}
        </ScrollView>

        {aiDevices.length > 0 && (
          <View style={[globalStyles.footerAddButtonContainer, { bottom: 5 }]}>
            <Pressable
              {...testProps("button_update_agent_id")}
              onPress={handleUpdateAgentId}
              disabled={selectedDevices.size === 0 || isUpdating || !id}
              style={[
                globalStyles.footerAddButton,
                (selectedDevices.size === 0 || isUpdating || !id) &&
                  globalStyles.btnDisabled,
              ]}
            >
              {isUpdating ? (
                <ActivityIndicator color={tokens.colors.white} size="small" />
              ) : (
                <Text style={globalStyles.configureUpdateButtonText}>
                  {t("agent.configure.updateDevices")}
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </ScreenWrapper>

      <AgentTermsBottomSheet
        visible={showTermsBottomSheet}
        onClose={closeTermsBottomSheet}
        onComplete={completeTermsBottomSheet}
        allowClose={true}
      />
    </>
  );
});

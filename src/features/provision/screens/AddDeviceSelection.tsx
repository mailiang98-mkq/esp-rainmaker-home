/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";

// Theme and Styles
import { tokens } from "@shared/theme/tokens";

// Components
import { ScreenWrapper, Header, Typo } from "@shared/components";
import {
  DeviceOptionCard,
  NonPrimaryUserCard,
} from "@features/provision/components";

// Hooks
import { useAddDeviceSelection } from "@features/provision/hooks";

/**
 * AddDeviceSelection Component
 *
 * This component displays the device addition method selection screen
 * where users can choose between different provisioning methods.
 */
const AddDeviceSelection = () => {
  const { t } = useTranslation();
  const {
    deviceOptions,
    isPrimaryUser,
    homeName,
    restrictionTitle,
    restrictionMessage,
  } = useAddDeviceSelection();

  return (
    <>
      <Header
        label={t("device.addDeviceSelection.title")}
        qaId="header_add_device_selection"
      />
      <ScreenWrapper
        style={styles.container}
        qaId="screen_wrapper_add_device_selection"
      >
        {isPrimaryUser ? (
          <>
            <Typo
              variant="body"
              style={styles.noteText}
              qaId="text_add_device_selection_note"
            >
              {t("device.addDeviceSelection.note")}
            </Typo>
            {deviceOptions.map((option) => (
              <DeviceOptionCard
                key={option.label}
                icon={option.icon}
                label={option.label}
                description={option.description}
                onPress={option.onClick}
              />
            ))}
          </>
        ) : (
          <NonPrimaryUserCard
            homeName={homeName}
            restrictionTitle={restrictionTitle}
            restrictionMessage={restrictionMessage}
          />
        )}
      </ScreenWrapper>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing._15,
    backgroundColor: tokens.colors.bg5,
  },
  noteText: {
    color: tokens.colors.text_secondary,
    marginBottom: tokens.spacing._20,
    paddingHorizontal: tokens.spacing._5,
    fontSize: tokens.fontSize.md,
  },
});

export default observer(AddDeviceSelection);

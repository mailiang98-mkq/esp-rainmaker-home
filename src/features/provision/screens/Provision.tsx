/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, StyleSheet, Image, ScrollView } from "react-native";

// Styles
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Hooks
import { useTranslation } from "react-i18next";
import { useProvision } from "@features/provision/hooks";
import { mapStageStatusToProvisionStatus } from "@features/provision/utils/provisionHelper";

// Components
import { Header, ScreenWrapper, Button } from "@shared/components";
import { ProvisioningStep } from "@features/provision/components";

// Utils
import { testProps } from "@shared/utils/testProps";

/**
 * Provision
 *
 * Main component for handling device provisioning process
 * Shows progress steps and handles Node provisioning steps
 * @returns JSX component
 */
const Provision = () => {
  const { t } = useTranslation();
  const { stages, isComplete, stepsScrollViewRef, handleContinue } =
    useProvision();

  // Render
  return (
    <>
      <Header
        label={t("device.provision.title")}
        showBack
        qaId="header_provision"
      />
      <ScreenWrapper
        style={{
          ...globalStyles.screenWrapper,
          backgroundColor: tokens.colors.bg5,
        }}
        qaId="screen_wrapper_provision"
      >
        <View
          {...testProps("view_provision")}
          style={[globalStyles.flex1, globalStyles.itemCenter, styles.content]}
        >
          <View
            {...testProps("view_image_container_provision")}
            style={[globalStyles.itemCenter, styles.imageContainer]}
          >
            <Image
              {...testProps("image_provision")}
              source={require("@assets/images/network.png")}
              style={styles.networkImage}
              resizeMode="contain"
            />
          </View>

          <ScrollView
            ref={stepsScrollViewRef}
            style={[globalStyles.fullWidth, styles.stepsScrollView]}
            contentContainerStyle={styles.stepsContainer}
            {...testProps("scroll_provision")}
            showsVerticalScrollIndicator={false}
          >
            {stages.map((stage) => (
              <ProvisioningStep
                key={stage.id}
                description={stage.title}
                status={mapStageStatusToProvisionStatus(stage.status)}
                error={stage.error}
              />
            ))}
          </ScrollView>

          <Button
            label={t("layout.shared.continue")}
            onPress={handleContinue}
            style={{
              ...globalStyles.btn,
              ...globalStyles.bgBlue,
              ...globalStyles.shadowElevationForLightTheme,
            }}
            disabled={!isComplete}
            qaId="button_continue_provision"
          />
        </View>
      </ScreenWrapper>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
    padding: tokens.spacing._20,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    marginBottom: tokens.spacing._20,
  },
  networkImage: {
    width: 160,
    height: 160,
  },
  stepsScrollView: {
    maxHeight: 300,
  },
  stepsContainer: {
    gap: tokens.spacing._15,
    paddingVertical: tokens.spacing._10,
  },
});

export default Provision;

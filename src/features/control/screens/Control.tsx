/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { View, Text, StyleSheet, Pressable } from "react-native";

// Styles
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Hooks
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { useControl } from "@features/control/hooks";

// Icons
import { Settings } from "lucide-react-native";

// Components
import { Header, ScreenWrapper } from "@shared/components";
import Fallback from "./device_panels/Fallback";
import LightControl from "./device_panels/Light";
import SwitchControl from "./device_panels/Switch";
import AiAgentControl from "./device_panels/AiAgent";

// Utils
import { testProps } from "@shared/utils/testProps";

const CONTROL_PANELS: Record<string, React.FC<any>> = {
  light: LightControl,
  switch: SwitchControl,
  "ai-agent": AiAgentControl,
};

/**
 * Control Component
 * Main device control screen that renders different device controls based on device type
 */
const Control = () => {
  const { t } = useTranslation();
  const { node, device, displayName, deviceConfig, handleMorePress } =
    useControl();

  // Early return for missing device
  if (!device) {
    return (
      <>
        <Header
          label={t("device.control.title")}
          showBack={true}
          qaId="header_control"
        />
        <ScreenWrapper
          style={styles.containerPadding}
          qaId="screen_wrapper_control"
          excludeTop={true}
        >
          <View
            {...testProps("view_control")}
            style={globalStyles.errorContainer}
          >
            <Text {...testProps("text_error")} style={globalStyles.errorText}>
              {t("device.control.deviceNotFound")}
            </Text>
          </View>
        </ScreenWrapper>
      </>
    );
  }

  // Device control renderer
  const renderDeviceControl = () => {
    if (!deviceConfig || !deviceConfig.controlPanel) {
      return <Fallback node={node as any} device={device} />;
    }

    const ControlPanel =
      CONTROL_PANELS[deviceConfig.controlPanel as keyof typeof CONTROL_PANELS];
    return <ControlPanel node={node} device={device} />;
  };

  // Render
  return (
    <>
      <Header
        label={displayName}
        showBack={true}
        rightSlot={
          <Pressable {...testProps("button_more")} onPress={handleMorePress}>
            <Settings size={24} color={tokens.colors.primary} />
          </Pressable>
        }
        qaId="header_control"
      />
      <ScreenWrapper
        style={styles.container}
        qaId="screen_wrapper_control"
        excludeTop={true}
      >
        <View {...testProps("view_control")} style={globalStyles.flex1}>
          {renderDeviceControl()}
        </View>
      </ScreenWrapper>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    backgroundColor: tokens.colors.bg5,
  },
  containerPadding: {
    ...globalStyles.container,
    paddingBottom: 100,
  },
});

export default observer(Control);

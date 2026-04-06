/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Styles
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Hooks
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { useDeviceSelection } from "@features/provision/hooks";
import type { ScheduleDeviceSelectionData } from "@src/types/global";

// Components
import { Header, ScreenWrapper } from "@shared/components";
import {
  ScheduleDeviceSelectionEmptyState,
  ScheduleDeviceSelectionFooter,
} from "@features/schedule/components";
import DeviceSelectionList from "@shared/components/DeviceSelectionList";

/**
 * ScheduleDeviceSelectionScreen
 *
 * A screen component that allows users to select devices for creating schedules.
 * It displays available devices with their selection state and online status.
 *
 * Features:
 * - Lists all available devices
 * - Allows device selection/deselection
 * - Handles online/offline device states
 * - Shows device connectivity status
 * - Simple device list without parameter conflicts
 */
export const ScheduleDeviceSelectionScreen = observer(() => {
  const { t } = useTranslation();
  const {
    devices,
    selectedDevices,
    nonSelectedDevices,
    handleDeviceSelect,
    handleDeviceDelete,
    isDeviceDisabled,
    getDeviceActionValues,
  } = useDeviceSelection("schedule");

  return (
    <>
      <Header label={t("schedule.deviceSelection.title")} showBack={true} />
      <ScreenWrapper
        style={{
          ...globalStyles.container,
          padding: 0,
        }}
      >
        {/* Main Content */}
        {devices.length === 0 ? (
          <ScheduleDeviceSelectionEmptyState />
        ) : (
          <>
            <DeviceSelectionList
              identifier="schedule"
              selectedDevices={selectedDevices as ScheduleDeviceSelectionData[]}
              nonSelectedDevices={
                nonSelectedDevices as ScheduleDeviceSelectionData[]
              }
              isDeviceDisabled={isDeviceDisabled}
              getDeviceActionValues={getDeviceActionValues}
              onDeviceSelect={handleDeviceSelect}
              onDeviceDelete={handleDeviceDelete}
            />

            {/* Footer Actions */}
            <ScheduleDeviceSelectionFooter
              selectedDevicesCount={selectedDevices.length}
            />
          </>
        )}
      </ScreenWrapper>
    </>
  );
});

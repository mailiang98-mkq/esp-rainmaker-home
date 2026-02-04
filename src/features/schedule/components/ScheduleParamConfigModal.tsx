/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { ActionButton, ParamWrap } from "@shared/components";
import { testProps } from "@shared/utils/testProps";
import { PARAM_CONTROLS } from "@/config/params.config";
import { DeviceParamGroup } from "@src/types/global";
import type { ESPCDFDeviceParam } from "@store";

type ParamWithValue = ESPCDFDeviceParam & { value: any };

/**
 * UI Control Map for parameter types
 * Maps parameter types to their corresponding UI controls
 */
const PARAMS_UI = PARAM_CONTROLS.reduce(
  (acc, control) => {
    if (control.types.includes("esp.ui.hidden")) return acc;
    control.types.forEach((type) => {
      acc[type] = {
        types: control.types,
        control: control.control,
      };
    });
    return acc;
  },
  {} as Record<string, DeviceParamGroup["control"]>,
);

interface ScheduleParamConfigModalProps {
  visible: boolean;
  selectedParam: ParamWithValue | null;
  hasActionForParam: (paramName: string) => boolean;
  onClose: () => void;
  onValueChange: (value: any) => void;
  onSave: () => void;
  onDelete: () => void;
}

/**
 * ScheduleParamConfigModal Component
 *
 * Bottom sheet modal for configuring device parameters.
 */
export const ScheduleParamConfigModal = ({
  visible,
  selectedParam,
  hasActionForParam,
  onClose,
  onValueChange,
  onSave,
  onDelete,
}: ScheduleParamConfigModalProps) => {
  const { t } = useTranslation();

  const renderParamControl = (param: ParamWithValue): React.ReactNode => {
    const Control = param.uiType && PARAMS_UI[param.uiType]?.control;
    if (!Control) return null;
    return (
      <Control
        label={param.name}
        value={param.value}
        onValueChange={() => {}}
        disabled={false}
        meta={param as any}
      />
    );
  };

  return (
    <Modal
      {...testProps("modal_schedule_device_params_selection")}
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        {...testProps("button_close_schedule_device_params")}
        style={globalStyles.scheduleParamModalContainer}
        onPress={onClose}
      >
        <Pressable
          style={globalStyles.scheduleParamModalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View
            style={globalStyles.scheduleParamModalHandle}
            {...testProps("view_schedule_device_params_selection")}
          />

          {/* Parameter UI */}
          <View
            {...testProps("view_schedule_device_param_ui_selection")}
            style={globalStyles.scheduleParamModalUIContainer}
          >
            {selectedParam && (
              <ParamWrap
                key={`${selectedParam.name}-modal`}
                param={selectedParam as any}
                disabled={false}
                setUpdating={() => {}}
                onValueChange={(value) => onValueChange(value)}
                qaId={`schedule_param_${selectedParam.name}_selection`}
              >
                {renderParamControl(selectedParam)}
              </ParamWrap>
            )}
          </View>

          {/* Action Buttons */}
          <View
            style={globalStyles.scheduleParamModalActionButtonsContainer}
            {...testProps("view_schedule_device_params_selection")}
          >
            {hasActionForParam(selectedParam?.name || "") && (
              <ActionButton
                onPress={onDelete}
                variant="danger"
                style={globalStyles.scheduleParamModalActionButton}
                qaId="button_delete_schedule_device_params_selection"
              >
                <Text
                  {...testProps("text_delete_schedule_device_params_selection")}
                  style={[globalStyles.fontMedium, globalStyles.textWhite]}
                >
                  {t("layout.shared.delete")}
                </Text>
              </ActionButton>
            )}
            <ActionButton
              onPress={onSave}
              variant="primary"
              style={globalStyles.scheduleParamModalActionButton}
              qaId="button_save_schedule_device_params_selection"
            >
              <Text
                {...testProps("text_save_schedule_device_params_selection")}
                style={[globalStyles.fontMedium, globalStyles.textWhite]}
              >
                {t("layout.shared.save")}
              </Text>
            </ActionButton>
          </View>

          {/* Bottom safe area */}
          <View style={globalStyles.scheduleParamModalBottomSafeArea} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

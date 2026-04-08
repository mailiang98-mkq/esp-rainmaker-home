/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";

// Components
import Input from "@shared/components/Form/Input";
import ActionButton from "@shared/components/Form/ActionButton";

// Styles
import { tokens } from "@shared/theme/tokens";
import { globalStyles } from "@shared/theme/globalStyleSheet";

// Types
import { AddUserModalProps } from "@src/types/global";
import { getGroupSharingAllowedTypes } from "@features/group/utils/settingsHelpers";
import { getFeatures } from "@config/features.config";

/**
 * AddUserModal Component
 *
 * Modal dialog for adding new users to share the device.
 * Handles invite identifier and validation.
 *
 * Features:
 * - Email and/or 6-character user code (per SDK `groupSharingAllowedTypes`)
 * - Input validation
 * - Loading state
 * - Success/error handling
 *
 * @param props - Component properties for add user modal
 */
const AddUserModal: React.FC<AddUserModalProps> = ({
  visible,
  onClose,
  onAdd,
  email,
  handleInviteChange,
  isLoading,
  inviteValidator,
  isInviteValid,
  makePrimary = false,
  onMakePrimaryChange,
  transfer = false,
  onTransferChange,
  transferAndAssignRole = false,
  onTransferAndAssignRoleChange,
  contentContainerStyle,
}) => {
  const { t } = useTranslation();
  const transferGroupSharingEnabled = getFeatures().transferGroupSharing;

  const inviteFieldProps = useMemo(() => {
    const allowed = getGroupSharingAllowedTypes();
    const allowsUserCode = allowed.includes("userCode");
    const allowsEmail = allowed.includes("email");
    const both = allowsEmail && allowsUserCode;
    return {
      description: both
        ? t("group.settings.addUserModalDescriptionEmailOrUserCode")
        : t("group.settings.addUserModalDescription"),
      placeholder: both
        ? t("group.settings.addUserModalEmailOrUserCodePlaceholder")
        : allowsUserCode && !allowsEmail
          ? t("group.settings.addUserModalUserCodePlaceholder")
          : t("group.settings.addUserModalEmailPlaceholder"),
      inputMode: (both || allowsUserCode ? "text" : "email") as
        | "text"
        | "email",
      keyboardType: (both || allowsUserCode ? "default" : "email-address") as
        | "default"
        | "email-address",
    };
  }, [t]);

  const handleFieldChange = (value: string, isValid: boolean) => {
    handleInviteChange(value, isValid);
  };

  /**
   * Handle make primary checkbox change
   * When selected, clear transfer checkboxes
   */
  const handleMakePrimaryChange = (value: boolean) => {
    onMakePrimaryChange?.(value);
    if (value) {
      onTransferChange?.(false);
      onTransferAndAssignRoleChange?.(false);
    }
  };

  /**
   * Handle transfer checkbox change
   * When selected, clear other checkboxes
   */
  const handleTransferChange = (value: boolean) => {
    onTransferChange?.(value);
    if (value) {
      onMakePrimaryChange?.(false);
      onTransferAndAssignRoleChange?.(false);
    }
  };

  /**
   * Handle transfer and assign role checkbox change
   * When selected, auto-select make primary and clear transfer
   */
  const handleTransferAndAssignRoleChange = (value: boolean) => {
    onTransferAndAssignRoleChange?.(value);
    if (value) {
      // Auto-select "make primary" and clear "transfer only"
      onMakePrimaryChange?.(true);
      onTransferChange?.(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={globalStyles.modalOverlay}>
        <View style={[globalStyles.modalContent, contentContainerStyle]}>
          <Text style={globalStyles.modalTitle}>
            {t("group.settings.addUserModalTitle")}
          </Text>
          <Text style={globalStyles.modalDescription}>
            {inviteFieldProps.description}
          </Text>
          <Input
            key={inviteFieldProps.placeholder}
            icon="mail-open"
            placeholder={inviteFieldProps.placeholder}
            initialValue={email}
            onFieldChange={handleFieldChange}
            validator={inviteValidator}
            validateOnChange={true}
            debounceDelay={500}
            inputMode={inviteFieldProps.inputMode}
            keyboardType={inviteFieldProps.keyboardType}
            style={{ width: "100%" }}
          />

          {/* Ownership Checkbox */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 5,
              marginBottom: 10,
            }}
            onPress={() => handleMakePrimaryChange(!makePrimary)}
            disabled={isLoading}
          >
            <View
              style={[
                globalStyles.checkbox,
                {
                  backgroundColor: makePrimary
                    ? tokens.colors.primary
                    : "transparent",
                  borderColor: makePrimary
                    ? tokens.colors.primary
                    : tokens.colors.bg2,
                  marginRight: 12,
                },
              ]}
            >
              {makePrimary && (
                <Check size={12} color={tokens.colors.white} strokeWidth={3} />
              )}
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                color: tokens.colors.black,
                lineHeight: 20,
              }}
            >
              {t("group.settings.grantOwnershipDescription")}
            </Text>
          </TouchableOpacity>

          {/* Transfer Group Checkbox — SDK / env gated */}
          {transferGroupSharingEnabled && (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 5,
                marginBottom: 10,
              }}
              onPress={() => handleTransferChange(!transfer)}
              disabled={isLoading}
            >
              <View
                style={[
                  globalStyles.checkbox,
                  {
                    backgroundColor: transfer
                      ? tokens.colors.primary
                      : "transparent",
                    borderColor: transfer
                      ? tokens.colors.primary
                      : tokens.colors.bg2,
                    marginRight: 12,
                  },
                ]}
              >
                {transfer && (
                  <Check
                    size={12}
                    color={tokens.colors.white}
                    strokeWidth={3}
                  />
                )}
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: tokens.colors.black,
                  lineHeight: 20,
                }}
              >
                {t("group.settings.transferGroupDescription")}
              </Text>
            </TouchableOpacity>
          )}

          {/* Transfer Group and Assign New Role Checkbox */}
          {transferGroupSharingEnabled && (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 5,
                marginBottom: 10,
              }}
              onPress={() =>
                handleTransferAndAssignRoleChange(!transferAndAssignRole)
              }
              disabled={isLoading}
            >
              <View
                style={[
                  globalStyles.checkbox,
                  {
                    backgroundColor: transferAndAssignRole
                      ? tokens.colors.primary
                      : "transparent",
                    borderColor: transferAndAssignRole
                      ? tokens.colors.primary
                      : tokens.colors.bg2,
                    marginRight: 12,
                  },
                ]}
              >
                {transferAndAssignRole && (
                  <Check
                    size={12}
                    color={tokens.colors.white}
                    strokeWidth={3}
                  />
                )}
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: tokens.colors.black,
                  lineHeight: 20,
                }}
              >
                {t("group.settings.transferAndAssignRoleDescription")}
              </Text>
            </TouchableOpacity>
          )}

          <View style={globalStyles.modalActions}>
            <ActionButton
              onPress={onClose}
              disabled={isLoading}
              variant="secondary"
              style={{ flex: 1 }}
            >
              <Text style={globalStyles.buttonTextSecondary}>
                {t("layout.shared.cancel")}
              </Text>
            </ActionButton>

            <View style={{ width: 10 }} />

            <ActionButton
              onPress={onAdd}
              disabled={isLoading || !isInviteValid}
              variant="primary"
              style={{ flex: 1 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={tokens.colors.white} />
              ) : (
                <Text style={globalStyles.buttonTextPrimary}>
                  {t("layout.shared.confirm")}
                </Text>
              )}
            </ActionButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddUserModal;

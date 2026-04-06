/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { InputDialog } from "@shared/components";

export interface HomeManagementAddDialogProps {
  open: boolean;
  loading?: boolean;
  title: string;
  inputPlaceholder: string;
  confirmLabel: string;
  cancelLabel: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
  /** QA id for the dialog */
  qaId?: string;
}

/**
 * Add-home input dialog with configurable labels.
 * UI only; translation and submit logic come from parent.
 */
export const HomeManagementAddDialog: React.FC<
  HomeManagementAddDialogProps
> = ({
  open,
  loading = false,
  title,
  inputPlaceholder,
  confirmLabel,
  cancelLabel,
  onSubmit,
  onCancel,
  qaId = "add_home",
}) => (
  <InputDialog
    qaId={qaId}
    open={open}
    title={title}
    inputPlaceholder={inputPlaceholder}
    initialValue=""
    confirmLabel={confirmLabel}
    cancelLabel={cancelLabel}
    onSubmit={onSubmit}
    onCancel={onCancel}
    loading={loading}
  />
);

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useTranslation } from "react-i18next";
import { globalStyles } from "@shared/theme/globalStyleSheet";
import { useCreateRoomSuccess } from "@features/group/hooks";
import { ScreenWrapper } from "@shared/components";
import { CreateRoomSuccessContent } from "@features/group/components";

/**
 * CreateRoomSuccess Screen
 *
 * Success screen shown after creating or updating a room.
 * Thin orchestration: uses useCreateRoomSuccess and CreateRoomSuccessContent.
 */
const CreateRoomSuccess = () => {
  const { t } = useTranslation();
  const { updated, handleDone } = useCreateRoomSuccess();

  const subtitle = updated
    ? t("group.createRoomSuccess.roomUpdatedSuccessfully")
    : undefined;

  return (
    <ScreenWrapper
      style={globalStyles.createRoomSuccessContainer}
      qaId="screen_wrapper_create_room_success"
    >
      <CreateRoomSuccessContent
        title={t("group.createRoomSuccess.title")}
        subtitle={subtitle}
        doneLabel={t("group.createRoomSuccess.done")}
        onDone={handleDone}
      />
    </ScreenWrapper>
  );
};

export default CreateRoomSuccess;

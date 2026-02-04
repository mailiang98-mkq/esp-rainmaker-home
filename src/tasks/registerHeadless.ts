/*
 * SPDX-FileCopyrightText: 2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppRegistry } from "react-native";
import {
  MatterIssueNocTask,
  MatterConfirmCommissionTask,
} from "@src/tasks/matterCommissioningTask";

export function registerHeadlessTasks() {
  AppRegistry.registerHeadlessTask(
    "MatterIssueNocTask",
    () => async (taskData: any) => {
      try {
        await MatterIssueNocTask(taskData);
      } catch (error) {
        console.error("[HeadlessJS] MatterIssueNocTask failed:", error);
        throw error;
      }
    },
  );

  AppRegistry.registerHeadlessTask(
    "MatterConfirmCommissionTask",
    () => async (taskData: any) => {
      try {
        await MatterConfirmCommissionTask(taskData);
      } catch (error) {
        console.error("[HeadlessJS] MatterConfirmCommissionTask failed:", error);
        throw error;
      }
    },
  );
}

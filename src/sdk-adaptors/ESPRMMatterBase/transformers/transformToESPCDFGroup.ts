/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ESPCDFCommissioningProgress, ESPCDFGroup, ESPCDFIssueUserNoCResponse } from "@store";
import { ESPRMFabric, ESPRMUser, ESPRMGroup } from "@espressif/rainmaker-matter-sdk";
import { transformToESPCDFGroup as transformToESPCDFGroupFromESPRMBase } from "@sdk-adaptors/ESPRMBase/transformers/transformToESPCDFGroup";

export function normalizeMatterFabricDetailsFromSdk(
    matterFabric: ESPRMFabric
  ): Record<string, any> | undefined {
    const result: Record<string, any> = {
      rootCa: matterFabric.fabricDetails?.rootCa ?? (matterFabric.fabricDetails as any)?.root_ca,
      matterUserId: matterFabric.fabricDetails?.matterUserId ?? (matterFabric.fabricDetails as any)?.matter_user_id,
      ipk: matterFabric.fabricDetails?.ipk,
      groupCatIdOperate: matterFabric.fabricDetails?.groupCatIdOperate ?? (matterFabric.fabricDetails as any)?.group_cat_id_operate,
      groupCatIdAdmin: matterFabric.fabricDetails?.groupCatIdAdmin ?? (matterFabric.fabricDetails as any)?.group_cat_id_admin,
      userCatId: matterFabric.fabricDetails?.userCatId ?? (matterFabric.fabricDetails as any)?.user_cat_id,
    };
  
    const hasAny = Object.values(result).some(
      (v) => v !== undefined && v !== null && String(v).length > 0
    );
    return hasAny ? result : undefined;
  }

/**
 * RainMaker + Matter: reuse ESPRMBase group operations, add fabric commissioning helpers when
 * `group.isMatter` is true. Subgroups returned from base SDK closures still use the base
 * transformer until that pipeline is refactored to accept an injectable subgroup mapper.
 */
export function transformToESPCDFGroup(
    group: ESPRMGroup | ESPRMFabric,
    user: ESPRMUser,
    identifier: string,
): ESPCDFGroup {
    const baseGroup = transformToESPCDFGroupFromESPRMBase(group, user, identifier);

    const matterOperations =
        group.isMatter
            ? {
                  async issueUserNoC(): Promise<ESPCDFIssueUserNoCResponse> {
                      return await (group as any).issueUserNoC();
                  },
                  async startCommissioning(
                      qrData: string,
                      onProgress?: (message: ESPCDFCommissioningProgress) => void,
                  ): Promise<() => void> {
                      const sdkOnProgress = onProgress
                          ? (progress: { status?: string; description?: string }) =>
                                onProgress({
                                    status: progress.status,
                                    description: progress.description,
                                })
                          : undefined;
                      return await (group as any).startCommissioning(qrData, sdkOnProgress);
                  },
              }
            : {};

    baseGroup.operations = {
        ...baseGroup.operations,
        ...matterOperations,
    };
    baseGroup.identifier = identifier;
    if (group instanceof ESPRMFabric) {
        baseGroup.fabricDetails = normalizeMatterFabricDetailsFromSdk(group);
    }
    return baseGroup;
}

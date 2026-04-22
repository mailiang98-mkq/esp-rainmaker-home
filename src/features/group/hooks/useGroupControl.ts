/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useCallback, useEffect } from "react";
import type { ESPCDFDeviceParam, ESPCDFGroup, ESPCDFNode } from "@store";
import { fetchNodesIfEmpty } from "@store";
import {
  broadcastGroupParam,
  BroadcastGroupParamOptions,
  findDeviceOfType,
  findMatchingParam,
  isDeviceTypeSubgroup,
  resolveHomogeneousDeviceType,
  stripGroupControlSubgroupDisplayName,
  type ParamBroadcastTarget,
} from "@features/group/utils/controlGroupHelpers";
import { useCDF } from "@shared/hooks/useCDF";
import { filterExcludedParamTypes } from "@shared/utils/paramUtils";

export type { ParamBroadcastTarget };

export interface ParamBroadcastRow {
  refParam: ESPCDFDeviceParam;
  targets: ParamBroadcastTarget[];
}

export interface UseGroupControlOptions {
  homeId: string | undefined;
  groupId: string | undefined;
  router: { push: (href: unknown) => void };
}

export interface UseGroupControlResult {
  home: ESPCDFGroup | undefined;
  deviceGroup: ESPCDFGroup | undefined;
  groupTitle: string;
  homogeneousDeviceType: string | null;
  referenceNode: ESPCDFNode | null;
  isConnected: boolean;
  paramRows: ParamBroadcastRow[];
  handleEditGroup: () => void;
  /**
   * Applies one param value to all targets via {@link ESPCDFGroup.setParams}; the active adaptor
   * implements transport (e.g. group MQTT vs unicast per param).
   */
  handleBroadcastParam: (
    refParam: ESPCDFDeviceParam,
    targets: ParamBroadcastTarget[],
    value: unknown,
    options?: BroadcastGroupParamOptions
  ) => void;
}

/**
 * Manages group control state and related actions.
 */
export function useGroupControl(
  options: UseGroupControlOptions
): UseGroupControlResult {
  const { homeId, groupId, router } = options;
  const { store } = useCDF();

  const home = store?.groupStore?.groupsByIDMap?.[homeId as string];

  const deviceGroup = useMemo(
    () =>
      home?.subGroups?.find(
        (g: ESPCDFGroup) => g.id === groupId && isDeviceTypeSubgroup(g)
      ),
    [home?.subGroups, groupId]
  );

  useEffect(() => {
    if (home) fetchNodesIfEmpty(home);
  }, [home]);

  const nodesById = useMemo(() => {
    const map = new Map<string, ESPCDFNode>();
    for (const n of store?.nodeStore?.nodesList ?? []) {
      map.set(n.id, n);
    }
    return map;
  }, [store?.nodeStore?.nodesList]);

  const homogeneousDeviceType = useMemo(() => {
    if (!deviceGroup) return null;
    return resolveHomogeneousDeviceType(deviceGroup, nodesById);
  }, [deviceGroup, nodesById]);

  const referenceNode = useMemo(() => {
    const firstId = deviceGroup?.nodeIds?.[0];
    if (!firstId) return null;
    return nodesById.get(firstId) ?? null;
  }, [deviceGroup?.nodeIds, nodesById]);

  const referenceDevice = useMemo(() => {
    if (!referenceNode || !homogeneousDeviceType) return null;
    return findDeviceOfType(referenceNode, homogeneousDeviceType) ?? null;
  }, [referenceNode, homogeneousDeviceType]);

  const paramRows: ParamBroadcastRow[] = useMemo(() => {
    if (!deviceGroup?.nodeIds?.length || !homogeneousDeviceType || !referenceDevice) {
      return [];
    }
    const refParams = filterExcludedParamTypes(referenceDevice.params) ?? [];
    return refParams.map((refParam) => {
      const targets: ParamBroadcastTarget[] = [];
      for (const nid of deviceGroup.nodeIds ?? []) {
        const node = nodesById.get(nid);
        if (!node) continue;
        const dev = findDeviceOfType(node, homogeneousDeviceType);
        if (!dev) continue;
        const p = findMatchingParam(dev, refParam);
        if (p) targets.push({ param: p, deviceName: dev.name });
      }
      return { refParam, targets };
    });
  }, [deviceGroup, homogeneousDeviceType, referenceDevice, nodesById]);

  const isConnected = Boolean(
    referenceNode?.connectivityStatus?.isConnected
  );

  const handleEditGroup = useCallback(() => {
    router.push({
      pathname: "/(group)/CreateControlGroup",
      params: {
        id: homeId,
        groupId,
        roomName: stripGroupControlSubgroupDisplayName(deviceGroup?.name),
      },
    } as any);
  }, [router, homeId, groupId, deviceGroup?.name]);

  const handleBroadcastParam = useCallback(
    (
      refParam: ESPCDFDeviceParam,
      targets: ParamBroadcastTarget[],
      value: unknown,
      options?: BroadcastGroupParamOptions
    ) => {
      broadcastGroupParam(deviceGroup, refParam, targets, value, options);
    },
    [deviceGroup]
  );

  return {
    home,
    deviceGroup,
    groupTitle: stripGroupControlSubgroupDisplayName(deviceGroup?.name),
    homogeneousDeviceType,
    referenceNode,
    isConnected,
    paramRows,
    handleEditGroup,
    handleBroadcastParam,
  };
}

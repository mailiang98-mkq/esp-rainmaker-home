/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SUCESS } from "@shared/utils/constants";
import {
  ESPCDFScene,
  ESPCDFSceneCreateInput,
  ESPCDFSceneEditInput,
  ESPCDFDevice,
  ESPCDFDeviceParam
} from "@store";
import { sortByConnectivity } from "@shared/utils/eventDeviceSelection";
import { defaultWritableParamValue } from "@shared/utils/paramUtils";
import type { DeviceSelectionData } from "@src/types/global";

/**
 * Scene data structure for validation and operations
 */
export interface SceneData {
  id: string;
  name: string;
  info?: string;
  nodes: string[];
  actions: Record<string, Record<string, any>>;
}

/**
 * Scene node structure
 */
export interface SceneNode {
  id: string;
  action: Record<string, any>;
  actionDevices: Record<string, any>;
}

/**
 * Node connectivity status
 */
export interface NodeConnectivityStatus {
  isConnected?: boolean;
}

/**
 * Validation result for scene data
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates scene data before creation or update
 * @param sceneData - The scene data to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export const validate = (sceneData: SceneData): ValidationResult => {
  // Validate scene name
  if (!sceneData.name || sceneData.name.trim().length === 0) {
    return {
      isValid: false,
      error: "Scene name is required",
    };
  }

  // Validate scene ID
  if (!sceneData.id || sceneData.id.trim().length === 0) {
    return {
      isValid: false,
      error: "Scene ID is required",
    };
  }

  // Validate actions exist
  if (!sceneData.actions || Object.keys(sceneData.actions).length === 0) {
    return {
      isValid: false,
      error: "Scene must have at least one action",
    };
  }

  // Validate nodes exist
  if (!sceneData.nodes || sceneData.nodes.length === 0) {
    return {
      isValid: false,
      error: "Scene must have at least one node",
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Creates a new scene using group-based creation
 * @param sceneData - The scene data to create
 * @param currentHome - The current home group entity
 * @param onSuccess - Callback function called on successful creation (handles UI logic)
 * @param onError - Callback function called on error (handles UI logic)
 */
export const create = async (
  sceneData: SceneData,
  currentHome: any,
  onSuccess: (scene: ESPCDFScene) => void,
  onError: (error: any) => void
): Promise<void> => {
  try {
    // Validate scene data first
    const validation = validate(sceneData);
    if (!validation.isValid) {
      onError(new Error(validation.error));
      return;
    }

    // Prepare scene data for creation
    const createInput: ESPCDFSceneCreateInput = {
      id: sceneData.id,
      name: sceneData.name,
      info: sceneData.info || "",
      nodes: sceneData.nodes,
      actions: sceneData.actions,
    };

    // Create scene using group-based creation
    if (!currentHome) {
      onError(new Error("Current home group is not available"));
      return;
    }

    const scene = await currentHome.createScene(createInput);
    if (scene) {
      await scene.add();
      onSuccess(scene);
    } else {
      onError(new Error("Failed to create scene"));
    }
  } catch (error: any) {
    console.error("[SCENE_HELPER] Error creating scene:", error);
    onError(error);
  }
};

/**
 * Updates an existing scene
 * @param sceneId - The ID of the scene to update
 * @param sceneData - The updated scene data
 * @param sceneEntity - The scene entity from sceneStore
 * @param onSuccess - Callback function called on successful update (handles UI logic)
 * @param onError - Callback function called on error (handles UI logic)
 */
export const update = async (
  sceneId: string,
  sceneData: SceneData,
  sceneEntity: any,
  onSuccess: () => void,
  onError: (error: any) => void
): Promise<void> => {
  try {
    // Validate scene data first
    const validation = validate(sceneData);
    if (!validation.isValid) {
      onError(new Error(validation.error));
      return;
    }

    // Validate scene entity exists
    if (!sceneEntity) {
      onError(new Error(`Scene with ID ${sceneId} not found`));
      return;
    }

    // Prepare edit input
    const editInput: ESPCDFSceneEditInput = {
      name: sceneData.name,
      info: sceneData.info || "",
      actions: sceneData.actions,
    };

    // Update scene using entity's edit method
    const resp = (await sceneEntity.edit(editInput)) as any;

    // Check response status
    if (resp && resp.some((resp: any) => resp.status !== SUCESS)) {
      onError(new Error("Some devices failed to update"));
    } else {
      onSuccess();
    }
  } catch (error: any) {
    console.error("[SCENE_HELPER] Error updating scene:", error);
    onError(error);
  }
};

/**
 * Deletes an existing scene
 * @param sceneId - The ID of the scene to delete
 * @param sceneEntity - The scene entity from sceneStore
 * @param onSuccess - Callback function called on successful deletion (handles UI logic)
 * @param onError - Callback function called on error (handles UI logic)
 */
export const deleteScene = async (
  sceneId: string,
  sceneEntity: any,
  onSuccess: () => void,
  onError: (error: any) => void
): Promise<void> => {
  try {
    // Validate scene entity exists
    if (!sceneEntity) {
      onError(new Error(`Scene with ID ${sceneId} not found`));
      return;
    }

    // Delete scene using entity's remove method
    const resp = (await sceneEntity.remove()) as any;

    // Check response status
    if (resp && resp.some((resp: any) => resp.status !== SUCESS)) {
      onError(new Error("Some devices failed to delete"));
    } else {
      onSuccess();
    }
  } catch (error: any) {
    console.error("[SCENE_HELPER] Error deleting scene:", error);
    onError(error);
  }
};

/**
 * Checks if the action button should be disabled
 * @param isLoading - Whether a save operation is in progress
 * @param sceneName - The scene name
 * @param sceneActionsCount - The number of scene actions
 * @returns true if the button should be disabled, false otherwise
 */
export const shouldDisableActionButton = (
  isLoading: boolean,
  sceneName: string,
  sceneActionsCount: number
): boolean => {
  return isLoading || !sceneName || sceneActionsCount === 0;
};

/**
 * Gets a warning message if any nodes are not connected
 * @param nodes - Array of scene nodes
 * @param nodesByIDMap - Map of node IDs to node objects with connectivity status
 * @param warningMessageKey - Translation key for the warning message (optional, for i18n)
 * @returns Warning message string if any nodes are disconnected, empty string otherwise
 */
export const getConnectionWarning = (
  nodes: SceneNode[],
  nodesByIDMap: Record<string, { connectivityStatus?: NodeConnectivityStatus }>,
  warningMessageKey?: string
): string => {
  if (
    nodes.some(
      (node) => !nodesByIDMap[node.id]?.connectivityStatus?.isConnected
    )
  ) {
    return warningMessageKey || "Some devices are not connected";
  }
  return "";
};

/**
 * Gets selected device information with parameters and their values
 * @param selectedDevice - The selected device info with nodeId and deviceName
 * @param nodesByIDMap - Map of node IDs to node objects
 * @param getActionValue - Function to get action value for a parameter
 * @returns Object containing selectedDevice, nodeId, and params with values, or empty object if not found
 */
export const getSelectedDeviceWithParams = (
  selectedDevice: { nodeId: string; deviceName: string } | null,
  nodesByIDMap: Record<string, { devices?: ESPCDFDevice[] }>,
  getActionValue: (nodeId: string, deviceName: string, paramName: string) => any
): {
  selectedDevice?: ESPCDFDevice;
  nodeId?: string;
  params?: (ESPCDFDeviceParam & { value: any })[];
} => {
  const nodeId = selectedDevice?.nodeId;
  if (!nodeId) return {};
  const node = nodesByIDMap[nodeId];
  if (!node) return {};
  const device = node.devices?.find(
    (device) => device.name === selectedDevice?.deviceName,
  );
  if (!device) return {};

  const params: (ESPCDFDeviceParam & { value: any })[] | undefined = device.params?.map((param) => ({
    ...param,
    value:
      getActionValue(nodeId, device.name, param.name) ??
      defaultWritableParamValue(param),
  })) as (ESPCDFDeviceParam & { value: any })[];

  return { selectedDevice: device, nodeId, params };
};

/**
 * Filters scenes into favorite and non-favorite lists
 * @param sceneList - Array of all scenes
 * @param favoriteSceneIds - Array of favorite scene IDs
 * @returns Object containing favoriteScenes and allScenes arrays
 */
export const filterScenes = (
  sceneList: ESPCDFScene[],
  favoriteSceneIds: string[]
): {
  favoriteScenes: ESPCDFScene[];
  allScenes: ESPCDFScene[];
} => {
  const favoriteScenes = sceneList.filter((scene) =>
    favoriteSceneIds.includes(scene.id)
  );
  const allScenes = sceneList.filter(
    (scene) => !favoriteSceneIds.includes(scene.id)
  );
  return { favoriteScenes, allScenes };
};

/**
 * Sorts devices by connectivity status
 * Online devices appear before offline ones
 * @param devices - Device list to sort
 * @returns Sorted device list (new array, does not mutate input)
 */
export const sortDevicesByConnectivity = (
  devices: DeviceSelectionData[]
): DeviceSelectionData[] =>
  sortByConnectivity(
    devices,
    (d) => d.node.connectivityStatus?.isConnected ?? false
  );

/**
 * Gets actions for a selected device
 * @param device - Device to get actions for
 * @param checkActionExists - Function to check if an action exists
 * @param getActionValue - Function to get action value
 * @returns Record of parameter names to values
 */
export const getDeviceActions = (
  device: DeviceSelectionData,
  checkActionExists: (nodeId: string, deviceName: string, paramName?: string) => { exist: boolean },
  getActionValue: (nodeId: string, deviceName: string, paramName: string) => any
): Record<string, any> => {
  if (!device.isSelected) return {};

  return (
    device.device.params
      ?.filter(
        (param) =>
          checkActionExists(
            device.node.id,
            device.device.name,
            param.name
          ).exist
      )
      ?.reduce((acc, param) => {
        acc[param.name] = getActionValue(
          device.node.id,
          device.device.name,
          param.name
        );
        return acc;
      }, {} as Record<string, any>) || {}
  );
};


/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoomTab } from "@src/types/global";
import { transformNodesToDevices } from "@shared/utils/device";
import {
  DEFAULT_HOME_GROUP_NAME,
  REJECTED_STATUS,
  GROUP_TYPE_HOME,
  NODE_TYPE,
  FULFILLED_STATUS,
} from "@shared/utils/constants";
import { getRandom4DigitString } from "@shared/utils/common";
import {
  ESPCDFCreateGroupRequest,
  ESPCDFDevice,
  ESPCDFGroup,
  ESPCDFNode,
  ESPCDFUser,
} from "@store";

/**
 * Validates and sanitizes home data
 * @param home The home group to validate
 * @returns Validated home data or null
 */
export const validateHomeData = (home: ESPCDFGroup | null): ESPCDFGroup | null => {
  if (!home) return null;
  return home;
};

/**
 * Creates room tabs from home data
 * @param home Validated home data
 * @param defaultTabs Default tabs to include
 * @returns Array of room tabs
 */
export const createRoomTabs = (
  home: ESPCDFGroup | null,
  defaultTabs: RoomTab[]
): RoomTab[] => {
  if (!home?.subGroups) {
    return defaultTabs;
  }
  return [
    ...defaultTabs,
    ...home.subGroups.map((room) => ({
      label: room.name.trim() || 'Unnamed Room',
      id: room.id,
    })),
  ];
};

/**
 * Gets devices for a room
 * @param selectedRoom Selected room tab
 * @param rooms List of all rooms
 * @param nodeList List of all nodes
 * @param devices List of all devices
 * @returns Array of devices for the room
 */
export const getFilteredDevices = (
  selectedRoom: RoomTab | null,
  rooms: ESPCDFGroup[],
  nodeList: ESPCDFNode[] | undefined,
  devices: (ESPCDFDevice & { node: WeakRef<ESPCDFNode> })[]
): (ESPCDFDevice & { node: WeakRef<ESPCDFNode> })[] => {
  try {
    if (!selectedRoom || !nodeList) {
      return [];
    }

    if (selectedRoom.id === "common") {
      return devices;
    }

    const selectedRoomData = rooms.find((room) => room.id === selectedRoom.id);
    if (!selectedRoomData) {
      return [];
    }

    const roomNodeIds = selectedRoomData.nodeIds || [];
    const roomNodes = nodeList.filter((node) =>
      roomNodeIds.includes(node.id)
    );
    return transformNodesToDevices(roomNodes);
  } catch (error) {
    console.error('Error filtering devices:', error);
    return [];
  }
};

/**
 * Checks if a group is a valid home group
 * @param group The group to check
 * @returns boolean indicating if the group is a valid home group
 */
export const isHome = (group: ESPCDFGroup): boolean => {
  return group.type === GROUP_TYPE_HOME && group.mutuallyExclusive === true;
};

/**
 * Finds a home group based on different selection strategies
 * @param groups List of all groups to search through
 * @param options Selection options
 * @param options.preferredId Optional ID to prioritize (e.g., lastSelectedHomeId)
 * @param options.preferredName Optional name to prioritize (e.g., "Home")
 * @returns The matching home group or null if none found
 *
 * Priority order:
 * 1. Group with preferredId (if provided)
 * 2. Group with preferredName (case-insensitive, if provided)
 * 3. First valid home group (type: "home" && mutuallyExclusive: true)
 */
export const findHomeGroup = (
  groups: ESPCDFGroup[],
  options?: {
    preferredId?: string | null;
    preferredName?: string | null;
  }
): ESPCDFGroup | null => {
  // Priority 1: Find by preferred ID (e.g., lastSelectedHomeId)
  if (options?.preferredId) {
    const groupById = groups.find((group) => group.id === options.preferredId);
    if (groupById) {
      return groupById;
    }
  }

  // Priority 2: Find by preferred name (case-insensitive, e.g., "Home")
  if (options?.preferredName) {
    const groupByName = groups.find(
      (group) =>
        group.name.trim().toLowerCase() ===
        options.preferredName?.trim().toLowerCase()
    );
    if (groupByName) {
      return groupByName;
    }
  }

  // Priority 3: Fallback to first valid home
  return groups.find(isHome) || null;
};

/**
 * Creates a new home configuration
 * @param nodeIds List of node IDs to include in the home
 * @returns New home configuration
 */
export const createHome = (nodeIds: string[] = []): ESPCDFCreateGroupRequest => {
  return {
    name: DEFAULT_HOME_GROUP_NAME,
    type: GROUP_TYPE_HOME,
    mutuallyExclusive: true,
    nodeIds: nodeIds,
    description: "",
    customData: {},
  };
};

/**
 * Updates an existing group to be a valid home
 * @param group The group to update
 * @returns Updated group configuration
 */
export const updateToHome = (): Partial<ESPCDFGroup> => {
  return {
    type: GROUP_TYPE_HOME,
    mutuallyExclusive: true,
  };
};

/**
 * Gets nodes that don't belong to any group and not of type pure_matter or rainmaker_matter
 * @param allNodes List of all nodes
 * @param groups List of all groups
 * @returns Array of unassigned node IDs
 */
export const getUnassignedNodes = (
  allNodes: ESPCDFNode[],
  groups: ESPCDFGroup[]
): string[] => {
  // Get all node IDs that are assigned to any group
  const assignedNodeIds = new Set(groups.flatMap((group) => group.nodeIds || []));

  // Exclude pure matter and rainmaker matter nodes
  const nodeTypesToExclude = [
    NODE_TYPE.PURE_MATTER,
    NODE_TYPE.RAINMAKER_MATTER,
  ];

  // Return nodes that aren't in the assigned set
  // and not of type pure_matter or rainmaker_matter
  return allNodes
    .filter(
      (node) =>
        !assignedNodeIds.has(node.id) &&
        !nodeTypesToExclude.includes(node.type || "")
    )
    .map((node) => node.id);
};

/**
 * Gets all valid homes from a list of groups
 * @param groups List of all groups
 * @returns Array of valid homes
 */
export const getValidHomes = (groups: ESPCDFGroup[]): ESPCDFGroup[] => {
  return groups.filter(isHome);
};

/**
 * Categorizes groups by ownership - primary user groups vs shared groups
 * @param groups List of all groups
 * @returns Object containing primaryGroups and sharedGroups arrays
 */
export const categorizeGroupsByOwnership = (
  groups: ESPCDFGroup[]
): {
  primaryGroups: ESPCDFGroup[];
  sharedGroups: ESPCDFGroup[];
} => {
  return groups.reduce(
    (acc, group) => {
      if (group.isPrimaryUser === true) {
        acc.primaryGroups.push(group);
      } else {
        acc.sharedGroups.push(group);
      }
      return acc;
    },
    { primaryGroups: [], sharedGroups: [] } as {
      primaryGroups: ESPCDFGroup[];
      sharedGroups: ESPCDFGroup[];
    }
  );
};

/**
 * Finds home groups that need mutuallyExclusive flag updated
 * Identifies groups with type "home" but mutuallyExclusive set to false
 *
 * @param groups List of groups to check
 * @returns Array of groups that need mutuallyExclusive updated to true
 */
export const getHomesNeedingMutualExclusiveUpdate = (
  groups: ESPCDFGroup[]
): ESPCDFGroup[] => {
  return groups.filter(
    (group) =>
      group.type === GROUP_TYPE_HOME && group.mutuallyExclusive === false
  );
};

/**
 * Ensures all home groups have mutuallyExclusive flag set to true
 *
 * This function:
 * - Identifies home groups with mutuallyExclusive: false
 * - Updates them in parallel using Promise.allSettled for optimal performance
 * - Logs failures without throwing (graceful degradation)
 * - Uses CDF interceptor pattern which updates group objects in place
 *
 * Note: Updates are reflected immediately in all references to these groups
 * due to MobX observable and CDF interceptor pattern.
 *
 * @param groups List of primary groups to check and update
 * @param needManualUpdate Whether to manually update the groups necessary fields after the promise.allSettled is resolved
 * @returns Promise that resolves when all updates complete (success or failure)
 */
export const ensureHomesAreMutuallyExclusive = async (
  groups: ESPCDFGroup[],
  needManualUpdate: boolean = false
): Promise<void> => {
  // Find groups that need mutuallyExclusive update
  const homesNeedingUpdate = getHomesNeedingMutualExclusiveUpdate(groups);

  if (homesNeedingUpdate.length === 0) {
    return;
  }

  // Update all groups in parallel using Promise.allSettled
  // CDF interceptor pattern updates the group objects in place, so changes are
  // automatically reflected in the original groups array references
  const updateResults = await Promise.allSettled(
    homesNeedingUpdate.map((group) =>
      group?.updateGroupInfo({
        mutuallyExclusive: true,
      })
    )
  );

  // Log any update failures
  updateResults.forEach((result, index) => {
    if (result.status === REJECTED_STATUS) {
      console.error(
        `Failed to update group with id ${homesNeedingUpdate[index].id}`,
        result.reason
      );
    }
    if (needManualUpdate && result.status === FULFILLED_STATUS) {
      // Update the group necessary fields manually
      homesNeedingUpdate[index].mutuallyExclusive = true;
    }
  });
};

/**
 * Returns a unique default home name that does not conflict with existing group names.
 * Tries "Home", "Home 1", "Home 2", ... until one is available.
 *
 * @param existingGroups List of existing groups to check names against
 * @returns A name that is unique among existing group names
 */
export const getUniqueDefaultHomeName = (
  existingGroups: ESPCDFGroup[]
): string => {
  const existingNames = new Set(
    (existingGroups || []).map((g) => g.name?.trim().toLowerCase() ?? "")
  );
  const base = DEFAULT_HOME_GROUP_NAME.trim().toLowerCase();
  if (!existingNames.has(base)) {
    return DEFAULT_HOME_GROUP_NAME;
  }
  for (let i = 1; i < 1000; i++) {
    const candidate = `${DEFAULT_HOME_GROUP_NAME} ${i}`;
    if (!existingNames.has(candidate.trim().toLowerCase())) {
      return candidate;
    }
  }
  return `${DEFAULT_HOME_GROUP_NAME}_${getRandom4DigitString()}`;
};

/**
 * Creates a default home with a unique name for new users or ESP RainMaker migration
 * (user exists but has no valid home). Uses getUniqueDefaultHomeName to avoid conflicts.
 *
 * @param user The user to create the group for
 * @param nodeIds Unassigned node IDs to include in the home
 * @param existingGroups All existing groups (to compute unique name)
 * @returns Promise that resolves when the home is created
 */
export const ensureDefaultHomeForNewOrMigratedUser = async (
  user: ESPCDFUser | null,
  nodeIds: string[],
  existingGroups: ESPCDFGroup[]
): Promise<void> => {
  if (!user) return;
  const name = getUniqueDefaultHomeName(existingGroups);
  const payload = createHome(nodeIds);
  payload.name = name;
  await user.createGroup(payload);
};

/**
 * Creates and submits a new home group with the given nodes
 *
 * Creates a default home group with:
 * - Name: "Home" (or "Home_XXXX" if withRandomSuffix is true)
 * - Type: "home"
 * - MutuallyExclusive: true
 * - Includes all specified node IDs
 *
 * @param user The user object to create the group with
 * @param nodeIds Array of node IDs to include in the home
 * @param withRandomSuffix Whether to append a random 4-digit suffix to avoid name collisions
 * @returns Promise that resolves when the group is created
 */
export const createDefaultHomeGroup = async (
  user: ESPCDFUser | null,
  nodeIds: string[],
  withRandomSuffix: boolean = false
): Promise<void> => {
  const newHomePayload = createHome(nodeIds);
  if (withRandomSuffix) {
    newHomePayload.name = `${DEFAULT_HOME_GROUP_NAME}_${getRandom4DigitString()}`;
  }
  await user?.createGroup(newHomePayload);
};

/**
 * Fetches nodes for a group if its nodes array is empty or undefined
 *
 * This utility function ensures that groups have their nodes loaded before use.
 * When getNodes() is called, the groupStore's handleGroupOperation callback
 * automatically updates the group's nodes array in the store via MobX observables.
 *
 * @param group - The group (ESPCDFGroup) to fetch nodes for
 * @returns Promise that resolves when nodes are fetched (or if already present)
 *
 * @remarks
 * - Checks if nodes array is empty or undefined before fetching
 * - Uses group.getNodes() which triggers the store's callback to update nodes
 * - The callback in groupStore.handleGroupOperation updates the group's nodes array
 * - This ensures nodes persist across navigation and component re-renders
 */
export const fetchNodesIfEmpty = async (
  group: ESPCDFGroup | null
): Promise<void> => {
  if (!group) return;

  // Check if nodes array is empty or undefined
  if (!group.nodeDetails || group.nodeDetails.length === 0) {
    try {
      await group.getNodes();
    } catch (error) {
      console.error(`Failed to fetch nodes for group ${group.id}:`, error);
    }
  }
};

/**
 * Fetches nodes for a home and all its rooms (subGroups)
 *
 * This function fetches nodes for:
 * 1. The home group itself
 * 2. All room groups (subGroups) within the home
 *
 * All fetches are done in parallel for optimal performance.
 * The groupStore's handleGroupOperation callback automatically updates
 * each group's nodes array via MobX observables.
 *
 * @param home - The home group to fetch nodes for
 * @returns Promise that resolves when all nodes are fetched
 *
 * @remarks
 * - Fetches nodes for the home group if its nodes array is empty
 * - Fetches nodes for all rooms (subGroups) if their nodes arrays are empty
 * - Uses Promise.allSettled to handle partial failures gracefully
 * - All nodes are automatically added to nodeStore via the callback mechanism
 */
export const fetchNodesForHomeAndRooms = async (
  home: ESPCDFGroup | null
): Promise<void> => {
  if (!home) return;

  const fetchPromises: Promise<void>[] = [];

  // Fetch nodes for the home itself
  fetchPromises.push(
    fetchNodesIfEmpty(home).catch((error) => {
      console.error(`Failed to fetch nodes for home ${home.id}:`, error);
    })
  );

  // Fetch nodes for all rooms (subGroups) in the home
  if (home.subGroups && home.subGroups.length > 0) {
    home.subGroups.forEach((room) => {
      fetchPromises.push(
        fetchNodesIfEmpty(room).catch((error) => {
          console.error(`Failed to fetch nodes for room ${room.id}:`, error);
        })
      );
    });
  }

  // Execute all fetches in parallel
  await Promise.allSettled(fetchPromises);
};

/**
 * Fetches nodes for all valid homes and their respective rooms
 *
 * This function prepopulates nodes for:
 * 1. All valid homes (type: "home" && mutuallyExclusive: true)
 * 2. All rooms (subGroups) within each valid home
 *
 * All fetches are done in parallel for optimal performance.
 * This ensures nodes are available throughout the app without needing
 * to fetch them on-demand when navigating to different screens.
 *
 * @param validHomes - Array of valid home groups to fetch nodes for
 * @returns Promise that resolves when all nodes are fetched
 *
 * @remarks
 * - Uses Promise.allSettled to handle partial failures gracefully
 * - Each home and its rooms are fetched in parallel
 * - All nodes are automatically added to nodeStore via the callback mechanism
 * - This should be called once during app initialization (e.g., in Home.tsx)
 */
export const fetchNodesForAllValidHomes = async (
  validHomes: ESPCDFGroup[]
): Promise<void> => {
  if (!validHomes || validHomes.length === 0) {
    return;
  }

  // Fetch nodes for all homes and their rooms in parallel
  const fetchPromises = validHomes.map((home) =>
    fetchNodesForHomeAndRooms(home).catch((error) => {
      console.error(`Failed to fetch nodes for home ${home.id} and its rooms:`, error);
    })
  );

  // Execute all fetches in parallel
  await Promise.allSettled(fetchPromises);
};

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { action, observable as mobxObservable } from "mobx";
import { ESPCDF } from "../store/index";
import { ESPCDFTransportConfig } from "../types";
import {
  EVENT_NODE_PARAMS_CHANGED,
  EVENT_USER_NODE_ADDED,
  EVENT_USER_NODE_REMOVED,
  EVENT_NODE_CONNECTED,
  EVENT_NODE_DISCONNECTED,
} from "../utils/constants";

/**
 * Safely parses the payload and returns null if parsing fails.
 */
export function safelyParsePayload(payload: any): any {
  if (!payload) return null;
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
  return payload;
}

/**
 * Handles the `EVENT_NODE_PARAMS_CHANGED` event.
 * Updates node device parameters when they change.
 * The payload contains the updated device/param structure that needs to be merged into the node.
 * Emits individual property change events for each param that changes to sync to _raw.
 */
export function handleNodeParamsChanged(
  rootStore: ESPCDF | null,
  node_id: string,
  payload: any
) {
  if (!rootStore || !node_id || !payload) return;

  const node = rootStore.nodeStore.getNodeById(node_id);
  if (!node) return;

  // Payload structure: { "DeviceName": { "ParamName1": value1, "ParamName2": value2, ... } }
  // Handle multiple devices if payload contains multiple device entries
  Object.entries(payload as Record<string, Record<string, unknown>>).forEach(
    ([deviceName, params]) => {
      const device = node.devices?.find((d: any) => d.name === deviceName);
      if (device) {
        // Update each param value and emit property change event for each
        Object.entries(params).forEach(([paramName, value]) => {
          const param = device?.params?.find((p: any) => p.name === paramName);
          if (param) {
            const oldValue = (param as any).value;
            (param as any).value = value;

            // Emit typed property change event for each param to sync to _raw
            node.emitPropertyChange({
              type: "deviceParamChanged",
              deviceName,
              paramName,
              value,
              oldValue,
              entity: node,
            });
          }
        });
      }
    }
  );
}

/**
 * Handles the `EVENT_USER_NODE_ADDED` event.
 * Adds nodes to the store.
 */
export async function handleUserNodeAdded(rootStore: ESPCDF | null, payload: any) {
  const activeAdaptorIdentifier = rootStore?.sdkAdaptorRegistry?.getActiveAdaptorIdentifier();
  if (!rootStore || !activeAdaptorIdentifier) return;

  const user = rootStore.userStore.getAuthorizationEntityForAdaptor(activeAdaptorIdentifier)
  if (!user) return;
  try {
    const nodeIds = payload.nodeIds;
    await Promise.all(
      nodeIds.map((nodeId: string) => user.getNodeDetails(nodeId))
    );
  } catch (error) {
    console.error(
      `[NodeEventHandlers] Error handling user node added event:`,
      error
    );
  }
}

/**
 * Handles the `EVENT_USER_NODE_REMOVED` event.
 * Removes nodes from the store.
 */
export function handleUserNodeRemoved(rootStore: ESPCDF | null, payload: any) {
  if (!rootStore || !payload) return;

  const nodeIds = payload.nodeIds || [];
  nodeIds.forEach((nodeId: string) => {
    try {
      rootStore.nodeStore.deleteNode(nodeId);
    } catch (error) {
      console.error(
        `[NodeEventHandlers] Failed to delete node ${nodeId}:`,
        error
      );
    }
  });
}

/**
 * Handles the `EVENT_NODE_CONNECTED` event.
 * Updates node connectivity status and adds cloud transport.
 */
export function handleNodeConnected(
  rootStore: ESPCDF | null,
  node_id: string,
  timestamp: number
) {
  if (!rootStore || !node_id) return;

  const node = rootStore.nodeStore.getNodeById(node_id);
  if (!node) return;

  // Update connectivity status
  rootStore.nodeStore.updateNode(node_id, {
    connectivityStatus: {
      isConnected: true,
      lastConnectionTimestamp: timestamp || Date.now(),
    },
  });
  const updatedNode = rootStore.nodeStore.getNodeById(node_id);
  if (!updatedNode) return;
  updatedNode.emitPropertyChange({
    type: "connectivityStatusChanged",
    connectivityStatus: {
      isConnected: true,
      lastConnectionTimestamp: timestamp || Date.now(),
    },
    entity: updatedNode,
  });
}

/**
 * Handles the `EVENT_NODE_DISCONNECTED` event.
 * Updates node connectivity status and removes cloud transport.
 */
export function handleNodeDisconnected(
  rootStore: ESPCDF | null,
  node_id: string,
  timestamp: number
) {
  if (!rootStore || !node_id) return;

  const node = rootStore.nodeStore.getNodeById(node_id);
  if (!node) return;

  // Update connectivity status
  rootStore.nodeStore.updateNode(node_id, {
    connectivityStatus: {
      isConnected: false,
      lastConnectionTimestamp: timestamp || Date.now(),
    },
  });

  const updatedNode = rootStore.nodeStore.getNodeById(node_id);
  if (!updatedNode) return;

  updatedNode.emitPropertyChange({
    type: "connectivityStatusChanged",
    connectivityStatus: {
      isConnected: false,
      lastConnectionTimestamp: timestamp || Date.now(),
    },
    entity: updatedNode,
  });
}

/**
 * Handles node update events from the SDK.
 * Routes events to appropriate handlers based on event type.
 */
export function handleNodeUpdateEvent(event: any, rootStore: ESPCDF | null) {
  if (!event || !rootStore) return;

  const { event_type, timestamp, node_id = null, payload = null } = event;

  // Parse payload safely
  const parsedPayload = safelyParsePayload(payload);

  // Handle events based on their type
  switch (event_type) {
    case EVENT_NODE_PARAMS_CHANGED:
      handleNodeParamsChanged(rootStore, node_id, parsedPayload);
      break;

    case EVENT_USER_NODE_ADDED:
      handleUserNodeAdded(rootStore, parsedPayload);
      break;

    case EVENT_USER_NODE_REMOVED:
      handleUserNodeRemoved(rootStore, parsedPayload);
      break;

    case EVENT_NODE_CONNECTED:
      handleNodeConnected(rootStore, node_id, timestamp);
      break;

    case EVENT_NODE_DISCONNECTED:
      handleNodeDisconnected(rootStore, node_id, timestamp);
      break;

    default:
      break;
  }
}

/**
 * Handles adding a transport to a node.
 * Updates the node's available transports and emits property change events.
 *
 * @param rootStore - The root CDF store instance
 * @param nodeId - The ID of the node to update
 * @param transportDetails - The transport configuration to add
 */
export const handleAddNodeTransport = action(
  (rootStore: ESPCDF | null, nodeId: string, transport: ESPCDFTransportConfig) => {
    if (!rootStore || !nodeId || !transport) return;

    const node = rootStore.nodeStore.getNodeById(nodeId);
    if (!node) return;

    const oldAvailableTransports = { ...node.availableTransports };
    const newAvailableTransports = { ...node.availableTransports };

    newAvailableTransports[transport.type] = transport;

    rootStore.nodeStore.updateNode(node.id, {
      availableTransports: mobxObservable.object(newAvailableTransports),
    });

    node.emitPropertyChange({
      type: "availableTransportsChanged",
      availableTransports: newAvailableTransports,
      oldAvailableTransports: oldAvailableTransports,
      entity: node,
    });
  }
);
/**
 * Handles removing a transport from a node.
 * Updates the node's available transports and emits property change events.
 *
 * @param rootStore - The root CDF store instance
 * @param nodeId - The ID of the node to update
 * @param transportDetails - The transport configuration to remove
 */
export const handleRemoveNodeTransport = action(
  (rootStore: ESPCDF | null, nodeId: string, transport: ESPCDFTransportConfig) => {
    if (!rootStore || !nodeId || !transport) return;

    const node = rootStore.nodeStore.getNodeById(nodeId);
    if (!node) return;

    const oldAvailableTransports = { ...node.availableTransports };
    const newAvailableTransports = { ...node.availableTransports };
    delete newAvailableTransports[transport.type];

    rootStore.nodeStore.updateNode(node.id, {
      availableTransports: mobxObservable.object(newAvailableTransports),
    });

    node.emitPropertyChange({
      type: "availableTransportsChanged",
      availableTransports: newAvailableTransports,
      oldAvailableTransports: oldAvailableTransports,
      entity: node,
    });
  }
);


/**
 * Handles updating node transport (add or remove).
 * Routes to the appropriate handler based on the operation type.
 *
 * @param rootStore - The root CDF store instance
 * @param nodeId - The ID of the node to update
 * @param transportDetails - The transport configuration
 * @param operation - The operation to perform: "add" (default) or "remove"
 */
export function handleNodeTransportUpdate(
  rootStore: ESPCDF | null,
  nodeId: string,
  transportDetails: ESPCDFTransportConfig,
  operation: "add" | "remove" = "add"
): void {
  switch (operation) {
    case "add":
      handleAddNodeTransport(rootStore, nodeId, transportDetails);
      break;
    case "remove":
      handleRemoveNodeTransport(rootStore, nodeId, transportDetails);
      break;
  }
}

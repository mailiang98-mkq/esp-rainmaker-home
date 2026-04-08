import {
    ESPCDFNode,
    ESPCDF,
    ESPCDFNodeConfig,
    ESPCDFNodeInfoInterface,
    ESPCDFAPIResponse,
} from "@store";
import { ESPRMNGNode } from "@espressif/rmng-base-sdk";
import type {
    ESPCDFNodeOperation,
    ESPCDFPropertyChangeCallback,
} from "@store";
import { EVENT_NODE_PARAMS_CHANGED } from "@store/utils/constants";
import { ESPRMNGBaseAdaptorIdentifier } from "@config/sdk.identifiers";
import { mapShadowDocumentToNodeUpdateEvents } from "../utils/common";
import { transformToESPCDFDevice } from "./transformToESPCDFDevice";
import { transformToESPCDFService } from "./transformToESPCDFService";
import { ianaTzToEspPosixTz } from "@shared/utils/timezone";

const MQTT_TRANSPORT_KEY = "mqtt";

/**
 * Creates a property change callback that syncs CDF node property updates to raw ESPRMNode
 */
const createPropertyChangeSyncCallback = (
    _rawNode: ESPRMNGNode,
): ESPCDFPropertyChangeCallback => {
    return () => {
        // Sync CDF changes back to raw node when needed
    };
};

/**
 * Transform ESPRMNGNode to ESPCDFNode (minimal CDF shell; devices/connectivity/metadata come from elsewhere).
 */
export function transformToESPCDFNode(node: ESPRMNGNode): ESPCDFNode {
    const operations: ESPCDFNodeOperation = {
        setMultipleParams: async (_params: Record<string, any>) => {
            return node.setParams(_params);
        },
        delete: async (): Promise<ESPCDFAPIResponse> => {
            const res = await node.delete();
            const raw =
                res && typeof res === "object"
                    ? String((res as { status?: string }).status ?? "").toLowerCase()
                    : "";
            if (raw === "success" || raw.includes("success")) {
                return res as ESPCDFAPIResponse;
            }
            return {
                status: "success",
                description:
                    (res &&
                        typeof res === "object" &&
                        typeof (res as { description?: string }).description ===
                            "string" &&
                        (res as { description: string }).description) ||
                    "",
            };
        },
        setTimeZone: async (_timeZone: string) => {
            const posix = ianaTzToEspPosixTz(_timeZone);
            const timePayload: Record<string, string> = { TZ: _timeZone };
            if (posix) {
                timePayload["TZ-POSIX"] = posix;
            }
            return node.setParams({
                Time: timePayload,
            });
        },
        updateMetadata: async (_metadata: Record<string, any>) => {
            throw new Error("RMNGBase SDK does not support node updateMetadata");
        },
        checkOTAUpdate: async () => {
            throw new Error("RMNGBase SDK does not support node checkOTAUpdate");
        },
        pushOTAUpdate: async (_params: any) => {
            throw new Error("RMNGBase SDK does not support node pushOTAUpdate");
        },
        getOTAUpdateStatus: async () => {
            throw new Error("RMNGBase SDK does not support node getOTAUpdateStatus");
        },
    };

    node.on("params", (event: any) => {
        const root = ESPCDF.instance;
        const listen = root?.subscriptionStore?.nodeUpdates?.listen;
        if (!listen) return;

        const isShadowDoc =
            event &&
            typeof event === "object" &&
            event.state?.reported !== undefined;

        if (isShadowDoc) {
            for (const ev of mapShadowDocumentToNodeUpdateEvents(node.nodeId, event)) {
                listen(ev);
            }
            return;
        }

        listen({
            event_type: EVENT_NODE_PARAMS_CHANGED,
            node_id: node.nodeId,
            payload: event ?? {},
            timestamp: Date.now(),
        });
    });

    const cdfNode = new ESPCDFNode({
        identifier: ESPRMNGBaseAdaptorIdentifier,
        id: node.nodeId,
        type: "rmng node",
        nodeConfig: new ESPCDFNodeConfig({
            configVersion: node.config.config_version ?? "",
            info: node.config.info as ESPCDFNodeInfoInterface,
        }),
        devices: node.devices.map(device => transformToESPCDFDevice(device)),
        services: node.services.map(service => transformToESPCDFService(service)),
        connectivityStatus: node.connectivityStatus,
        metadata: {},
        operations: operations,
        isPrimaryUser: true, // TODO: Remove this once we have a proper way to determine if the node is primary user
        transportOrder: [MQTT_TRANSPORT_KEY],
        availableTransports: {
            [MQTT_TRANSPORT_KEY]: { type: MQTT_TRANSPORT_KEY, metadata: {} },
        },
        _raw: node,
    });
    const syncCallback = createPropertyChangeSyncCallback(node);
    cdfNode.onPropertyChange(syncCallback);

    return cdfNode;
}

/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ESPMQTTConfig, ESPMQTTInterface } from "../interfaces/ESPMQTTInterface";
import {
    NativeEventEmitter,
    NativeModules,
    type EmitterSubscription
} from "react-native";

const { ESPMQTTModule } = NativeModules;

const MQTT_MESSAGE_EVENT = "mqttMessageReceived";

const topicHandlers = new Map<
    string,
    Set<(topic: string, payload: Buffer) => void>
>();

let bridgeSubscription: EmitterSubscription | null = null;

function logMqttJson(event: string, data: Record<string, unknown>): void {
    console.log(JSON.stringify({ event, ...data }));
}

function topicMatches(filter: string, topic: string): boolean {
    const fSegs = filter.split("/");
    const tSegs = topic.split("/");

    for (let i = 0; i < fSegs.length; i++) {
        const f = fSegs[i];
        if (f === "#") {
            return i === fSegs.length - 1;
        }
        if (i >= tSegs.length) {
            return false;
        }
        if (f === "+") {
            continue;
        }
        if (f !== tSegs[i]) {
            return false;
        }
    }
    return fSegs.length === tSegs.length;
}

function dispatchMessage(topic: string, payload: Buffer): void {
    for (const [pattern, handlers] of topicHandlers) {
        if (topicMatches(pattern, topic)) {
            logMqttJson("mqtt.dispatch", {
                topic,
                pattern,
                payload: payload.toString("utf8")
            });
            handlers.forEach((h) => {
                h(topic, payload);
            });
        }
    }
}

function ensureBridgeListener(): void {
    if (bridgeSubscription != null) {
        return;
    }
    const emitter = new NativeEventEmitter(ESPMQTTModule);
    bridgeSubscription = emitter.addListener(
        MQTT_MESSAGE_EVENT,
        (event: { topic?: string; message?: string }) => {
            const t = event.topic;
            if (t == null || event.message == null) {
                return;
            }
            logMqttJson("mqtt.received", { topic: t, message: event.message });
            const payload = Buffer.from(event.message, "utf8");
            dispatchMessage(t, payload);
        }
    );
}

function removeBridgeListenerIfIdle(): void {
    if (topicHandlers.size > 0) {
        return;
    }
    bridgeSubscription?.remove();
    bridgeSubscription = null;
}

function payloadToString(payload: string | Buffer): string {
    if (typeof payload === "string") {
        return payload;
    }
    return payload.toString("utf8");
}

export const ESPMQTTAdapter: ESPMQTTInterface = {
    connect: async (config: ESPMQTTConfig) => {
        const _config: Record<string, unknown> = {
            accessKeyId: config.accessKey,
            secretAccessKey: config.secretKey,
            sessionToken: config.sessionToken,
            endpoint: config.endpoint,
            clientId: config.clientId
        };
        if (config.region != null && config.region !== "") {
            _config.region = config.region;
        }
        return ESPMQTTModule.connect(_config);
    },
    disconnect: async () => {
        topicHandlers.clear();
        bridgeSubscription?.remove();
        bridgeSubscription = null;
        return ESPMQTTModule.disconnect();
    },
    isConnected: async () => {
        return ESPMQTTModule.isConnected();
    },
    publish: async (topic: string, payload: string | Buffer) => {
        const body = payloadToString(payload);
        logMqttJson("mqtt.publish", { topic, payload: body });
        return ESPMQTTModule.publish(topic, body);
    },
    subscribe: async (
        topic: string,
        handler: (topic: string, payload: Buffer) => void
    ) => {
        const connected = await ESPMQTTModule.isConnected();
        if (!connected) {
            throw new Error("ESPMQTTAdapter: not connected");
        }

        ensureBridgeListener();

        let set = topicHandlers.get(topic);
        const firstForPattern = !set || set.size === 0;
        if (!set) {
            set = new Set();
            topicHandlers.set(topic, set);
        }
        set.add(handler);

        if (firstForPattern) {
            await ESPMQTTModule.subscribe(topic);
        }
    },
    unsubscribe: async (
        topic: string,
        handler?: (topic: string, payload: Buffer) => void
    ) => {
        const set = topicHandlers.get(topic);
        if (!set) {
            return;
        }

        if (handler) {
            set.delete(handler);
            if (set.size > 0) {
                return;
            }
            topicHandlers.delete(topic);
        } else {
            topicHandlers.delete(topic);
        }

        const connected = await ESPMQTTModule.isConnected();
        if (connected) {
            await ESPMQTTModule.unsubscribe(topic);
        }
        removeBridgeListenerIfIdle();
    }
};

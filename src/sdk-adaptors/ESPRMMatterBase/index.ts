/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    ESPSDKAdaptorAPIDataResponse,
    ESPSDKAdaptorAPIRequest,
    ESPSDKAdaptorAPIResponse,
    ESPCDFUser,
    ESPCDFLoginRequestPayload,
    ESPCDFLoginWithOauthRequestPayload,
} from "@store";
import {
    ESPRMMatterBase,
    type ESPRMMatterBaseConfig,
    ESPRMAuth,
    ESPRMBaseConfig,
    ESPTransportMode,
} from "@espressif/rainmaker-matter-sdk";
import { transformToESPCDFUser } from "./transformers";
import { ESPRMMatterBaseAdaptorIdentifier } from "./constants";

export { ESPRMMatterBaseAdaptorIdentifier };

export class ESPRMMatterBaseSDKAdaptor {
    config: ESPRMMatterBaseConfig;
    _identifier: string = ESPRMMatterBaseAdaptorIdentifier;
    _authInstance!: ESPRMAuth;

    constructor(config: ESPRMMatterBaseConfig) {
        this.config = config;
        this.initializeSDK(this.config);
    }

    async initializeSDK(config: ESPRMMatterBaseConfig): Promise<ESPSDKAdaptorAPIResponse> {
        ESPRMMatterBase.setTransportOrder([
            ESPTransportMode.local,
            ESPTransportMode.cloud,
        ]);
        ESPRMMatterBase.configure(config);
        this._authInstance = ESPRMMatterBase.getAuthInstance();
        return {
            status: "success",
            description: "SDK initialized successfully with Matter support",
        };
    }

    async loginWithOauth(input: ESPSDKAdaptorAPIRequest<ESPCDFLoginWithOauthRequestPayload>): Promise<ESPSDKAdaptorAPIDataResponse<ESPCDFUser>> {
        const provider = input.request as unknown as { identityProvider: string };
        const esprmUser = await this._authInstance.loginWithOauth(provider.identityProvider);
        const cdfUser = transformToESPCDFUser(esprmUser);
        return {
            status: "success",
            data: cdfUser,
        };
    }

    async login(input: ESPSDKAdaptorAPIRequest<ESPCDFLoginRequestPayload>): Promise<ESPSDKAdaptorAPIDataResponse<ESPCDFUser>> {
        const { username, password } = input.request as { username: string, password: string };
        const esprmUser = await this._authInstance.login(username, password);
        if (!esprmUser) {
            throw new Error("Login failed: No user returned");
        }
        const cdfUser = transformToESPCDFUser(esprmUser);
        return {
            status: "success",
            description: "Login successful",
            data: cdfUser,
        };
    }

    async getCurrentLoggedInUser(): Promise<ESPSDKAdaptorAPIDataResponse<ESPCDFUser>> {
        const esprmUser = await this._authInstance.getLoggedInUser();
        if (!esprmUser) {
            throw new Error("No logged in user found");
        }
        const cdfUser = transformToESPCDFUser(esprmUser);
        return {
            status: "success",
            description: "Current logged in user fetched successfully",
            data: cdfUser,
        };
    }

    async getSignUpCode(input: ESPSDKAdaptorAPIRequest<any>): Promise<ESPSDKAdaptorAPIResponse> {
        const { username, password } = input.request as { username: string, password: string };
        const response = await this._authInstance.sendSignUpCode(username, password);
        return {
            status: "success",
            description: response?.description || "Signup code fetched successfully",
        };
    }

    async confirmSignUp(input: ESPSDKAdaptorAPIRequest<any>): Promise<ESPSDKAdaptorAPIResponse> {
        const { username, verificationCode } = input.request as { username: string, verificationCode: string };
        const response = await this._authInstance.confirmSignUp(username, verificationCode);
        if (!response) {
            throw new Error("Signup confirmation failed: No response returned");
        }
        return {
            status: "success",
            description: response?.description || "Signup confirmation successful",
        };
    }

    async forgotPassword(input: ESPSDKAdaptorAPIRequest<any>): Promise<ESPSDKAdaptorAPIResponse> {
        const { username } = input.request as { username: string };
        const response = await this._authInstance.forgotPassword(username);
        return {
            status: "success",
            description: response?.description || "Forgot password successful",
        };
    }

    async setNewPassword(input: ESPSDKAdaptorAPIRequest<any>): Promise<ESPSDKAdaptorAPIResponse> {
        const { username, newPassword, verificationCode } = input.request!
        const response = await this._authInstance.setNewPassword(username, newPassword, verificationCode);
        return {
            status: "success",
            description: response?.description || "New password set successfully",
        };
    }
}

export type { ESPRMBaseConfig };

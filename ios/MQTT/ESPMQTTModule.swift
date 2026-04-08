/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import Foundation
import React

private let kMqttMessageEvent = "mqttMessageReceived"
private let kIotDataManagerKey = "com.espressif.ESPMQTTModule.IoT"

@objc(ESPMQTTModule)
class ESPMQTTModule: RCTEventEmitter {

  private let queue = DispatchQueue(label: "com.espressif.ESPMQTTModule", qos: .userInitiated)
  private var connectPromiseHandled = false
  /// `AWSIoTDataManager(forKey:)` is non-optional in Swift; track registration locally (matches disconnect/remove lifecycle).
  private var hasActiveIoTRegistration = false

  override static func moduleName() -> String! {
    "ESPMQTTModule"
  }

  override func supportedEvents() -> [String]! {
    [kMqttMessageEvent]
  }

  override static func requiresMainQueueSetup() -> Bool {
    false
  }

  // MARK: - Endpoint / region (no hardcoded region map — use AWSCore string lookup + optional JS `region`)

  private func normalizeEndpointHost(_ raw: String) -> String {
    var host = raw
    if host.hasPrefix("https://") {
      host = String(host.dropFirst("https://".count))
    } else if host.hasPrefix("http://") {
      host = String(host.dropFirst("http://".count))
    } else if host.hasPrefix("wss://") {
      host = String(host.dropFirst("wss://".count))
    } else if host.hasPrefix("ws://") {
      host = String(host.dropFirst("ws://".count))
    }
    if host.hasSuffix("/mqtt") || host.hasSuffix("/mqtt/") {
      if host.hasSuffix("/") {
        host = String(host.dropLast())
      }
      if host.hasSuffix("/mqtt") {
        host = String(host.dropLast("/mqtt".count))
      }
    }
    let parts = host.split(separator: "/")
    return parts.first.map(String.init) ?? host
  }

  /// Extracts the AWS region id (e.g. `us-east-1`) from standard IoT Core hostnames.
  private func parseRegionId(fromIotEndpointHost host: String) -> String? {
    let parts = host.split(separator: ".").map(String.init)
    for i in parts.indices {
      if parts[i] == "iot", i + 1 < parts.count {
        return parts[i + 1]
      }
      if parts[i].hasPrefix("iot-"), parts[i] != "iot", i + 1 < parts.count {
        return parts[i + 1]
      }
    }
    return nil
  }

  /// Resolves `AWSRegionType` using AWSCore's `NSString.aws_regionTypeValue` (kept in sync with new regions in the pod).
  private func awsRegionType(regionId: String) -> AWSRegionType {
    (regionId as NSString).aws_regionTypeValue()
  }

  private func teardownIoTClient(completion: @escaping () -> Void) {
    let hadClient = hasActiveIoTRegistration
    if hadClient {
      AWSIoTDataManager(forKey: kIotDataManagerKey).disconnect()
      AWSIoTDataManager.remove(forKey: kIotDataManagerKey)
      hasActiveIoTRegistration = false
    }
    if hadClient {
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.0, execute: completion)
    } else {
      completion()
    }
  }

  /// Full connect path; `connect` only schedules this so `queue.async` stays a tiny closure (Swift type-checker).
  private func performConnect(
    config: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    if hasActiveIoTRegistration {
      let status = AWSIoTDataManager(forKey: kIotDataManagerKey).getConnectionStatus()
      if status == .connecting || status == .connected {
        DispatchQueue.main.async { resolve(nil) }
        return
      }
    }

    guard let accessKeyId = config["accessKeyId"] as? String, !accessKeyId.isEmpty,
          let secretAccessKey = config["secretAccessKey"] as? String, !secretAccessKey.isEmpty,
          let sessionToken = config["sessionToken"] as? String, !sessionToken.isEmpty,
          let endpointRaw = config["endpoint"] as? String, !endpointRaw.isEmpty
    else {
      DispatchQueue.main.async {
        reject("invalid_args", "Missing credentials", nil)
      }
      return
    }

    let host = normalizeEndpointHost(endpointRaw)
    guard let serviceURL = URL(string: "https://\(host)") else {
      DispatchQueue.main.async {
        reject("invalid_args", "Invalid endpoint", nil)
      }
      return
    }

    let clientId = (config["clientId"] as? String).flatMap { $0.isEmpty ? nil : $0 }
      ?? "ios-\(UUID().uuidString)"

    let credentialsProvider = AWSBasicSessionCredentialsProvider(
      accessKey: accessKeyId,
      secretKey: secretAccessKey,
      sessionToken: sessionToken
    )

    let trimmedOverride: String? = {
      guard let r = config["region"] as? String else { return nil }
      let t = r.trimmingCharacters(in: .whitespacesAndNewlines)
      return t.isEmpty ? nil : t
    }()
    let resolvedRegion = trimmedOverride ?? parseRegionId(fromIotEndpointHost: host)
    guard let regionId = resolvedRegion else {
      DispatchQueue.main.async {
        reject(
          "invalid_args",
          "Could not determine AWS region: pass config.region (e.g. us-east-1) or use a standard IoT endpoint host (*.iot.<region>.amazonaws.com).",
          nil
        )
      }
      return
    }
    let regionType = awsRegionType(regionId: regionId)
    // Avoid `== .unknown`: Swift may resolve `.unknown` as `FormatStyleCapitalizationContext`,
    // not `AWSRegionType.unknown`. AWSCore defines `AWSRegionTypeUnknown` as raw value 0.
    if regionType.rawValue == 0 {
      DispatchQueue.main.async {
        reject(
          "invalid_args",
          "Unknown AWS region '\(regionId)'. Pass a supported region id in config.region, or update the AWS iOS SDK.",
          nil
        )
      }
      return
    }

    let endpoint = AWSEndpoint(url: serviceURL)
    guard let serviceConfiguration = AWSServiceConfiguration(
      region: regionType,
      endpoint: endpoint,
      credentialsProvider: credentialsProvider,
      localTestingEnabled: false
    ) else {
      DispatchQueue.main.async {
        reject("invalid_args", "Invalid service configuration", nil)
      }
      return
    }

    let mqttConfig = AWSIoTMQTTConfiguration(
      keepAliveTimeInterval: 30,
      baseReconnectTimeInterval: 1,
      minimumConnectionTimeInterval: 20,
      maximumReconnectTimeInterval: 128,
      runLoop: .current,
      runLoopMode: RunLoop.Mode.default.rawValue,
      autoResubscribe: true,
      lastWillAndTestament: AWSIoTMQTTLastWillAndTestament()
    )

    connectPromiseHandled = false

    teardownIoTClient {
      AWSIoTDataManager.register(
        with: serviceConfiguration,
        with: mqttConfig,
        forKey: kIotDataManagerKey
      )
      self.hasActiveIoTRegistration = true

      let iotManager = AWSIoTDataManager(forKey: kIotDataManagerKey)

      let started = iotManager.connectUsingWebSocket(
        withClientId: clientId,
        cleanSession: true
      ) { [weak self] status in
        guard let self else { return }
        switch status {
        case .connected:
          if !self.connectPromiseHandled {
            self.connectPromiseHandled = true
            DispatchQueue.main.async { resolve(nil) }
          }
        case .connectionError, .connectionRefused, .protocolError:
          if !self.connectPromiseHandled {
            self.connectPromiseHandled = true
            self.hasActiveIoTRegistration = false
            AWSIoTDataManager.remove(forKey: kIotDataManagerKey)
            DispatchQueue.main.async {
              reject("connection_failed", "MQTT connection failed (status \(status.rawValue))", nil)
            }
          }
        default:
          break
        }
      }

      if !started {
        if !self.connectPromiseHandled {
          self.connectPromiseHandled = true
          self.hasActiveIoTRegistration = false
          AWSIoTDataManager.remove(forKey: kIotDataManagerKey)
          DispatchQueue.main.async {
            reject("connection_failed", "connectUsingWebSocket returned false", nil)
          }
        }
      }
    }
  }

  @objc(connect:resolver:rejecter:)
  func connect(
    _ config: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async { [weak self] in
      guard let self else { return }
      self.performConnect(config: config, resolve: resolve, reject: reject)
    }
  }

  @objc(disconnect:rejecter:)
  func disconnect(
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async { [weak self] in
      guard let self else { return }
      if self.hasActiveIoTRegistration {
        AWSIoTDataManager(forKey: kIotDataManagerKey).disconnect()
        AWSIoTDataManager.remove(forKey: kIotDataManagerKey)
        self.hasActiveIoTRegistration = false
      }
      self.connectPromiseHandled = false
      DispatchQueue.main.async { resolve(nil) }
    }
  }

  @objc(isConnected:rejecter:)
  func isConnected(
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async { [weak self] in
      guard let self else { return }
      let connected = self.hasActiveIoTRegistration
        && AWSIoTDataManager(forKey: kIotDataManagerKey).getConnectionStatus() == .connected
      DispatchQueue.main.async { resolve(connected) }
    }
  }

  @objc(publish:payload:resolver:rejecter:)
  func publish(
    _ topic: String,
    payload: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async { [weak self] in
      guard let self else { return }
      guard self.hasActiveIoTRegistration else {
        DispatchQueue.main.async {
          reject("not_connected", "MQTT not connected", nil)
        }
        return
      }
      let manager = AWSIoTDataManager(forKey: kIotDataManagerKey)
      guard manager.getConnectionStatus() == .connected else {
        DispatchQueue.main.async {
          reject("not_connected", "MQTT not connected", nil)
        }
        return
      }
      let ok = manager.publishString(payload, onTopic: topic, qoS: .messageDeliveryAttemptedAtMostOnce)
      if ok {
        DispatchQueue.main.async { resolve(nil) }
      } else {
        DispatchQueue.main.async {
          reject("error", "publish failed", nil)
        }
      }
    }
  }

  @objc(subscribe:resolver:rejecter:)
  func subscribe(
    _ topic: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async { [weak self] in
      guard let self else { return }
      guard self.hasActiveIoTRegistration else {
        DispatchQueue.main.async {
          reject("not_connected", "MQTT not connected", nil)
        }
        return
      }
      let manager = AWSIoTDataManager(forKey: kIotDataManagerKey)
      guard manager.getConnectionStatus() == .connected else {
        DispatchQueue.main.async {
          reject("not_connected", "MQTT not connected", nil)
        }
        return
      }

      let ok = manager.subscribe(
        toTopic: topic,
        qoS: .messageDeliveryAttemptedAtMostOnce,
        extendedCallback: { [weak self] _, receivedTopic, data in
          guard let self else { return }
          let body = (data as Data?) ?? Data()
          let message = String(data: body, encoding: .utf8) ?? ""
          let payload: [String: Any] = [
            "topic": receivedTopic,
            "message": message,
            "timestamp": Date().timeIntervalSince1970 * 1000,
          ]
          DispatchQueue.main.async {
            self.sendEvent(withName: kMqttMessageEvent, body: payload)
          }
        }
      )

      if ok {
        DispatchQueue.main.async { resolve(nil) }
      } else {
        DispatchQueue.main.async {
          reject("error", "subscribe failed", nil)
        }
      }
    }
  }

  @objc(unsubscribe:resolver:rejecter:)
  func unsubscribe(
    _ topic: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async { [weak self] in
      guard let self else { return }
      guard self.hasActiveIoTRegistration else {
        DispatchQueue.main.async {
          reject("not_connected", "MQTT not connected", nil)
        }
        return
      }
      let manager = AWSIoTDataManager(forKey: kIotDataManagerKey)
      guard manager.getConnectionStatus() == .connected else {
        DispatchQueue.main.async {
          reject("not_connected", "MQTT not connected", nil)
        }
        return
      }
      manager.unsubscribeTopic(topic)
      DispatchQueue.main.async { resolve(nil) }
    }
  }
}

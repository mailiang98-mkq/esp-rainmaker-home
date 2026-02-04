/*
 * SPDX-FileCopyrightText: 2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import Foundation
import React

@objc(ESPNotificationModule)
public class ESPNotificationModule: RCTEventEmitter {
  
  private var deviceToken: String?
  private var deviceTokenKey: String {
    return "\(Bundle.bundleIdentifier()).devicetoken"
  }
  
  private var listenerEnabled = true
  private let eventKey = "ESPNotificationModule"
  
  /// AppDelegate uses this for token storage; push delivery must use the bridge module (see `bridgeModuleInstance`).
  private static var isSharedSingletonInit = false
  private static weak var bridgeModuleInstance: ESPNotificationModule?
  
  @objc public static let shared: ESPNotificationModule = {
    // Use `ESPNotificationModule`, not `Self` — covariant `Self` is not allowed in stored property initializers.
    ESPNotificationModule.isSharedSingletonInit = true
    let instance = ESPNotificationModule()
    ESPNotificationModule.isSharedSingletonInit = false
    return instance
  }()
  
  /// Bridge-registered module instance (has `RCTEventEmitter` plumbing). The `shared` singleton is not connected to the bridge.
  /// Uses `disabledObservation` like `ESPDiscoveryModule` so `sendEvent` reaches JS when the app listens via `DeviceEventEmitter` only (no native `addListener` call).
  public override init() {
    super.init(disabledObservation: ())
    if !Self.isSharedSingletonInit {
      Self.bridgeModuleInstance = self
    }
  }
  
  override public static func moduleName() -> String {
    return "ESPNotificationModule"
  }
  
  public override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  // List of supported events
  public override func supportedEvents() -> [String]! {
    return [self.eventKey]
  }
  
  // Method to set the device token
  @objc(setDeviceToken:)
  func setDeviceToken(_ token: String) {
    UserDefaults.standard.setValue(token, forKey: deviceTokenKey)
  }
  
  /// Retrieves the device token from UserDefaults.
  ///
  /// - Parameters:
  ///   - resolve: A promise resolve block that is called with the device token if it exists.
  ///   - reject: A promise reject block that is called if the device token is not found.
  @objc(getDeviceToken:reject:)
  func getDeviceToken(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // Check if the device token is stored in UserDefaults
    if let token = UserDefaults.standard.value(forKey: deviceTokenKey) {
      // Resolve the promise with the token if it exists
      resolve(token)
    } else {
      // Reject the promise if the token is not found
      reject("error", "Device token not set", nil)
    }
  }
  
  /// Retrieves the notification platform identifier.
  ///
  /// - Parameters:
  ///   - resolve: A promise resolve block that is called with the notification platform identifier.
  ///   - reject: A promise reject block that is called in case of any errors.
  @objc(getNotificationPlatform:reject:)
  func getNotificationPlatform(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // Resolving the promise with a fixed notification platform identifier for APNS sandbox demo
    resolve("APNS_NOVA")
  }
  
  /// Add the notification listener.
  @objc(addNotificationListener)
  func addNotificationListener() {
    listenerEnabled = true
  }
  
  /// Removes the notification listener.
  @objc(removeNotificationListener)
  func removeNotificationListener() {
    listenerEnabled = false
  }
  
  // MARK: - AppDelegate entry points (forward to bridge module)
  
  /// AppDelegate calls this on `shared`. Events must be emitted from the bridge `RCTEventEmitter` instance or JS never receives them.
  @objc(handleSilentNotification:)
  func handleSilentNotification(_ userInfo: [String: Any]) {
    Self.bridgeModuleInstance?.emitNotificationToJSIfListening(userInfo)
  }
  
  @objc(handlePushNotification:)
  func handlePushNotification(_ userInfo: [String: Any]) {
    Self.bridgeModuleInstance?.emitNotificationToJSIfListening(userInfo)
  }
  
  private func emitNotificationToJSIfListening(_ userInfo: [String: Any]) {
    guard listenerEnabled else { return }
    sendEvent(withName: self.eventKey, body: normalizeNotificationUserInfoForBridge(userInfo))
  }
  
  /// Matches Android `ESPNotificationQueue.sendToJS`: parse JSON string `event_data_payload` and set `event_data_payload_raw`.
  private func normalizeEventDataPayloadInUserInfo(_ userInfo: [String: Any]) -> [String: Any] {
    var updated: [String: Any] = [:]
    for (key, value) in userInfo {
      guard key == "event_data_payload" else {
        updated[key] = value
        continue
      }
      let (payload, raw) = Self.eventDataPayloadAndRaw(from: value)
      updated["event_data_payload"] = payload
      if let raw = raw {
        updated["event_data_payload_raw"] = raw
      }
    }
    return updated
  }
  
  /// Parses `event_data_payload` (string JSON vs dict) and optional canonical JSON string for `event_data_payload_raw`.
  private static func eventDataPayloadAndRaw(from value: Any) -> (payload: Any, raw: String?) {
    if let jsonString = value as? String {
      if let data = jsonString.data(using: .utf8),
         let obj = try? JSONSerialization.jsonObject(with: data),
         let dict = obj as? [String: Any] {
        return (dict, jsonString)
      }
      return (value, nil)
    }
    if let dict = value as? [String: Any] {
      return (dict, jsonUTF8String(from: dict))
    }
    if let nsDict = value as? NSDictionary {
      return (nsDict, jsonUTF8String(from: nsDict))
    }
    return (value, nil)
  }
  
  private static func jsonUTF8String(from object: Any) -> String? {
    guard JSONSerialization.isValidJSONObject(object),
          let data = try? JSONSerialization.data(withJSONObject: object),
          let raw = String(data: data, encoding: .utf8) else { return nil }
    return raw
  }
  
  /// Keeps APNS `data.*` nested so Rainmaker SDK `transformNotificationData` (iOS paths) matches; aligns `event_data_payload` like Android.
  private func normalizeNotificationUserInfoForBridge(_ userInfo: [String: Any]) -> [String: Any] {
    guard let dataVal = userInfo["data"] else {
      return normalizeEventDataPayloadInUserInfo(userInfo)
    }
    var out = userInfo
    if let inner = dataVal as? [String: Any] {
      out["data"] = normalizeEventDataPayloadInUserInfo(inner)
    } else if let inner = dataVal as? NSDictionary {
      out["data"] = normalizeEventDataPayloadInUserInfo(Self.stringKeyedDictionary(from: inner))
    }
    return out
  }
  
  /// Converts `NSDictionary` from ObjC to `[String: Any]` for merging.
  private static func stringKeyedDictionary(from ns: NSDictionary) -> [String: Any] {
    var map: [String: Any] = [:]
    ns.enumerateKeysAndObjects { key, value, _ in
      if let k = key as? String {
        map[k] = value
      }
    }
    return map
  }
}

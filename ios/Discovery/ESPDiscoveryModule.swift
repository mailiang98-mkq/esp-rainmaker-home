/*
 * SPDX-FileCopyrightText: 2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import Darwin
import Foundation
import React

private let kDefaultMdnsServiceType = "_esp_local_ctrl._tcp."
private let kDefaultMdnsDomain = "local."

@objc(ESPDiscoveryModule)
class ESPDiscoveryModule: RCTEventEmitter {
  
  private var serviceBrowser = NetServiceBrowser()
  private var servicesBeingResolved: [NetService] = []
  /// Matches Android `resolvedNsdServices` bookkeeping: stable node id for `DiscoveryLost` when TXT `node_id` ≠ instance name.
  private var resolvedNodeIdByServiceKey: [String: String] = [:]
  
  override init() {
    super.init(disabledObservation: ())
    // Ensure service browser is properly initialized
    serviceBrowser = NetServiceBrowser()
    serviceBrowser.delegate = self
  }
  
  override public static func moduleName() -> String {
    return "ESPDiscoveryModule"
  }
  
  // Required for RCTEventEmitter
  public override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func supportedEvents() -> [String]! {
    return ["DiscoveryUpdate", "DiscoveryLost"]
  }
  /// Starts the discovery process for network services.
  ///
  /// - Parameter params: A dictionary containing the following keys:
  ///   - `serviceType`: RainMaker local control default `_esp_local_ctrl._tcp.` (from base SDK).
  ///   - `domain`: SDK sends `local`; Bonjour expects `local.` — normalized below.
  ///
  @objc(startDiscovery:)
  func startDiscovery(params: NSDictionary) {
    var serviceType = (params["serviceType"] as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines)
    var domain = (params["domain"] as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines)

    if serviceType == nil || serviceType!.isEmpty {
      serviceType = kDefaultMdnsServiceType
    }
    if domain == nil || domain!.isEmpty {
      domain = kDefaultMdnsDomain
    } else if domain == "local" {
      domain = kDefaultMdnsDomain
    }

    guard let st = serviceType, let dom = domain else { return }

    resolvedNodeIdByServiceKey.removeAll()
    servicesBeingResolved.removeAll()
    serviceBrowser.stop()
    serviceBrowser.searchForServices(ofType: st, inDomain: dom)
  }
  
  /// Stops the ongoing discovery process.
  @objc(stopDiscovery)
  func stopDiscovery() {
    // Stop the service browser to terminate the discovery process.
    serviceBrowser.stop()
    servicesBeingResolved.removeAll()
    resolvedNodeIdByServiceKey.removeAll()
  }
  
  private func sendDeviceEvent(nodeId: String, baseUrl: String) {
    // Validate inputs before sending event
    guard !nodeId.isEmpty, !baseUrl.isEmpty else {
      return
    }
    
    let eventData: [String: Any] = ["nodeId": nodeId, "baseUrl": baseUrl]
    sendEvent(withName: "DiscoveryUpdate", body: eventData)
  }
  
}

extension ESPDiscoveryModule: NetServiceBrowserDelegate {
  func netServiceBrowser(_: NetServiceBrowser, didFind service: NetService, moreComing _: Bool) {
    service.delegate = self
    servicesBeingResolved.append(service)
    service.resolve(withTimeout: 5.0)
  }

  func netServiceBrowser(_: NetServiceBrowser, didRemove service: NetService, moreComing _: Bool) {
    NSLog("ESPDiscoveryModule: Service lost: name=%@ type=%@ domain=%@", service.name, service.type, service.domain)
    servicesBeingResolved.removeAll {
      $0.name == service.name && $0.type == service.type && $0.domain == service.domain
    }
    let key = Self.serviceKey(service)
    let nodeId = resolvedNodeIdByServiceKey.removeValue(forKey: key) ?? service.name
    if !nodeId.isEmpty {
      sendEvent(withName: "DiscoveryLost", body: ["nodeId": nodeId])
    }
  }
}

extension ESPDiscoveryModule: NetServiceDelegate {
  func netServiceDidResolveAddress(_ sender: NetService) {
    var nodeId = nodeIdFromTxtRecord(sender)
    if nodeId.isEmpty {
      nodeId = sender.name
    }
    guard !nodeId.isEmpty else {
      NSLog("ESPDiscoveryModule: Could not determine node id for service")
      return
    }

    let hostForUrl = numericHostString(from: sender)
      ?? sender.hostName.map { $0.hasSuffix(".") ? String($0.dropLast()) : $0 }
    guard let host = hostForUrl, !host.isEmpty else {
      NSLog("ESPDiscoveryModule: Invalid host after resolve")
      return
    }

    let baseUrl = "http://\(host):\(sender.port)"
    resolvedNodeIdByServiceKey[Self.serviceKey(sender)] = nodeId
    sendDeviceEvent(nodeId: nodeId, baseUrl: baseUrl)
  }
  
  func netService(_ sender: NetService, didNotResolve errorDict: [String: NSNumber]) {
    print("ESPDiscoveryModule: Failed to resolve service: \(errorDict)")
  }

  private static func serviceKey(_ service: NetService) -> String {
    "\(service.name)|\(service.type)|\(service.domain)"
  }

  /// Bonjour TXT `node_id` (case-insensitive), same as RainMaker Android `mDNSManager`.
  /// Uses `txtRecordData` + `dictionary(fromTXTRecord:)` for compatibility (no `txtRecordDictionary()` on all targets).
  private func nodeIdFromTxtRecord(_ service: NetService) -> String {
    guard let txtData = service.txtRecordData() else { return "" }
    let dict = NetService.dictionary(fromTXTRecord: txtData)
    for (key, valueData) in dict where key.lowercased() == "node_id" {
      guard let raw = String(data: valueData, encoding: .utf8) else { continue }
      let trimmed = raw.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
      if !trimmed.isEmpty { return trimmed }
    }
    return ""
  }

  /// Prefer numeric IP for `baseUrl` to match Android `InetAddress.getHostAddress()`.
  private func numericHostString(from service: NetService) -> String? {
    guard let addresses = service.addresses else { return nil }
    for data in addresses {
      let host: String? = data.withUnsafeBytes { buf -> String? in
        guard let base = buf.baseAddress else { return nil }
        var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
        let saLen = socklen_t(data.count)
        let rc = getnameinfo(
          base.assumingMemoryBound(to: sockaddr.self),
          saLen,
          &hostname,
          socklen_t(hostname.count),
          nil,
          0,
          NI_NUMERICHOST
        )
        guard rc == 0 else { return nil }
        return String(cString: hostname)
      }
      if let h = host, !h.isEmpty { return h }
    }
    return nil
  }
}

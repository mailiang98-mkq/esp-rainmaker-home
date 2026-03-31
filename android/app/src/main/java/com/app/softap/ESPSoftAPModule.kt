/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package com.app.softap

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.net.wifi.WifiManager
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets
import java.util.concurrent.Executors

/**
 * Parity with iOS [ESPSoftAPModule]: SoftAP detection via /proto-ver and opening app settings for Wi‑Fi.
 */
class ESPSoftAPModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val executor = Executors.newSingleThreadExecutor()

    override fun getName(): String = "ESPSoftAPModule"

    @ReactMethod
    fun openWifiSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", reactContext.packageName, null)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (_: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getCurrentWifiSSID(promise: Promise) {
        executor.execute {
            try {
                promise.resolve(readSsid(reactContext.applicationContext))
            } catch (_: Exception) {
                promise.resolve(null)
            }
        }
    }

    @ReactMethod
    fun checkSoftAPConnection(promise: Promise) {
        executor.execute {
            try {
                val ssid = readSsid(reactContext.applicationContext)
                if (ssid.isNullOrEmpty()) {
                    promise.resolve(null)
                    return@execute
                }
                val caps = fetchProtoVerCapabilities()
                if (caps == null) {
                    promise.resolve(null)
                } else {
                    val result = WritableNativeMap().apply {
                        putString("deviceName", ssid)
                        putArray("capabilities", Arguments.fromList(caps))
                    }
                    promise.resolve(result)
                }
            } catch (_: Exception) {
                promise.resolve(null)
            }
        }
    }

    private fun readSsid(context: Context): String? {
        val wifi = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            ?: return null
        @Suppress("DEPRECATION")
        val info = wifi.connectionInfo ?: return null
        var ssid = info.ssid ?: return null
        if (ssid == WifiManager.UNKNOWN_SSID) return null
        if (ssid.length >= 2 && ssid.startsWith("\"") && ssid.endsWith("\"")) {
            ssid = ssid.substring(1, ssid.length - 1)
        }
        if (ssid.isEmpty() || ssid == "<unknown ssid>") return null
        return ssid
    }

    private fun fetchProtoVerCapabilities(): List<String>? {
        var conn: HttpURLConnection? = null
        return try {
            val url = URL("http://192.168.4.1/proto-ver")
            conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-type", "application/x-www-form-urlencoded")
            conn.setRequestProperty("Accept", "text/plain")
            conn.doOutput = true
            conn.connectTimeout = 2000
            conn.readTimeout = 2000
            conn.outputStream.use { os ->
                os.write("ESP".toByteArray(StandardCharsets.UTF_8))
            }
            if (conn.responseCode != HttpURLConnection.HTTP_OK) {
                null
            } else {
                val body = conn.inputStream.bufferedReader(StandardCharsets.UTF_8).use { it.readText() }
                val json = JSONObject(body)
                val prov = json.optJSONObject("prov") ?: return null
                val cap = prov.optJSONArray("cap") ?: return null
                List(cap.length()) { i -> cap.getString(i) }
            }
        } catch (_: Exception) {
            null
        } finally {
            conn?.disconnect()
        }
    }
}

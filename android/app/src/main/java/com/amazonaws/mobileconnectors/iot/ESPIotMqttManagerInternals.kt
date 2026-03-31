package com.amazonaws.mobileconnectors.iot

/**
 * [AWSIotMqttManager.isReadyToPublish] is package-private; this type lives in the same package
 * so we can query the underlying Paho client connection state from app code.
 */
object ESPIotMqttManagerInternals {
    fun isPahoConnected(manager: AWSIotMqttManager): Boolean = manager.isReadyToPublish()
}

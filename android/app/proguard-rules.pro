# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html
 
# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
 
# ============================================================
# Matter SDK - Required for JNI native library to work
# The native libCHIPController.so needs to call back into Java classes
# ============================================================
 
# Keep all Matter SDK controller classes (JNI callbacks)
-keep class chip.** { *; }
-keep class chip.devicecontroller.** { *; }
-keep class chip.tlv.** { *; }
-keep class chip.clusterinfo.** { *; }
-keep class chip.onboardingpayload.** { *; }
 
# Keep Matter SDK interfaces and callbacks
-keep interface chip.devicecontroller.** { *; }
 
# Keep app's Matter module classes
-keep class com.espressif.novahome.matter.** { *; }
 
# Keep native method signatures
-keepclasseswithmembernames class * {
    native <methods>;
}
 
# Keep enum classes used by Matter SDK
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
 
# ============================================================
# Bouncycastle - Required for certificate handling
# ============================================================
-keep class org.bouncycastle.** { *; }
-dontwarn org.bouncycastle.**
 
# ============================================================
# Protobuf - Required for Matter TLV handling
# ============================================================
-keep class com.google.protobuf.** { *; }
-dontwarn com.google.protobuf.**

# AWS SDK (IoT MQTT)
-keep class com.amazonaws.** { *; }
-dontwarn com.amazonaws.**

# Eclipse Paho MQTT v3 (bundled with aws-android-sdk-iot). R8 obfuscation breaks LoggerFactory
# (MissingResourceException: "Error locating the logging class") and SPI-based network modules.
-keep class org.eclipse.paho.client.mqttv3.** { *; }
-keep interface org.eclipse.paho.client.mqttv3.** { *; }
-dontwarn org.eclipse.paho.client.mqttv3.**

# Platform TLS internals are referenced reflectively by AWS / OkHttp; they are not on the app
# classpath during R8 analysis and must not fail the release shrink step.
-dontwarn com.android.org.conscrypt.**
-dontwarn org.apache.harmony.xnet.provider.jsse.**

# ============================================================
# WebRTC - Required for react-native-webrtc
# Prevents WebRtcClassLoader and other WebRTC classes from being obfuscated
# ============================================================

-keep class org.webrtc.** { *; }
-keep interface org.webrtc.** { *; }

-keep class org.webrtc.WebRtcClassLoader { *; }
-keep class org.webrtc.WebRtcClassLoader$* { *; }

-keepclasseswithmembernames class org.webrtc.** {
    native <methods>;
}

-keepclassmembers class * {
    @org.webrtc.CalledByNative <methods>;
}

-keepattributes InnerClasses
-keepattributes EnclosingMethod

-dontwarn org.webrtc.**

# Add any project specific keep options here:

export default {
  expo: {
    name: process.env.APP_NAME || "ESP RainMaker Home",
    slug: process.env.APP_SLUG || "esp-rainmaker-home",
    version: process.env.APP_VERSION || "3.5.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.IOS_APP_APPLICATION_ID || "com.espressif.novahome"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/logo.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/logo.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-system-ui",
        {
          "userInterfaceStyle": "automatic"
        }
      ],
      "expo-font"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "b020040e-1c36-426a-9528-042d4730d69e"
      },
      // Environment variables
      baseUrl: process.env.BASE_URL,
      authUrl: process.env.THIRD_PARTY_AUTH_AUTH_URL,
      redirectUrl: process.env.THIRD_PARTY_AUTH_REDIRECT_URL,
      version: process.env.API_VERSION,
      clientId: process.env.THIRD_PARTY_AUTH_CLIENT_ID,
      loginOptions: process.env.THIRD_PARTY_AUTH_ENABLED_THIRD_PARTY_PROVIDERS,
      enableCdfAutoSync: process.env.ENABLE_CDF_AUTOSYNC === 'true',
      oauthEnabled: process.env.ENABLE_THIRD_PARTY_AUTH === 'true',
      enabledThirdPartyProviders: process.env.ENABLE_THIRD_PARTY_AUTH === 'true'
        ? (process.env.THIRD_PARTY_AUTH_ENABLED_THIRD_PARTY_PROVIDERS?.split(',') || [])
        : [],
      matterVendorId: process.env.MATTER_VENDOR_ID,
    }
  },
  // Additional features configuration
  features: {
    enabledOauth: process.env.ENABLE_THIRD_PARTY_AUTH === 'true'
      ? (process.env.THIRD_PARTY_AUTH_ENABLED_THIRD_PARTY_PROVIDERS?.split(',') || [])
      : []
  }
};
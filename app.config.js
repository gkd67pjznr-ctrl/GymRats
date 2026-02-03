module.exports = {
  expo: {
    name: 'forgerank',
    slug: 'forgerank',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'forgerank',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        UIViewControllerBasedStatusBarAppearance: true,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-iap',
      [
        '@sentry/react-native',
        {
          organization: process.env.SENTRY_ORG || 'forgerank',
          project: process.env.SENTRY_PROJECT || 'forgerank-mobile',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      'expo-font',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
      revenueCatAppleKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '',
      revenueCatGoogleKey: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '',
    },
  },
};

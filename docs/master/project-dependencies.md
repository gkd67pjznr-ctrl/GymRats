# Project Dependencies

This document lists all dependencies required for the GymRats project. Use this as a reference when setting up new worktrees.

---

## Quick Setup for New Worktrees

```bash
# Navigate to the new worktree
cd /path/to/new-worktree

# Install all dependencies
npm install

# If any dependencies are missing, install them:
npm install react-native-view-shot expo-linear-gradient
```

---

## Production Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0.33 | Core Expo framework |
| `react` | 19.1.0 | React library |
| `react-dom` | 19.1.0 | React DOM (for web) |
| `react-native` | 0.81.5 | React Native framework |
| `react-native-web` | ~0.21.0 | Web support for React Native |

### Navigation

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-router` | ~6.0.23 | File-based routing |
| `@react-navigation/native` | ^7.1.8 | Navigation core |
| `@react-navigation/native-stack` | ^7.3.16 | Stack navigator |
| `@react-navigation/bottom-tabs` | ^7.4.0 | Tab navigator |
| `@react-navigation/elements` | ^2.6.3 | Navigation UI elements |
| `expo-linking` | ~8.0.11 | Deep linking support |

### State Management & Storage

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.10 | State management |
| `@react-native-async-storage/async-storage` | ^2.2.0 | Local storage persistence |

### Backend & Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.91.1 | Supabase client for database & auth |
| `expo-apple-authentication` | ~8.0.1 | Apple Sign-In |
| `expo-auth-session` | ~7.0.10 | OAuth flows |
| `expo-web-browser` | ~15.0.10 | In-app browser for OAuth |

### UI Components & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `@expo/vector-icons` | ^15.0.3 | Icon library (Ionicons, etc.) |
| `react-native-svg` | 15.12.1 | SVG support (BodyModel, charts) |
| `react-native-safe-area-context` | ~5.6.0 | Safe area handling |
| `react-native-screens` | ~4.16.0 | Native screen containers |
| `react-native-gesture-handler` | ~2.28.0 | Gesture handling |
| `react-native-reanimated` | ~4.1.1 | Animations |
| `react-native-confetti-cannon` | ^1.5.2 | Celebration confetti |
| `expo-linear-gradient` | ~15.0.8 | Gradient backgrounds |
| `expo-status-bar` | ~3.0.9 | Status bar control |
| `expo-splash-screen` | ~31.0.13 | Splash screen |
| `expo-symbols` | ~1.0.8 | SF Symbols (iOS) |
| `expo-system-ui` | ~6.0.9 | System UI theming |

### Charts & Data Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| `victory-native` | ^37.3.6 | Charts (sparklines, graphs) |

### Media & Sharing

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-image` | ~3.0.11 | Optimized image component |
| `expo-image-picker` | ^17.0.10 | Image selection |
| `expo-document-picker` | ^14.0.8 | Document selection |
| `expo-av` | ^16.0.8 | Audio/video playback |
| `expo-speech` | ~14.0.8 | Text-to-speech (AI Buddy voice) |
| `react-native-view-shot` | ^4.0.3 | Screenshot capture for sharing |

### Notifications & Haptics

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-notifications` | ~0.32.16 | Push & local notifications |
| `expo-haptics` | ~15.0.8 | Haptic feedback |

### In-App Purchases

| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-purchases` | ^9.7.5 | RevenueCat SDK |
| `react-native-iap` | ^14.7.7 | Native IAP (fallback) |
| `expo-iap` | ^3.4.8 | Expo IAP wrapper |
| `apple-iap` | ^0.0.0 | Apple IAP validation |
| `google-play-billing-validator` | ^2.1.3 | Google Play validation |

### Networking & Monitoring

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-native-community/netinfo` | ^11.4.1 | Network status detection |
| `@sentry/react-native` | ^7.11.0 | Error tracking & monitoring |
| `@google-cloud/pubsub` | ^5.2.2 | Google Cloud Pub/Sub |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-constants` | ~18.0.13 | App constants & environment |
| `expo-font` | ~14.0.11 | Custom fonts |
| `expo-random` | ~14.0.1 | Cryptographic random |
| `react-error-boundary` | ^6.1.0 | Error boundaries |
| `react-native-worklets` | 0.5.1 | Reanimated worklets |
| `punycode` | ^2.3.1 | Punycode encoding |
| `start` | ^5.1.0 | Process runner |

---

## Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ~5.9.2 | TypeScript compiler |
| `@types/react` | ~19.1.0 | React type definitions |
| `@types/jest` | ^29.5.14 | Jest type definitions |
| `eslint` | ^9.25.0 | Linting |
| `eslint-config-expo` | ~10.0.0 | Expo ESLint config |
| `jest` | ~29.7.0 | Testing framework |
| `jest-expo` | ~54.0.17 | Expo Jest preset |
| `@testing-library/react-native` | ^13.3.3 | Component testing |
| `@testing-library/jest-native` | ^5.4.3 | Jest matchers for RN |
| `react-test-renderer` | ^19.1.0 | React renderer for tests |
| `@expo/ngrok` | ^4.1.3 | Tunnel for development |

---

## Expo Plugins (app.config.js)

These are configured in `app.config.js` and loaded by Expo:

```javascript
plugins: [
  'expo-router',
  'expo-iap',
  ['@sentry/react-native', {
    organization: 'gymrats',
    project: 'gymrats-mobile',
  }],
  ['expo-splash-screen', {
    image: './assets/images/splash-icon.png',
    imageWidth: 200,
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  }],
  'expo-font',
]
```

---

## Environment Variables Required

Create a `.env` file with these variables:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# Sentry Error Tracking
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=gymrats
SENTRY_PROJECT=gymrats-mobile

# RevenueCat (In-App Purchases)
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_xxx
EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=goog_xxx
```

---

## Code Import Usage Reference

The following packages are actively imported in the codebase:

### From `src/` and `app/` directories:

**Expo packages:**
- `expo-apple-authentication`
- `expo-av`
- `expo-constants`
- `expo-haptics`
- `expo-image`
- `expo-image-picker`
- `expo-linking`
- `expo-notifications`
- `expo-router`
- `expo-status-bar`
- `expo-web-browser`

**React Native packages:**
- `react-native` (core)
- `react-native-confetti-cannon`
- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-safe-area-context`
- `react-native-svg`
- `react-native-view-shot`

**Third-party packages:**
- `@expo/vector-icons`
- `@react-native-async-storage/async-storage`
- `@react-native-community/netinfo`
- `@react-navigation/native`
- `@sentry/react-native`
- `@supabase/supabase-js`
- `victory-native`
- `zustand`
- `zustand/middleware`

---

## Sync Dependencies Across Worktrees

To ensure all worktrees have the same dependencies:

```bash
# From any worktree, get the package.json
cat package.json | grep -E '"[^"]+": "[^"]+"' | sort

# Or copy package.json from main to worktree
cp /path/to/GymRats/package.json /path/to/GymRats-wt2/
npm install
```

---

## Troubleshooting

### Missing native modules
If you get errors about missing native modules after installing:
```bash
npx expo prebuild --clean
```

### Expo SDK version mismatch
Ensure all Expo packages use compatible versions:
```bash
npx expo install --fix
```

### Node modules corruption
Clean reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

*Last updated: February 3, 2026*

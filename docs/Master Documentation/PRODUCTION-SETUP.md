# Production Setup Guide

This document covers the required external service configuration for production builds.

## Required Environment Variables

Create a `.env` file (or set in your CI/CD):

```bash
# Supabase (REQUIRED for production)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Sentry (crash reporting)
EXPO_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=forgerank-mobile

# RevenueCat (in-app purchases)
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_xxx
EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=goog_xxx
```

---

## 1. Sentry Setup

Sentry provides crash reporting and error monitoring for production builds.

### Steps:

1. **Create Sentry account** at https://sentry.io
2. **Create a new project** (React Native)
3. **Get your DSN** from Project Settings → Client Keys
4. **Set environment variables**:
   - `EXPO_PUBLIC_SENTRY_DSN` - Your DSN
   - `SENTRY_ORG` - Your Sentry organization slug
   - `SENTRY_PROJECT` - Your project name

### Features Enabled:
- Native crash handling (iOS/Android)
- JavaScript error tracking
- Performance monitoring (20% sample rate)
- Breadcrumb trail for debugging
- User context (set on auth)

### Code Location:
- `src/lib/monitoring/sentry.ts` - Sentry wrapper
- `app/_layout.tsx` - Initialization

---

## 2. RevenueCat Setup

RevenueCat handles in-app purchases for premium/legendary AI buddies.

### Steps:

1. **Create RevenueCat account** at https://www.revenuecat.com
2. **Create a new project**
3. **Connect your App Store / Play Store accounts**
4. **Create Products**:
   - Premium buddies (consumable or non-consumable)
   - Legendary buddies (non-consumable)
5. **Create Entitlements**:
   - `premium_buddies` - Access to premium tier
   - `legendary_buddies` - Access to legendary tier
   - `all_buddies` - Access to everything (bundle)
6. **Create Offerings** with packages for each product
7. **Get API Keys** from Project Settings:
   - Apple API Key → `EXPO_PUBLIC_REVENUECAT_APPLE_KEY`
   - Google API Key → `EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY`

### Features:
- Cross-platform purchase handling
- Automatic receipt validation
- Subscription management (future)
- Purchase restore
- Analytics

### Code Location:
- `src/lib/iap/RevenueCatService.ts` - RevenueCat wrapper
- `src/lib/iap/IAPService.ts` - Legacy expo-iap (deprecated)

### Migration Note:
The app currently has both `expo-iap` and RevenueCat. RevenueCat is the recommended path forward. To switch:

1. Update `buddyStore.ts` to use `RevenueCatService` instead of `IAPService`
2. Update `_layout.tsx` to initialize RevenueCat
3. Remove `expo-iap` from plugins in `app.config.js`

---

## 3. Supabase Hardening

Supabase is configured with production guards.

### Production Behavior:
- **Throws fatal error** if credentials not set (fails fast)
- Validates URL format and key length
- Adds `x-client-info` header for debugging
- Connection state tracking
- Automatic retry for transient failures

### Development Behavior:
- Falls back to placeholder (non-functional)
- Warns in console
- Backend features disabled but app runs

### Code Location:
- `src/lib/supabase/client.ts`

### New Utilities:
```typescript
// Check if backend is available
import { isBackendAvailable } from '@/src/lib/supabase/client';

if (isBackendAvailable()) {
  // Safe to make backend calls
}

// Retry wrapper for important operations
import { withRetry } from '@/src/lib/supabase/client';

const data = await withRetry(() =>
  supabase.from('users').select('*')
);
```

---

## 4. Pre-Launch Checklist

Before submitting to app stores:

- [ ] All environment variables set in production config
- [ ] Sentry DSN configured and tested
- [ ] RevenueCat products created and tested (Sandbox)
- [ ] Supabase RLS policies reviewed
- [ ] OAuth providers configured (Google, Apple)
- [ ] Deep linking schemes registered
- [ ] Push notification certificates uploaded

---

## Testing Production Config

Run this in dev to verify config is loaded:

```typescript
import Constants from 'expo-constants';

console.log('Supabase URL:', Constants.expoConfig?.extra?.supabaseUrl ? 'SET' : 'MISSING');
console.log('Sentry DSN:', Constants.expoConfig?.extra?.sentryDsn ? 'SET' : 'MISSING');
console.log('RevenueCat Apple:', Constants.expoConfig?.extra?.revenueCatAppleKey ? 'SET' : 'MISSING');
console.log('RevenueCat Google:', Constants.expoConfig?.extra?.revenueCatGoogleKey ? 'SET' : 'MISSING');
```

# OAuth Setup Guide

This guide covers the setup and configuration of Google OAuth and Apple Sign In for the Forgerank application.

## Overview

Forgerank supports OAuth authentication with:
- **Google OAuth**: Available on iOS, Android, and web
- **Apple Sign In**: Available on iOS 13+, macOS 10.15+, and web

The OAuth integration uses:
- `expo-auth-session` for Google OAuth
- `expo-apple-authentication` for Apple Sign In
- Supabase `signInWithIdToken` for token verification

## Architecture

### Module Locations

| Module | Location | Purpose |
|--------|----------|---------|
| OAuth utilities | `src/lib/auth/oauth.ts` | Helper functions, error handling, token parsing |
| Google OAuth | `src/lib/auth/google.ts` | Google OAuth implementation |
| Apple Sign In | `src/lib/auth/apple.ts` | Apple Sign In implementation |
| OAuth Button | `src/ui/components/OAuthButton.tsx` | Reusable OAuth button component |
| Signup screen | `app/auth/signup.tsx` | Signup with OAuth integration |
| Login screen | `app/auth/login.tsx` | Login with OAuth integration |

### Authentication Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User      │────▶│   OAuth      │────▶│  Supabase   │
│  (Button)   │     │   Provider   │     │   (Verify)  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Forgerank  │
                    │     App      │
                    └──────────────┘
```

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

### Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in required information:
   - App name: `Forgerank`
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (for development)

### Step 3: Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Configure authorized redirect URIs:

```
# Development (Expo Go with default scheme)
exp://127.0.0.1:19000/auth

# Development (custom scheme)
forgerank://auth

# Production (replace with your app scheme)
yourapp://auth
```

5. Copy the **Client ID**

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your credentials:
   ```bash
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

3. Restart your development server:
   ```bash
   npm start
   ```

### Step 5: Enable Google Provider in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. Paste your Google Client ID and Client Secret
5. Add the redirect URL to your site URL:
   - `forgerank://auth` (or your custom scheme)

### Step 6: Verify App Configuration

The app configuration in `app.config.js` already includes:
- `scheme: 'forgerank'` - Used for deep linking
- `googleClientId` in `extra` - Loaded from environment variable

Verify these settings match your Google Cloud Console configuration.

## Apple Sign In Setup

### Step 1: Configure App ID in Apple Developer

1. Visit [Apple Developer](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a new **App ID** or edit your existing one
4. Enable **Sign In with Apple** capability

### Step 2: Create Services ID

1. In Apple Developer portal, create a new **Services ID**
2. Bundle ID: Match your app's bundle identifier
3. Configure return URLs:

```
com.yourcompany.forgerank://auth
```

### Step 3: Enable Apple Provider in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Apple** provider
4. Add your Apple Services ID and Team ID

### Step 4: Configure Expo (iOS)

For iOS development, ensure your `app.json` has the correct bundle identifier:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.forgerank"
    }
  }
}
```

### Step 5: Configure Expo (Android)

Apple Sign In is not supported on Android. The `OAuthButton` component automatically hides the Apple button on Android.

## Usage Examples

### Using the OAuth Button

```tsx
import { OAuthButton } from '@/src/ui/components/OAuthButton';
import { useGoogleAuth } from '@/src/lib/auth/google';
import { useAppleAuth } from '@/src/lib/auth/apple';

function MyAuthScreen() {
  const { signInWithGoogle } = useGoogleAuth({
    onSuccess: (profile) => {
      console.log('Google sign in success:', profile);
      // Navigate to main app
    },
    onError: (error) => {
      console.error('Google sign in error:', error);
    },
  });

  const { signInWithApple } = useAppleAuth({
    onSuccess: (profile) => {
      console.log('Apple sign in success:', profile);
    },
    onError: (error) => {
      console.error('Apple sign in error:', error);
    },
  });

  return (
    <>
      <OAuthButton
        provider="google"
        onPress={signInWithGoogle}
        isLoading={isGoogleLoading}
      />
      <OAuthButton
        provider="apple"
        onPress={signInWithApple}
        isLoading={isAppleLoading}
      />
    </>
  );
}
```

### Direct OAuth Functions

For custom implementations, you can use the OAuth utility functions:

```typescript
import {
  signInWithOAuthToken,
  extractGoogleProfile,
  extractAppleProfile,
} from '@/src/lib/auth/oauth';

// After getting an ID token from the provider
const result = await signInWithOAuthToken('google', idToken);

if (result.data.user) {
  console.log('Authenticated:', result.data.user);
}
```

## Testing

### Run OAuth Tests

```bash
npm test -- oauth
```

### Test Coverage

```bash
npm run test:coverage
```

OAuth test files:
- `src/lib/auth/__tests__/oauth.test.ts`
- `src/lib/auth/__tests__/google.test.ts`
- `src/lib/auth/__tests__/apple.test.ts`
- `src/ui/components/__tests__/OAuthButton.test.tsx`

## Platform-Specific Notes

### iOS

- Apple Sign In uses the native `AppleAuthenticationButton`
- Google OAuth uses `expo-auth-session` with in-app browser
- Requires iOS 13+ for Apple Sign In

### Android

- Google OAuth works with Chrome Custom Tabs
- Apple Sign In is **not available** and automatically hidden

### Web

- Both providers use popup-based OAuth flow
- Requires proper redirect URI configuration

## Error Handling

OAuth errors are standardized with the `OAuthError` type:

```typescript
interface OAuthError {
  type: 'cancelled' | 'network' | 'invalid_token' | 'provider_error' | 'supabase_error' | 'unknown';
  message: string;
  originalError?: unknown;
}
```

Common error scenarios:

| Error Type | Description | User Message |
|------------|-------------|--------------|
| `cancelled` | User cancelled sign-in | "Sign in was cancelled." |
| `network` | Network connectivity issue | "Network error. Please check your connection." |
| `invalid_token` | Token verification failed | "Invalid authentication token." |
| `provider_error` | OAuth provider error | Provider-specific error message |
| `supabase_error` | Supabase authentication error | "Authentication error." |

## Security Considerations

### Token Verification

- All ID tokens are verified by Supabase before authentication
- Tokens are never stored locally; only session is maintained
- Supabase handles token refresh automatically

### Redirect URIs

- Always use HTTPS redirect URIs in production
- Development can use `exp://` for Expo Go
- Ensure redirect URIs match exactly in provider console

### Client IDs

- Store client IDs in environment variables
- Never commit actual client IDs to version control
- Use separate client IDs for development and production

## Troubleshooting

### Common Issues

**Issue**: "Google OAuth is not configured"
- **Solution**: Add `googleClientId` to `app.json` extra section

**Issue**: Apple button not showing
- **Solution**: Verify platform is iOS or macOS; Android doesn't support Apple Sign In

**Issue**: Redirect URI mismatch
- **Solution**: Ensure redirect URIs match exactly in Google Cloud Console and app.json

**Issue**: "No identity token received"
- **Solution**: Check provider configuration and verify scopes are correct

**Issue**: Supabase authentication fails
- **Solution**: Verify provider is enabled in Supabase dashboard

### Debug Mode

Enable debug logging for OAuth:

```typescript
// Add to your auth modules
console.log('OAuth request:', { provider, clientId, redirectUri });
```

## Additional Resources

- [Expo Auth Session Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Supabase OAuth Guide](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In JS SDK](https://developer.apple.com/sign-in-with-apple/get-started/)

## Next Steps

1. Create OAuth credentials for each provider
2. Configure environment variables
3. Enable providers in Supabase
4. Test OAuth flow on each platform
5. Implement custom user profile handling if needed
6. Add additional scopes if required (e.g., calendar, fitness)

---

Last Updated: 2026-01-25
Forgerank Version: 1.0.0

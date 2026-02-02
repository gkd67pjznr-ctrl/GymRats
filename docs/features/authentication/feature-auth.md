# Feature: Authentication

## Overview
User accounts, login, signup, and session management. Enables cloud sync, social features, and personalization.

---

## Sub-Features

### Done - Auth Screens UI
- [x] Login screen layout with email/password
- [x] Signup screen layout with email/password/name
- [x] Form inputs with validation
- [x] Loading states
- [x] Error display with toast feedback
- [x] Keyboard-aware scroll views
- [x] Show/hide password toggle

**Implementation:** `app/auth/login.tsx`, `app/auth/signup.tsx`

### Done - Auth State Management
- [x] Zustand store for auth
- [x] User state tracking
- [x] Session management
- [x] Hydration from storage
- [x] Auth state listener setup
- [x] Safe state updates (setState vs direct mutation)

**Implementation:** `src/lib/stores/authStore.ts`

### Done - Supabase Auth Integration
- [x] Supabase client configured
- [x] Auth methods (signUp, signIn, signOut)
- [x] User profile fetching from public.users table
- [x] Auth state synchronization
- [x] Error handling with user-friendly messages

**Implementation:** `src/lib/supabase/client.ts`, `src/lib/stores/authStore.ts`

### Done - Google OAuth
- [x] OAuth flow implemented
- [x] Google config structure
- [x] Deep link handler for OAuth callback
- [x] Token exchange with Supabase
- [x] Auth state integration
- [x] OAuth button component

**Implementation:** `src/lib/auth/google.ts`, `src/lib/auth/oauth.ts`, `app/_layout.tsx`, `src/ui/components/OAuthButton.tsx`

**Setup Required:**
- [x] Code implementation complete
- [ ] Create Google Cloud Project and OAuth credentials
- [ ] Add redirect URIs to Google Cloud Console
- [ ] Enable Google provider in Supabase dashboard
- [ ] Set `EXPO_PUBLIC_GOOGLE_CLIENT_ID` in `.env` file

See `docs/OAUTH_SETUP.md` for complete setup instructions.

### Done - Dev Login
- [x] Quick dev login for testing (DEV mode only)
- [x] Creates or signs in dev user automatically
- [x] Credentials: dev@forgerank.app / dev123456
- [x] Red button on login screen (DEV only)

**Implementation:** `src/lib/stores/authStore.ts::devLogin()`

### Done - User Profile Editing
- [x] Profile edit screen (`app/profile/edit.tsx`)
- [x] Display name update with validation
- [x] Avatar upload via expo-image-picker
- [x] Avatar remove functionality
- [x] Form validation and error handling
- [x] Loading states for operations
- [x] Keyboard-aware form

**Implementation:** `app/profile/edit.tsx`, `src/lib/stores/authStore.ts::updateDisplayName()`

---

### Planned - Apple Sign In
- [ ] Apple authentication flow
- [ ] iOS-specific configuration
- [ ] Token exchange
- [ ] Error handling

**Status:** Code scaffolded in `src/lib/auth/apple.ts`

### Planned - Password Reset
- [ ] Forgot password screen
- [ ] Reset email flow
- [ ] Password update screen
- [ ] Reset link handling

**Status:** Functions exist in authStore, needs UI

### Planned - Email Verification
- [ ] Verification email send
- [ ] Verification status check
- [ ] Resend verification
- [ ] Verification UI flow

**Status:** Partial implementation in authStore

### Planned - Protected Routes
- [ ] Auth guard component for screens
- [ ] Redirect to login for unauthenticated
- [ ] Auth-required features gating

**Status:** ProtectedRoute component exists, needs implementation

### Planned - Logout
- [x] Sign out function implemented
- [ ] Clear local state completely
- [ ] Redirect to welcome/login

**Status:** Sign out works, needs UI refinement

### Planned - Account Deletion
- [x] Delete account function implemented
- [ ] Delete account confirmation screen
- [ ] Data cleanup verification
- [ ] GDPR compliance

**Status:** Function exists in authStore, needs UI

---

## Technical Notes

**Key Files:**
- `app/auth/login.tsx` - Login screen with OAuth
- `app/auth/signup.tsx` - Signup screen
- `app/profile/edit.tsx` - Profile editing
- `src/lib/stores/authStore.ts` - Auth state (Zustand)
- `src/lib/auth/google.ts` - Google OAuth
- `src/lib/auth/apple.ts` - Apple Sign In
- `src/lib/auth/oauth.ts` - Shared OAuth utilities
- `src/lib/supabase/client.ts` - Supabase client
- `src/ui/components/OAuthButton.tsx` - OAuth button UI

**Auth State:**
```typescript
interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  isEmailVerified: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Supabase Auth Methods:**
- `supabase.auth.signUp({ email, password, options: { data: { display_name } } })`
- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`
- `supabase.auth.signOut()`
- `supabase.auth.onAuthStateChange(callback)`
- `supabase.auth.updateUser({ password })`

**Google OAuth Flow:**
```typescript
// 1. Open Google auth in browser
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: 'forgerank://auth' }
});

// 2. Deep link callback in app/_layout.tsx
Linking.addEventListener('url', async ({ url }) => {
  if (url.includes('#access_token')) {
    await supabase.auth.getSession(); // Establishes session
  }
});

// 3. Auth state listener updates store
setupAuthListener((event, session) => {
  // Store automatically updates user state
});
```

---

## Database Schema

**users table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Test Coverage

- `authStore.test.ts` - 89 tests
- `apple.test.ts` - 36 tests
- `google.test.ts` - OAuth flow tests

---

## Dependencies

- Supabase project (configured)
- Expo Auth Session (for OAuth)
- expo-apple-authentication (for Apple Sign In)
- expo-image-picker (for avatar uploads)
- @react-native-community/netinfo (for network detection)

---

## Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## See Also

- `docs/OAUTH_SETUP.md` - OAuth setup instructions
- `docs/SUPABASE_SETUP.md` - Supabase configuration
- `app/_layout.tsx` - Deep link handling

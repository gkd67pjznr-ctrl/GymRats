# Feature: Authentication

## Overview
User accounts, login, signup, and session management. Enables cloud sync, social features, and personalization.

---

## Sub-Features

### Done - Auth Screens UI
- [x] Login screen layout
- [x] Signup screen layout
- [x] Form inputs (email, password, name)
- [x] Loading states
- [x] Error display

**Implementation:** `app/auth/login.tsx`, `app/auth/signup.tsx`

### Done - Auth State Management
- [x] Zustand store for auth
- [x] User state tracking
- [x] Session management
- [x] Hydration from storage

**Implementation:** `src/lib/stores/authStore.ts`

### Done - Supabase Auth Integration
- [x] Supabase client configured
- [x] Auth methods available (signUp, signIn)
- [x] Auth state listener setup

**Implementation:** `src/lib/supabase/client.ts`, `src/lib/stores/authStore.ts`

### In Progress - Google OAuth
- [x] OAuth flow scaffolded
- [x] Google config structure
- [ ] Working Google sign-in
- [ ] Token exchange with Supabase

**Implementation:** `src/lib/auth/google.ts`, `src/lib/auth/oauth.ts`

---

### Planned - Apple Sign In
- [ ] Apple authentication flow
- [ ] iOS-specific configuration
- [ ] Token exchange

### Planned - Password Reset
- [ ] Forgot password screen
- [ ] Reset email flow
- [ ] Password update

### Planned - Email Verification
- [ ] Verification email send
- [ ] Verification status check
- [ ] Resend verification

### Planned - Protected Routes
- [ ] Auth guard for screens
- [ ] Redirect to login
- [ ] Auth-required features gating

### Planned - Logout
- [ ] Sign out function
- [ ] Clear local state
- [ ] Redirect to welcome

### Planned - Account Deletion
- [ ] Delete account flow
- [ ] Data cleanup
- [ ] GDPR compliance

---

## Technical Notes

**Key Files:**
- `app/auth/login.tsx` - Login screen (10,551 bytes)
- `app/auth/signup.tsx` - Signup screen (12,543 bytes)
- `src/lib/stores/authStore.ts` - Auth state (Zustand)
- `src/lib/auth/google.ts` - Google OAuth
- `src/lib/auth/apple.ts` - Apple Sign In
- `src/lib/auth/oauth.ts` - Shared OAuth utilities
- `src/lib/supabase/client.ts` - Supabase client

**Auth State:**
```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}
```

**Supabase Auth Methods:**
- `supabase.auth.signUp({ email, password })`
- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.auth.signOut()`
- `supabase.auth.onAuthStateChange(callback)`

---

## Test Coverage

- `authStore.test.ts` - 53 tests
- `apple.test.ts` - 36 tests
- `google.test.ts` - Tests for Google OAuth

---

## Dependencies

- Supabase project (configured)
- Expo Auth Session (for OAuth)
- expo-apple-authentication (for Apple Sign In)

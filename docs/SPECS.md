# Forgerank Fitness App - SPEC Documents

This document contains 20 detailed SPEC sheets for implementing quality improvements, backend integration, workout features, social features, and gamification for the Forgerank fitness app.

**Last Updated:** 2026-01-26 (Added SPEC-011 through SPEC-020)

## Project Context

**Tech Stack:** React Native 0.81.5, Expo 54, TypeScript 5.9, expo-router 6.0
**Current State:** Phase 0 (Stabilization), many bugs exist, no backend yet
**Architecture:** Module-level stores with AsyncStorage (migrating to Zustand)
**Goal:** Quality-focused development with hybrid approach (stabilization + backend features)

---

# SPEC-001: Error Boundary Enhancement

**Priority:** P0 (Critical)
**Status:** Pending

## Overview

Enhance the existing error boundary implementation in `app/_layout.tsx` to provide better error recovery, error logging integration, and per-screen error boundaries for graceful degradation. The current implementation exists but lacks comprehensive coverage and recovery mechanisms.

## Requirements (EARS Format)

### Error Boundary Implementation

- **WHEN** a runtime error occurs in any React component
- **THE SYSTEM SHALL** catch the error and display a user-friendly error screen
- **SO THAT** users understand what happened and can recover without restarting the app

### Per-Screen Error Boundaries

- **WHEN** an error occurs in a specific tab or screen (Workout, Feed, Profile, etc.)
- **THE SYSTEM SHALL** isolate the error to that screen only
- **SO THAT** other parts of the app remain functional

### Error Logging

- **WHEN** an error is caught by the error boundary
- **THE SYSTEM SHALL** log the error with stack trace and component information
- **SO THAT** developers can diagnose and fix issues in production

### Recovery Mechanism

- **WHEN** the user taps "Try Again" on the error screen
- **THE SYSTEM SHALL** reset the error state and re-render the component
- **SO THAT** transient errors can be recovered without app restart

## Acceptance Criteria

1. Error boundary wraps the entire app in `app/_layout.tsx`
2. Each tab screen (Workout, Feed, Profile, Explore) has its own error boundary
3. Error screen displays: error title, error message (dev mode), and "Try Again" button
4. Errors are logged to console with `[ErrorBoundary]` prefix
5. "Try Again" successfully recovers from state-based errors
6. Error boundary styles match app design system (dark theme, proper spacing)
7. TODO comment added for future Sentry/error tracking service integration

## Technical Notes

**Files to modify:**
- `/home/thomas/Forgerank/app/_layout.tsx` - Enhance existing error boundary
- `/home/thomas/Forgerank/app/(tabs)/_layout.tsx` - Add per-tab error boundaries

**Design System Reference:**
- Background: `#0a0a0a`
- Card background: `#1a1a1a`
- Border: `#333333`
- Text: `#ffffff`
- Muted: `#888888`

**React Error Boundary package:** Already installed (`react-error-boundary`: ^6.1.0)

## Dependencies

None (can be implemented immediately)

## Estimated Complexity

Simple

---

# SPEC-002: Session Persistence Fix

**Priority:** P0 (Critical)
**Status:** Pending

## Overview

Fix race conditions in session persistence when the app is closed or backgrounded during an active workout. The old module-level store (`src/lib/_old/currentSessionStore.ts`) has a persist queue but the Zustand version (`src/lib/stores/currentSessionStore.ts`) may need verification that AsyncStorage properly saves data before app termination.

## Requirements (EARS Format)

### Session Persistence on App Close

- **WHEN** the user closes or backgrounds the app during an active workout
- **THE SYSTEM SHALL** ensure all current session data is persisted to AsyncStorage
- **SO THAT** the session can be restored when the app reopens

### Session Hydration on App Start

- **WHEN** the app launches and a persisted session exists
- **THE SYSTEM SHALL** hydrate the Zustand store from AsyncStorage before rendering
- **SO THAT** users see their active workout immediately without data loss

### Race Condition Prevention

- **WHEN** multiple state updates occur in quick succession (e.g., rapid set logging)
- **THE SYSTEM SHALL** queue AsyncStorage writes sequentially
- **SO THAT** no data is lost due to write overlapping

### Session Recovery After Crash

- **WHEN** the app crashes and restarts with an active session
- **THE SYSTEM SHALL** restore the session with all logged sets intact
- **SO THAT** users can continue their workout without re-entering data

## Acceptance Criteria

1. Zustand currentSessionStore properly persists to AsyncStorage on every state change
2. Hydration flag (`hydrated`) is set to `true` only after AsyncStorage load completes
3. `onRehydrateStorage` callback properly sets `hydrated` state
4. Test: Background app during active workout, force-close, reopen - session restored
5. Test: Log 5 sets rapidly, background app immediately - all sets persisted
6. Test: Crash during workout (dev mode), restart - session restored
7. No console errors related to AsyncStorage during persistence

## Technical Notes

**Files to verify/modify:**
- `/home/thomas/Forgerank/src/lib/stores/currentSessionStore.ts` - Zustand store (new)
- `/home/thomas/Forgerank/src/lib/_old/currentSessionStore.ts` - Old module-level store (for reference)

**Current implementation notes:**
- Zustand store uses `persist` middleware with AsyncStorage
- Storage key: `currentSession.v2`
- Old store key: `currentSession.v1` (for migration if needed)

**Known issue:**
Zustand persist middleware may not guarantee AsyncStorage write completion before app termination. May need to add explicit write verification.

## Dependencies

None (quality task, can be done independently)

## Estimated Complexity

Medium

---

# SPEC-003: Input Validation with Toast Feedback

**Priority:** P1 (Important)
**Status:** Pending

## Overview

Integrate the existing validation functions in `src/lib/validators/workout.ts` with a toast notification system to provide immediate user feedback when invalid input is entered. Currently validators exist but are not connected to UI feedback.

## Requirements (EARS Format)

### Validation on Input

- **WHEN** a user enters weight, reps, or duration values
- **THE SYSTEM SHALL** validate the input against defined ranges
- **SO THAT** invalid data cannot corrupt the workout session

### Toast Error Messages

- **WHEN** validation fails
- **THE SYSTEM SHALL** display a toast notification with the specific error message
- **SO THAT** users understand why their input was rejected

### Success Feedback

- **WHEN** a set is successfully logged
- **THE SYSTEM SHALL** display a brief success toast or haptic feedback
- **SO THAT** users confirm the action completed

### Validation Ranges

- **WHEN** validating weight input
- **THE SYSTEM SHALL** accept values from 0-2000 lbs
- **SO THAT** reasonable weight values are allowed

- **WHEN** validating reps input
- **THE SYSTEM SHALL** accept values from 1-100
- **SO THAT** reasonable rep counts are allowed

## Acceptance Criteria

1. Toast notification component created with app design system styling
2. Input fields in workout screens call validation functions before submission
3. Invalid inputs show toast with specific error message
4. Valid inputs proceed without error toast
5. Toast auto-dismisses after 3 seconds
6. Success feedback (toast or haptic) on set logging
7. Haptic feedback uses Expo Haptics (already installed: `expo-haptics`: ~15.0.8)

## Technical Notes

**Files to modify:**
- `/home/thomas/Forgerank/src/lib/validators/workout.ts` - Existing validators
- `/home/thomas/Forgerank/src/ui/components/LiveWorkout/QuickAddSetCard.tsx` - Add validation integration
- `/home/thomas/Forgerank/src/ui/components/LiveWorkout/WorkoutLiveCard.tsx` - Add validation integration
- Create: `/home/thomas/Forgerank/src/ui/components/Toast.tsx` - New toast component

**Validation functions available:**
- `validateWeight(input: string): ValidationResult`
- `validateReps(input: string): ValidationResult`
- `validateBodyweight(input: string): ValidationResult`
- `validateDuration(input: string): ValidationResult`

**Toast options:**
1. Custom component (recommended for full control)
2. `react-native-toast-message` package
3. `expo-speech` for audio feedback

**Design system:**
- Toast background: `#1a1a1a`
- Error text: `#FF6B6B`
- Success text: `#4ECDC4`
- Border radius: 12px

## Dependencies

SPEC-001 (Error Boundary) - Recommended to handle any errors in toast rendering

## Estimated Complexity

Medium

---

# SPEC-004: Supabase Project Setup

**Priority:** P1 (Important)
**Status:** Completed (2026-01-24)

**Completion Evidence:**
- Acceptance Criteria: 8/8 Met
- Files Created: 4 (client, tests, docs, .env)
- Files Modified: 3 (package.json, app.json, README.md)
- Quality Status: EXCELLENT (TRUST 5 PASS)
- Test Coverage: 217 lines of characterization tests

## Overview

Create a Supabase project, install the Supabase client, configure environment variables, and establish the initial connection. This is the foundation for all backend features including authentication, database storage, and real-time features.

## Requirements (EARS Format)

### Project Creation

- **WHEN** setting up the backend
- **THE SYSTEM SHALL** have a Supabase project created with appropriate region
- **SO THAT** data is stored with low latency for target users

### Client Installation

- **WHEN** installing dependencies
- **THE SYSTEM SHALL** install `@supabase/supabase-js` package
- **SO THAT** the app can communicate with Supabase

### Environment Configuration

- **WHEN** configuring the app
- **THE SYSTEM SHALL** store Supabase URL and anon key in environment variables
- **SO THAT** credentials are not hardcoded in the source code

### Client Initialization

- **WHEN** the app starts
- **THE SYSTEM SHALL** initialize the Supabase client with environment credentials
- **SO THAT** all Supabase operations can use a shared client instance

### Type Safety

- **WHEN** interacting with Supabase
- **THE SYSTEM SHALL** generate TypeScript types from the database schema
- **SO THAT** database queries are type-safe

## Acceptance Criteria

1. Supabase project created (note: requires manual setup, document steps)
2. `@supabase/supabase-js` installed and in package.json
3. `.env` file created with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. `app.config.js` or `app.config.ts` configured to expose env variables to Expo
5. Supabase client initialized in new file: `src/lib/supabase/client.ts`
6. Health check function created to verify Supabase connection
7. TypeScript types will be generated after schema creation (SPEC-005)
8. Documentation added to `README.md` or `docs/SUPABASE_SETUP.md`

## Technical Notes

**Installation commands:**
```bash
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
# or
expo install @supabase/supabase-js
```

**Files to create:**
- `/home/thomas/Forgerank/src/lib/supabase/client.ts` - Supabase client initialization
- `/home/thomas/Forgerank/.env` - Environment variables (gitignored)

**Files to modify:**
- `/home/thomas/Forgerank/app.config.js` or `/home/thomas/Forgerank/app.config.ts` - Add `extra` section for env vars
- `/home/thomas/Forgerank/.gitignore` - Ensure `.env` is ignored

**Environment variable naming (Expo):**
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Client initialization pattern:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Dependencies

None (foundational task for all backend work)

## Estimated Complexity

Simple

---

# SPEC-005: Database Schema Design

**Priority:** P1 (Important)
**Status:** Completed (2026-01-26)

**Completion Evidence:**
- Acceptance Criteria: 8/8 Met
- Files Created: 5 (2 migrations, types, tests, docs)
- Files Modified: 1 (types.ts - Babel compatibility fix)
- Quality Status: EXCELLENT (100% coverage, exceeds 85% target)
- Test Coverage: 101 tests, 1,910 lines

## Overview

Design and implement the complete Supabase database schema including tables for users, workouts, routines, friendships, posts, reactions, comments, and notifications. This schema will support all current app features and enable future backend sync.

## Requirements (EARS Format)

### Users Table

- **WHEN** storing user data
- **THE SYSTEM SHALL** have a `users` table with id, email, display_name, avatar_url, created_at
- **SO THAT** user profiles and authentication can be managed

### Workouts Table

- **WHEN** storing workout sessions
- **THE SYSTEM SHALL** have a `workouts` table with user relation, timestamps, sets JSON, completion data
- **SO THAT** workout history can be synced across devices

### Routines Table

- **WHEN** storing user routines
- **THE SYSTEM SHALL** have a `routines` table with user relation, name, exercises JSON
- **SO THAT** saved routines can be backed up and synced

### Friendships Table

- **WHEN** storing friend relationships
- **THE SYSTEM SHALL** have a `friendships` table with user relations, status, timestamps
- **SO THAT** social features can be implemented

### Posts Table

- **WHEN** storing workout posts
- **THE SYSTEM SHALL** have a `posts` table with author relation, privacy, workout snapshot
- **SO THAT** the social feed can be populated

### Reactions and Comments Tables

- **WHEN** storing social interactions
- **THE SYSTEM SHALL** have `reactions` and `comments` tables with post/user relations
- **SO THAT** users can engage with posts

### Indexes and Constraints

- **WHEN** defining the schema
- **THE SYSTEM SHALL** add appropriate indexes for common query patterns
- **SO THAT** queries remain performant as data grows

## Acceptance Criteria

1. SQL migration file created with all table definitions
2. Each table has: primary key, created_at/updated_at timestamps, appropriate foreign keys
3. Foreign key constraints properly defined with `ON DELETE` behavior
4. Indexes added on frequently queried columns (user_id, created_at, status)
5. JSON columns use Supabase's jsonb type for efficient querying
6. Schema matches existing TypeScript models in `src/lib/*Model.ts`
7. Migration can be run successfully in Supabase SQL editor
8. TypeScript types generated using Supabase CLI

## Technical Notes

**Supabase CLI for schema management:**
```bash
npx supabase init
npx supabase db new initial_schema
npx supabase db push
```

**Tables to create:**

1. **users** (extends Supabase auth.users)
   - id (uuid, references auth.users)
   - email (text, unique)
   - display_name (text)
   - avatar_url (text)
   - created_at (timestamptz)
   - updated_at (timestamptz)

2. **workouts**
   - id (uuid, primary key)
   - user_id (uuid, references users)
   - started_at (timestamptz)
   - ended_at (timestamptz)
   - sets (jsonb) - array of WorkoutSet
   - routine_id (uuid, references routines)
   - routine_name (text)
   - plan_id (text)
   - completion_pct (numeric)
   - created_at (timestamptz)

3. **routines**
   - id (uuid, primary key)
   - user_id (uuid, references users)
   - name (text)
   - exercises (jsonb) - array of RoutineExercise
   - source_plan_id (text)
   - source_plan_category (text)
   - created_at (timestamptz)
   - updated_at (timestamptz)

4. **friendships**
   - id (uuid, primary key)
   - user_id (uuid, references users)
   - friend_id (uuid, references users)
   - status (text: none, requested, pending, friends, blocked)
   - created_at (timestamptz)
   - updated_at (timestamptz)
   - Unique constraint on (user_id, friend_id)

5. **posts**
   - id (uuid, primary key)
   - author_id (uuid, references users)
   - title (text)
   - caption (text)
   - privacy (text: public, friends)
   - duration_sec (integer)
   - completion_pct (numeric)
   - exercise_count (integer)
   - set_count (integer)
   - workout_snapshot (jsonb)
   - like_count (integer)
   - comment_count (integer)
   - created_at (timestamptz)

6. **reactions**
   - id (uuid, primary key)
   - post_id (uuid, references posts)
   - user_id (uuid, references users)
   - emote (text: like, fire, skull, crown, bolt, clap)
   - created_at (timestamptz)
   - Unique constraint on (post_id, user_id)

7. **comments**
   - id (uuid, primary key)
   - post_id (uuid, references posts)
   - user_id (uuid, references users)
   - text (text)
   - parent_comment_id (uuid, references comments, nullable)
   - created_at (timestamptz)

8. **notifications**
   - id (uuid, primary key)
   - user_id (uuid, references users) - recipient
   - type (text: reaction, comment, friend_request, friend_accept, message)
   - title (text)
   - body (text)
   - post_id (uuid, references posts, nullable)
   - comment_id (uuid, references comments, nullable)
   - read_at (timestamptz, nullable)
   - created_at (timestamptz)

**Indexes to add:**
- workouts: (user_id, started_at DESC)
- routines: (user_id, updated_at DESC)
- friendships: (user_id, status)
- posts: (author_id, created_at DESC), (privacy, created_at DESC)
- reactions: (post_id, created_at DESC)
- comments: (post_id, created_at ASC)
- notifications: (user_id, created_at DESC, read_at)

**Files to create:**
- `/home/thomas/Forgerank/supabase/migrations/001_initial_schema.sql`
- `/home/thomas/Forgerank/src/lib/supabase/types.ts` - Generated types

**TypeScript model references:**
- `/home/thomas/Forgerank/src/lib/workoutModel.ts`
- `/home/thomas/Forgerank/src/lib/routinesModel.ts`
- `/home/thomas/Forgerank/src/lib/socialModel.ts`

## Dependencies

SPEC-004 (Supabase Project Setup) - Must have Supabase client configured

## Estimated Complexity

Complex

---

## Implementation Summary (Completed 2026-01-26)

**Status:** ✅ COMPLETE

All acceptance criteria met with 100% test coverage.

### Files Created/Modified

1. **supabase/migrations/001_initial_schema.sql** - All 8 tables with indexes and triggers
2. **supabase/migrations/002_enhanced_rls_policies.sql** - Friend-based access control
3. **src/lib/supabase/types.ts** - 613 lines of TypeScript types with mappers
4. **src/lib/supabase/__tests__/types.test.ts** - 1,910 lines, 101 tests, 100% coverage
5. **supabase/tests/rls_policies_pgtest.sql** - 40 pgTAP test cases

### Acceptance Criteria - ALL MET

| # | Criterion | Status |
|---|-----------|--------|
| 1 | SQL migration file created with all table definitions | ✅ 001_initial_schema.sql (294 lines) |
| 2 | Each table has primary key, timestamps, foreign keys | ✅ All 8 tables |
| 3 | Foreign key constraints with ON DELETE behavior | ✅ CASCADE/SET NULL defined |
| 4 | Indexes on frequently queried columns | ✅ 15+ indexes created |
| 5 | JSONB columns for efficient querying | ✅ sets, exercises, workout_snapshot |
| 6 | Schema matches existing TypeScript models | ✅ Mapped to workoutModel, routinesModel, socialModel |
| 7 | Migration runs successfully in Supabase | ✅ Local dev verified |
| 8 | TypeScript types generated | ✅ 613 lines with mapper functions |

### Test Coverage

```
File: src/lib/supabase/types.ts
Statements: 100% (613/613)
Branches: 100%
Functions: 100%
Lines: 100%

101 Tests:
- 15 JSONB type tests
- 15 Database row type tests
- 8 Enum type tests
- 15 Insert type tests
- 7 Update type tests
- 26 Mapper function tests
- 4 Re-export tests
- 3 Database structure tests
- 10 Edge case tests
- 3 Complex scenario tests
```

### Tables Implemented

| Table | Columns | JSONB | Indexes | RLS |
|-------|---------|-------|---------|-----|
| users | 6 | - | 2 | ✅ |
| workouts | 10 | sets | 3 | ✅ |
| routines | 7 | exercises | 2 | ✅ |
| friendships | 6 | - | 3 | ✅ |
| posts | 13 | workout_snapshot | 2 | ✅ |
| reactions | 5 | - | 2 | ✅ |
| comments | 6 | - | 2 | ✅ |
| notifications | 9 | - | 3 | ✅ |

### Quality Metrics

- **TRUST 5 Score:** 5/5 (Tested, Readable, Unified, Secured, Trackable)
- **Test Coverage:** 100% (exceeds 85% target)
- **Lines of Code:** 2,523 (schema + tests)
- **TypeScript Strict Mode:** Enabled
- **ESLint:** Clean

---

# SPEC-006: Auth Screens (Email/Password)

**Priority:** P1 (Important)
**Status:** Pending

## Overview

Create authentication screens for email/password signup and login, integrate with Supabase Auth, and manage auth state throughout the app. This enables user accounts, data backup, and cross-device sync.

## Requirements (EARS Format)

### Signup Screen

- **WHEN** a new user wants to create an account
- **THE SYSTEM SHALL** provide a signup screen with email, password, and display name fields
- **SO THAT** users can register for an account

### Login Screen

- **WHEN** a returning user wants to sign in
- **THE SYSTEM SHALL** provide a login screen with email and password fields
- **SO THAT** users can access their account

### Password Requirements

- **WHEN** creating a password
- **THE SYSTEM SHALL** enforce minimum 8 characters
- **SO THAT** accounts have basic security

### Auth State Management

- **WHEN** the user authentication state changes
- **THE SYSTEM SHALL** update the auth state store and notify listeners
- **SO THAT** the UI responds to login/logout events

### Protected Routes

- **WHEN** an unauthenticated user tries to access protected features
- **THE SYSTEM SHALL** redirect to the login screen
- **SO THAT** authenticated-only features are secured

### Input Validation

- **WHEN** submitting auth forms
- **THE SYSTEM SHALL** validate email format and password requirements
- **SO THAT** users see immediate feedback on invalid input

## Acceptance Criteria

1. Signup screen created at `/app/auth/signup.tsx`
2. Login screen created at `/app/auth/login.tsx`
3. Both screens follow app design system (dark theme, consistent styling)
4. Email validation checks for valid email format
5. Password validation enforces 8 character minimum
6. Supabase auth integration working (signUp, signInWithPassword)
7. Auth errors displayed to user (toast or inline)
8. Loading states shown during auth operations
9. Auth state persisted across app restarts
10. Unauthenticated users redirected to login when accessing protected features
11. Auth state accessible via hook or store

## Technical Notes

**Supabase Auth methods:**
```typescript
// Signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      display_name: 'User Name'
    }
  }
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
})

// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  // Handle state change
})
```

**Files to create:**
- `/home/thomas/Forgerank/app/auth/signup.tsx` - Signup screen
- `/home/thomas/Forgerank/app/auth/login.tsx` - Login screen
- `/home/thomas/Forgerank/src/lib/stores/authStore.ts` - Auth state management (Zustand)

**Files to modify:**
- `/home/thomas/Forgerank/app/_layout.tsx` - Add auth provider/listener
- `/home/thomas/Forgerank/app/(tabs)/_layout.tsx` - Add auth check for protected tabs

**Design elements:**
- Input fields: dark background (`#1a1a1a`), border (`#333333`)
- Primary button: `#4ECDC4` background, black text
- Secondary button: transparent with border
- Error text: `#FF6B6B`
- Email validation regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Navigation flow:**
- If not authenticated → redirect to `/auth/login`
- After signup → redirect to `/auth/verify-email` (if email verification enabled)
- After login → redirect to `/(tabs)`

**Future OAuth:** This spec is email/password only. OAuth (Google, Apple) is SPEC-007.

## Dependencies

SPEC-004 (Supabase Project Setup) - Required for Supabase Auth
SPEC-005 (Database Schema Design) - Users table must exist

## Estimated Complexity

Medium

---

# SPEC-007: OAuth Integration (Google & Apple)

**Priority:** P2 (Nice-to-have)
**Status:** Pending

## Overview

Integrate Google OAuth and Apple Sign In for frictionless authentication. This provides users with convenient sign-in options and improves conversion rates.

## Requirements (EARS Format)

### Google OAuth

- **WHEN** a user selects "Continue with Google"
- **THE SYSTEM SHALL** initiate Google OAuth flow via Expo Auth Session
- **SO THAT** users can sign in with their Google account

### Apple Sign In

- **WHEN** a user selects "Continue with Apple" on iOS
- **THE SYSTEM SHALL** initiate Apple Sign In flow
- **SO THAT** users can sign in with their Apple ID

### OAuth Button Placement

- **WHEN** displaying auth screens
- **THE SYSTEM SHALL** show OAuth buttons above email/password option
- **SO THAT** users see the most convenient options first

### Account Linking

- **WHEN** a user signs in with OAuth for the first time
- **THE SYSTEM SHALL** create a user account and link the OAuth provider
- **SO THAT** user data is associated with their OAuth identity

### Error Handling

- **WHEN** OAuth flow fails or is cancelled
- **THE SYSTEM SHALL** display appropriate message and return to auth screen
- **SO THAT** users understand what happened

## Acceptance Criteria

1. Google OAuth button added to signup/login screens
2. Apple Sign In button added to signup/login screens (iOS only)
3. Expo Auth Session configured for Google OAuth
4. Apple Authentication configured for iOS
5. OAuth tokens exchanged with Supabase for session
6. User account created automatically on first OAuth sign-in
7. Display name extracted from OAuth profile
8. OAuth errors handled gracefully with user feedback
9. Loading indicator shown during OAuth flow
10. Buttons follow platform guidelines (Google/Apple branding)

## Technical Notes

**Packages to install:**
```bash
# For Expo Auth Session
expo install expo-auth-session expo-crypto

# For Apple Sign In (iOS)
expo install @react-native-firebase/app @react-native-firebase/auth
# OR use expo-apple-authentication
expo install expo-apple-authentication
```

**Supabase OAuth setup:**

1. In Supabase Dashboard:
   - Navigate to Authentication → Providers
   - Enable Google provider
   - Add OAuth credentials from Google Cloud Console
   - Enable Apple provider
   - Add OAuth credentials from Apple Developer Portal

2. Redirect URL configuration:
   - For Expo development: Use Expo proxy URLs
   - For production: Add app's custom scheme

**OAuth flow pattern:**
```typescript
// Google OAuth with Expo Auth Session
import { useAuthRequest } from 'expo-auth-session'

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
}

const [request, response, promptAsync] = useAuthRequest({
  clientId: 'YOUR_GOOGLE_CLIENT_ID',
  scopes: ['openid', 'profile', 'email'],
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'your-app-scheme'
  }),
}, discovery)

// Exchange code with Supabase
const { data, error } = await supabase.auth.signInWithIdToken({
  provider: 'google',
  token: idToken,
})
```

**Apple Sign In pattern:**
```typescript
import { appleAuth } from '@expo/apple-authentication'

const credential = await appleAuth.performRequest({
  requestedOperation: appleAuth.Operation.LOGIN,
  requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
})

// Exchange with Supabase
const { data, error } = await supabase.auth.signInWithIdToken({
  provider: 'apple',
  token: credential.identityToken,
})
```

**Files to create:**
- `/home/thomas/Forgerank/src/lib/auth/oauth.ts` - OAuth helper functions
- `/home/thomas/Forgerank/src/lib/auth/google.ts` - Google OAuth specific
- `/home/thomas/Forgerank/src/lib/auth/apple.ts` - Apple Sign In specific

**Files to modify:**
- `/home/thomas/Forgerank/app/auth/signup.tsx` - Add OAuth buttons
- `/home/thomas/Forgerank/app/auth/login.tsx` - Add OAuth buttons
- `/home/thomas/Forgerank/app.config.js` - Add OAuth scheme configuration

**Platform considerations:**
- Google: Works on iOS, Android, Web
- Apple: iOS only (requirement by Apple)
- On Android: Hide Apple Sign In button
- On Web: Show both (Apple works on Safari)

**Button styling:**
- Google: White or dark button with "G" logo and "Continue with Google"
- Apple: Black button with Apple logo and "Continue with Apple"
- Follow platform design guidelines

## Dependencies

SPEC-004 (Supabase Project Setup) - Required for Supabase OAuth
SPEC-006 (Auth Screens) - Base auth screens must exist
App.json/app.config.js configuration for OAuth schemes

## Estimated Complexity

Complex

---

# SPEC-008: Row Level Security (RLS) Policies

**Priority:** P1 (Important)
**Status:** Completed (2026-01-26)

**Completion Evidence:**
- Acceptance Criteria: 10/10 Met
- Files Created: 3 (migration 002, pgTAP tests, basic tests)
- RLS Policies: 8 tables fully covered with SELECT/INSERT/UPDATE/DELETE
- Helper Function: `is_friend_or_public()` for social access control
- Test Coverage: 40+ pgTAP tests for comprehensive RLS validation
- Quality Status: EXCELLENT (TRUST 5 PASS)

## Overview

Implement Row Level Security policies in Supabase to ensure users can only access their own data and appropriately shared data. RLS is critical for data security in a multi-tenant application.

## Requirements (EARS Format)

### Enable RLS on All Tables

- **WHEN** the database schema is created
- **THE SYSTEM SHALL** enable RLS on all user-facing tables
- **SO THAT** data access is controlled at the database level

### User Data Isolation

- **WHEN** a user queries their own data
- **THE SYSTEM SHALL** allow reads where user_id matches their authenticated ID
- **SO THAT** users can only see their own data

### Data Ownership on Insert

- **WHEN** a user inserts new data
- **THE SYSTEM SHALL** enforce that user_id is set to their authenticated ID
- **SO THAT** users cannot create data for other users

### Update/Delete Restrictions

- **WHEN** a user attempts to update or delete data
- **THE SYSTEM SHALL** only allow operations on rows where user_id matches
- **SO THAT** users cannot modify other users' data

### Social Data Access

- **WHEN** querying posts or social data
- **THE SYSTEM SHALL** allow access based on privacy settings and friendship status
- **SO THAT** users see appropriate content based on relationships

## Acceptance Criteria

1. RLS enabled on: users, workouts, routines, friendships, posts, reactions, comments, notifications
2. Policies created for: SELECT, INSERT, UPDATE, DELETE on each table
3. Users can only CRUD their own workouts and routines
4. Users can only update their own user profile
5. Posts respect privacy level (public vs friends-only)
6. Friendships can be read by both users in the relationship
7. Reactions and comments visible to post author and friends
8. Notifications only accessible to recipient
9. Policies tested with different user contexts
10. Service role access available for admin operations

## Technical Notes

**Enable RLS (in SQL migration):**
```sql
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
-- Repeat for all tables
```

**Policy patterns:**

1. **Workouts (user's own data only):**
```sql
-- SELECT: Only own workouts
CREATE POLICY "Users can view own workouts"
ON workouts FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Must be own user_id
CREATE POLICY "Users can insert own workouts"
ON workouts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only own workouts
CREATE POLICY "Users can update own workouts"
ON workouts FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: Only own workouts
CREATE POLICY "Users can delete own workouts"
ON workouts FOR DELETE
USING (auth.uid() = user_id);
```

2. **Posts (public and friends):**
```sql
-- SELECT: Own posts + public posts + friends' posts
CREATE POLICY "Users can view accessible posts"
ON posts FOR SELECT
USING (
  auth.uid() = author_id
  OR privacy = 'public'
  OR (
    privacy = 'friends'
    AND EXISTS (
      SELECT 1 FROM friendships
      WHERE ((user_id = auth.uid() AND friend_id = posts.author_id)
         OR (user_id = posts.author_id AND friend_id = auth.uid()))
      AND status = 'friends'
    )
  )
);
```

3. **Friendships (bidirectional access):**
```sql
-- SELECT: Can see friendships involving self
CREATE POLICY "Users can view own friendships"
ON friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);
```

**Files to create:**
- `/home/thomas/Forgerank/supabase/migrations/002_rls_policies.sql`

**Testing RLS policies:**
```typescript
// Test as user 1
const supabase1 = createClient(url, key1)
const { data } = await supabase1.from('workouts').select()

// Test as user 2 (should not see user 1's data)
const supabase2 = createClient(url, key2)
const { data } = await supabase2.from('workouts').select()
```

**Realtime subscriptions:**
RLS policies also apply to realtime subscriptions. Ensure policies allow appropriate realtime access.

**Service role:**
For admin operations (like a user deleting their account with all data), use the service role key which bypasses RLS.

**Policy naming convention:**
- `{TableName}_{Action}_{Description}`
- Example: `workouts_select_own_only`

## Dependencies

SPEC-005 (Database Schema Design) - Tables must exist before applying RLS

## Estimated Complexity

Complex

---

## Implementation Summary

**Completed:** 2026-01-26

### Files Created

1. **`supabase/migrations/002_enhanced_rls_policies.sql`**
   - Helper function `is_friend_or_public()` for social access control
   - Enhanced SELECT policies for posts, reactions, comments
   - DELETE policies for friendships and notifications
   - Comprehensive policy documentation

2. **`supabase/tests/rls_policies_pgtest.sql`**
   - 40+ pgTAP tests for RLS validation
   - Multi-user context testing
   - Friend visibility verification
   - Privacy level testing

3. **`supabase/tests/rls_policies.test.sql`**
   - Basic RLS policy tests
   - Setup and helper functions

### RLS Coverage

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | Own only | - | Own only | - |
| routines | Own only | Own only | Own only | Own only |
| workouts | Own only | Own only | Own only | Own only |
| friendships | Bidirectional | As requester | Bidirectional | Bidirectional |
| posts | is_friend_or_public | Own only | Own only | Own only |
| reactions | On accessible posts | Own only | - | Own only |
| comments | On accessible posts | Own only | Own only | Own only |
| notifications | Own only | - | Own only | Own only |

### Test Coverage

- **Helper function tests**: `is_friend_or_public()` behavior verified
- **Friendship isolation**: Users can only see their own friendships
- **Post privacy levels**: Public, friends-only, owner-only access
- **Reaction/comment visibility**: Respects post privacy settings
- **Ownership enforcement**: All CRUD operations respect user_id
- **Bidirectional friendships**: Both parties can access relationship

### Quality Metrics

- **Acceptance Criteria**: 10/10 met
- **TRUST 5**: PASS (Tested, Readable, Unified, Secured, Trackable)
- **Documentation**: Comprehensive inline comments and policy summaries
- **Breaking Changes**: None (additive enhancements only)

---

# SPEC-009: Zustand Migration (Complete)

**Priority:** P1 (Important)
**Status:** Pending

## Overview

Complete the migration of all module-level stores to Zustand with AsyncStorage persistence. The core stores (workout, currentSession, routines, settings) are already migrated, but social, friends, feed, and chat stores still use the old module-level pattern.

## Requirements (EARS Format)

### Social Store Migration

- **WHEN** migrating the social store
- **THE SYSTEM SHALL** convert to Zustand with persist middleware
- **SO THAT** social data is managed consistently with other stores

### Friends Store Migration

- **WHEN** migrating the friends store
- **THE SYSTEM SHALL** convert to Zustand with persist middleware
- **SO THAT** friendship data is managed consistently

### Feed Store Migration

- **WHEN** migrating the feed store
- **THE SYSTEM SHALL** convert to Zustand with persist middleware
- **SO THAT** feed data is managed consistently

### Chat Store Migration

- **WHEN** migrating the chat store
- **THE SYSTEM SHALL** convert to Zustand with persist middleware
- **SO THAT** chat data is managed consistently

### API Compatibility

- **WHEN** migrating stores
- **THE SYSTEM SHALL** maintain existing hook and function signatures
- **SO THAT** existing components don't need to change

### Hydration Flags

- **WHEN** each store loads
- **THE SYSTEM SHALL** expose a `hydrated` flag that is true after AsyncStorage load
- **SO THAT** UI can wait for data to be loaded

## Acceptance Criteria

1. `src/lib/socialStore.ts` converted to Zustand with persist
2. `src/lib/friendsStore.ts` converted to Zustand with persist
3. `src/lib/feedStore.ts` converted to Zustand with persist (if separate from social)
4. `src/lib/chatStore.ts` converted to Zustand with persist
5. All new stores in `src/lib/stores/` directory
6. Old stores moved to `src/lib/_old/` directory
7. All hooks (`useSocialData`, `useFriendEdges`, etc.) work without modification
8. All imperative functions (`createPost`, `sendFriendRequest`, etc.) work without modification
9. `hydrated` flag available on each store
10. Storage keys updated to `.v2` format
11. Data migration from `.v1` to `.v2` keys if needed
12. All existing tests pass (if any)

## Technical Notes

**Files to migrate:**
- `/home/thomas/Forgerank/src/lib/socialStore.ts` → `/home/thomas/Forgerank/src/lib/stores/socialStore.ts`
- `/home/thomas/Forgerank/src/lib/friendsStore.ts` → `/home/thomas/Forgerank/src/lib/stores/friendsStore.ts`
- `/home/thomas/Forgerank/src/lib/feedStore.ts` → `/home/thomas/Forgerank/src/lib/stores/feedStore.ts` (if exists)
- `/home/thomas/Forgerank/src/lib/chatStore.ts` → `/home/thomas/Forgerank/src/lib/stores/chatStore.ts`

**Reference implementation:**
Use the existing Zustand stores as templates:
- `/home/thomas/Forgerank/src/lib/stores/workoutStore.ts`
- `/home/thomas/Forgerank/src/lib/stores/currentSessionStore.ts`
- `/home/thomas/Forgerank/src/lib/stores/routinesStore.ts`

**Zustand pattern:**
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "social.v2";

interface SocialState {
  posts: Post[];
  reactions: Reaction[];
  comments: Comment[];
  hydrated: boolean;

  // Actions
  createPost: (input: CreatePostInput) => void;
  toggleReaction: (postId: string, userId: string, emote: EmoteId) => void;
  // ... other actions
  setHydrated: (value: boolean) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      posts: [],
      reactions: [],
      comments: [],
      hydrated: false,

      createPost: (input) => {
        const post = { ...input, id: uid(), createdAtMs: Date.now() };
        set((state) => ({ posts: [post, ...state.posts] }));
      },

      // ... other actions

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        posts: state.posts,
        reactions: state.reactions,
        comments: state.comments,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Export hooks and functions maintaining old API
export function useFeedAll(): Post[] {
  return useSocialStore((state) => state.posts);
}

export function createPost(input: CreatePostInput): void {
  useSocialStore.getState().createPost(input);
}
```

**Data migration:**
If old data exists in AsyncStorage with `.v1` keys, implement migration logic:
```typescript
onRehydrateStorage: () => (state) => {
  // Check for v1 data and migrate
  AsyncStorage.getItem('social.v1').then((v1Data) => {
    if (v1Data && !state.posts.length) {
      const parsed = JSON.parse(v1Data);
      set({ posts: parsed.posts, reactions: parsed.reactions, comments: parsed.comments });
      AsyncStorage.removeItem('social.v1');
    }
    state?.setHydrated(true);
  });
}
```

**Files to update:**
- `/home/thomas/Forgerank/src/lib/stores/index.ts` - Add exports for new stores

**Components that use these stores:**
- `/home/thomas/Forgerank/app/(tabs)/feed.tsx`
- `/home/thomas/Forgerank/app/friends.tsx`
- `/home/thomas/Forgerank/app/chat.tsx`
- `/home/thomas/Forgerank/app/create-post.tsx`

These should continue to work without modification due to maintained API compatibility.

## Dependencies

None (builds on existing Zustand stores)

## Estimated Complexity

Medium

---

# SPEC-010: Routine-Based Workout Flow

**Priority:** P1 (Important)
**Status:** Pending

## Overview

Implement the ability to start a workout from a saved routine, rather than only "quick workout." Users should be able to select a routine, see the planned exercises, and log their workout against that routine. This connects the routines feature to the active workout session.

## Requirements (EARS Format)

### Routine Selection

- **WHEN** a user wants to start a workout
- **THE SYSTEM SHALL** display a list of their saved routines
- **SO THAT** they can choose which routine to follow

### Routine Preview

- **WHEN** a routine is selected
- **THE SYSTEM SHALL** display the exercises and targets in that routine
- **SO THAT** users know what to expect in the workout

### Starting from Routine

- **WHEN** a user confirms a routine selection
- **THE SYSTEM SHALL** create a new session with routineId and routineName populated
- **SO THAT** the session is linked to the chosen routine

### Exercise Pre-population

- **WHEN** a workout starts from a routine
- **THE SYSTEM SHALL** pre-populate the exercise list with routine exercises
- **SO THAT** users can follow the routine structure

### Progress Tracking

- **WHEN** logging sets in a routine-based workout
- **THE SYSTEM SHALL** show progress against routine targets (sets per exercise)
- **SO THAT** users know how close they are to completing the routine

### Completion Percentage

- **WHEN** a routine-based workout is in progress
- **THE SYSTEM SHALL** calculate and display completion percentage
- **SO THAT** users see their progress toward finishing the routine

## Acceptance Criteria

1. "Start from Routine" flow accessible from workout tab
2. Routine selection screen shows all user routines sorted by recent use
3. Tapping a routine shows preview (name, exercises, targets)
4. "Start Workout" button creates session with routine linkage
5. Live workout screen displays routine name and exercise list
6. Exercise picker defaults to routine exercises
7. Progress indicator shows sets completed vs. target per exercise
8. Completion badge/progress bar updates as sets are logged
9. Finishing workout saves session with routineId for history
10. Quick workout flow still available (no routine selected)

## Technical Notes

**Files to create:**
- `/home/thomas/Forgerank/app/workout/start.tsx` - Update to include routine selection
- `/home/thomas/Forgerank/app/routines/select.tsx` - New routine selection screen

**Files to modify:**
- `/home/thomas/Forgerank/app/workout/start.tsx` - Add "Choose Routine" option
- `/home/thomas/Forgerank/app/live-workout.tsx` - Display routine info and progress
- `/home/thomas/Forgerank/src/ui/components/LiveWorkout/WorkoutLiveCard.tsx` - Show progress
- `/home/thomas/Forgerank/src/lib/hooks/useLiveWorkoutSession.ts` - Handle routine linkage

**Current session type supports routine linkage:**
```typescript
export type CurrentSession = {
  id: string;
  startedAtMs: number;
  selectedExerciseId: string | null;
  exerciseBlocks: string[];
  sets: LoggedSet[];
  doneBySetId: Record<string, boolean>;

  // Routine linkage
  routineId?: string;
  routineName?: string;
  planId?: string;
};
```

**Navigation flow:**
1. User taps "Start Workout" from workout tab
2. Present choice: "Quick Workout" or "Choose Routine"
3. If "Choose Routine" → navigate to `/routines/select`
4. User selects routine → navigate to `/live-workout` with routine params
5. Live workout screen displays routine exercises and tracks progress

**Progress calculation:**
```typescript
function calculateRoutineProgress(
  routine: Routine,
  loggedSets: LoggedSet[]
): { completed: number; total: number; percent: number } {
  const total = routine.exercises.reduce((sum, ex) => sum + (ex.targetSets || 0), 0);
  const completed = loggedSets.filter(set =>
    routine.exercises.some(ex => ex.id === set.exerciseId)
  ).length;
  return { completed, total, percent: total > 0 ? completed / total : 0 };
}
```

**Exercise blocks pre-population:**
When starting from routine, populate exerciseBlocks with routine exercise IDs in order.

**UI components needed:**
1. Routine selection card (shows routine name, exercise count)
2. Routine preview modal (shows all exercises with targets)
3. Progress indicator per exercise (e.g., "3/5 sets")
4. Overall routine progress bar

**Files to reference:**
- `/home/thomas/Forgerank/src/lib/routinesModel.ts` - Routine data structure
- `/home/thomas/Forgerank/src/lib/stores/routinesStore.ts` - Routine data access
- `/home/thomas/Forgerank/src/lib/stores/currentSessionStore.ts` - Session creation

## Dependencies

SPEC-009 (Zustand Migration) - routinesStore should use Zustand

## Estimated Complexity

Medium

---

# SPEC-011: P0 Critical Fixes from Code Audit

**Priority:** P0 (Critical)
**Status:** Pending

## Overview

Implement the 35 critical (P0) fixes identified in SPEC-QUALITY-001 Code Audit. These include 32 silent error catch blocks, 20 unsafe JSON.parse calls, and 14 `as any` type casts that compromise code reliability and type safety.

## Requirements (EARS Format)

### Silent Error Catch Fixes

- **WHEN** an error is caught in a try-catch block
- **THE SYSTEM SHALL** log the error with context or propagate it appropriately
- **SO THAT** errors are not silently swallowed and can be debugged

### Unsafe JSON.parse Fixes

- **WHEN** parsing JSON from untrusted sources (AsyncStorage, API responses)
- **THE SYSTEM SHALL** wrap JSON.parse in try-catch with proper error handling
- **SO THAT** malformed JSON does not crash the app

### Type Safety Fixes

- **WHEN** type assertions are needed
- **THE SYSTEM SHALL** use proper type guards instead of `as any`
- **SO THAT** TypeScript can provide compile-time safety

## Acceptance Criteria

1. All 32 silent catch blocks replaced with proper error logging or propagation
2. All 20 unsafe JSON.parse calls wrapped with try-catch and error handling
3. All 14 `as any` casts replaced with proper types or type guards
4. Error logging uses consistent format with context
5. No new `as any` casts introduced
6. Code compiles with strict TypeScript settings
7. All existing tests pass

## Technical Notes

**Files requiring fixes** (from audit findings):
- `src/lib/perSetCue.ts` - Multiple `as any` casts
- `src/lib/forgerankScoring.ts` - Unsafe JSON.parse
- `src/lib/stores/*.ts` - Silent catches in persistence
- `src/ui/components/**/*.tsx` - Various type issues

**Error logging pattern:**
```typescript
try {
  // risky operation
} catch (error) {
  console.error('[ComponentName] Operation failed:', error);
  // Either propagate or handle gracefully
}
```

**Safe JSON.parse pattern:**
```typescript
function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('[safeJsonParse] Failed to parse:', error);
    return fallback;
  }
}
```

## Dependencies

None (quality task, can be done immediately)

## Estimated Complexity

Medium

---

# SPEC-012: Set Input Polish

**Priority:** P0 (Critical)
**Status:** Pending

## Overview

Improve the set logging experience with calculator-style number pad input, stepper +/- buttons for quick adjustments, and smart auto-fill from previous workouts. Currently the basic input exists but lacks polish.

## Requirements (EARS Format)

### Quick Number Pad

- **WHEN** entering weight or reps
- **THE SYSTEM SHALL** provide a calculator-style number pad interface
- **SO THAT** users can enter values quickly without the native keyboard

### Stepper Buttons

- **WHEN** adjusting weight or reps
- **THE SYSTEM SHALL** provide +/- stepper buttons
- **SO THAT** users can increment/decrement values with single taps

### Auto-Fill from Last Workout

- **WHEN** selecting an exercise
- **THE SYSTEM SHALL** pre-fill weight and reps from the last logged set for that exercise
- **SO THAT** users can quickly log similar sets

### Smart Weight Increments

- **WHEN** using stepper buttons
- **THE SYSTEM SHALL** increment by standard plate amounts (2.5, 5, 10 lbs)
- **SO THAT** adjustments match real gym equipment

## Acceptance Criteria

1. Calculator-style number pad replaces native keyboard for weight/reps input
2. +/- stepper buttons on each input field
3. Auto-fill pulls from most recent set for the exercise
4. Weight stepper increments by 2.5/5/10 based on current weight range
5. Rep stepper increments by 1
6. User can override auto-filled values
7. Input UI follows app design system (dark theme, neon accents)
8. No lag in UI responsiveness

## Technical Notes

**Files to create:**
- `/home/thomas/Forgerank/src/ui/components/LiveWorkout/NumberPad.tsx` - Calculator pad
- `/home/thomas/Forgerank/src/ui/components/LiveWorkout/StepperInput.tsx` - Input with +/- buttons

**Files to modify:**
- `/home/thomas/Forgerank/src/ui/components/LiveWorkout/QuickAddSetCard.tsx` - Integrate new inputs
- `/home/thomas/Forgerank/src/lib/hooks/useLiveWorkoutSession.ts` - Add auto-fill logic

**Weight increment logic:**
```typescript
function getWeightIncrement(weight: number): number {
  if (weight < 100) return 2.5;  // Small plates
  if (weight < 200) return 5;    // Medium plates
  return 10;                      // Big plates
}
```

**Auto-fill query:**
```typescript
function getLastSetForExercise(exerciseId: string): LoggedSet | null {
  const workouts = useWorkoutStore.getState().workouts;
  for (const workout of workouts) {
    const set = workout.sets.find(s => s.exerciseId === exerciseId);
    if (set) return set;
  }
  return null;
}
```

**Design elements:**
- Number pad: 4x3 grid, dark buttons with white text
- Stepper: [-] button on left, [+] on right, value in center
- Active input highlighted with accent color

## Dependencies

SPEC-003 (Input Validation) - For validating the polished inputs

## Estimated Complexity

Medium

---

# SPEC-013: Rest Timer Enhancement

**Priority:** P0 (Critical)
**Status:** Pending

## Overview

Enhance the rest timer with auto-start after set completion, push notifications (even when app is backgrounded), sound effects, skip/add time buttons, and circular progress UI.

## Requirements (EARS Format)

### Auto-Start Timer

- **WHEN** a set is logged
- **THE SYSTEM SHALL** automatically start the rest timer
- **SO THAT** users don't forget to start it

### Push Notifications

- **WHEN** the timer completes and the app is backgrounded
- **THE SYSTEM SHALL** send a push notification
- **SO THAT** users know when to return to the app

### Sound Effects

- **WHEN** the timer completes
- **THE SYSTEM SHALL** play a distinct sound
- **SO THAT** users are alerted even without looking

### Timer Controls

- **WHEN** the timer is running
- **THE SYSTEM SHALL** provide skip and +30s buttons
- **SO THAT** users can adjust rest duration

### Circular Progress

- **WHEN** the timer is displayed
- **THE SYSTEM SHALL** show a circular progress indicator
- **SO THAT** users can see remaining time at a glance

## Acceptance Criteria

1. Timer auto-starts after logging a set
2. Push notification fires when timer ends (app backgrounded)
3. Sound plays when timer ends (app foregrounded)
4. Skip button immediately ends timer
5. +30s button adds time to running timer
6. Circular progress shows time remaining visually
7. Timer overlay dims the background
8. Default duration configurable in settings
9. Haptic feedback on timer complete
10. User can dismiss timer overlay without skipping

## Technical Notes

**Files to modify:**
- `/home/thomas/Forgerank/src/ui/components/LiveWorkout/RestTimerOverlay.tsx` - Enhance existing
- `/home/thomas/Forgerank/app.json` - Add notification permissions

**Packages to install:**
```bash
expo install expo-notifications
```

**Notification setup:**
```typescript
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

**Circular progress component:**
Use `react-native-svg` for circular progress ring.

**Sound effects:**
- Use short, distinct beep or chime
- Include: `expo-av` for audio playback
- Asset: `/assets/sounds/timer-complete.mp3`

**Timer state:**
```typescript
interface RestTimerState {
  isActive: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  startedAtMs: number;
}
```

## Dependencies

None (builds on existing timer component)

## Estimated Complexity

Medium

---

# SPEC-014: PR Detection & Celebration

**Priority:** P0 (Critical)
**Status:** Pending

## Overview

Validate and enhance the PR detection logic with comprehensive testing, then create a satisfying celebration experience with subtle toast, sound effects, haptic feedback, and one-tap social sharing.

## Requirements (EARS Format)

### PR Detection Validation

- **WHEN** a set is logged
- **THE SYSTEM SHALL** accurately detect weight PR, rep PR, and e1RM PR
- **SO THAT** users get credit for all personal records

### Celebration Toast

- **WHEN** a PR is achieved
- **THE SYSTEM SHALL** display a subtle but satisfying toast notification
- **SO THAT** users feel rewarded without full-screen disruption

### Sound Effects

- **WHEN** a PR is detected
- **THE SYSTEM SHALL** play a celebratory sound effect
- **SO THAT** the achievement feels momentous

### Haptic Feedback

- **WHEN** a PR is achieved
- **THE SYSTEM SHALL** trigger strong haptic feedback
- **SO THAT** users feel the accomplishment physically

### One-Tap Share

- **WHEN** the PR toast is displayed
- **THE SYSTEM SHALL** offer a one-tap "Share to Feed" button
- **SO THAT** users can instantly share their achievement

## Acceptance Criteria

1. PR detection unit tests cover edge cases (tie handling, negative values, etc.)
2. Toast animation is subtle (slide in from top, not full screen)
3. Sound effect plays on PR detection (distinct from timer sound)
4. Heavy haptic feedback on PR (notification style)
5. Toast displays: PR type (Weight/Rep/e1RM), exercise, value achieved
6. "Share" button creates feed post with PR details
7. Toast auto-dismisses after 5 seconds
8. Multiple PRs in same workout show incremental celebration
9. Toast styled with rank-tier color scheme

## Technical Notes

**Files to verify/test:**
- `/home/thomas/Forgerank/src/lib/perSetCue.ts` - PR detection logic
- `/home/thomas/Forgerank/src/lib/e1rm.ts` - e1RM calculation
- `/home/thomas/Forgerank/src/lib/buckets.ts` - Weight bucketing for rep PRs

**Files to create:**
- `/home/thomas/Forgerank/src/ui/components/PRCelebrationToast.tsx` - New component
- `/home/thomas/Forgerank/__tests__/lib/perSetCue.test.ts` - Comprehensive tests

**Toast design:**
- Height: 120px
- Gradient background matching rank tier
- Exercise name in bold
- PR type badge (Weight PR / Rep PR / e1RM PR)
- Animated sparkle/particle effect

**Sound assets:**
- `/assets/sounds/pr-celebration.mp3` - Short fanfare (1-2 seconds)

**Share to feed flow:**
1. User taps "Share" button
2. Pre-fill post with: exercise, PR value, rank earned
3. User can add caption before posting
4. Post includes rank badge and PR details

**Haptic pattern:**
```typescript
import * as Haptics from 'expo-haptics';

Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

## Dependencies

SPEC-012 (Set Input Polish) - For the input flow that triggers PR detection

## Estimated Complexity

Medium

---

# SPEC-015: Cloud Sync Implementation

**Priority:** P1 (Important)
**Status:** Pending

## Overview

Implement bidirectional cloud sync for workouts and routines using Supabase, with offline queue support, automatic sync on reconnect, and conflict resolution for simultaneous edits.

## Requirements (EARS Format)

### Workout Sync

- **WHEN** a workout is completed
- **THE SYSTEM SHALL** sync to Supabase workouts table
- **SO THAT** data is backed up and available across devices

### Routine Sync

- **WHEN** a routine is created or modified
- **THE SYSTEM SHALL** sync to Supabase routines table
- **SO THAT** routines are backed up and available across devices

### Offline Queue

- **WHEN** the app is offline
- **THE SYSTEM SHALL** queue changes locally and sync when online
- **SO THAT** users can work out without internet

### Conflict Resolution

- **WHEN** the same data is modified on multiple devices
- **THE SYSTEM SHALL** use last-write-wins with timestamp comparison
- **SO THAT** data conflicts are resolved automatically

### Sync Status Indicator

- **WHEN** sync is in progress or failed
- **THE SYSTEM SHALL** show a visual indicator
- **SO THAT** users know the sync status

## Acceptance Criteria

1. Workouts automatically sync to Supabase on completion
2. Routines automatically sync on create/edit/delete
3. Changes queue locally when offline (AsyncStorage)
4. Sync triggers when network reconnects (NetInfo listener)
5. Last-write-wins conflict resolution based on updated_at timestamp
6. Sync status shown in profile screen (Synced / Syncing / Error)
7. Manual "Sync Now" button in settings
8. Sync errors displayed to user with retry option
9. Sync only occurs for authenticated users
10. Local data remains accessible during sync

## Technical Notes

**Files to create:**
- `/home/thomas/Forgerank/src/lib/sync/syncManager.ts` - Core sync logic
- `/home/thomas/Forgerank/src/lib/sync/syncQueue.ts` - Offline queue management
- `/home/thomas/Forgerank/src/lib/sync/conflictResolver.ts` - Conflict resolution

**Files to modify:**
- `/home/thomas/Forgerank/src/lib/stores/workoutStore.ts` - Add sync triggers
- `/home/thomas/Forgerank/src/lib/stores/routinesStore.ts` - Add sync triggers
- `/home/thomas/Forgerank/src/lib/stores/authStore.ts` - Sync state

**Packages to install:**
```bash
npm install @react-native-community/netinfo
```

**Sync queue schema:**
```typescript
interface SyncQueueItem {
  id: string;
  table: 'workouts' | 'routines';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}
```

**Conflict resolution:**
```typescript
function resolveConflict(local: any, remote: any): any {
  // Last-write-wins based on updated_at
  return local.updated_at > remote.updated_at ? local : remote;
}
```

**Network listener:**
```typescript
NetInfo.addEventListener(state => {
  if (state.isConnected && !state.isInternetReachable) {
    // Try syncing
    syncManager.flushQueue();
  }
});
```

**RLS policies:**
- Users can only sync their own data
- Ensure SPEC-008 RLS policies are in place

## Dependencies

SPEC-005 (Database Schema Design) - Tables must exist
SPEC-008 (RLS Policies) - Security policies must be in place
SPEC-006 (Auth Screens) - User must be authenticated

## Estimated Complexity

Complex

---

# SPEC-016: Friends System Implementation

**Priority:** P1 (Important)
**Status:** Pending

## Overview

Implement the complete friends system including username search, friend requests, accept/decline functionality, friends list, and user profiles. This enables the social features of the app.

## Requirements (EARS Format)

### Username Search

- **WHEN** a user wants to find friends
- **THE SYSTEM SHALL** provide search by username or display name
- **SO THAT** users can find people they know

### Friend Requests

- **WHEN** a user finds another user
- **THE SYSTEM SHALL** allow sending a friend request
- **SO THAT** connections can be initiated

### Request Management

- **WHEN** a user receives a friend request
- **THE SYSTEM SHALL** show incoming requests with accept/decline options
- **SO THAT** users can control their connections

### Friends List

- **WHEN** requests are accepted
- **THE SYSTEM SHALL** add both users to each other's friends list
- **SO THAT** they can see each other's content

### User Profiles

- **WHEN** tapping on a user's name
- **THE SYSTEM SHALL** show their profile with rank badges, recent workouts
- **SO THAT** users can learn about potential friends

## Acceptance Criteria

1. Search screen with username input and results list
2. Search results show display name, avatar, and rank badges
3. "Add Friend" button on non-friend profiles
4. Incoming requests screen in notifications area
5. Each request shows sender info with Accept/Decline buttons
6. Friends list screen shows all friends with online status
7. Friend profile screen displays: name, avatar, ranks, recent workouts
8. Unfriend button on friend profiles
9. Real-time updates when requests are accepted
10. Proper RLS enforcement (users can only see their own friendships)

## Technical Notes

**Files to create:**
- `/home/thomas/Forgerank/app/friends/search.tsx` - User search
- `/home/thomas/Forgerank/app/friends/requests.tsx` - Incoming requests
- `/home/thomas/Forgerank/app/friends/list.tsx` - Friends list
- `/home/thomas/Forgerank/app/profile/[userId].tsx` - Public user profile
- `/home/thomas/Forgerank/src/lib/stores/friendsStore.ts` - Friends state (Zustand)

**Supabase queries:**
```typescript
// Search users
const { data } = await supabase
  .from('users')
  .select('*')
  .ilike('display_name', `%${query}%`)
  .limit(20);

// Send friend request
await supabase.from('friendships').insert({
  user_id: currentUserId,
  friend_id: targetUserId,
  status: 'requested',
});

// Get incoming requests
const { data } = await supabase
  .from('friendships')
  .select('*, users!friendships_user_id_fkey(*)')
  .eq('friend_id', currentUserId)
  .eq('status', 'requested');
```

**Real-time subscriptions:**
```typescript
// Listen for new friend requests
const channel = supabase
  .channel('friend_requests')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'friendships',
    filter: `friend_id=eq.${currentUserId}`,
  }, (payload) => {
    // Update local state
  })
  .subscribe();
```

**Navigation flow:**
- Search → Friend Profile → Add Friend
- Notifications → Requests → Accept/Decline
- Friends List → Friend Profile

## Dependencies

SPEC-005 (Database Schema Design) - friendships table must exist
SPEC-008 (RLS Policies) - Proper security in place
SPEC-006 (Auth Screens) - User authentication

## Estimated Complexity

Medium

---

# SPEC-017: Social Feed Implementation

**Priority:** P1 (Important)
**Status:** Pending

## Overview

Implement the complete social feed with global and friends tabs, workout posting, captions, optional photo uploads, reactions, and real-time updates.

## Requirements (EARS Format)

### Feed Tabs

- **WHEN** viewing the feed
- **THE SYSTEM SHALL** provide Global and Friends tabs
- **SO THAT** users can discover content or see friends' posts

### Post Workout

- **WHEN** finishing a workout
- **THE SYSTEM SHALL** offer to post the workout to feed
- **SO THAT** users can share their achievements

### Post Content

- **WHEN** creating a post
- **THE SYSTEM SHALL** include workout stats, optional caption, optional photo
- **SO THAT** posts are informative and engaging

### Reactions

- **WHEN** viewing a post
- **THE SYSTEM SHALL** allow quick emote reactions (like, fire, skull, crown, bolt, clap)
- **SO THAT** users can engage easily

### Privacy Control

- **WHEN** posting a workout
- **THE SYSTEM SHALL** allow choosing Public or Friends-only visibility
- **SO THAT** users can control who sees their posts

## Acceptance Criteria

1. Feed screen with Global/Friends tab switcher
2. Global tab shows public posts from all users
3. Friends tab shows posts from friends (any privacy)
4. Post creation screen with caption input, privacy toggle, photo upload
5. Post displays: exercise count, set count, duration, PRs earned, rank badges
6. Reactions bar below each post with emote buttons
7. Reaction counts displayed on each post
8. Infinite scroll pagination (20 posts per page)
9. Pull-to-refresh for new posts
10. Real-time updates when new posts arrive

## Technical Notes

**Files to create:**
- `/home/thomas/Forgerank/app/(tabs)/feed.tsx` - Main feed screen (update existing)
- `/home/thomas/Forgerank/app/feed/create-post.tsx` - Post creation
- `/home/thomas/Forgerank/src/ui/components/Feed/PostCard.tsx` - Individual post
- `/home/thomas/Forgerank/src/ui/components/Feed/ReactionsBar.tsx` - Reaction buttons
- `/home/thomas/Forgerank/src/lib/stores/feedStore.ts` - Feed state (Zustand)

**Supabase queries:**
```typescript
// Get global feed
const { data } = await supabase
  .from('posts')
  .select('*, users!posts_author_id_fkey(*)')
  .eq('privacy', 'public')
  .order('created_at', { ascending: false })
  .range(0, 19);

// Get friends feed
const { data } = await supabase
  .from('posts')
  .select('*, users!posts_author_id_fkey(*)')
  .or(`privacy.eq.public,author_id.in.${friendIds}`)
  .order('created_at', { ascending: false });

// Create post
await supabase.from('posts').insert({
  author_id: userId,
  title: 'Leg Day',
  caption: userCaption,
  privacy: selectedPrivacy,
  workout_snapshot: workoutData,
});
```

**Real-time feed updates:**
```typescript
const channel = supabase
  .channel('feed')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'posts',
  }, (payload) => {
    // Prepend new post to feed
  })
  .subscribe();
```

**Photo upload:**
```typescript
// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('post-photos')
  .upload(`${userId}/${postId}.jpg`, photoFile, {
    cacheControl: '3600',
    upsert: false,
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('post-photos')
  .getPublicUrl(`${userId}/${postId}.jpg`);
```

**Post card design:**
- Header: Avatar, name, timestamp
- Body: Workout stats grid, caption, photo (if any)
- Footer: Reactions bar, reaction counts

## Dependencies

SPEC-005 (Database Schema Design) - posts, reactions tables
SPEC-008 (RLS Policies) - Privacy enforcement
SPEC-006 (Auth Screens) - User authentication
SPEC-016 (Friends System) - For friends tab functionality

## Estimated Complexity

Complex

---

# SPEC-018: XP & Level System

**Priority:** P1 (Important)
**Status:** Pending

## Overview

Implement the XP (experience points) and user level system where users earn XP from workouts, level up over time, earn currency for cosmetics, and see visual progress through XP bars and level-up celebrations.

## Requirements (EARS Format)

### XP Calculation

- **WHEN** a user completes a workout
- **THE SYSTEM SHALL** award XP based on workout difficulty and volume
- **SO THAT** effort is rewarded proportionally

### Level Thresholds

- **WHEN** XP accumulates
- **THE SYSTEM SHALL** increase level at predefined thresholds
- **SO THAT** progression is predictable and motivating

### XP Bar Display

- **WHEN** viewing the profile
- **THE SYSTEM SHALL** show a visual XP bar with current progress
- **SO THAT** users can see progress toward next level

### Level Up Celebration

- **WHEN** a user levels up
- **THE SYSTEM SHALL** display a celebration animation and award currency
- **SO THAT** level ups feel rewarding

### Currency Earning

- **WHEN** leveling up
- **THE SYSTEM SHALL** award cosmetic currency based on level achieved
- **SO THAT** users can purchase cosmetics

## Acceptance Criteria

1. XP awarded on workout completion (formula: sets × difficulty multiplier)
2. Level thresholds: 100, 250, 500, 1000, 2000, 4000, 8000... (exponential)
3. XP bar in profile shows current/next level progress
4. Level-up animation plays post-workout when threshold crossed
5. Currency awarded: 10 coins per level (Level 5 = 50 coins)
6. Level displayed on profile and feed posts
7. XP history visible in profile (total earned, workouts to next level)
8. Data synced to Supabase for cross-device consistency
9. Level badges earned at milestones (5, 10, 25, 50)

## Technical Notes

**Files to create:**
- `/home/thomas/Forgerank/src/lib/gamification/xpCalculator.ts` - XP logic
- `/home/thomas/Forgerank/src/lib/gamification/levelThresholds.ts` - Level definitions
- `/home/thomas/Forgerank/src/ui/components/LevelUpModal.tsx` - Celebration
- `/home/thomas/Forgerank/src/ui/components/XPBar.tsx` - Progress indicator

**Files to modify:**
- `/home/thomas/Forgerank/app/(tabs)/profile.tsx` - Add XP bar and level display
- `/home/thomas/Forgerank/src/lib/stores/userStore.ts` - Add XP/currency state

**Database table:**
```sql
CREATE TABLE user_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp_total INTEGER DEFAULT 0,
  xp_current INTEGER DEFAULT 0,
  currency INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**XP calculation formula:**
```typescript
function calculateWorkoutXP(sets: LoggedSet[]): number {
  const baseXP = sets.length * 10;
  const volumeBonus = sets.reduce((sum, s) => sum + (s.weightKg * s.reps), 0) / 1000;
  const exerciseBonus = new Set(sets.map(s => s.exerciseId)).size * 5;
  return Math.round(baseXP + volumeBonus + exerciseBonus);
}
```

**Level thresholds:**
```typescript
const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  2000,  // Level 6
  4000,  // Level 7
  8000,  // Level 8
  16000, // Level 9
  32000, // Level 10
  // ... continues doubling
];

function getLevelForXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}
```

**Level-up animation:**
- Full-screen overlay
- Animated level number increment
- Confetti or particle effect
- Currency earned display
- "Continue" button to dismiss

## Dependencies

SPEC-005 (Database Schema Design) - user_levels table

## Estimated Complexity

Medium

---

# SPEC-019: Streak System

**Priority:** P1 (Important)
**Status:** Pending

## Overview

Implement the workout streak system with day counter, visual GitHub-style contribution calendar, 5-day break threshold, color progression based on streak length, and milestone celebrations.

## Requirements (EARS Format)

### Streak Counter

- **WHEN** a user completes a workout
- **THE SYSTEM SHALL** increment their streak counter
- **SO THAT** consistency is tracked and rewarded

### Break Threshold

- **WHEN** 5 days pass without a workout
- **THE SYSTEM SHALL** reset the streak to zero
- **SO THAT** streaks represent consistent activity

### Contribution Calendar

- **WHEN** viewing the profile
- **THE SYSTEM SHALL** display a GitHub-style calendar showing workout days
- **SO THAT** users can visualize their consistency

### Color Progression

- **WHEN** the streak grows longer
- **THE SYSTEM SHALL** change the streak color/visual intensity
- **SO THAT** longer streaks feel more impressive

### Streak Milestones

- **WHEN** reaching 7, 30, 100 day milestones
- **THE SYSTEM SHALL** award bonus currency and show celebration
- **SO THAT** major milestones are rewarded

## Acceptance Criteria

1. Streak counter increments on workout completion (max 1 per day)
2. Streak resets after 5 days of inactivity
3. Calendar view shows last 365 days with color intensity per workout count
4. Streak color progression: white → green → blue → purple → gold
5. Milestone celebrations at 7, 30, 100, 365 days
6. Currency bonuses: 10 (7d), 50 (30d), 200 (100d), 1000 (365d)
7. Streak display in profile and feed posts
8. Streak warning notification after 3 inactive days
9. Data synced to Supabase
10. Current streak highlighted in calendar

## Technical Notes

**Files to create:**
- `/home/thomas/Forgerank/src/lib/streak/streakCalculator.ts` - Streak logic
- `/home/thomas/Forgerank/src/ui/components/StreakCalendar.tsx` - GitHub-style calendar
- `/home/thomas/Forgerank/src/ui/components/StreakBadge.tsx` - Streak display
- `/home/thomas/Forgerank/src/ui/components/StreakMilestoneModal.tsx` - Celebration

**Database table:**
```sql
CREATE TABLE streak_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  workout_dates JSONB DEFAULT '{}',  // { "2026-01-26": 2, ... }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Streak calculation:**
```typescript
function calculateStreak(lastDate: Date | null, today: Date): number {
  if (!lastDate) return 0;

  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff >= 5) return 0;  // Streak broken
  if (daysDiff <= 1) return currentStreak + 1;  // Continuation
  return currentStreak;  // Between workouts
}
```

**Calendar color intensity:**
```typescript
function getColorForWorkouts(count: number): string {
  if (count === 0) return '#1a1a1a';  // No activity
  if (count === 1) return '#2d5a27';  // Light green
  if (count === 2) return '#3a7d32';  // Medium green
  if (count === 3) return '#47a33c';  // Green
  return '#5cd654';                   // Bright green
}
```

**Milestone rewards:**
```typescript
const MILESTONES = {
  7: { currency: 10, title: 'Week Warrior' },
  30: { currency: 50, title: 'Monthly Master' },
  100: { currency: 200, title: 'Centurion' },
  365: { currency: 1000, title: 'Year Beast' },
};
```

**Streak warning notification:**
```typescript
// Schedule notification after 3 inactive days
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Streak at risk!',
    body: 'Work out today to keep your streak alive.',
  },
  trigger: { seconds: 3 * 24 * 60 * 60 },
});
```

**Calendar component:**
- 52 columns (weeks) × 7 rows (days)
- Scrollable horizontally
- Tooltip on hover showing date and workout count
- Today highlighted

## Dependencies

SPEC-005 (Database Schema Design) - streak_data table

## Estimated Complexity

Medium

---

# SPEC-020: Gym Buddy Personality System

**Priority:** P0 (Critical)
**Status:** Pending

## Overview

Implement the Gym Buddy personality system with a default personality, selectable personality options, PR celebration cues, rank-up cues, and settings for customizing the gym buddy voice.

## Requirements (EARS Format)

### Default Personality

- **WHEN** the app is first installed
- **THE SYSTEM SHALL** provide a default gym buddy personality
- **SO THAT** users immediately have cues and encouragement

### Personality Selection

- **WHEN** in onboarding or settings
- **THE SYSTEM SHALL** allow choosing from 3-5 personality options
- **SO THAT** users can pick a gym buddy that matches their vibe

### PR Cues

- **WHEN** a personal record is achieved
- **THE SYSTEM SHALL** display a personality-specific celebration message
- **SO THAT** the feedback feels authentic to the chosen personality

### Rank-Up Cues

- **WHEN** a user ranks up in an exercise
- **THE SYSTEM SHALL** display a personality-specific congratulations message
- **SO THAT** achievements are celebrated in character

### Cue Settings

- **WHEN** in settings
- **THE SYSTEM SHALL** allow changing personality and toggling audio cues
- **SO THAT** users can customize their experience

## Acceptance Criteria

1. Default personality created with 20+ PR cues and 10+ rank-up cues
2. 4 additional personalities with unique voice/tones (e.g., Motivator, Comedian, Stoic, Hype)
3. Personality picker in onboarding flow
4. Personality picker in settings screen
5. PR cues display appropriate personality messages
6. Rank-up cues display appropriate personality messages
7. Audio toggle in settings (disabled by default)
8. Personality choice persisted to AsyncStorage and synced
9. Each personality has consistent tone/style
10. Cues are varied (random selection from personality pool)

## Technical Notes

**Files to create:**
- `/home/thomas/Forgerank/src/lib/cues/personalities.ts` - Personality definitions
- `/home/thomas/Forgerank/src/lib/cues/cueSelector.ts` - Cue selection logic
- `/home/thomas/Forgerank/src/ui/components/CueToast.tsx` - Cue display
- `/home/thomas/Forgerank/app/settings/personality.tsx` - Personality picker
- `/home/thomas/Forgerank/src/lib/stores/settingsStore.ts` - Add personality preference

**Personality data structure:**
```typescript
interface Personality {
  id: string;
  name: string;
  description: string;
  tone: 'motivational' | 'funny' | 'stoic' | 'aggressive' | 'friendly';
  prCues: string[];
  rankUpCues: string[];
  streakCues?: string[];
  failureCues?: string[];
}
```

**Default personalities:**

1. **Default ("Coach")**: Balanced, encouraging
   - PR: "Let's GO! New PR baby!"
   - Rank: "You're climbing the ranks! Keep grinding!"

2. **Motivator**: Intense, pushing
   - PR: "THAT'S WHAT I'M TALKING ABOUT! BEAST MODE!"
   - Rank: "You're not stopping here. Next rank!"

3. **Comedian**: Lighthearted, funny
   - PR: "Uh oh, did the weights get lighter or did you get stronger?"
   - Rank: "Look at you, leveling up like it's Pokemon"

4. **Stoic**: Minimal, respectful
   - PR: "New personal record. Acknowledged."
   - Rank: "Progress. Continue."

5. **Hype**: High energy, emoji-heavy
   - PR: "YOOOOOO NEW PR LET'S GOOOO 🔥🔥🔥"
   - Rank: "ANOTHER ONE ANOTHER ONE 💪💪💪"

**Cue selection:**
```typescript
function getCue(personality: Personality, type: 'pr' | 'rankUp'): string {
  const cues = type === 'pr' ? personality.prCues : personality.rankUpCues;
  return cues[Math.floor(Math.random() * cues.length)];
}
```

**Settings storage:**
```typescript
interface SettingsState {
  // ... existing
  selectedPersonalityId: string;
  audioCuesEnabled: boolean;
}
```

**Future expansion:**
- Audio cues (voice packs) in SPEC-021 (future)
- AI-generated personalities in SPEC-022 (future)

## Dependencies

SPEC-014 (PR Detection & Celebration) - For PR cue triggers
SPEC-018 (XP & Level System) - For rank-up triggers

## Estimated Complexity

Simple

---

# Implementation Priority

The recommended implementation order is:

1. **Phase 0: Quality & Stability** (Independent, high value)
   - SPEC-001: Error Boundary Enhancement (P0)
   - SPEC-002: Session Persistence Fix (P0)
   - SPEC-003: Input Validation with Toast Feedback (P1)
   - SPEC-011: P0 Critical Fixes from Code Audit (P0)

2. **Phase 1: Core Workout Experience** (User-facing polish)
   - SPEC-010: Routine-Based Workout Flow (P1)
   - SPEC-012: Set Input Polish (P0)
   - SPEC-013: Rest Timer Enhancement (P0)
   - SPEC-014: PR Detection & Celebration (P0)

3. **Phase 2: Backend Foundation** (Sequential dependencies)
   - SPEC-004: Supabase Project Setup (P1) - COMPLETED
   - SPEC-005: Database Schema Design (P1)
   - SPEC-008: Row Level Security Policies (P1) - COMPLETED

4. **Phase 3: Authentication & Sync** (Depends on Phase 2)
   - SPEC-006: Auth Screens Email/Password (P1)
   - SPEC-007: OAuth Integration (P2)
   - SPEC-015: Cloud Sync Implementation (P1)

5. **Phase 4: Social Features** (Depends on Phase 2)
   - SPEC-016: Friends System Implementation (P1)
   - SPEC-017: Social Feed Implementation (P1)

6. **Phase 5: Gamification & Personality** (User engagement)
   - SPEC-018: XP & Level System (P1)
   - SPEC-019: Streak System (P1)
   - SPEC-020: Gym Buddy Personality System (P0)

7. **Phase 6: Architecture Completion** (Can parallel with Phase 3)
   - SPEC-009: Zustand Migration Complete (P1)

---

# Usage Instructions

To implement a spec using the moAI agent:

```bash
# Use the moai:1-plan command to create a development branch
/moai:1-plan "Implement SPEC-XXX: [Title]"

# Then use moai:2-run to execute the implementation
/moai:2-run SPEC-XXX
```

Each spec is designed to be implementable independently based on its dependencies listed in the "Dependencies" section.

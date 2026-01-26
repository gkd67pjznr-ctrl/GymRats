# Forgerank Fitness App - SPEC Documents

This document contains 10 detailed SPEC sheets for implementing quality improvements, backend integration, and architecture updates for the Forgerank fitness app.

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
**Status:** Pending

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
**Status:** Pending

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

# Implementation Priority

The recommended implementation order is:

1. **Phase 1: Quality & Stability** (Independent, high value)
   - SPEC-001: Error Boundary Enhancement (P0)
   - SPEC-002: Session Persistence Fix (P0)
   - SPEC-003: Input Validation with Toast Feedback (P1)

2. **Phase 2: Backend Foundation** (Sequential dependencies)
   - SPEC-004: Supabase Project Setup (P1)
   - SPEC-005: Database Schema Design (P1)
   - SPEC-008: Row Level Security Policies (P1)

3. **Phase 3: Authentication** (Depends on Phase 2)
   - SPEC-006: Auth Screens Email/Password (P1)
   - SPEC-007: OAuth Integration (P2)

4. **Phase 4: Architecture Completion** (Can parallel with Phase 3)
   - SPEC-009: Zustand Migration Complete (P1)
   - SPEC-010: Routine-Based Workout Flow (P1)

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

# SPEC-TEST-001: AuthStore and Apple OAuth Testing

**Status:** Planned
**Created:** 2025-01-26
**Priority:** High
**Domain:** Testing (Auth)
**Tags:** testing, auth, oauth, apple, zustand, store

---

## Environment

### System Context

Forgerank is a React Native Expo 54 workout tracking app using:
- **Frontend:** React Native 0.81 with TypeScript 5.9
- **State Management:** Zustand with AsyncStorage persistence
- **Authentication:** Supabase Auth (email/password + OAuth)
- **Testing:** Jest with React Native Testing Library

### Current Implementation State

**Fully Implemented:**
- `authStore.ts`: Zustand store for authentication state (349 lines)
- `apple.ts`: Apple OAuth implementation (396 lines)
- Google OAuth tests: `google.test.ts` (219 lines, 85%+ coverage) - EXCELLENT reference pattern

**Missing Tests:**
- authStore tests: No test coverage exists
- Apple OAuth tests: No test coverage exists

### Testing Infrastructure

**Existing Test Configuration:**
```javascript
// jest.config.js
{
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}']
}
```

**Test File Locations:**
- `src/lib/stores/__tests__/authStore.test.ts` (TO BE CREATED)
- `src/lib/auth/__tests__/apple.test.ts` (TO BE CREATED)

---

## Assumptions

### Technical Assumptions

1. **Supabase Client Mock:** Supabase client will be mocked using jest.mock to avoid actual API calls
2. **Expo Modules Mock:** expo-apple-authentication will be mocked for platform-independent testing
3. **Test Environment:** Tests will run in Jest environment with React Native Testing Library

### Business Assumptions

1. **User Behavior:** Users expect sign-up, sign-in, and sign-out to work reliably
2. **OAuth Flow:** Apple Sign In is critical for iOS user acquisition
3. **Error Handling:** Users need clear error messages for authentication failures

### Risk Assessment

**High Risk:**
- No test coverage for auth store could lead to production bugs
- Apple OAuth without tests may fail in production

**Mitigation:**
- Mirror existing Google OAuth test patterns (85%+ coverage)
- Test all error scenarios comprehensively

---

## Requirements

### WHOLE Requirements Overview

The system shall provide comprehensive test coverage for authStore and Apple OAuth to ensure authentication reliability and user data integrity.

### Feature 1: AuthStore Tests (src/lib/stores/__tests__/authStore.test.ts)

#### 1.1 signUp Function Tests

**Event-Driven Requirements:**

**WHEN** user signs up with valid email, password, and display name, **THEN** the system shall create Supabase user, insert to users table, and update store state.

**Test Scenarios:**

1. **Given** valid email, password, and display name
   **WHEN** signUp is called
   **THEN** shall call supabase.auth.signUp with correct parameters
   **AND** shall fetch user profile from users table
   **AND** shall update store with user profile
   **AND** shall set loading to false
   **AND** shall return { success: true }

2. **Given** valid credentials but users table fetch fails
   **WHEN** signUp is called
   **THEN** shall fallback to auth metadata
   **AND** shall update store with basic user info
   **AND** shall return { success: true }

3. **Given** email already exists
   **WHEN** signUp is called
   **THEN** shall set error state with error message
   **AND** shall set loading to false
   **AND** shall return { success: false, error: string }

4. **Given** network error occurs
   **WHEN** signUp is called
   **THEN** shall catch error
   **AND** shall set error state
   **AND** shall return { success: false, error: string }

5. **Given** validation error (invalid email format)
   **WHEN** signUp is called
   **THEN** shall handle Supabase validation error
   **AND** shall set error state
   **AND** shall return { success: false, error: string }

#### 1.2 signIn Function Tests

**Event-Driven Requirements:**

**WHEN** user signs in with valid email and password, **THEN** the system shall authenticate with Supabase and fetch user profile.

**Test Scenarios:**

1. **Given** valid email and password
   **WHEN** signIn is called
   **THEN** shall call supabase.auth.signInWithPassword
   **AND** shall fetch user profile from users table
   **AND** shall update store with user profile and session
   **AND** shall set loading to false
   **AND** shall return { success: true }

2. **Given** invalid credentials
   **WHEN** signIn is called
   **THEN** shall handle invalid credentials error
   **AND** shall set error state
   **AND** shall return { success: false, error: string }

3. **Given** user not found
   **WHEN** signIn is called
   **THEN** shall handle user not found error
   **AND** shall set error state
   **AND** shall return { success: false, error: string }

4. **Given** valid auth but profile fetch fails
   **WHEN** signIn is called
   **THEN** shall fallback to auth metadata
   **AND** shall update store with basic user info
   **AND** shall return { success: true }

#### 1.3 signOut Function Tests

**Event-Driven Requirements:**

**WHEN** user signs out, **THEN** the system shall clear Supabase session and reset store state.

**Test Scenarios:**

1. **Given** user is signed in
   **WHEN** signOut is called
   **THEN** shall call supabase.auth.signOut
   **AND** shall set user to null
   **AND** shall set session to null
   **AND** shall set loading to false
   **AND** shall set error to null

2. **Given** signOut throws error
   **WHEN** signOut is called
   **THEN** shall still clear store state
   **AND** shall complete without throwing

#### 1.4 State Management Tests

**Ubiquitous Requirements:**

The system shall provide clear error state and loading state management.

**Test Scenarios:**

1. **Given** error exists in state
   **WHEN** clearError is called
   **THEN** shall set error to null

2. **Given** store is initialized
   **WHEN** setHydrated is called with true
   **THEN** shall set hydrated to true

3. **Given** loading needs to be set
   **WHEN** setLoading is called with false
   **THEN** shall set loading to false

#### 1.5 Auth State Listener Tests

**Event-Driven Requirements:**

**WHEN** Supabase auth state changes, **THEN** the system shall update store with new session and user profile.

**Test Scenarios:**

1. **Given** setupAuthListener is called
   **WHEN** Supabase emits INITIAL_SESSION event
   **THEN** shall fetch user profile from users table
   **AND** shall update store with user and session
   **AND** shall set hydrated to true
   **AND** shall set loading to false

2. **Given** setupAuthListener is called with callback
   **WHEN** auth state changes
   **THEN** shall call callback with event and session

3. **Given** setupAuthListener returns cleanup
   **WHEN** cleanup is called
   **THEN** shall unsubscribe from auth listener

4. **Given** auth state changes to SIGNED_OUT
   **WHEN** listener receives event
   **THEN** shall set user to null
   **AND** shall set session to null

#### 1.6 Selector and Hook Tests

**Ubiquitous Requirements:**

The system shall provide convenience selectors and hooks for accessing auth state.

**Test Scenarios:**

1. **Given** store has user
   **WHEN** selectUser is called
   **THEN** shall return user object

2. **Given** store has session
   **WHEN** selectSession is called
   **THEN** shall return session object

3. **Given** store is hydrated
   **WHEN** selectIsHydrated is called
   **THEN** shall return true

4. **Given** store is loading
   **WHEN** selectLoading is called
   **THEN** shall return true

5. **Given** store has error
   **WHEN** selectError is called
   **THEN** shall return error string

6. **Given** store has user
   **WHEN** selectIsAuthenticated is called
   **THEN** shall return true

7. **Given** useUser hook is called
   **WHEN** store has user
   **THEN** shall return user profile

8. **Given** useIsAuthenticated hook is called
   **WHEN** store has user
   **THEN** shall return true

#### 1.7 Imperative Getter Tests

**Ubiquitous Requirements:**

The system shall provide imperative getters for non-React code.

**Test Scenarios:**

1. **Given** store has user
   **WHEN** getUser is called
   **THEN** shall return user profile

2. **Given** store has session
   **WHEN** getSession is called
   **THEN** shall return session

3. **Given** store has user
   **WHEN** isAuthenticated is called
   **THEN** shall return true

---

### Feature 2: Apple OAuth Tests (src/lib/auth/__tests__/apple.test.ts)

#### 2.1 Platform Detection Tests

**Event-Driven Requirements:**

**WHEN** checking Apple Sign In availability, **THEN** the system shall detect platform correctly.

**Test Scenarios:**

1. **Given** platform is iOS
   **WHEN** isAppleAuthAvailable is called
   **THEN** shall return true

2. **Given** platform is macOS
   **WHEN** isAppleAuthAvailable is called
   **THEN** shall return true

3. **Given** platform is Android
   **WHEN** isAppleAuthAvailable is called
   **THEN** shall return false

4. **Given** platform is web
   **WHEN** isAppleAuthAvailable is called
   **THEN** shall return true

#### 2.2 useAppleAuth Hook Tests

**Event-Driven Requirements:**

**WHEN** useAppleAuth hook is used, **THEN** the system shall provide signInWithApple function and state.

**Test Scenarios:**

1. **Given** hook is called without options
   **WHEN** useAppleAuth is invoked
   **THEN** shall return object with signInWithApple function
   **AND** shall return isAvailable boolean
   **AND** signInWithApple shall be a function

2. **Given** hook is called with onSuccess callback
   **WHEN** signInWithApple succeeds
   **THEN** shall call onSuccess with user profile

3. **Given** hook is called with onError callback
   **WHEN** signInWithApple fails
   **THEN** shall call onError with error object

#### 2.3 Successful Sign-In Flow Tests

**Event-Driven Requirements:**

**WHEN** user completes Apple Sign In successfully, **THEN** the system shall extract profile and authenticate with Supabase.

**Test Scenarios:**

1. **Given** platform is iOS
   **AND** Apple Sign In is available
   **AND** user grants permission
   **WHEN** signInWithApple is called
   **THEN** shall call AppleAuthentication.signInAsync
   **AND** shall request FULL_NAME and EMAIL scopes
   **AND** shall extract profile from identity token
   **AND** shall call signInWithOAuthToken
   **AND** shall call onSuccess callback
   **AND** shall return { success: true, user: profile }

2. **Given** identity token is valid JWT
   **WHEN** extractAppleProfile is called
   **THEN** shall decode JWT
   **AND** shall extract email from token payload
   **AND** shall return OAuthUserProfile object

3. **Given** credential has full name
   **WHEN** getAppleDisplayName is called
   **THEN** shall combine first and last name
   **AND** shall return full name string

#### 2.4 Error Handling Tests

**Event-Driven Requirements:**

**WHEN** Apple Sign In fails, **THEN** the system shall return appropriate error messages.

**Test Scenarios:**

1. **Given** platform is Android (not supported)
   **WHEN** signInWithApple is called
   **THEN** shall return { success: false, error: { type: 'provider_error', message: string } }
   **AND** shall call onError callback

2. **Given** user cancels sign in
   **WHEN** AppleAuthentication.signInAsync throws ERR_REQUEST_CANCELED
   **THEN** shall return { success: false, error: { type: 'cancelled', message: string } }
   **AND** shall call onError callback

3. **Given** identity token is missing
   **WHEN** Apple Sign In returns credential without identityToken
   **THEN** shall return { success: false, error: { type: 'invalid_token', message: string } }
   **AND** shall call onError callback

4. **Given** identity token is invalid
   **WHEN** extractAppleProfile fails to decode
   **THEN** shall return { success: false, error: { type: 'invalid_token', message: string } }

5. **Given** Supabase auth fails
   **WHEN** signInWithOAuthToken returns error
   **THEN** shall parse OAuth error
   **AND** shall return { success: false, error: OAuthError }
   **AND** shall call onError callback

6. **Given** network error occurs
   **WHEN** AppleAuthentication.signInAsync throws network error
   **THEN** shall parse error with parseOAuthError
   **AND** shall return { success: false, error: OAuthError }

#### 2.5 JWT Decoding Tests

**Event-Driven Requirements:**

**WHEN** decoding Apple identity token, **THEN** the system shall extract user profile correctly.

**Test Scenarios:**

1. **Given** valid JWT with email and name
   **WHEN** extractAppleProfile is called
   **THEN** shall decode base64url-encoded payload
   **AND** shall extract email
   **AND** shall return profile with email and displayName

2. **Given** JWT without email
   **WHEN** extractAppleProfile is called with email parameter
   **THEN** shall use provided email
   **AND** shall return profile with provided email

3. **Given** JWT with name parameter
   **WHEN** extractAppleProfile is called
   **THEN** shall use provided name
   **AND** shall return profile with provided displayName

4. **Given** invalid JWT format
   **WHEN** extractAppleProfile is called
   **THEN** shall return null
   **AND** shall not throw error

#### 2.6 Credential Utilities Tests

**Ubiquitous Requirements:**

The system shall provide utility functions for credential validation and parsing.

**Test Scenarios:**

1. **Given** Apple credential object
   **WHEN** parseAppleCredential is called
   **THEN** shall return parsed AppleCredential object
   **AND** shall include all required fields

2. **Given** credential with LIKELY_REAL status
   **WHEN** isRealUser is called
   **THEN** shall return true

3. **Given** credential with UNKNOWN status
   **WHEN** isRealUser is called
   **THEN** shall return true

4. **Given** credential with UNSUPPORTED status
   **WHEN** isRealUser is called
   **THEN** shall return false

5. **Given** real user status
   **WHEN** getRealUserStatusString is called
   **THEN** shall return human-readable description

6. **Given** credential with email
   **WHEN** hasEmail is called
   **THEN** shall return true

7. **Given** credential without email
   **WHEN** hasEmail is called
   **THEN** shall return false

8. **Given** credential with email and full name
   **WHEN** isFirstSignIn is called
   **THEN** shall return true

9. **Given** credential without email (subsequent sign in)
   **WHEN** isFirstSignIn is called
   **THEN** shall return false

#### 2.7 Error Message Tests

**Ubiquitous Requirements:**

The system shall provide user-friendly error messages for Apple Sign In errors.

**Test Scenarios:**

1. **Given** error with code ERR_REQUEST_CANCELED
   **WHEN** getAppleErrorMessage is called
   **THEN** shall return "Sign in was cancelled."

2. **Given** error with code ERR_REQUEST_NOT_HANDLED
   **WHEN** getAppleErrorMessage is called
   **THEN** shall return "Sign in request was not handled."

3. **Given** error with code ERR_REQUEST_FAILED
   **WHEN** getAppleErrorMessage is called
   **THEN** shall return "Sign in request failed. Please try again."

4. **Given** error with code ERR_REQUEST_RESPONSE
   **WHEN** getAppleErrorMessage is called
   **THEN** shall return "Invalid sign in response."

5. **Given** error with code ERR_REQUEST_UNKNOWN
   **WHEN** getAppleErrorMessage is called
   **THEN** shall return "An unknown error occurred."

6. **Given** error without code
   **WHEN** getAppleErrorMessage is called
   **THEN** shall return error.message or generic message

7. **Given** non-Error object
   **WHEN** getAppleErrorMessage is called
   **THEN** shall return "An unexpected error occurred. Please try again."

---

## Specifications

### Test File Structure

#### authStore.test.ts

**File Location:** `src/lib/stores/__tests__/authStore.test.ts`

**Imports:**
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore, setupAuthListener, useUser, useIsAuthenticated } from '../authStore';
import { supabase } from '../../supabase/client';
```

**Mock Configuration:**
```typescript
jest.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));
```

**Test Groups:**
1. signUp (7 test cases)
2. signIn (5 test cases)
3. signOut (2 test cases)
4. State management (3 test cases)
5. Auth state listener (4 test cases)
6. Selectors and hooks (8 test cases)
7. Imperative getters (3 test cases)

**Total:** 32 test cases

#### apple.test.ts

**File Location:** `src/lib/auth/__tests__/apple.test.ts`

**Imports:**
```typescript
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  isAppleAuthAvailable,
  useAppleAuth,
  parseAppleCredential,
  isRealUser,
  getRealUserStatusString,
  hasEmail,
  isFirstSignIn,
  getAppleDisplayName,
  getAppleErrorMessage,
} from '../apple';
```

**Mock Configuration:**
```typescript
jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(),
  AppleAuthenticationButtonType: { SIGN_IN: 'SIGN_IN' },
  AppleAuthenticationStyle: { BLACK: 'BLACK' },
  AppleAuthenticationScope: { FULL_NAME: 'FULL_NAME', EMAIL: 'EMAIL' },
  AppleAuthenticationRealUserStatus: {
    UNSUPPORTED: 0,
    UNKNOWN: 1,
    LIKELY_REAL: 2,
  },
}));
```

**Test Groups:**
1. Platform detection (4 test cases)
2. useAppleAuth hook (3 test cases)
3. Successful sign-in flow (3 test cases)
4. Error handling (6 test cases)
5. JWT decoding (4 test cases)
6. Credential utilities (9 test cases)
7. Error messages (7 test cases)

**Total:** 36 test cases

### Test Coverage Requirements

**Minimum Coverage Targets:**
- authStore.ts: 85% line coverage
- apple.ts: 85% line coverage
- All branches: 80% coverage
- All functions: 90% coverage

**Exclusions:**
- Type definitions
- Interface declarations
- Export constants

### Mock Strategy

**Supabase Client Mock:**
- Mock all auth methods (signUp, signInWithPassword, signOut, onAuthStateChange)
- Mock database queries (from().select().eq().single())
- Return predictable test data

**Expo Modules Mock:**
- Mock expo-apple-authentication for platform-independent tests
- Mock Platform.OS for platform detection tests
- Simulate success and error scenarios

**Async Storage:**
- Not required for authStore (not persisted)
- Not required for Apple OAuth (runtime only)

---

## Traceability

### TAG Reference

**Primary Domain:** TEST
**Secondary Domain:** AUTH
**Feature:** Testing Implementation

### Related Files

**Implementation Files:**
- `src/lib/stores/authStore.ts` (349 lines)
- `src/lib/auth/apple.ts` (396 lines)
- `src/lib/auth/oauth.ts` (shared OAuth utilities)

**Test Files (To Create):**
- `src/lib/stores/__tests__/authStore.test.ts`
- `src/lib/auth/__tests__/apple.test.ts`

**Reference Tests:**
- `src/lib/auth/__tests__/google.test.ts` (219 lines, EXCELLENT pattern)

### Dependencies

**Supabase:**
- Client: `@supabase/supabase-js`
- Types: Database user types

**Expo:**
- Apple Auth: `expo-apple-authentication`
- Core: `expo-constants`

**Testing:**
- Jest: `jest-expo`
- RNTL: `@testing-library/react-native`

### Success Metrics

**Quantitative:**
- 68 test cases total (32 for authStore, 36 for Apple)
- 85%+ code coverage
- Zero linter warnings
- All tests pass in under 30 seconds

**Qualitative:**
- Clear test descriptions
- Comprehensive error scenarios
- Proper mock isolation
- Follows existing test patterns

---

## Definition of Done

A test suite is considered complete when:

1. **All Test Scenarios Pass:** Every test scenario in this SPEC passes
2. **Coverage Targets Met:** 85%+ line coverage for both files
3. **No Linter Warnings:** `npm run lint` passes without warnings
4. **TypeScript Compile:** No TypeScript errors
5. **Pattern Consistency:** Follows google.test.ts structure
6. **Mock Isolation:** Each test properly mocks and clears mocks
7. **Async Handling:** All async operations properly awaited
8. **Error Scenarios:** All error paths tested
9. **Documentation:** Complex tests have explanatory comments
10. **PR Ready:** Code review ready with clear diff

---

## References

**Project Documentation:**
- `CLAUDE.md` - Project overview and testing guidelines
- `jest.config.js` - Jest configuration

**External Documentation:**
- Jest: https://jestjs.io/docs/getting-started
- React Native Testing Library: https://callstack.github.io/react-native-testing-library/
- Supabase Auth: https://supabase.com/docs/guides/auth
- Expo Apple Authentication: https://docs.expo.dev/versions/latest/sdk/apple-authentication/

**Internal Reference:**
- `google.test.ts` - EXCELLENT test pattern (219 lines, 85%+ coverage)

---

**END OF SPEC**

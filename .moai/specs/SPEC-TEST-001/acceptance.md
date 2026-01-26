# Acceptance Criteria: SPEC-TEST-001

**SPEC ID:** SPEC-TEST-001
**Title:** AuthStore and Apple OAuth Testing
**Status:** Planned
**Created:** 2025-01-26

---

## Overview

This document defines detailed acceptance criteria for comprehensive test coverage of authStore and Apple OAuth functionality. All criteria use Given-When-Then format for clarity and testability.

---

## Feature 1: AuthStore Tests

### Test Suite 1.1: signUp Function

**Acceptance Criteria:**

**AC-1.1.1:** Successful User Registration
```gherkin
Given the authStore is initialized
And Supabase auth.signUp mock returns valid user data
And users table query returns valid profile
When user calls signUp with valid email, password, and displayName
Then store shall contain user profile with correct email
And store shall contain session object
And loading shall be false
And error shall be null
And signUp shall return { success: true }
```

**AC-1.1.2:** Registration with Profile Fetch Failure
```gherkin
Given the authStore is initialized
And Supabase auth.signUp mock returns valid user data
And users table query returns error
When user calls signUp with valid credentials
Then store shall contain user profile from auth metadata
And store shall contain session object
And loading shall be false
And signUp shall return { success: true }
```

**AC-1.1.3:** Registration with Existing Email
```gherkin
Given the authStore is initialized
And Supabase auth.signUp mock returns error
And error message is "Email already exists"
When user calls signUp with existing email
Then store shall not contain user
And error shall be "Email already exists"
And loading shall be false
And signUp shall return { success: false, error: "Email already exists" }
```

**AC-1.1.4:** Registration with Network Error
```gherkin
Given the authStore is initialized
And Supabase auth.signUp mock throws network error
When user calls signUp with valid credentials
Then store shall not contain user
And error shall contain error message
And loading shall be false
And signUp shall return { success: false, error: string }
```

**AC-1.1.5:** Registration with Invalid Email Format
```gherkin
Given the authStore is initialized
And Supabase auth.signUp mock returns validation error
When user calls signUp with invalid email
Then error shall be set with validation message
And loading shall be false
And signUp shall return { success: false, error: string }
```

**AC-1.1.6:** Loading State During Registration
```gherkin
Given the authStore is initialized
When user calls signUp
Then loading shall be set to true immediately
And loading shall be set to false after completion
```

**AC-1.1.7:** signUp Parameters Passed Correctly
```gherkin
Given the authStore is initialized
When user calls signUp("test@test.com", "password123", "Test User")
Then Supabase auth.signUp shall be called with:
  - email: "test@test.com"
  - password: "password123"
  - options.data.display_name: "Test User"
```

---

### Test Suite 1.2: signIn Function

**Acceptance Criteria:**

**AC-1.2.1:** Successful User Authentication
```gherkin
Given the authStore is initialized
And Supabase auth.signInWithPassword mock returns valid session
And users table query returns valid profile
When user calls signIn with valid email and password
Then store shall contain user profile
And store shall contain session object
And loading shall be false
And error shall be null
And signIn shall return { success: true }
```

**AC-1.2.2:** Authentication with Invalid Credentials
```gherkin
Given the authStore is initialized
And Supabase auth.signInWithPassword mock returns invalid credentials error
When user calls signIn with wrong password
Then store shall not contain user
And error shall contain "Invalid login credentials"
And loading shall be false
And signIn shall return { success: false, error: string }
```

**AC-1.2.3:** Authentication with Non-Existent User
```gherkin
Given the authStore is initialized
And Supabase auth.signInWithPassword mock returns user not found error
When user calls signIn with non-existent email
Then store shall not contain user
And error shall contain error message
And loading shall be false
And signIn shall return { success: false, error: string }
```

**AC-1.2.4:** Authentication with Profile Fetch Failure
```gherkin
Given the authStore is initialized
And Supabase auth.signInWithPassword mock returns valid session
And users table query returns error
When user calls signIn with valid credentials
Then store shall contain user from auth metadata
And store shall contain session object
And signIn shall return { success: true }
```

**AC-1.2.5:** Loading State During Authentication
```gherkin
Given the authStore is initialized
When user calls signIn
Then loading shall be set to true immediately
And loading shall be set to false after completion
```

---

### Test Suite 1.3: signOut Function

**Acceptance Criteria:**

**AC-1.3.1:** Successful Sign Out
```gherkin
Given the authStore has authenticated user
And store contains session object
When user calls signOut
Then Supabase auth.signOut shall be called
And store.user shall be null
And store.session shall be null
And loading shall be false
And error shall be null
```

**AC-1.3.2:** Sign Out with Supabase Error
```gherkin
Given the authStore has authenticated user
And Supabase auth.signOut throws error
When user calls signOut
Then store.user shall be null (still cleared)
And store.session shall be null (still cleared)
And signOut shall complete without throwing
```

---

### Test Suite 1.4: State Management

**Acceptance Criteria:**

**AC-1.4.1:** Clear Error State
```gherkin
Given the authStore has error state set
When user calls clearError
Then error shall be null
```

**AC-1.4.2:** Set Hydrated State
```gherkin
Given the authStore is initialized
And hydrated is false
When user calls setHydrated(true)
Then hydrated shall be true
```

**AC-1.4.3:** Set Loading State
```gherkin
Given the authStore is initialized
When user calls setLoading(false)
Then loading shall be false
```

---

### Test Suite 1.5: Auth State Listener

**Acceptance Criteria:**

**AC-1.5.1:** Initial Session Event
```gherkin
Given setupAuthListener is called
And Supabase emits INITIAL_SESSION event with session
When listener receives event
Then store.user shall be populated from users table
And store.session shall contain session object
And store.hydrated shall be true
And store.loading shall be false
```

**AC-1.5.2:** Signed In Event
```gherkin
Given setupAuthListener is called
And Supabase emits SIGNED_IN event with session
When listener receives event
Then store.user shall be populated
And store.session shall be updated
```

**AC-1.5.3:** Signed Out Event
```gherkin
Given setupAuthListener is called
And store has authenticated user
And Supabase emits SIGNED_OUT event
When listener receives event
Then store.user shall be null
And store.session shall be null
```

**AC-1.5.4:** Listener Cleanup
```gherkin
Given setupAuthListener is called
And returns cleanup function
When cleanup function is called
Then auth listener shall be unsubscribed
```

---

### Test Suite 1.6: Selectors and Hooks

**Acceptance Criteria:**

**AC-1.6.1:** selectUser Selector
```gherkin
Given store contains user profile
When selectUser is called with state
Then shall return user profile object
```

**AC-1.6.2:** selectSession Selector
```gherkin
Given store contains session
When selectSession is called with state
Then shall return session object
```

**AC-1.6.3:** selectIsHydrated Selector
```gherkin
Given store hydrated state is true
When selectIsHydrated is called with state
Then shall return true
```

**AC-1.6.4:** selectLoading Selector
```gherkin
Given store loading state is true
When selectLoading is called with state
Then shall return true
```

**AC-1.6.5:** selectError Selector
```gherkin
Given store contains error
When selectError is called with state
Then shall return error string
```

**AC-1.6.6:** selectIsAuthenticated Selector
```gherkin
Given store contains user
When selectIsAuthenticated is called with state
Then shall return true
```

**AC-1.6.7:** useUser Hook
```gherkin
Given renderHook wraps useUser
And store contains user profile
When hook is rendered
Then shall return user profile
```

**AC-1.6.8:** useIsAuthenticated Hook
```gherkin
Given renderHook wraps useIsAuthenticated
And store contains user
When hook is rendered
Then shall return true
```

---

### Test Suite 1.7: Imperative Getters

**Acceptance Criteria:**

**AC-1.7.1:** getUser Imperative Getter
```gherkin
Given store contains user profile
When getUser is called
Then shall return user profile
```

**AC-1.7.2:** getSession Imperative Getter
```gherkin
Given store contains session
When getSession is called
Then shall return session object
```

**AC-1.7.3:** isAuthenticated Imperative Getter
```gherkin
Given store contains user
When isAuthenticated is called
Then shall return true
```

---

## Feature 2: Apple OAuth Tests

### Test Suite 2.1: Platform Detection

**Acceptance Criteria:**

**AC-2.1.1:** iOS Platform Availability
```gherkin
Given platform is iOS
When isAppleAuthAvailable is called
Then shall return true
```

**AC-2.1.2:** macOS Platform Availability
```gherkin
Given platform is macOS
When isAppleAuthAvailable is called
Then shall return true
```

**AC-2.1.3:** Android Platform Unavailability
```gherkin
Given platform is Android
When isAppleAuthAvailable is called
Then shall return false
```

**AC-2.1.4:** Web Platform Availability
```gherkin
Given platform is web
When isAppleAuthAvailable is called
Then shall return true
```

---

### Test Suite 2.2: useAppleAuth Hook

**Acceptance Criteria:**

**AC-2.2.1:** Hook Returns Correct Interface
```gherkin
Given useAppleAuth hook is called
When hook is rendered
Then shall return object with:
  - signInWithApple function
  - isAvailable boolean
```

**AC-2.2.2:** Success Callback Invocation
```gherkin
Given useAppleAuth is called with onSuccess callback
And Apple Sign In succeeds
When signInWithApple is called
Then onSuccess shall be called with user profile
```

**AC-2.2.3:** Error Callback Invocation
```gherkin
Given useAppleAuth is called with onError callback
And Apple Sign In fails
When signInWithApple is called
Then onError shall be called with error object
```

---

### Test Suite 2.3: Successful Sign-In Flow

**Acceptance Criteria:**

**AC-2.3.1:** Complete Sign-In Flow
```gherkin
Given platform is iOS
And Apple Sign In is available
And user grants permission
When signInWithApple is called
Then AppleAuthentication.signInAsync shall be called with:
  - requestedScopes: [FULL_NAME, EMAIL]
And identity token shall be extracted
And profile shall be extracted from token
And signInWithOAuthToken shall be called
And onSuccess callback shall be invoked
And shall return { success: true, user: profile }
```

**AC-2.3.2:** JWT Profile Extraction
```gherkin
Given valid JWT identity token
And token contains email in payload
When extractAppleProfile is called
Then shall decode JWT payload
And shall extract email from payload
And shall return OAuthUserProfile with email
```

**AC-2.3.3:** Display Name from Full Name
```gherkin
Given Apple full name object with givenName and familyName
When getAppleDisplayName is called
Then shall combine first and last name
And shall return trimmed full name string
```

---

### Test Suite 2.4: Error Handling

**Acceptance Criteria:**

**AC-2.4.1:** Unsupported Platform Error
```gherkin
Given platform is Android
When signInWithApple is called
Then shall return { success: false, error: { type: 'provider_error' } }
And onError callback shall be invoked
```

**AC-2.4.2:** User Cancellation Error
```gherkin
Given AppleAuthentication.signInAsync throws ERR_REQUEST_CANCELED
When signInWithApple is called
Then shall return { success: false, error: { type: 'cancelled' } }
And error message shall be "Sign in was cancelled"
```

**AC-2.4.3:** Missing Identity Token Error
```gherkin
Given Apple Sign In returns credential without identityToken
When signInWithApple is called
Then shall return { success: false, error: { type: 'invalid_token' } }
And error message shall mention missing token
```

**AC-2.4.4:** Invalid Identity Token Error
```gherkin
Given identity token is malformed
And extractAppleProfile returns null
When signInWithApple is called
Then shall return { success: false, error: { type: 'invalid_token' } }
```

**AC-2.4.5:** Supabase Auth Error
```gherkin
Given Apple Sign In succeeds
And signInWithOAuthToken returns error
When signInWithApple is called
Then shall parse OAuth error
And shall return { success: false, error: OAuthError }
```

**AC-2.4.6:** Network Error
```gherkin
Given AppleAuthentication.signInAsync throws network error
When signInWithApple is called
Then shall parse error with parseOAuthError
And shall return { success: false, error: OAuthError }
```

---

### Test Suite 2.5: JWT Decoding

**Acceptance Criteria:**

**AC-2.5.1:** Valid JWT with Email
```gherkin
Given valid JWT with email in payload
When extractAppleProfile is called
Then shall decode base64url payload
And shall extract email
And shall return profile with email
```

**AC-2.5.2:** JWT without Email
```gherkin
Given JWT without email in payload
And email parameter is provided
When extractAppleProfile is called with email parameter
Then shall use provided email
And shall return profile with provided email
```

**AC-2.5.3:** JWT with Name Parameter
```gherkin
Given JWT payload
And name parameter is provided
When extractAppleProfile is called
Then shall use provided name as displayName
```

**AC-2.5.4:** Invalid JWT Format
```gherkin
Given invalid JWT string
When extractAppleProfile is called
Then shall return null
And shall not throw error
```

---

### Test Suite 2.6: Credential Utilities

**Acceptance Criteria:**

**AC-2.6.1:** Parse Apple Credential
```gherkin
Given AppleAuthenticationCredential object
When parseAppleCredential is called
Then shall return AppleCredential with:
  - user string
  - email string or null
  - fullName object or null
  - authorizationCode string or null
  - identityToken string or null
  - realUserStatus enum value
```

**AC-2.6.2:** Real User Detection - Likely Real
```gherkin
Given credential with realUserStatus LIKELY_REAL
When isRealUser is called
Then shall return true
```

**AC-2.6.3:** Real User Detection - Unknown
```gherkin
Given credential with realUserStatus UNKNOWN
When isRealUser is called
Then shall return true
```

**AC-2.6.4:** Real User Detection - Unsupported
```gherkin
Given credential with realUserStatus UNSUPPORTED
When isRealUser is called
Then shall return false
```

**AC-2.6.5:** Real User Status String
```gherkin
Given realUserStatus enum value
When getRealUserStatusString is called
Then shall return human-readable description
```

**AC-2.6.6:** Has Email Detection
```gherkin
Given credential with email property set
When hasEmail is called
Then shall return true
```

**AC-2.6.7:** No Email Detection
```gherkin
Given credential with email property null
When hasEmail is called
Then shall return false
```

**AC-2.6.8:** First Sign In Detection
```gherkin
Given credential with email and fullName
When isFirstSignIn is called
Then shall return true
```

**AC-2.6.9:** Subsequent Sign In Detection
```gherkin
Given credential without email
When isFirstSignIn is called
Then shall return false
```

---

### Test Suite 2.7: Error Messages

**Acceptance Criteria:**

**AC-2.7.1:** Cancellation Message
```gherkin
Given Error with code ERR_REQUEST_CANCELED
When getAppleErrorMessage is called
Then shall return "Sign in was cancelled."
```

**AC-2.7.2:** Not Handled Message
```gherkin
Given Error with code ERR_REQUEST_NOT_HANDLED
When getAppleErrorMessage is called
Then shall return "Sign in request was not handled."
```

**AC-2.7.3:** Failed Message
```gherkin
Given Error with code ERR_REQUEST_FAILED
When getAppleErrorMessage is called
Then shall return "Sign in request failed. Please try again."
```

**AC-2.7.4:** Invalid Response Message
```gherkin
Given Error with code ERR_REQUEST_RESPONSE
When getAppleErrorMessage is called
Then shall return "Invalid sign in response."
```

**AC-2.7.5:** Unknown Message
```gherkin
Given Error with code ERR_REQUEST_UNKNOWN
When getAppleErrorMessage is called
Then shall return "An unknown error occurred."
```

**AC-2.7.6:** Generic Error Message
```gherkin
Given Error without code
And Error has message property
When getAppleErrorMessage is called
Then shall return error.message or generic message
```

**AC-2.7.7:** Non-Error Object
```gherkin
Given non-Error object
When getAppleErrorMessage is called
Then shall return "An unexpected error occurred. Please try again."
```

---

## Quality Gates

### Gate 1: All Tests Pass
```gherkin
Given all acceptance criteria are implemented
When test suite is executed
Then all 68 tests shall pass
And zero tests shall fail
And zero tests shall be skipped
```

### Gate 2: Coverage Targets Met
```gherkin
Given test suite passes all tests
When coverage report is generated
Then authStore.ts shall have 85%+ line coverage
And apple.ts shall have 85%+ line coverage
And combined coverage shall be 85%+
```

### Gate 3: No Quality Issues
```gherkin
Given test suite passes
When npm run lint is executed
Then zero warnings shall be reported
And TypeScript compilation shall succeed
```

### Gate 4: Performance Standards
```gherkin
Given test suite is ready
When npm test is executed
Then all tests shall complete in under 30 seconds
And no memory leaks shall be detected
```

---

## Definition of Done

A test scenario is considered complete when:

1. **Test Written:** Test code exists and follows patterns
2. **Test Passes:** Test execution passes consistently
3. **No Side Effects:** Test cleans up mocks properly
4. **Clear Description:** Test name clearly describes scenario
5. **Assertions Verify:** Test assertions verify expected behavior
6. **Edge Cases Covered:** Error paths and edge cases tested

---

## Test Execution Commands

**Run All Tests:**
```bash
npm test
```

**Run Specific Test File:**
```bash
npm test -- authStore
npm test -- apple
```

**Run with Coverage:**
```bash
npm run test:coverage
```

**Run in Watch Mode:**
```bash
npm run test:watch
```

---

## Verification Checklist

Before marking SPEC as complete, verify:

- [ ] All 68 test cases pass
- [ ] Coverage report shows 85%+ for both files
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tests follow google.test.ts pattern
- [ ] All mocks properly cleared in afterEach
- [ ] Async operations properly handled with act()
- [ ] Error scenarios comprehensively tested
- [ ] Platform detection tests work
- [ ] JWT decoding handles edge cases

---

**END OF ACCEPTANCE CRITERIA**

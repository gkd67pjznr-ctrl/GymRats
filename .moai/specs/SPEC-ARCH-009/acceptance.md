# Acceptance Criteria: SPEC-ARCH-009 - Zustand Migration (Complete)

**TAG**: SPEC-ARCH-009

---

## Overview

This document defines the acceptance criteria for completing the Zustand migration. Each criterion includes Gherkin-format scenarios for verification.

---

## Functional Acceptance Criteria

### AC-1: workoutStore Uses createQueuedJSONStorage

**GIVEN** the workoutStore is configured with Zustand persist middleware
**WHEN** the store is initialized
**THEN** it **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence

**Scenarios**:

```gherkin
Scenario: workoutStore initializes with createQueuedJSONStorage
  Given the workoutStore is imported
  When the store is created
  Then the storage adapter is createQueuedJSONStorage
  And the storage key is "workoutSessions.v2"

Scenario: workoutStore persists sessions across app closes
  Given a user has completed a workout session
  And the session is saved to workoutStore
  When the app is closed and reopened
  Then the session is available in the store
  And the session data is intact

Scenario: workoutStore handles rapid state updates
  Given a user is logging multiple sets rapidly
  When sets are added to the session in quick succession
  Then all sets are persisted correctly
  And no race conditions occur
```

---

### AC-2: settingsStore Uses createQueuedJSONStorage

**GIVEN** the settingsStore is configured with Zustand persist middleware
**WHEN** the store is initialized
**THEN** it **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence

**Scenarios**:

```gherkin
Scenario: settingsStore initializes with createQueuedJSONStorage
  Given the settingsStore is imported
  When the store is created
  Then the storage adapter is createQueuedJSONStorage
  And the storage key is "forgerank.settings.v2"

Scenario: settingsStore persists user preferences
  Given a user changes the unit system from "lb" to "kg"
  And the setting is saved to settingsStore
  When the app is closed and reopened
  Then the unit system is "kg"
  And all other settings are preserved

Scenario: settingsStore applies default values on first launch
  Given the app is launched for the first time
  When settingsStore is initialized
  Then hapticsEnabled is true
  And soundsEnabled is true
  And unitSystem is "lb"
  And defaultRestSeconds is 90
```

---

### AC-3: routinesStore Uses createQueuedJSONStorage

**GIVEN** the routinesStore is configured with Zustand persist middleware
**WHEN** the store is initialized
**THEN** it **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence

**Scenarios**:

```gherkin
Scenario: routinesStore initializes with createQueuedJSONStorage
  Given the routinesStore is imported
  When the store is created
  Then the storage adapter is createQueuedJSONStorage
  And the storage key is "routines.v2"

Scenario: routinesStore persists user routines
  Given a user creates a new routine
  And the routine is saved to routinesStore
  When the app is closed and reopened
  Then the routine is available in the store
  And the routine data is intact

Scenario: routinesStore handles upsert and delete
  Given a user has a routine named "Push Day"
  When the user updates the routine
  Then the routine is updated in the store
  When the user deletes the routine
  Then the routine is removed from the store
  And the change persists across app closes
```

---

### AC-4: friendsStore Uses createQueuedJSONStorage

**GIVEN** the friendsStore is configured with Zustand persist middleware
**WHEN** the store is initialized
**THEN** it **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence

**Scenarios**:

```gherkin
Scenario: friendsStore initializes with createQueuedJSONStorage
  Given the friendsStore is imported
  When the store is created
  Then the storage adapter is createQueuedJSONStorage
  And the storage key is "friends.v2"

Scenario: friendsStore migrates V1 data
  Given a user has existing friend data in "friends.v1"
  When the store is hydrated
  Then V1 data is migrated to V2
  And "friends.v1" is removed from AsyncStorage

Scenario: friendsStore persists friend relationships
  Given a user sends a friend request to another user
  And the request is saved to friendsStore
  When the app is closed and reopened
  Then the friend request is visible
  And the status is "requested" for sender
  And the status is "pending" for recipient

Scenario: friendsStore seeds mock data for new users
  Given the app is launched for the first time
  When friendsStore is hydrated
  Then mock friend edges are created
  And the user has demo friends, requests, and blocked users
```

---

### AC-5: socialStore Uses createQueuedJSONStorage

**GIVEN** the socialStore is configured with Zustand persist middleware
**WHEN** the store is initialized
**THEN** it **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence

**Scenarios**:

```gherkin
Scenario: socialStore initializes with createQueuedJSONStorage
  Given the socialStore is imported
  When the store is created
  Then the storage adapter is createQueuedJSONStorage
  And the storage key is "social.v2"

Scenario: socialStore persists posts, reactions, and comments
  Given a user creates a post
  And another user reacts to the post
  And a third user comments on the post
  When the app is closed and reopened
  Then the post is visible
  And the reaction is visible
  And the comment is visible

Scenario: socialStore seeds mock data for new users
  Given the app is launched for the first time
  When socialStore is hydrated
  Then mock posts are created
  And mock reactions are created
  And mock comments are created
```

---

### AC-6: feedStore Uses createQueuedJSONStorage

**GIVEN** the feedStore is configured with Zustand persist middleware
**WHEN** the store is initialized
**THEN** it **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence

**Scenarios**:

```gherkin
Scenario: feedStore initializes with createQueuedJSONStorage
  Given the feedStore is imported
  When the store is created
  Then the storage adapter is createQueuedJSONStorage
  And the storage key is "feed.v2"

Scenario: feedStore persists posts and likes
  Given a user creates a feed post
  And another user likes the post
  When the app is closed and reopened
  Then the post is visible in the feed
  And the like is visible

Scenario: feedStore enforces visibility rules
  Given a user has a friends-only post
  When a non-friend views the feed
  Then the friends-only post is not visible
  Given a user has a public post
  When any user views the feed
  Then the public post is visible
```

---

### AC-7: chatStore Uses createQueuedJSONStorage

**GIVEN** the chatStore is configured with Zustand persist middleware
**WHEN** the store is initialized
**THEN** it **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence

**Scenarios**:

```gherkin
Scenario: chatStore initializes with createQueuedJSONStorage
  Given the chatStore is imported
  When the store is created
  Then the storage adapter is createQueuedJSONStorage
  And the storage key is "chat.v2"

Scenario: chatStore persists threads and messages
  Given a user has a chat thread with messages
  When the app is closed and reopened
  Then the thread is visible
  And all messages are visible
  And read state is preserved

Scenario: chatStore handles ephemeral typing state
  Given a user is typing in a chat
  When the typing indicator is shown
  Then the typing state is NOT persisted to AsyncStorage
  And the indicator clears after TTL expires
```

---

### AC-8: workoutPlanStore Migrated to Zustand

**GIVEN** the workoutPlanStore was previously a custom implementation
**WHEN** it is migrated to Zustand
**THEN** it **SHALL** use Zustand with `createQueuedJSONStorage()` for persistence

**Scenarios**:

```gherkin
Scenario: workoutPlanStore is a Zustand store
  Given the workoutPlanStore is imported
  When the store is inspected
  Then it uses Zustand create function
  And it uses persist middleware
  And it uses createQueuedJSONStorage
  And the storage key is "currentPlan.v2"

Scenario: workoutPlanStore persists current plan
  Given a user has selected a workout plan
  When the app is closed and reopened
  Then the workout plan is still selected
  And all plan data is intact

Scenario: workoutPlanStore API is preserved
  Given the old workoutPlanStore API
  When functions are called
  Then setCurrentPlan works correctly
  And getCurrentPlan works correctly
  And updateCurrentPlan works correctly
  And clearCurrentPlan works correctly
  And useCurrentPlan hook works correctly

Scenario: workoutPlanStore migrates V1 data
  Given a user has existing plan data in "currentPlan.v1"
  When the store is hydrated
  Then V1 data is migrated to V2
  And "currentPlan.v1" is removed from AsyncStorage
```

---

## Non-Functional Acceptance Criteria

### AC-NFR-1: All Stores Use Zustand

**GIVEN** the codebase has module-level state management
**WHEN** all stores are inspected
**THEN** all stores **SHALL** use Zustand as the state management library

**Verification**:
```bash
# Verify no non-Zustand state management remains
find src/lib -name "*Store.ts" -not -path "*/stores/*" -not -path "*/_old/*"
# Expected: Only re-export files (workoutPlanStore.ts, friendsStore.ts, etc.)

# Verify all stores in src/lib/stores/ use Zustand
grep -r "create<" src/lib/stores/
# Expected: All store files use Zustand create function
```

---

### AC-NFR-2: Test Coverage >85%

**GIVEN** all stores are implemented
**WHEN** test coverage is measured
**THEN** each store **SHALL** have >85% test coverage

**Verification**:
```bash
# Run coverage tests
npm run test:coverage

# Check coverage for each store
# Expected: Each store in src/lib/stores/ shows >85% coverage
```

**Minimum Coverage by Store**:
- currentSessionStore: 90%+ (already high)
- workoutStore: 85%+
- settingsStore: 85%+
- routinesStore: 85%+
- authStore: 85%+
- friendsStore: 85%+
- socialStore: 85%+
- feedStore: 85%+
- chatStore: 85%+
- workoutPlanStore: 85%+

---

### AC-NFR-3: No Data Loss During Migration

**GIVEN** a user has existing data in AsyncStorage
**WHEN** the app is upgraded with the new stores
**THEN** all existing data **SHALL** be preserved

**Verification**:
1. Set up test device with V1 data
2. Upgrade app with new stores
3. Verify all data is migrated correctly
4. Verify no data is lost or corrupted

**Test Data to Verify**:
- Workout sessions
- User settings
- User routines
- Friend relationships
- Social posts, reactions, comments
- Feed posts and likes
- Chat threads and messages
- Current workout plan

---

### AC-NFR-4: Performance - No UI Blocking

**GIVEN** the app is using the migrated stores
**WHEN** rapid state updates occur
**THEN** the UI **SHALL** remain responsive

**Verification**:
1. Log multiple workout sets rapidly (10+ sets in 10 seconds)
2. Toggle settings quickly
3. Send multiple chat messages rapidly
4. Verify no ANR (Application Not Responding) warnings
5. Verify UI remains smooth (60fps target)

---

### AC-NFR-5: Type Safety - No TypeScript Errors

**GIVEN** all stores are implemented
**WHEN** TypeScript is compiled
**THEN** no TypeScript errors **SHALL** occur

**Verification**:
```bash
# Run TypeScript compiler
npx tsc --noEmit

# Expected: No errors
```

**Type Safety Checks**:
- All state interfaces are exported
- All actions are typed
- No `any` types in store implementations
- Selectors are typed functions
- Hooks return correct types

---

## Quality Gates

### Pre-Integration Gates

Before marking this SPEC as complete, the following must be verified:

1. **All FRs Implemented**: All 8 functional requirements are implemented
2. **All NFRs Met**: All 5 non-functional requirements are satisfied
3. **Tests Pass**: All tests pass with >85% coverage
4. **TypeScript Clean**: No TypeScript errors
5. **No Data Loss**: Migration logic preserves all existing data
6. **Performance Verified**: No UI blocking or ANRs

---

### Definition of Done

This SPEC is considered complete when:

1. **Code**:
   - [ ] All stores use `createQueuedJSONStorage()`
   - [ ] workoutPlanStore is migrated to Zustand
   - [ ] Re-exports are in place for backward compatibility
   - [ ] No non-Zustand state management remains

2. **Testing**:
   - [ ] All stores have test files
   - [ ] All tests pass
   - [ ] Coverage is >85% for each store
   - [ ] Migration logic is tested

3. **Quality**:
   - [ ] No TypeScript errors
   - [ ] No ESLint warnings
   - [ ] No performance issues
   - [ ] No data loss in migration

4. **Documentation**:
   - [ ] CLAUDE.md is updated
   - [ ] Code is well-commented
   - [ ] Migration notes are documented

---

## Test Scenarios Summary

| Store | Persistence Test | Migration Test | API Test | Edge Cases |
|-------|------------------|----------------|----------|------------|
| workoutStore | ✅ | ✅ | ✅ | ✅ |
| settingsStore | ✅ | ✅ | ✅ | ✅ |
| routinesStore | ✅ | ✅ | ✅ | ✅ |
| friendsStore | ✅ | ✅ (V1→V2) | ✅ | ✅ |
| socialStore | ✅ | ✅ (V1→V2) | ✅ | ✅ |
| feedStore | ✅ | ✅ (V1→V2) | ✅ | ✅ |
| chatStore | ✅ | ✅ (V1→V2) | ✅ | ✅ (typing) |
| workoutPlanStore | ✅ | ✅ (V1→V2) | ✅ | ✅ |

---

## Verification Methods

### Automated Verification

1. **Unit Tests**: `npm test` - Verify each store in isolation
2. **Coverage Tests**: `npm run test:coverage` - Verify >85% coverage
3. **TypeScript Check**: `npx tsc --noEmit` - Verify no type errors
4. **Linting**: `npm run lint` - Verify code quality

### Manual Verification

1. **Data Migration Test**:
   - Install old version of app
   - Create test data (workouts, settings, routines, social data)
   - Upgrade to new version
   - Verify all data is present

2. **Performance Test**:
   - Log 10+ workout sets rapidly
   - Toggle settings quickly
   - Send multiple chat messages
   - Verify UI remains responsive

3. **Integration Test**:
   - Complete full workout flow
   - Create and edit routines
   - Interact with social features
   - Verify all state persists correctly

---

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Stores Migrated | 8/8 | Code inspection |
| Test Coverage | >85% | Coverage report |
| TypeScript Errors | 0 | `tsc --noEmit` |
| Data Loss Incidents | 0 | Manual testing |
| Performance Issues | 0 | Manual testing |
| ESLint Warnings | 0 | `npm run lint` |

---

**Acceptance Version**: 1.0.0
**Last Updated**: 2025-01-26

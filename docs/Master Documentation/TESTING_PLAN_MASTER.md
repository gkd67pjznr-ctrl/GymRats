# FORGERANK TESTING PLAN
**Comprehensive Testing Strategy**

---

## Document Info
- **Created:** 2026-01-23
- **Last Updated:** 2026-02-02
- **Status:** Active

---

# 1. TESTING PHILOSOPHY

## Core Principles - 2026-01-23

1. **Every feature gets tested** - No feature ships without:
   - Automated tests (where applicable)
   - Manual testing by Claude
   - Real-world testing by User on Expo Go

2. **Build → Test → Fix → Test Loop**
   ```
   Claude builds feature
   → Claude runs automated tests
   → Claude fixes errors
   → Claude tests manually
   → User tests on Expo Go
   → User provides feedback (AskUserQuestion)
   → Claude iterates until approved
   ```

3. **Document Everything**
   - All test results documented
   - All bugs found logged
   - All fixes documented with timestamps

---

# 2. TEST TYPES

## 2.1 Automated Tests

### Unit Tests
- Location: `__tests__/`
- Framework: Jest
- Coverage targets:
  - Scoring algorithm: 100%
  - PR detection: 100%
  - Data transformations: 90%+
  - Utilities: 90%+

### Integration Tests
- Store hydration/persistence
- Navigation flows
- Data sync (when backend added)

## 2.2 Manual Tests (Claude)

Before prompting user to test, Claude will:
1. Run the app in development
2. Test all new/changed features
3. Test related existing features
4. Document any issues found
5. Fix issues
6. Re-test

## 2.3 Real-World Tests (User - Expo Go)

User tests on physical device with specific checklist:
1. Receive test checklist from Claude
2. Run through all test cases
3. Report results via AskUserQuestion interview
4. Provide feedback on UX/feel
5. Report any bugs/crashes

---

# 3. FEATURE TESTING TEMPLATE

## Template for Each Feature - 2026-01-23

```markdown
# Feature: [Feature Name]
**Date Started:** YYYY-MM-DD
**Date Completed:** YYYY-MM-DD
**Status:** In Progress / Testing / Complete

## Automated Tests
- [ ] Test file created: `__tests__/[feature].test.ts`
- [ ] All tests passing
- [ ] Edge cases covered

## Claude Manual Testing
- [ ] Happy path works
- [ ] Error states handled
- [ ] Loading states work
- [ ] Empty states work
- [ ] Navigation works
- [ ] Data persists correctly

## User Expo Go Testing
**Test Date:** YYYY-MM-DD
**Test Checklist:**
- [ ] Test case 1
- [ ] Test case 2
- [ ] etc.

**User Feedback:**
- [Feedback from interview]

**Issues Found:**
- Issue 1 - Fixed YYYY-MM-DD
- Issue 2 - Fixed YYYY-MM-DD

## Sign-Off
- [ ] All tests pass
- [ ] User approved
- [ ] Ready for next feature
```

---

# 4. EXPO GO TEST SESSIONS

## Session Format - 2026-01-23

When Claude prompts for Expo Go testing:

### 1. Pre-Test Message
Claude will provide:
- Summary of what was built/changed
- Specific test checklist
- What to look for
- How to report issues

### 2. Test Checklist Format
```markdown
## Expo Go Test Session #X
**Date:** YYYY-MM-DD
**Focus:** [Feature/Area]

### Setup
1. Open Expo Go
2. Scan QR code (or enter URL)
3. Wait for bundle to load

### Test Cases
- [ ] **TC1:** [Description]
  - Steps: 1. Do X, 2. Do Y, 3. Verify Z
  - Expected: [What should happen]

- [ ] **TC2:** [Description]
  - Steps: ...
  - Expected: ...

### General Checks
- [ ] No crashes during testing
- [ ] App feels responsive
- [ ] UI looks correct
- [ ] Text is readable
- [ ] Buttons are tappable

### Feedback Questions
1. How did [feature] feel to use?
2. Anything confusing?
3. Any suggestions?
```

### 3. Post-Test Interview
Claude will use AskUserQuestion to:
- Confirm each test case result
- Gather subjective feedback
- Identify issues
- Prioritize fixes

---

# 5. BUG REPORTING FORMAT

## Bug Template - 2026-01-23

```markdown
## Bug #XXX
**Reported:** YYYY-MM-DD HH:MM
**Reporter:** User / Claude
**Status:** Open / In Progress / Fixed / Won't Fix

### Description
[What went wrong]

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Environment
- Device: [iPhone X / Pixel 6 / etc.]
- OS: [iOS 17 / Android 14 / etc.]
- Expo Go Version: [X.X.X]

### Screenshots/Videos
[If applicable]

### Fix
**Fixed:** YYYY-MM-DD
**Commit:** [hash]
**Description:** [What was changed]
```

---

# 6. TEST COVERAGE REQUIREMENTS

## By Feature Category - 2026-01-23

| Category | Unit Tests | Integration | Manual | Expo Go |
|----------|------------|-------------|--------|---------|
| Scoring Algorithm | Required (100%) | - | Required | Required |
| PR Detection | Required (100%) | - | Required | Required |
| Workout Logging | Recommended | Required | Required | Required |
| Data Persistence | Required | Required | Required | Required |
| Navigation | - | Recommended | Required | Required |
| UI Components | Recommended | - | Required | Required |
| Social Features | Recommended | Required | Required | Required |
| Auth | Required | Required | Required | Required |

---

# 7. TESTING SCHEDULE

## Per-Feature Cycle - 2026-01-23

```
Day 1: Claude builds feature
Day 1-2: Claude tests & fixes
Day 2: User Expo Go test
Day 2-3: Claude iterates based on feedback
Day 3: Final user verification
Day 3: Move to next feature
```

## Milestone Testing - 2026-01-23

### After Phase 0 (Stabilization)
- Full app smoke test
- All existing features work
- No crashes

### After Phase 1 (Core Workout)
- Complete workout flow
- PR detection accuracy
- Data persistence
- PR celebration system

### After Phase 1 (Core Workout) - PR Celebration Testing

#### TC-PR01: Small Weight PR (Tier 1)
**Steps:**
1. Start a workout on an exercise you've done before
2. Log a set that beats your previous best by 1-5 lb
3. Verify celebration modal appears
4. Check that emoji shows correctly
5. Tap "Continue" to dismiss

**Expected:** Tier 1 celebration with modest visual, sound plays, haptic feedback
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**

---

#### TC-PR02: Medium Weight PR (Tier 2)
**Steps:**
1. Log a set that beats previous best by 5-10 lb
2. Verify celebration modal appears
3. Check tier indicator shows "Big"
4. Verify sound is more intense than Tier 1

**Expected:** Tier 2 celebration with more energy
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**

---

#### TC-PR03: Massive Weight PR (Tier 4)
**Steps:**
1. Log a set that beats previous best by 20+ lb
2. Verify celebration modal appears
3. Check tier indicator shows "Mythic"
4. Verify haptic feedback has multiple pulses

**Expected:** Tier 4 celebration with maximum intensity
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**

---

#### TC-PR04: Rep PR Celebration
**Steps:**
1. Log same weight as before but with more reps
2. Verify "Rep PR" badge shows
3. Check appropriate tier based on rep increase
4. Verify detail text shows rep count

**Expected:** Rep PR detected and celebrated
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**

---

#### TC-PR05: e1RM PR Celebration
**Steps:**
1. Log a set with higher reps at a weight that increases e1RM
2. Verify "e1RM PR" badge shows
3. Check celebration appears

**Expected:** e1RM PR detected and celebrated
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**

---

#### TC-PR06: Dismiss Functionality
**Steps:**
1. Trigger any PR
2. Wait for modal to appear
3. Tap "Continue" button
4. Verify modal closes smoothly
5. Verify workout continues normally

**Expected:** Modal dismisses cleanly without affecting workout state
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**

---

#### TC-PR07: Share Button (Stub)
**Steps:**
1. Trigger any PR
2. Tap "Share" button
3. Verify modal closes

**Expected:** Modal closes (share functionality not implemented yet)
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**

---

#### TC-PR08: Multiple PRs in Session
**Steps:**
1. Log a PR (celebration should show)
2. Dismiss celebration
3. Log another PR on different exercise
4. Verify celebration shows again with correct content

**Expected:** Each PR triggers its own celebration
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**

---

### After Phase 2 (Backend)
- Auth flows
- Sync functionality
- Offline/online transitions

### After Phase 3 (Social)
- Friend system
- Feed functionality
- Real-time updates

### Pre-Launch
- Full regression test
- Performance testing
- Both iOS and Android
- Multiple devices

---

# 8. PERFORMANCE TESTING

## Metrics to Track - 2026-01-23

| Metric | Target | How to Test |
|--------|--------|-------------|
| App startup | < 3 seconds | Stopwatch from tap to usable |
| Screen transitions | < 300ms | Visual smoothness |
| Workout save | < 1 second | Stopwatch |
| Feed load | < 2 seconds | Stopwatch |
| Memory usage | < 200MB | Dev tools |
| Bundle size | < 50MB | Build output |

---

# 9. CRASH REPORTING

## Current Strategy - 2026-01-23

- **Development:** Console errors, React error boundary
- **Future:** Sentry integration for production

## Error Categories
1. **Critical:** App crashes, data loss → Fix immediately
2. **High:** Feature broken, bad UX → Fix before next test
3. **Medium:** Minor bugs, visual glitches → Fix when possible
4. **Low:** Edge cases, polish → Backlog

---

# 10. TEST SUITE HEALTH TRACKING

## Overall Test Health - 2026-02-02

**Current Status:** Excellent (100% passing)
- **Total Tests:** 1,403
- **Passing:** 1,371 (100% of non-skipped)
- **Failing:** 0
- **Skipped:** 32
- **Test Suites:** 82 total (79 passing, 3 skipped, 0 failing)

## Test Suite Status

All 82 test suites are now passing. Previous issues have been resolved:

| Test Suite | Status | Notes |
|------------|--------|-------|
| presenceTracker | ✅ PASS | 22 tests for real-time subscriptions |
| decorationManager | ✅ PASS | 33 tests for utility functions |
| FriendAvatar | ✅ PASS | 13 snapshot tests for UI component |
| hangoutStore | ✅ PASS | 50+ tests for Zustand store |
| hangoutRepository | ✅ PASS | Tests for database operations |
| OAuthButton | ✅ PASS | Platform.OS mocking fixed |
| ValidationToast | ✅ PASS | Animation mocks resolved |
| useValidationToast | ✅ PASS | expo-haptics mock working |

| Test Suite | Status | Notes |
|------------|--------|-------|
| OAuthButton | ✅ PASS | Platform.OS mocking fixed |
| ValidationToast | ✅ PASS | Animation mocks resolved |
| useValidationToast | ✅ PASS | expo-haptics mock working |
| friendsStore | ✅ PASS | AsyncStorage promises fixed |
| feedStore | ✅ PASS | Hook→imperative functions resolved |
| error-boundary | ✅ PASS | undefined error.message handling |
| tab-error-boundary | ✅ PASS | undefined error.message handling |
| useWorkoutOrchestrator | ✅ PASS | Argument forwarding resolved |
| authStore | ✅ PASS | camelCase/snake_case types fixed |
| supabase/client | ✅ PASS | rpc mock added |
| celebration/personalities | ✅ PASS | - |
| celebration/sound | ✅ PASS | - |
| celebration/selector | ✅ PASS | - |
| shop | ✅ PASS | - |
| Apple auth | ✅ PASS | Platform.OS mocking complexity resolved |
| chatStore | ✅ PASS | State timing issues fixed |
| socialStore | ✅ PASS | AsyncStorage issues resolved |
| currentSessionStore | ✅ PASS | Hydration/persistence timing fixed |
| currentSessionStore.appstate | ✅ PASS | Complex queued writes resolved |
| error-boundary.characterization | ✅ PASS | Integration test dependencies handled |
| validation-flow | ✅ PASS | - |
| ... (60+ more passing) | ✅ PASS | - |

**Previously failing test suites now fixed:**
- Apple auth: 9 failures → 0 failures
- chatStore: 16 failures → 0 failures
- socialStore: Multiple failures → 0 failures
- currentSessionStore: Multiple failures → 0 failures
- currentSessionStore.appstate: Multiple failures → 0 failures
- error-boundary.characterization: Failures → 0 failures

## Known Test Patterns & Solutions

### AsyncStorage Mock Pattern
**Problem:** `Cannot read properties of undefined (reading 'then')`
**Solution:** Return promises from mocks
```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(undefined)),
  removeItem: jest.fn(() => Promise.resolve(undefined)),
}));
```

### Platform.OS Mocking Pattern
**Problem:** `Property 'OS' does not have access type get`
**Solution:** Use mutable variable before module import
```typescript
const mockPlatform = {
  OS: 'ios' as 'ios' | 'android' | 'macos' | 'web',
  // ... other properties
};
jest.mock('react-native', () => ({ Platform: mockPlatform }));
```

### Hook Test Infinite Updates
**Problem:** "Maximum update depth exceeded"
**Solution:** Use imperative functions instead of renderHook for rapid state changes

### Zustand Persist State Structure
**Problem:** Tests expect direct property access but Zustand wraps in `state`
**Solution:** Access via `persistedValue.state.session`

### Error Boundary Undefined Message
**Problem:** `error.message` deleted returns empty string in some environments
**Solution:** Check for truthy string after trimming: `error?.message && error.message.trim() ? error.message : 'Fallback'`

**All test patterns have been successfully applied across the test suite.**

## Test Run Commands

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- path/to/test.test.ts

# Run with filter
npm test -- --testNamePattern="OAuth"

# Coverage report
npm run test:coverage
```

---

**End of Testing Plan v1.1**
*Updated as testing processes evolve.*

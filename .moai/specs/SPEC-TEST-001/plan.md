# Implementation Plan: SPEC-TEST-001

**SPEC ID:** SPEC-TEST-001
**Title:** AuthStore and Apple OAuth Testing
**Status:** Planned
**Created:** 2025-01-26

---

## Implementation Approach

### Development Strategy

This SPEC follows a test-driven approach for two critical authentication components:

1. **AuthStore Tests:** Comprehensive Zustand store testing covering all authentication flows
2. **Apple OAuth Tests:** Complete Apple Sign In testing mirroring Google OAuth patterns

### Reference Pattern

**Excellent Reference:** `src/lib/auth/__tests__/google.test.ts` (219 lines)

This test file demonstrates:
- Proper mock setup for Expo modules
- Clear test organization with describe blocks
- Comprehensive error scenario coverage
- Platform detection testing
- OAuth flow simulation

### Test Quality Standards

**Coverage Requirements:**
- Minimum 85% line coverage per file
- 80% branch coverage
- 90% function coverage
- All error paths tested

**Code Quality:**
- Zero TypeScript errors
- Zero ESLint warnings
- Follow existing test patterns
- Clear test descriptions

---

## Milestones

### Primary Goal (Must Have)

**Milestone 1: AuthStore Test Infrastructure**

**Objective:** Set up testing infrastructure and write basic authStore tests

**Tasks:**
1. Create test file: `src/lib/stores/__tests__/authStore.test.ts`
2. Configure Supabase client mock
3. Write tests for signUp function (7 test cases)
4. Write tests for signIn function (5 test cases)
5. Write tests for signOut function (2 test cases)

**Acceptance Criteria:**
- All auth action tests pass
- Supabase client properly mocked
- Error scenarios covered
- Loading states tested

**Dependencies:** None

**Completion Marker:** `npm test -- authStore` passes with 14 tests

---

**Milestone 2: AuthStore State and Hook Tests**

**Objective:** Test state management, selectors, hooks, and auth listener

**Tasks:**
1. Write state management tests (3 test cases)
2. Write auth state listener tests (4 test cases)
3. Write selector and hook tests (8 test cases)
4. Write imperative getter tests (3 test cases)

**Acceptance Criteria:**
- All state management tests pass
- Auth listener properly mocked
- All hooks tested with renderHook
- Selectors return correct values
- Imperative getters work correctly

**Dependencies:** Milestone 1 complete

**Completion Marker:** All 18 state/hook tests pass

---

**Milestone 3: Apple OAuth Test Infrastructure**

**Objective:** Set up Apple OAuth testing infrastructure

**Tasks:**
1. Create test file: `src/lib/auth/__tests__/apple.test.ts`
2. Configure expo-apple-authentication mock
3. Configure Platform.OS mock for platform detection
4. Write platform detection tests (4 test cases)

**Acceptance Criteria:**
- Apple module properly mocked
- Platform detection tests pass
- Mocks return predictable results
- Tests isolated from platform

**Dependencies:** None (can run parallel with Milestone 1-2)

**Completion Marker:** 4 platform detection tests pass

---

**Milestone 4: Apple OAuth Hook Tests**

**Objective:** Test useAppleAuth hook and sign-in flow

**Tasks:**
1. Write useAppleAuth hook tests (3 test cases)
2. Write successful sign-in flow tests (3 test cases)
3. Write JWT decoding tests (4 test cases)

**Acceptance Criteria:**
- Hook tests pass with renderHook
- Sign-in flow end-to-end tested
- JWT decoding handles edge cases
- Profile extraction works correctly

**Dependencies:** Milestone 3 complete

**Completion Marker:** 10 Apple OAuth flow tests pass

---

**Milestone 5: Apple OAuth Error Handling**

**Objective:** Comprehensive error scenario testing

**Tasks:**
1. Write error handling tests (6 test cases)
2. Write credential utilities tests (9 test cases)
3. Write error message tests (7 test cases)

**Acceptance Criteria:**
- All error scenarios covered
- User-facing error messages tested
- Credential validation tests pass
- Edge cases handled

**Dependencies:** Milestone 4 complete

**Completion Marker:** All 22 error/utility tests pass

---

### Secondary Goal (Should Have)

**Milestone 6: Coverage Optimization**

**Objective:** Achieve 85%+ coverage for both files

**Tasks:**
1. Run coverage report: `npm run test:coverage`
2. Identify uncovered lines
3. Add tests for uncovered branches
4. Remove unnecessary exclusions

**Acceptance Criteria:**
- authStore.ts: 85%+ coverage
- apple.ts: 85%+ coverage
- No critical paths uncovered

**Dependencies:** Milestones 1-5 complete

**Completion Marker:** Coverage report shows 85%+ for both files

---

### Optional Goal (Nice to Have)

**Milestone 7: Performance Optimization**

**Objective:** Ensure tests run efficiently

**Tasks:**
1. Measure test execution time
2. Optimize mock setup/teardown
3. Add test parallelization if needed
4. Document test runtime expectations

**Acceptance Criteria:**
- All tests run in under 30 seconds
- No memory leaks in tests
- Proper cleanup in afterEach

**Dependencies:** Milestone 6 complete

**Completion Marker:** Test suite completes in under 30 seconds

---

## Technical Approach

### Test File Structure

**authStore.test.ts Structure:**
```typescript
// Imports
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore, setupAuthListener } from '../authStore';

// Mocks
jest.mock('../../supabase/client', () => ({...}));

// Test Groups
describe('authStore', () => {
  describe('signUp', () => {
    // 7 test cases
  });
  describe('signIn', () => {
    // 5 test cases
  });
  describe('signOut', () => {
    // 2 test cases
  });
  describe('State Management', () => {
    // 3 test cases
  });
  describe('Auth State Listener', () => {
    // 4 test cases
  });
  describe('Selectors and Hooks', () => {
    // 8 test cases
  });
  describe('Imperative Getters', () => {
    // 3 test cases
  });
});
```

**apple.test.ts Structure:**
```typescript
// Imports
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAppleAuth, isAppleAuthAvailable, ... } from '../apple';

// Mocks
jest.mock('expo-apple-authentication', () => ({...}));

// Test Groups
describe('Apple OAuth', () => {
  describe('Platform Detection', () => {
    // 4 test cases
  });
  describe('useAppleAuth Hook', () => {
    // 3 test cases
  });
  describe('Successful Sign-In Flow', () => {
    // 3 test cases
  });
  describe('Error Handling', () => {
    // 6 test cases
  });
  describe('JWT Decoding', () => {
    // 4 test cases
  });
  describe('Credential Utilities', () => {
    // 9 test cases
  });
  describe('Error Messages', () => {
    // 7 test cases
  });
});
```

### Mock Configuration

**Supabase Client Mock Pattern:**
```typescript
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { unsubscribe: jest.fn() },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
};
```

**Expo Apple Authentication Mock Pattern:**
```typescript
jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(),
  AppleAuthenticationButtonType: { SIGN_IN: 'SIGN_IN' },
  AppleAuthenticationStyle: { BLACK: 'BLACK' },
  AppleAuthenticationScope: {
    FULL_NAME: 'FULL_NAME',
    EMAIL: 'EMAIL',
  },
}));
```

### Async Testing Pattern

**Using act() for State Updates:**
```typescript
it('should sign up user successfully', async () => {
  const { result } = renderHook(() => useAuthStore());

  mockSupabase.auth.signUp.mockResolvedValue({
    data: { user: { id: '123', email: 'test@test.com' } },
    error: null,
  });

  await act(async () => {
    const response = await result.current.signUp('test@test.com', 'password123', 'Test User');
  });

  expect(result.current.user).toBeTruthy();
  expect(result.current.loading).toBe(false);
});
```

### Error Testing Pattern

**Testing Error Scenarios:**
```typescript
it('should handle sign up error', async () => {
  const { result } = renderHook(() => useAuthStore());

  mockSupabase.auth.signUp.mockResolvedValue({
    data: { user: null },
    error: { message: 'Email already exists' },
  });

  await act(async () => {
    const response = await result.current.signUp('test@test.com', 'password123', 'Test User');
  });

  expect(result.current.error).toBe('Email already exists');
  expect(response.success).toBe(false);
});
```

---

## Risk Assessment

### Technical Risks

**Risk 1: Supabase Mock Complexity**

**Description:** Supabase client has complex nested methods that may be difficult to mock accurately

**Impact:** Medium - Could cause test flakiness

**Mitigation:**
- Use jest.mock() at top of file
- Mock all nested methods explicitly
- Return consistent mock data
- Clear mocks in afterEach

**Risk 2: Platform Detection Testing**

**Description:** Platform.OS is read-only, may be difficult to mock

**Impact:** Low - Platform detection is simple

**Mitigation:**
- Use jest.spyOn(Platform, 'OS', 'get').mockReturnValue()
- Test each platform separately
- Restore original in afterEach

**Risk 3: Async Timing Issues**

**Description:** Tests may fail due to async timing

**Impact:** Medium - Could cause flaky tests

**Mitigation:**
- Always use act() for state updates
- Properly await all async operations
- Use fake timers if needed
- Avoid arbitrary timeouts

### Implementation Risks

**Risk 4: Coverage Targets Not Met**

**Description:** Some code paths may be difficult to test

**Impact:** Low - Can adjust targets if needed

**Mitigation:**
- Start with high-priority paths
- Document uncovered lines
- Use pragma comments if necessary
- Focus on business-critical paths

**Risk 5: Test Maintenance Burden**

**Description:** Tests may break when implementation changes

**Impact:** Medium - Tests need updating

**Mitigation:**
- Write clear, maintainable tests
- Use descriptive test names
- Comment complex scenarios
- Update tests when code changes

---

## Dependencies

### External Dependencies

**Required Packages:**
- `jest-expo` - Jest preset for Expo
- `@testing-library/react-native` - React Native testing utilities
- `@testing-library/jest-native` - Custom Jest matchers
- `typescript` - Type checking

**Version Requirements:**
- All packages already installed
- No new dependencies required

### Internal Dependencies

**Implementation Files:**
- `src/lib/stores/authStore.ts` - Must exist (already implemented)
- `src/lib/auth/apple.ts` - Must exist (already implemented)
- `src/lib/auth/oauth.ts` - Shared OAuth utilities

**Reference Files:**
- `src/lib/auth/__tests__/google.test.ts` - Test pattern reference

---

## Success Criteria

### Quantitative Metrics

**Test Count:**
- authStore.test.ts: 32 test cases
- apple.test.ts: 36 test cases
- Total: 68 test cases

**Coverage:**
- authStore.ts: 85%+ line coverage
- apple.ts: 85%+ line coverage
- Combined: 85%+ coverage

**Performance:**
- Test execution time: Under 30 seconds
- No memory leaks
- No test flakiness

### Qualitative Metrics

**Code Quality:**
- Zero TypeScript errors
- Zero ESLint warnings
- Clear test descriptions
- Proper test organization

**Maintainability:**
- Follows existing patterns
- Easy to understand
- Well-documented
- Isolated tests

---

## Rollback Plan

If implementation issues arise:

**Rollback Trigger:**
- Tests cannot be made stable
- Mock complexity becomes unmanageable
- Coverage targets unachievable

**Rollback Actions:**
1. Document challenges encountered
2. Create issue with findings
3. Partially complete work is valuable
4. Tests can be completed incrementally

**Recovery Plan:**
1. Reduce scope to critical paths only
2. Focus on happy path testing
3. Add error scenarios later
4. Iteratively improve coverage

---

## Next Steps

**Immediate Actions:**
1. Run `/moai:2-run SPEC-TEST-001` to begin implementation
2. Start with Milestone 1 (AuthStore Test Infrastructure)
3. Reference google.test.ts for patterns
4. Run tests frequently: `npm test -- authStore`

**After Implementation:**
1. Run `/moai:3-sync SPEC-TEST-001` for documentation
2. Update STATUS.md with completion
3. Create pull request for review

---

**END OF PLAN**

# Code Quality Metrics Dashboard

## Overview

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Overall Quality Score** | 68/100 | 80+ | ⚠️ Needs Improvement |
| **Critical Issues** | 35 | 0 | 🔴 Action Required |
| **High Priority Issues** | 18 | <5 | ⚠️ Needs Improvement |
| **Medium Priority Issues** | 25 | <15 | ⚠️ Needs Improvement |
| **Low Priority Issues** | 12 | <20 | ✅ Good |

---

## Category Breakdown

### TypeScript Safety: 55/100

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| `: any` usage (production) | 24 | 0 | -24 |
| `as any` assertions | 14 | 0 | -14 |
| Type coverage | ~85% | 95% | -10% |
| Explicit return types | ~60% | 80% | -20% |

**Top Offenders**:
1. `src/lib/hooks/useWorkoutOrchestrator.ts` - 14 `as any` casts
2. `app/live-workout.tsx` - 4 `: any` declarations
3. `src/lib/forgerankScoring.ts` - 2 `any` parameters

---

### Error Handling: 45/100

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Silent catch blocks | 32 | 0 | -32 |
| Unsafe JSON.parse | 20 | 0 | -20 |
| Unawaited async calls | 15 | 0 | -15 |
| Error logging coverage | ~40% | 90% | -50% |

**Files with Most Issues**:
- `src/lib/_old/chatStore.ts` - 10 silent catches
- `src/lib/_old/socialStore.ts` - 5 silent catches
- `src/lib/_old/feedStore.ts` - 3 silent catches
- `src/lib/_old/friendsStore.ts` - 2 silent catches

---

### Code Complexity: 75/100

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Average file LOC | 180 | <200 | ✅ Good |
| Largest file | 577 LOC | <400 | ⚠️ Monitor |
| Functions >50 lines | 3 | 0 | ⚠️ Monitor |
| Components >10 props | 2 | 0 | ✅ Good |

**Large Files** (>300 LOC):
1. `app/live-workout.tsx` - 577 LOC (needs refactoring)
2. `src/lib/hooks/useWorkoutOrchestrator.ts` - 326 LOC (needs refactoring)
3. `src/ui/tab-error-boundary.tsx` - 260 LOC (acceptable)
4. `src/lib/stores/feedStore.ts` - 302 LOC (acceptable)

---

### Pattern Consistency: 70/100

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Zustand store migration | 100% | 100% | ✅ Complete |
| Deprecated code cleanup | 0% | 100% | 🔴 Pending |
| Import style consistency | ~60% | 100% | ⚠️ In Progress |
| Naming convention adherence | 95% | 100% | ✅ Good |

**Migration Status**:
- ✅ `feedStore` - Migrated to Zustand
- ✅ `friendsStore` - Migrated to Zustand
- ✅ `chatStore` - Migrated to Zustand
- ✅ `socialStore` - Migrated to Zustand
- ✅ `currentSessionStore` - Migrated to Zustand
- ✅ `workoutStore` - Migrated to Zustand
- ⏳ `_old/` directory cleanup - Pending

---

### Duplication: 60/100

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Duplicate timeAgo | 5 copies | 1 | -4 |
| Duplicate kgToLb | 3 copies | 1 | -2 |
| Duplicate exerciseName | 5 copies | 1 | -4 |
| Code duplication index | ~15% | <5% | -10% |

**Duplication Hotspots**:
- Time formatting: 5 copies of `timeAgo()`
- Unit conversion: 3 copies of `kgToLb()`
- Exercise lookup: 5 copies of `exerciseName()`

---

### Validation: 80/100

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Input validation coverage | ~75% | 90% | ⚠️ Monitor |
| Zod schema usage | Partial | Widespread | ⚠️ In Progress |
| AsyncStorage safety | 0% | 100% | 🔴 Critical |
| OAuth token validation | Partial | Complete | ⚠️ Monitor |

---

## Technical Debt Summary

### High Debt Areas

1. **Error Handling** - 47 technical debt items
   - 32 silent catches
   - 20 unsafe JSON.parse
   - 15 unawaited async calls

2. **TypeScript Type Safety** - 38 technical debt items
   - 24 `: any` usages
   - 14 `as any` assertions

3. **Code Duplication** - 13 technical debt items
   - Duplicate utility functions
   - Repeated patterns

4. **Deprecated Code** - 8 files in `_old/`
   - Migration complete
   - Cleanup pending

---

## File Health Scores

### Healthiest Files (>90 score)

| File | Score | Notes |
|------|-------|-------|
| `src/ui/error-boundary.tsx` | 95 | Well-tested, clear error handling |
| `src/lib/units.ts` | 92 | Pure functions, good types |
| `src/lib/uid.ts` | 90 | Simple, focused |
| `src/lib/buckets.ts` | 88 | Well-documented |
| `src/ui/designSystem.ts` | 85 | Clear structure |

### Files Needing Attention (<60 score)

| File | Score | Primary Issues |
|------|-------|----------------|
| `src/lib/hooks/useWorkoutOrchestrator.ts` | 45 | Multiple `as any` casts, complex logic |
| `src/lib/_old/chatStore.ts` | 40 | 10 silent catch blocks |
| `src/lib/_old/socialStore.ts` | 42 | 5 silent catch blocks |
| `src/lib/_old/feedStore.ts` | 48 | 3 silent catch blocks |
| `app/live-workout.tsx` | 55 | Large file, `: any` usage |

---

## Trend Analysis

### Quality Velocity

| Period | Issues Found | Issues Resolved | Net Change |
|--------|--------------|-----------------|------------|
| Current Audit | 90 | 0 | +90 |
| Previous (if any) | - | - | - |

**Target**: Resolve all P0 and P1 issues within 2 sprints.

---

## Risk Assessment

### High Risk Areas

1. **Data Integrity** 🔴
   - Unsafe JSON.parse can crash app on corrupted storage
   - Impact: App crash on startup
   - Likelihood: Medium
   - Mitigation: Add try-catch to all JSON.parse

2. **Error Visibility** 🔴
   - Silent catches hide errors from users and developers
   - Impact: Poor UX, difficult debugging
   - Likelihood: High
   - Mitigation: Add logging and error toasts

3. **Type Safety** ⚠️
   - `as any` casts bypass type checking
   - Impact: Runtime type errors
   - Likelihood: Medium
   - Mitigation: Define proper interfaces

### Medium Risk Areas

1. **Code Duplication** ⚠️
   - Duplicated utilities create maintenance burden
   - Impact: Inconsistent fixes
   - Likelihood: High
   - Mitigation: Extract to shared utilities

2. **Large Files** ⚠️
   - Complex files are hard to understand and modify
   - Impact: Slower development
   - Likelihood: Medium
   - Mitigation: Component extraction

---

## Recommendations

### Immediate Actions (This Sprint)

1. **Fix all P0 issues**
   - Add try-catch to all JSON.parse calls
   - Replace silent catches with error handling
   - Define types for `useWorkoutOrchestrator`

2. **Reduce technical debt by 30%**
   - Focus on error handling and type safety

### Short-term Goals (Next Sprint)

1. **Resolve all P1 issues**
   - Extract duplicate utilities
   - Delete `_old/` directory
   - Add `__DEV__` guards to console logs

2. **Improve overall score to 75+**

### Long-term Goals (Next Quarter)

1. **Achieve 80+ quality score**
   - Reduce code complexity
   - Improve test coverage
   - Standardize patterns

2. **Establish quality gates**
   - Pre-commit hooks for linting
   - CI/CD quality checks
   - Automated PR reviews

---

## Metrics Legend

- 🔴 **Critical**: Immediate action required
- ⚠️ **Warning**: Needs attention soon
- ✅ **Good**: Within acceptable range
- 📊 **Monitor**: Track over time

---

**Last Updated**: 2026-01-26
**Next Review**: After P0 issues resolved
**Dashboard Version**: 1.0.0

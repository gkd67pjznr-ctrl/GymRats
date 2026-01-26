# SPEC-QUALITY-001: Comprehensive Code Audit

**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-01-26
**Author:** Quality Gate Agent
**Priority:** High

---

## 1. Overview

### 1.1 Purpose

This specification defines a comprehensive code audit for the Forgerank React Native workout tracking application. The audit will systematically identify technical debt, type safety gaps, error handling issues, code complexity problems, pattern inconsistencies, code duplication, and validation gaps.

### 1.2 Scope

**In Scope:**
- All TypeScript/TSX files in `app/` directory (screens/routes)
- All TypeScript files in `src/lib/` directory (domain logic, stores, hooks)
- All TypeScript files in `src/ui/` directory (components, design system)
- All TypeScript files in `src/data/` directory (static datasets)

**Out of Scope:**
- Files in `src/lib/_old/` directory (deprecated, excluded from compilation)
- Node modules and generated files
- Test files (separate test audit recommended)
- Documentation files

### 1.3 Background

Based on existing code review findings (CODE_REVIEW.md, REFACTORING_GUIDE.md):
- `app/live-workout.tsx` exceeds 400 lines with mixed concerns
- Race condition identified in `currentSessionStore.ts` persist() function
- Multiple stores use silent error handlers `.catch(() => {})`
- Prop drilling issues in ExerciseBlocksCard component
- Missing error boundaries and loading states
- Input validation gaps across user-facing inputs

---

## 2. Requirements (EARS Format)

### 2.1 TypeScript Safety Audit

#### REQ-TS-001: Any Type Detection
**EARS:** The system SHALL identify all usages of `any` type including explicit `any` declarations, type assertions using `as any`, and type assertions using `as unknown`.

**Acceptance Criteria:**
- Report includes file path, line number, and context for each occurrence
- Categorize by severity (explicit any vs assertion)
- Provide recommended type replacement where determinable

#### REQ-TS-002: Missing Type Annotations
**EARS:** The system SHALL identify function parameters, return types, and variable declarations that lack explicit type annotations where inference is ambiguous.

**Acceptance Criteria:**
- Focus on exported functions and public APIs
- Identify parameters with implicit `any` due to missing annotations
- Flag return types that are implicitly `any`

#### REQ-TS-003: Type Assertion Audit
**EARS:** The system SHALL identify all type assertions using `as` keyword and evaluate their safety.

**Acceptance Criteria:**
- Identify `as Type` assertions
- Flag potentially unsafe casts (e.g., `as string` on unknown data)
- Identify double assertions (`as unknown as Type`)

### 2.2 Error Handling Audit

#### REQ-ERR-001: Silent Error Handler Detection
**EARS:** The system SHALL identify all instances of silent error handlers including `.catch(() => {})`, `.catch(() => null)`, and `catch (e) {}` blocks.

**Acceptance Criteria:**
- Report all empty or effectively empty catch handlers
- Include file path and line number
- Suggest proper error handling patterns

#### REQ-ERR-002: Fire-and-Forget Promise Detection
**EARS:** The system SHALL identify all unhandled Promise invocations where async functions are called without await, catch, or then handlers.

**Acceptance Criteria:**
- Identify async function calls not awaited
- Identify Promise-returning functions without error handling
- Flag hydration calls without error handling

#### REQ-ERR-003: Missing Error Boundary Detection
**EARS:** The system SHALL verify error boundary coverage for all route components in `app/` directory.

**Acceptance Criteria:**
- Check for ErrorBoundary component usage in layout files
- Identify routes without error boundary protection
- Verify error boundary implementation follows React best practices

### 2.3 Code Complexity Audit

#### REQ-CMPLX-001: Large File Detection
**EARS:** The system SHALL identify all files exceeding 300 lines of code.

**Acceptance Criteria:**
- Report file path and line count
- Identify primary concerns/responsibilities in large files
- Suggest decomposition strategies

#### REQ-CMPLX-002: Long Function Detection
**EARS:** The system SHALL identify all functions exceeding 50 lines of code.

**Acceptance Criteria:**
- Report function name, file path, and line count
- Calculate cyclomatic complexity where feasible
- Identify extraction opportunities

#### REQ-CMPLX-003: Component Prop Count Analysis
**EARS:** The system SHALL identify React components accepting 10 or more props.

**Acceptance Criteria:**
- Report component name and prop count
- List all props for affected components
- Suggest Context or composition patterns to reduce prop drilling

### 2.4 Pattern Consistency Audit

#### REQ-PAT-001: State Management Pattern Analysis
**EARS:** The system SHALL analyze state management patterns and identify inconsistencies between Zustand stores and legacy subscription-based stores.

**Acceptance Criteria:**
- Catalog all state management approaches in use
- Identify stores not yet migrated to Zustand
- Document pattern deviations from established conventions

#### REQ-PAT-002: Naming Convention Analysis
**EARS:** The system SHALL verify naming conventions conform to project standards: camelCase for variables/functions, PascalCase for components/types, UPPER_SNAKE_CASE for constants.

**Acceptance Criteria:**
- Identify naming convention violations
- Check hook naming (use* prefix)
- Check type/interface naming (PascalCase, no I prefix)

#### REQ-PAT-003: Import Pattern Analysis
**EARS:** The system SHALL analyze import patterns for consistency including path alias usage, import ordering, and barrel exports.

**Acceptance Criteria:**
- Verify consistent use of `@/` path alias
- Identify direct imports that should use path alias
- Check for circular import risks

### 2.5 Code Duplication Audit

#### REQ-DUP-001: Utility Function Duplication
**EARS:** The system SHALL identify utility functions that are duplicated or substantially similar across multiple files.

**Acceptance Criteria:**
- Identify duplicate time formatting functions
- Identify duplicate unit conversion functions
- Identify duplicate ID generation logic
- Suggest consolidation into `src/lib/utils/`

#### REQ-DUP-002: Component Logic Duplication
**EARS:** The system SHALL identify similar component logic patterns that could be extracted into custom hooks.

**Acceptance Criteria:**
- Identify repeated state + effect patterns
- Identify similar data fetching logic
- Suggest custom hook extractions

#### REQ-DUP-003: Repeated Code Patterns
**EARS:** The system SHALL identify repeated code patterns such as loading state handling, error handling wrappers, and form validation patterns.

**Acceptance Criteria:**
- Catalog repeated patterns with 3+ occurrences
- Estimate lines of code that could be reduced
- Provide abstraction recommendations

### 2.6 Validation Audit

#### REQ-VAL-001: Input Validation Gap Analysis
**EARS:** The system SHALL identify user input handlers lacking proper validation.

**Acceptance Criteria:**
- Review all text input handlers
- Review numeric input handlers (weight, reps)
- Identify inputs without range validation
- Identify inputs without type validation

#### REQ-VAL-002: Null/Undefined Safety Analysis
**EARS:** The system SHALL identify potential null or undefined access without proper guards.

**Acceptance Criteria:**
- Identify optional chaining opportunities missed
- Identify array access without bounds checking
- Identify object property access without existence checks

#### REQ-VAL-003: Runtime Type Validation
**EARS:** The system SHALL identify locations where runtime data (AsyncStorage, API responses) is used without validation.

**Acceptance Criteria:**
- Review AsyncStorage hydration logic
- Review any API response handling
- Recommend Zod schema validation where appropriate

---

## 3. Known Issues Reference

Based on existing documentation, the following issues are already identified and should be verified during audit:

### 3.1 From CODE_REVIEW.md

| Issue | File | Description |
|-------|------|-------------|
| Race Condition | `src/lib/stores/currentSessionStore.ts` | persist() called fire-and-forget |
| Memory Leak Risk | `src/ui/components/LiveWorkout/InstantCueToast.tsx` | Timer cleanup (verified OK) |
| Silent Catches | Multiple stores | `.catch(() => {})` patterns |
| Any Casts | `app/live-workout.tsx` | `session as any` usage |
| No Error Boundaries | `app/_layout.tsx` | Missing ErrorBoundary wrapper |
| No Loading States | `app/history.tsx` | Hydration without loading indicator |

### 3.2 From REFACTORING_GUIDE.md

| Issue | File | Description |
|-------|------|-------------|
| God Component | `app/live-workout.tsx` | 400+ lines, mixed concerns |
| Prop Drilling | `ExerciseBlocksCard` | 10+ props passed |
| Scattered Types | Multiple files | No central type definitions |
| Duplicate Utils | Multiple files | timeAgo, formatting duplicated |

---

## 4. Deliverables

### 4.1 Audit Report

A comprehensive markdown report containing:
- Executive summary with severity counts
- Detailed findings for each audit category
- Prioritized remediation recommendations
- Estimated effort for each fix category

### 4.2 Issue Tracking

Each finding should be formatted for easy issue creation:
- Clear title describing the issue
- File path and line number(s)
- Code snippet showing the problem
- Recommended fix approach
- Severity level (Critical/High/Medium/Low)

### 4.3 Metrics Dashboard

Summary metrics including:
- Total `any` type usages
- Total silent error handlers
- Files exceeding complexity thresholds
- Estimated technical debt in hours

---

## 5. Success Criteria

The audit is successful when:
1. All files in scope have been analyzed
2. All requirement categories have been evaluated
3. Findings are documented with actionable recommendations
4. Severity-based prioritization is provided
5. Report enables creation of remediation SPECs

---

## 6. Technical Approach

### 6.1 Analysis Tools

**AST-based Analysis:**
- Use ast-grep (sg) for structural pattern matching
- TypeScript compiler API for type analysis

**Grep-based Analysis:**
- Pattern search for common anti-patterns
- Regex matching for naming convention violations

**Manual Review:**
- Component architecture evaluation
- Pattern consistency assessment

### 6.2 Pattern Definitions

**TypeScript Safety Patterns (ast-grep):**
```
# Any type detection
sg -p 'any' --lang typescript
sg -p '$X as any' --lang typescript
sg -p '$X as unknown' --lang typescript

# Missing annotations
sg -p 'function $NAME($$$PARAMS)' --lang typescript
```

**Error Handling Patterns (grep):**
```
# Silent catch
\.catch\(\(\) => \{\}\)
\.catch\(\(\) => null\)
catch \([a-z]+\) \{\s*\}

# Fire-and-forget
hydrate.*\(\)(?!.*await)(?!.*\.catch)(?!.*\.then)
```

**Complexity Analysis:**
```
# File line counts
wc -l **/*.ts **/*.tsx

# Function extraction
sg -p 'function $NAME($$$) { $$$BODY }' --lang typescript
```

---

## 7. References

- `/home/thomas/Forgerank/CLAUDE.md` - Project conventions and structure
- `/home/thomas/Forgerank/docs_archive_chatgpt/CODE_REVIEW.md` - Previous code review findings
- `/home/thomas/Forgerank/docs_archive_chatgpt/REFACTORING_GUIDE.md` - Refactoring recommendations
- TRUST 5 Framework - Quality validation criteria

# SPEC-QUALITY-001: Implementation Plan

**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-01-26

---

## Phase Overview

| Phase | Name | Duration | Dependencies |
|-------|------|----------|--------------|
| 1 | Setup and Tooling | 0.5 day | None |
| 2 | TypeScript Safety Audit | 1 day | Phase 1 |
| 3 | Error Handling Audit | 0.5 day | Phase 1 |
| 4 | Code Complexity Audit | 0.5 day | Phase 1 |
| 5 | Pattern Consistency Audit | 0.5 day | Phase 1 |
| 6 | Duplication Audit | 0.5 day | Phase 1 |
| 7 | Validation Audit | 0.5 day | Phase 1 |
| 8 | Report Generation | 0.5 day | Phases 2-7 |

**Total Estimated Duration:** 4.5 days

---

## Phase 1: Setup and Tooling

### Objectives
- Establish audit tooling and scripts
- Create output templates
- Verify scope boundaries

### Tasks

#### TAG-SETUP-001: Create Audit Scripts Directory
Create `/home/thomas/Forgerank/.moai/audit/` directory structure:
```
.moai/audit/
├── scripts/           # Analysis scripts
├── patterns/          # AST-grep patterns
├── results/           # Raw analysis output
└── report/            # Final report
```

#### TAG-SETUP-002: Install/Verify AST-Grep
Verify ast-grep (sg) is available for structural code analysis.

#### TAG-SETUP-003: Create Pattern Files
Create ast-grep pattern files for:
- TypeScript any detection
- Error handler patterns
- Function complexity patterns

#### TAG-SETUP-004: Define File Scope
Generate list of all files in scope:
- `app/**/*.tsx`
- `src/lib/**/*.ts` (excluding `_old/`)
- `src/ui/**/*.ts`
- `src/ui/**/*.tsx`
- `src/data/**/*.ts`

### Deliverables
- Audit tooling ready
- Scope file list generated
- Pattern files created

---

## Phase 2: TypeScript Safety Audit

### Objectives
- Identify all `any` type usages
- Find type assertions
- Detect missing annotations

### Tasks

#### TAG-TS-001: Scan for Explicit Any Types
**Command:**
```bash
sg -p 'any' --lang typescript -r src/ app/
sg -p ': any' --lang typescript -r src/ app/
```

**Expected Output:**
- File path
- Line number
- Surrounding context

#### TAG-TS-002: Scan for Any Assertions
**Command:**
```bash
sg -p '$X as any' --lang typescript -r src/ app/
sg -p '$X as unknown as $Y' --lang typescript -r src/ app/
```

**Known Locations (from CODE_REVIEW.md):**
- `app/live-workout.tsx`: `const anySession = session as any`

#### TAG-TS-003: Scan for Unknown Assertions
**Command:**
```bash
sg -p '$X as unknown' --lang typescript -r src/ app/
```

#### TAG-TS-004: Identify Missing Return Types
**Command:**
```bash
sg -p 'export function $NAME($$$PARAMS) {' --lang typescript -r src/ app/
sg -p 'export const $NAME = ($$$PARAMS) =>' --lang typescript -r src/ app/
```

Review results for missing explicit return types on exported functions.

#### TAG-TS-005: Compile Findings
Aggregate results into structured format:
```typescript
interface TypeSafetyFinding {
  file: string;
  line: number;
  type: 'explicit-any' | 'any-assertion' | 'unknown-assertion' | 'missing-annotation';
  context: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestion: string;
}
```

### Deliverables
- TypeScript safety findings JSON
- Severity-sorted issue list
- Recommendation summary

---

## Phase 3: Error Handling Audit

### Objectives
- Find all silent error handlers
- Identify fire-and-forget promises
- Check error boundary coverage

### Tasks

#### TAG-ERR-001: Scan for Silent Catch Handlers
**Patterns:**
```bash
# Empty catch blocks
grep -rn "\.catch\s*(\s*(\(\s*\)\s*=>|function\s*\(\s*\))\s*{\s*})" src/ app/
grep -rn "\.catch\s*(\s*\(\s*\)\s*=>\s*null)" src/ app/
grep -rn "\.catch\s*(\s*\(\s*\)\s*=>\s*undefined)" src/ app/
```

**Known Locations (from CODE_REVIEW.md):**
- Multiple stores: `hydrateFriends().catch(() => {})`

#### TAG-ERR-002: Scan for Fire-and-Forget Async
**Patterns:**
```bash
# Async calls without await/catch
grep -rn "hydrate.*\(\)" src/lib/stores/ | grep -v "await\|\.catch\|\.then"
```

#### TAG-ERR-003: Audit Error Boundary Usage
Review `app/_layout.tsx` and all layout files for:
- ErrorBoundary component import
- Proper fallback component
- Error recovery mechanism

**Expected Location:**
```typescript
// app/_layout.tsx
import { ErrorBoundary } from 'react-error-boundary';
```

#### TAG-ERR-004: Compile Findings
Aggregate error handling findings with:
- Location information
- Pattern type
- Recommended fix

### Deliverables
- Error handling findings JSON
- Priority-sorted remediation list
- Error boundary coverage report

---

## Phase 4: Code Complexity Audit

### Objectives
- Identify oversized files
- Find long functions
- Detect components with excessive props

### Tasks

#### TAG-CMPLX-001: File Line Count Analysis
**Command:**
```bash
find src/ app/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -nr
```

**Threshold:** Files > 300 lines

**Known Large Files:**
- `app/live-workout.tsx` (400+ lines)

#### TAG-CMPLX-002: Function Length Analysis
**Command:**
```bash
sg -p 'function $NAME($$$PARAMS) { $$$BODY }' --lang typescript -r src/ app/
sg -p 'const $NAME = ($$$PARAMS) => { $$$BODY }' --lang typescript -r src/ app/
```

Post-process to calculate line counts per function.
**Threshold:** Functions > 50 lines

#### TAG-CMPLX-003: Component Prop Analysis
**Command:**
```bash
sg -p 'function $COMP({ $$$PROPS }: $TYPE)' --lang tsx -r src/ui/ app/
sg -p 'const $COMP = ({ $$$PROPS }: $TYPE) =>' --lang tsx -r src/ui/ app/
```

Count destructured props per component.
**Threshold:** Components with > 10 props

**Known Issues:**
- `ExerciseBlocksCard`: 10+ props (prop drilling)

#### TAG-CMPLX-004: Cyclomatic Complexity Estimation
For functions > 50 lines, count:
- `if` statements
- `switch` cases
- `for`/`while` loops
- `&&`/`||` logical operators
- Ternary operators

#### TAG-CMPLX-005: Compile Findings
Create complexity report with:
- File/function ranking by size
- Decomposition recommendations
- Refactoring priority

### Deliverables
- Complexity metrics report
- Top 10 largest files
- Top 10 longest functions
- Components requiring Context refactor

---

## Phase 5: Pattern Consistency Audit

### Objectives
- Analyze state management patterns
- Check naming conventions
- Review import patterns

### Tasks

#### TAG-PAT-001: State Management Inventory
Catalog all state management approaches:

**Zustand Stores:**
```bash
grep -rn "create<.*>()" src/lib/stores/
```

**Legacy Subscription Stores:**
```bash
grep -rn "const listeners = new Set" src/lib/
```

Document which stores use which pattern.

#### TAG-PAT-002: Naming Convention Check
**Component Names (PascalCase):**
```bash
grep -rn "export function [a-z]" app/ src/ui/
grep -rn "export const [a-z].*=.*\(\)" app/ src/ui/
```

**Hook Names (use* prefix):**
```bash
grep -rn "export function use" src/lib/hooks/
```
Verify all custom hooks start with `use`.

**Constant Names (UPPER_SNAKE_CASE):**
```bash
grep -rn "export const [A-Z]" src/
```

#### TAG-PAT-003: Import Pattern Analysis
**Path Alias Usage:**
```bash
grep -rn "from '\.\./\.\." app/ src/
grep -rn "from '@/'" app/ src/
```

Count relative vs alias imports.

**Import Order:**
Review for consistent ordering:
1. React/React Native
2. External packages
3. Internal modules (@/)
4. Relative imports
5. Types

#### TAG-PAT-004: Compile Findings
Document pattern inconsistencies with:
- Current state vs recommended state
- Migration path for legacy patterns
- Naming violations list

### Deliverables
- State management inventory
- Naming convention violations
- Import pattern recommendations

---

## Phase 6: Duplication Audit

### Objectives
- Find duplicated utility functions
- Identify similar component logic
- Detect repeated patterns

### Tasks

#### TAG-DUP-001: Utility Function Duplication
Search for common utilities implemented multiple times:

**Time Formatting:**
```bash
grep -rn "function.*timeAgo\|timeAgo.*=" src/ app/
grep -rn "function.*formatDuration\|formatDuration.*=" src/ app/
```

**Unit Conversion:**
```bash
grep -rn "kgToLb\|lbToKg" src/ app/
grep -rn "2\.2046\|0\.4535" src/ app/
```

**ID Generation:**
```bash
grep -rn "Math\.random().*toString(16)" src/ app/
grep -rn "uid\(\)" src/ app/
```

#### TAG-DUP-002: Component Pattern Duplication
Search for repeated state patterns:

**Loading State Pattern:**
```bash
sg -p 'const [$LOADING, $SET_LOADING] = useState(true)' --lang tsx -r src/ app/
```

**Fetch Pattern:**
```bash
sg -p 'useEffect(() => { $$$FETCH }, [])' --lang tsx -r src/ app/
```

#### TAG-DUP-003: Code Clone Detection
Use diff-based analysis to find similar code blocks:
- Functions with similar structure
- Components with similar render logic
- Handlers with similar validation

#### TAG-DUP-004: Compile Findings
Document duplications with:
- All locations of each duplicate
- Recommended consolidation location
- Estimated lines saved

### Deliverables
- Duplication report
- Consolidation recommendations
- Estimated LOC reduction

---

## Phase 7: Validation Audit

### Objectives
- Find input validation gaps
- Identify null safety issues
- Check runtime type validation

### Tasks

#### TAG-VAL-001: Input Handler Analysis
Find all user input handlers:

**Text Input Handlers:**
```bash
sg -p 'onChangeText={$HANDLER}' --lang tsx -r src/ app/
sg -p 'onChange={$HANDLER}' --lang tsx -r src/ app/
```

**Numeric Input Validation:**
```bash
grep -rn "Number\(text\)" src/ app/
grep -rn "parseInt\|parseFloat" src/ app/
```

Review for:
- NaN checks
- Range validation
- Type coercion safety

**Known Gap (from CODE_REVIEW.md):**
- `setWeightForSet`: No range validation (should be 0-2000 lbs)

#### TAG-VAL-002: Null Safety Analysis
**Missing Optional Chaining:**
```bash
sg -p '$OBJ.$PROP.$NESTED' --lang typescript -r src/ app/
```

Review for potential undefined access.

**Array Access Without Bounds:**
```bash
grep -rn "\[0\]\|\[-1\]" src/ app/
```

Review for potential out-of-bounds access.

#### TAG-VAL-003: Runtime Data Validation
**AsyncStorage Hydration:**
```bash
grep -rn "AsyncStorage.getItem" src/lib/stores/
```

Review for:
- JSON.parse error handling
- Schema validation of retrieved data
- Type assertions on hydrated data

**API Response Handling:**
```bash
grep -rn "fetch\|axios\|supabase" src/lib/
```

Review for response validation.

#### TAG-VAL-004: Compile Findings
Document validation gaps with:
- Input type and location
- Current validation (if any)
- Recommended validation (Zod schema)

### Deliverables
- Input validation gap report
- Null safety issues list
- Runtime validation recommendations

---

## Phase 8: Report Generation

### Objectives
- Compile all findings
- Generate prioritized report
- Create actionable recommendations

### Tasks

#### TAG-REPORT-001: Aggregate All Findings
Merge findings from Phases 2-7 into unified dataset.

#### TAG-REPORT-002: Severity Classification
Apply consistent severity levels:

| Severity | Criteria |
|----------|----------|
| Critical | Security risk, data loss potential, crash risk |
| High | Significant technical debt, user-facing bugs |
| Medium | Code quality issues, maintainability concerns |
| Low | Style issues, minor improvements |

#### TAG-REPORT-003: Generate Executive Summary
Create summary including:
- Total issues by severity
- Top 5 priority remediations
- Estimated effort by category
- Risk assessment

#### TAG-REPORT-004: Create Issue Templates
Format findings for issue tracking:
```markdown
## [SEVERITY] Title

**File:** path/to/file.ts
**Line:** 123

### Description
[What the issue is]

### Current Code
```typescript
// problematic code
```

### Recommended Fix
```typescript
// fixed code
```

### Effort
[T-shirt size: XS/S/M/L/XL]
```

#### TAG-REPORT-005: Generate Metrics Dashboard
Create summary metrics:
- Total `any` usages: X
- Silent error handlers: X
- Files > 300 LOC: X
- Functions > 50 LOC: X
- Components > 10 props: X
- Validation gaps: X
- Estimated total technical debt: X hours

### Deliverables
- Final audit report (Markdown)
- Issue-ready findings (JSON)
- Metrics dashboard
- Remediation roadmap

---

## Risk Mitigation

### Risk 1: Incomplete Scope Coverage
**Mitigation:** Generate file list upfront, track analysis progress per file.

### Risk 2: False Positives
**Mitigation:** Manual review of automated findings, context-aware filtering.

### Risk 3: Tool Limitations
**Mitigation:** Combine AST analysis with grep patterns for comprehensive coverage.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Files Analyzed | 100% of in-scope files |
| Categories Covered | All 6 audit categories |
| Critical Issues Identified | 100% captured |
| Actionable Recommendations | Every finding has recommendation |
| Report Clarity | Enables follow-up SPEC creation |

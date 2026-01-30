# CLAUDE WORKFLOW CONFIG

**Version:** 1.0
**Created:** 2026-01-27
**Purpose:** Standardized work loop for all development sessions

---

## SESSION STARTUP PROTOCOL

When a new session begins, Claude will:

### 1. Status Check (Always)
```
1. Read docs/progress.md - current state
2. Read docs/FEATURE-MASTER.md - feature status
3. Read all files in docs/features
3. Run `npm test` - verify test suite passes
4. Check for any blocking issues
```

### 2. Priority Assessment

Present the user with **top 3 recommended tasks** based on this priority matrix:

| Priority | Criteria | Weight |
|----------|----------|--------|
| P0 | Blocking bugs / broken core functionality | 100 |
| P1 | Current phase incomplete features | 80 |
| P2 | Test coverage gaps (<80%) | 60 |
| P3 | Technical debt from audit | 40 |
| P4 | Next phase prep | 20 |

### 3. Task Selection

**Default:** Claude recommends, user confirms
**Override:** User can specify task directly

```
Claude: "Based on current state, I recommend:
  1. [P0] Fix silent error catch blocks (32 remaining)
  2. [P1] Complete routine-based workout flow
  3. [P2] Add tests for currentSessionStore

Which would you like to work on? (or specify something else)"
```

---

## THE WORK LOOP

Every task follows this cycle. No exceptions.

```
┌─────────────────────────────────────────────────────────────┐
│                     THE FORGERANK LOOP                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. UNDERSTAND                                             │
│      └── Read relevant code, understand scope               │
│                                                             │
│   2. PLAN                                                   │
│      └── Define acceptance criteria, estimate scope         │
│                                                             │
│   3. BUILD                                                  │
│      └── Implement the feature/fix                          │
│                                                             │
│   4. TEST (Automated)                                       │
│      └── Run `npm test`, check coverage                     │
│                                                             │
│   5. FIX                                                    │
│      └── Address test failures                              │
│          └── If tests pass → Step 6                         │
│          └── If tests fail → Return to Step 3               │
│                                                             │
│   6. VERIFY (Manual)                                        │
│      └── Claude reviews code for quality                    │
│                                                             │
│   7. DOCUMENT                                               │
│      └── Update feature file, progress.md                   │
│      └── Add test cases to USER_TESTING_CHECKLIST.md      │
│                                                             │
│   8. SCORE                                                  │
│      └── Calculate completion score (see below)             │
│                                                             │
│   9. REPORT                                                 │
│      └── Summary to user with score                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## COMPLETION SCORING (0-100%)

Each task is scored against these metrics:

### Score Components

| Component | Max Points | How to Measure |
|-----------|------------|----------------|
| **Functionality** | 40 | Does it work? All acceptance criteria met? |
| **Tests** | 25 | Tests written? Tests passing? Coverage? |
| **Code Quality** | 15 | No new type errors? No `any` casts? Follows patterns? |
| **Documentation** | 10 | Feature file updated? Code commented where needed? |
| **Edge Cases** | 10 | Error states handled? Empty states? Loading states? |

### Score Thresholds

| Score | Status | Action |
|-------|--------|--------|
| 90-100% | **Complete** | Ready for user testing |
| 70-89% | **Acceptable** | Can ship, minor improvements needed |
| 50-69% | **Incomplete** | Continue iteration |
| 0-49% | **Failed** | Reassess approach |

### Score Calculation Template

```markdown
## Task Score: [TASK NAME]

### Functionality (0-40)
- [ ] Primary feature works: +20
- [ ] All acceptance criteria met: +10
- [ ] No regressions introduced: +10

### Tests (0-25)
- [ ] Test file exists: +5
- [ ] All tests pass: +10
- [ ] Coverage >80% for changed files: +5
- [ ] Edge cases tested: +5

### Code Quality (0-15)
- [ ] No new TypeScript errors: +5
- [ ] No new `as any` casts: +5
- [ ] Follows existing patterns: +5

### Documentation (0-10)
- [ ] Feature file updated: +5
- [ ] Complex logic commented: +5

### Edge Cases (0-10)
- [ ] Error states handled: +4
- [ ] Empty states handled: +3
- [ ] Loading states handled: +3

**TOTAL: XX/100**
```

---

## TEST REQUIREMENTS BY CATEGORY

### Required Tests (Must Have)

| Category | Min Coverage | Test Type |
|----------|-------------|-----------|
| Scoring Algorithm | 100% | Unit |
| PR Detection | 100% | Unit |
| Store Logic | 80% | Unit + Integration |
| Validators | 90% | Unit |
| Data Transformations | 80% | Unit |

### Recommended Tests (Should Have)

| Category | Target Coverage | Test Type |
|----------|-----------------|-----------|
| Hooks | 70% | Unit |
| Utils | 70% | Unit |
| Components | 50% | Snapshot + Behavior |

### Test Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- __tests__/lib/perSetCue.test.ts

# Run tests matching pattern
npm test -- --testPathPattern="currentSessionStore"

# Run with coverage
npm run test:coverage

# Watch mode (TDD)
npm run test:watch
```

---

## USER-INSTRUCTIONS.MD UPDATE PROTOCOL

**CRITICAL:** After completing ANY feature that requires admin/user instructions to use, customize, or extend, you MUST update `docs/user-instructions.md` with those instructions.

### When to Add Instructions

Add instructions to `docs/user-instructions.md` when you build:
- Features with configuration options (e.g., AI image integration, theme customization)
- Systems that require content to be added (e.g., celebration assets, exercise data)
- Features with extensible APIs or hooks
- Anything the user (admin) needs to manually configure or maintain

### What to Include

For each instruction section, include:
1. **Feature name** as heading
2. **Brief description** of what it does
3. **File(s) to edit** - exact paths
4. **Step-by-step instructions** - clear, actionable steps
5. **Code examples** - where helpful
6. **Reference tables** - for keys, options, etc.

### Template

```markdown
### [Feature Name]

[Brief description of what the feature does]

**File(s) to Edit:** `path/to/file.ts`

**Instructions:**
1. Step one
2. Step two
3. Step three

**Example:**
```typescript
// Code example
```

**Reference:**
| Key | Description |
|-----|-------------|
| key1 | Description |
```
```

### After Adding Instructions

1. Update the Table of Contents at the top of `docs/user-instructions.md`
2. Inform the user that instructions have been added
3. Reference the instructions file in completion message

### Example Completion Message

```markdown
## Work Complete

I've implemented the [feature name] system.

**Instructions Added:**
See `docs/user-instructions.md` → "[Feature Name]" section for:
- How to customize [configurable aspect]
- Where to add [content/assets]
- Configuration options and examples

The feature is ready to use with defaults, or you can customize it following the instructions.
```

---

## FEATURE FILE UPDATE PROTOCOL

After completing work, update the relevant feature file in `docs/features/`:

```markdown
## [Feature Name] - [Date]

### What Was Done
- Bullet points of changes

### Files Changed
- path/to/file.ts - description

### Test Status
- Tests: X/Y passing
- Coverage: XX%

### Score: XX/100

### Next Steps
- What's left to do
```

---

## USER TESTING CHECKLIST UPDATE PROTOCOL

**CRITICAL:** After completing ANY work that requires user testing, you MUST update `docs/USER_TESTING_CHECKLIST.md` with new test cases.

### When to Update

Add test cases to the checklist when you complete:
- New features (UI flows, screens, interactions)
- Bug fixes that affect user behavior
- Data model changes that affect the UI
- Navigation changes
- Store/state management changes

### What to Add

For each new feature/fix, add:
1. **Test Case ID** (e.g., TC-R13 for Routine feature #13)
2. **Clear steps** to reproduce
3. **Expected behavior**
4. **Pass/Fail checkbox**
5. **Notes section** for user feedback

### Template

```markdown
### TC-XX: [Brief test name]
**Steps:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** [What should happen]
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```
```

### Example

```markdown
### TC-R13: Progress bar color changes
**Steps:**
1. Start a routine workout
2. Complete sets to reach ~25% progress
3. Verify progress bar color (should be warning/yellow)
4. Complete sets to reach ~50% progress
5. Verify progress bar color (should be primary)
6. Complete sets to reach 100% progress
7. Verify progress bar color (should be success/green)

**Expected:** Colors change based on completion level
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```
```

### After Updating

1. Add a new "Latest Testing Session" section header with the date
2. Group related test cases together
3. Include a summary at the top of what was tested
4. Inform the user that the checklist has been updated

### Example Completion Message

```markdown
## Work Complete

I've added 12 new test cases to `docs/USER_TESTING_CHECKLIST.md` for the routine-based workout flow features.

**Test Coverage:**
- P0: Start workout from routine (2 test cases)
- P1: Routine progress indicator (3 test cases)
- P2: Workout summary screen (4 test cases)
- P3: Quick-start from list (3 test cases)

Please open the checklist and run through the tests on Expo Go when you're ready!
```

---

## PROGRESS.MD UPDATE PROTOCOL

Update `docs/progress.md` when:
- A feature is completed
- A bug is fixed
- Quality score changes significantly
- A milestone is reached

```markdown
### [Date]
- [Action]: [Brief description]
```

---

## QUALITY GATES

### Before Starting Work
- [ ] Tests currently pass (`npm test`)
- [ ] No critical blocking bugs
- [ ] Clear acceptance criteria

### Before Marking Complete
- [ ] All tests pass
- [ ] Score >= 70%
- [ ] Feature file updated
- [ ] No new TypeScript errors
- [ ] **USER_TESTING_CHECKLIST.md updated with new test cases**

### Before User Testing (Expo Go)
- [ ] Score >= 90%
- [ ] Manual review complete
- [ ] Test checklist prepared

---

## USER INTERACTION POINTS

### Mandatory Check-ins
1. **Task Selection** - Confirm which task to work on
2. **Scope Questions** - If requirements unclear, ask before building
3. **Completion Report** - Present score and summary

### Optional Check-ins
- Major architectural decisions
- Multiple valid approaches
- Discovered additional work

### Using AskUserQuestion

When Claude needs input:
```
Claude uses AskUserQuestion tool with:
- Clear question
- Options if applicable
- Context for decision
```

---

## INTERVIEW / ASKUSERQUESTION ARCHIVE PROTOCOL

**CRITICAL:** After conducting ANY interview or extended AskUserQuestion session (3+ questions), you MUST save the full transcript to `docs/AskUQ/`.

### When to Save
- Feature brainstorming sessions
- Requirements gathering interviews
- Design decision discussions
- Any multi-question AskUserQuestion flow

### File Naming
`docs/AskUQ/YYYY-MM-DD-topic-name.md`

Example: `docs/AskUQ/2026-01-29-feature-brainstorm.md`

### What to Include
- Date and participants
- Context (what prompted the interview)
- Every question asked and the user's full answer
- Decisions made
- Summary table of outcomes/action items

### After Saving
1. Inform the user that the interview has been archived
2. Reference the file path in your completion message

### Post-Interview: Update All Docs

**CRITICAL:** After any interview or brainstorm session that introduces new features, changes existing features, or makes design/business decisions, you MUST update ALL affected documentation:

1. **Analyze the interview** for new features, changed features, and decisions
2. **Update `docs/FEATURE-MASTER.md`:**
   - Add new feature groups to the summary table
   - Update progress counts for changed features
   - Recalculate totals
   - Update development phases if needed
   - Update business model section if needed
3. **Update `docs/MASTER_PLAN.md`:**
   - Update vision, core differentiators, target user if changed
   - Update business model, gamification systems, key features tables
   - Update timeline/phases
   - Update competitive positioning
   - Add decision log entry with date and key decisions
4. **Update existing feature files** (`docs/features/feature-*.md`):
   - Modify any feature files affected by interview decisions
   - Update sub-feature counts, statuses, planned items
5. **Create new feature files** for any brand-new features identified:
   - Follow the standard feature file format (Overview, Sub-Features, Technical Notes, UI Design, Dependencies, Priority)
   - Include source reference (e.g., "Source: 2026-01-29 brainstorm interview")
6. **Inform the user** of all files updated/created with a summary table

This ensures documentation stays synchronized and no decisions are lost between the interview transcript and the living docs.

---

## CURRENT STATE QUICK REFERENCE

### Phase: 0 - Stabilization

### Critical Issues (P0)
- 32 silent error catch blocks
- 20 unsafe JSON.parse calls
- 14 `as any` type casts

### In Progress Features
- Workout Core: 8/20
- Authentication: 4/10
- UI & Design: 6/15

### Completed Features
- Exercise Library: 3/3 (Done)
- Scoring & Ranks: 5/5 (Done)

### Quality Score: 68/100

---

## INVOKING THE WORKFLOW

The workflow is **automatically invoked** when:
1. User asks Claude to work on something
2. Claude identifies work to do
3. A new session begins

**Shortcut triggers:**
- "Let's work" → Start session startup protocol
- "What should we do?" → Priority assessment only
- "Start [task]" → Skip to task with that focus
- "Exercise DB sync" → Run daily exercise database sync

---

## DIRECTIVE: EXERCISE DB SYNC

**Trigger:** User says "exercise db sync" or "sync exercises"

**Purpose:** Incrementally sync exercises from ExerciseDB API to expand the exercise database

**What to do:**

1. **Check sync state**
   - Import and call `getSyncProgress()` from `src/lib/exerciseAPI/syncService`
   - Display current progress (completed/total body parts, percentage)

2. **Determine next body part to sync**
   - Import `BODY_PARTS` from `src/lib/exerciseAPI/exerciseDBService`
   - Import `getSyncState()` to see which body parts are completed
   - Find first uncompleted body part

3. **Sync the body part**
   - Import `syncBodyPart()` from `src/lib/exerciseAPI/syncService`
   - Call with the body part name and progress callback
   - Wait for completion

4. **Report results**
   - Number of new exercises fetched
   - Total exercises now in database
   - Updated sync progress percentage

5. **Repeat or finish**
   - If sync quota remaining (~500/day free tier), ask to sync another body part
   - If quota exhausted, report completion and suggest returning tomorrow

**Notes:**
- API key must be set in `.env`: `EXPO_PUBLIC_EXERCISEDB_API_KEY`
- Free tier: 500 requests/day = ~14 body parts full sync, or daily incremental sync
- Target: 3,000+ exercises within 60 days
- Name simplification automatically removes verbose descriptors

**Files involved:**
- `src/lib/exerciseAPI/syncService.ts` - Sync functions
- `src/lib/exerciseAPI/exerciseDBService.ts` - API client
- `src/lib/exerciseAPI/nameSimplifier.ts` - Name cleanup
- `docs/exercise-db-api.md` - Full documentation

---

## EXAMPLE SESSION

```
User: "hey let's work"

Claude: "Running startup checks...
✓ Tests passing (203/203)
✓ Current phase: 0 - Stabilization
✓ Quality score: 68/100

Based on current state, I recommend:
1. [P0] Fix 32 silent error catch blocks (audit finding)
2. [P1] Complete routine-based workout flow (Phase 1 prep)
3. [P2] Add integration tests for workout persistence

Which would you like to tackle?"

User: "1"

Claude: "[Enters work loop]
Understanding scope...
- Found 32 catch blocks with empty/silent handling
- Files affected: [list]

Acceptance criteria:
- All catch blocks either log, report, or handle errors
- No silent failures
- Tests verify error handling

Building fix..."

[...work loop continues...]

Claude: "Task complete!

## Score: 87/100
- Functionality: 38/40
- Tests: 22/25
- Code Quality: 15/15
- Documentation: 7/10
- Edge Cases: 5/10

Summary: Fixed 32/32 silent catch blocks. All now log to errorHandler.
Tests added for 8 critical paths. 2 catch blocks need user decision
on proper fallback behavior.

Ready for next task or want to address the 2 edge cases?"
```

---

*This workflow is living documentation. Update as process improves.*

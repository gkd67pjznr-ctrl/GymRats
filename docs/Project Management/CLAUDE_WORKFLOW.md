# CLAUDE WORKFLOW CONFIG

**Version:** 1.1
**Created:** 2026-01-27
**Updated:** 2026-01-30
**Purpose:** Standardized work loop for all development sessions

---

## SESSION STARTUP PROTOCOL

When a new session begins, Claude will:

### 1. Status Check (Always)
```
1. Read docs/progress.md - current state
2. Read docs/FEATURE-MASTER.md - feature status
3. Read all files in docs/features
4. Run `npm test` - verify test suite passes
5. Check for any blocking issues
6. [Maestro] Check if feature documentation sync needed
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
  1. [P0] Fix failing tests (159 currently failing)
  2. [P1] Complete backend sync integration with Supabase
  3. [P2] Implement OAuth authentication (Google/Apple)

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
│      └── Add test cases to USER_TESTING_CHECKLIST.md        │
│      └── Update codebase-analysis.md if needed              │
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

### Visual Style Documentation

When working on UI/UX features, always reference the visual style documentation:
- `docs/visual-style/ui-aesthetic-implementation.md` - Complete implementation strategy
- `docs/visual-style/visual-style-guide.md` - Detailed design specifications
- `docs/visual-style/implementation-roadmap.md` - Phased approach and timeline

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

## MAESTRO DUTIES

**Purpose:** Synchronize feature documentation across all Forgerank worktrees to maintain a single source of truth for feature implementation status.

### Routine Scanning Protocol

Maestro will periodically scan all Forgerank repositories to accumulate feature implementation information:

```
Repositories to scan:
- /projects/forgerank (main)
- /projects/forgerank-devs
- /projects/forgerank-qwen (current)
- /projects/forgerank-glm
```

### Documentation Synchronization Process

1. **Read Key Documentation Files** from each repository:
   - `docs/FEATURE-MASTER.md` - Overall feature progress
   - `docs/progress.md` - Implementation timeline
   - `docs/PROJECT_STATUS.md` - Current project status
   - `docs/features/feature-*.md` - Individual feature status
   - `docs/USER_TESTING_CHECKLIST.md` - Test coverage
   - `docs/codebase-analysis.md` - Technical analysis

2. **Compare and Accumulate** information:
   - Identify new features or status changes in other repositories
   - Preserve all existing information without deletion
   - Only add information that advances feature status (never go backwards)
   - Maintain consistency in documentation style

3. **Update Current Repository** (`/projects/forgerank-qwen`):
   - Update `docs/FEATURE-MASTER.md` with accumulated feature status
   - Update individual feature files in `docs/features/`
   - Update `docs/progress.md` with new implementation entries
   - Update `docs/PROJECT_STATUS.md` with current phase and feature status
   - Add test cases to `docs/USER_TESTING_CHECKLIST.md` for new features
   - Create summary documentation files when appropriate

4. **Create Summary Documentation:**
   - `docs/feature-synchronization-summary.md` - Track all changes made
   - `docs/project-status-update-summary.md` - Summarize PROJECT_STATUS.md updates
   - Implementation summary files for major feature groups

### Key Principles

- **Only Update Current Repository**: Make changes only to files in the current repository (Forgerank-qwen)
- **No Deletions**: Preserve all existing content without removing any information
- **Accumulate Forward**: Only add information that advances feature status, never go backwards
- **Consistency**: Maintain consistent documentation style and structure
- **Completeness**: Ensure all feature implementations are properly documented

### Verification Process

After synchronization, verify:
- No existing information was deleted
- Only additive changes were made
- Documentation remains consistent and accurate
- All implemented features are properly tracked
- Testing documentation is comprehensive
- Project status reflects current development state

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

### Phase: 2 - Advanced Features (AI Gym Buddy, Analytics, and Social Enhancements)

### Critical Issues (P0)
- 160 failing tests
- Backend sync integration incomplete
- OAuth authentication not working

### In Progress Features
- Workout Core: 15/20
- Authentication: 7/10
- Backend & Sync: 9/10
- UI & Design: 12/15
- Notifications: 1/4
- Onboarding: 3/7
- Avatar & Hangout Room: 4/8
- Forge Lab (Analytics): 3/6

### Completed Features
- Exercise Library: 3/3 (Done)
- Scoring & Ranks: 5/5 (Done)
- Workout Logging UX: 10/10 (Done)
- Gamification: 12/12 (Done)
- AI Gym Buddy: 11/11 (Done)
- Workout Replay: 5/5 (Done)
- Forge Milestones: 5/5 (Done)
- UI Themes & Visual Style: 12/12 (Done)
- Forge DNA: 4/4 (Done)

### Quality Score: 75/100

### Visual Style Documentation
- UI Aesthetic Implementation Plan: Complete
- Visual Style Guide: Complete
- Implementation Roadmap: Complete
- Located in: `docs/visual-style/`

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
- "Maestro scan" → Run feature documentation synchronization across all worktrees
- "Fix errors" → Run expo error log fixing protocol

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
## DIRECTIVE: FIX EXPO ERROR LOGS

**Trigger:** User says "fix errors" or similar request to fix expo errors

**Purpose:** Check the latest error logs in the `expo-errors` folder, fix any errors found, prompt user to restart npm/npx when finished, and delete the error log (but NOT the folder)

**What to do:**

1. **Check for expo-errors folder**
   - Look for `expo-errors` directory in project root
   - If folder doesn't exist, create it (will be needed for future errors)
   - Note: NEVER delete the `expo-errors` folder itself, only individual log files

2. **Find latest error log**
   - List all `.log` files in `expo-errors/` sorted by modification time (newest first)
   - If no logs found, inform user there are no recent error logs to fix
   - Read the most recent log file to understand the error

3. **Analyze and fix errors**
   - Common error patterns to look for:
     - "Unable to resolve" import path errors → fix import paths
     - TypeScript/compilation errors → fix type issues
     - Package version mismatches → update packages if possible
     - Missing modules/files → create missing files or fix imports
   - Apply fixes based on error type
   - Document what was fixed

4. **Prompt user to restart**
   - After applying fixes, inform user to restart the development server:
     ```
     npm start
     # or
     npx expo start
     ```
   - This ensures Metro bundler picks up the changes

5. **Clean up (critical rules)**
   - ✅ **DO** delete the specific `.log` file that was just fixed
   - ✅ **DO** keep the `expo-errors` folder itself (don't delete)
   - ✅ **DO** note that error logs are gitignored (`expo-errors/*.log`)
   - ✅ **DO** inform user which log file was deleted
   - ❌ **NEVER** delete the `expo-errors` folder
   - ❌ **NEVER** delete logs before analyzing/fixing them

**Common Error Patterns & Fixes:**

| Error Pattern | Likely Cause | Fix Approach |
|---------------|--------------|--------------|
| "Unable to resolve" | Incorrect import path | Fix relative import paths |
| "Module not found" | Missing file/directory | Create missing file or fix path |
| TypeScript errors | Type mismatches, missing exports | Add proper type annotations |
| Package mismatches | `expo-doctor` warnings | Update packages with `npx expo install` |
| Metro bundler failures | Import resolution issues | Check circular dependencies |

**Example Flow:**
```
User: "fix errors"

Claude: "Checking expo-errors folder...
Found: expo-20260131-221322.log
Reading error log...

Error detected: Unable to resolve "../lib/gamification/shop"
Fixing import path in src/lib/stores/index.ts...

✅ Fixed: Changed "../lib/gamification/shop" → "../gamification/shop"

Please restart your development server:
npm start

Deleting error log: expo-20260131-221322.log
The expo-errors folder remains for future errors."
```

**Files involved:**
- `expo-errors/` directory - error logs from Metro bundler
- Various source files - depending on the specific errors

---
## EXAMPLE SESSION

```
User: "hey let's work"

Claude: "Running startup checks...
✓ Tests currently failing (159/1219)
✓ Current phase: 2 - Advanced Features
✓ Quality score: 75/100

Based on current state, I recommend:
1. [P0] Fix failing tests (159 currently failing)
2. [P1] Complete backend sync integration with Supabase
3. [P2] Implement OAuth authentication (Google/Apple)

Which would you like to tackle?"
```

---

*This workflow is living documentation. Update as process improves.*
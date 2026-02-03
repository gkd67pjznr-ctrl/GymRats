# Admin Workflow Commands

**Version:** 1.0
**Created:** 2026-02-02
**Purpose:** Quick reference for all trigger commands that invoke specific Claude workflows

---

## Overview

These commands are shortcuts that trigger specific automated workflows in Claude. Use them to quickly initiate common development tasks without explaining the full context each time.

---

## Session Management Commands

### `Let's work`
**Triggers:** Full Session Startup Protocol

**What it does:**
- Runs status check (tests, branch, critical issues)
- Reads progress documentation
- Assesses priorities and presents top 3 recommended tasks
- Waits for task confirmation

**Use when:** Starting a new development session and want Claude to assess current state

---

### `What should we do?`
**Triggers:** Priority Assessment Only

**What it does:**
- Skips status check
- Presents top 3 recommended tasks based on priority matrix
- Does not run full startup protocol

**Use when:** You know the current state and just want task recommendations

---

### `Start [task]`
**Triggers:** Jump to Specific Task

**What it does:**
- Skips status check and priority assessment
- Immediately begins work on the specified task

**Examples:**
- "Start Forge Lab analytics"
- "Start fixing tests"
- "Start OAuth implementation"

**Use when:** You know exactly what you want to work on

---

## Data Sync Commands

### `Exercise DB sync` or `sync exercises`
**Triggers:** Exercise Database Sync Workflow

**What it does:**
1. Checks current sync progress
2. Determines next body part to sync
3. Fetches exercises from ExerciseDB API
4. Adds new exercises to local database
5. Reports results and updated progress

**Notes:**
- API key required: `EXPO_PUBLIC_EXERCISEDB_API_KEY`
- Free tier: 500 requests/day (~14 body parts)
- Target: 3,000+ exercises within 60 days

**Files involved:**
- `src/lib/exerciseAPI/syncService.ts`
- `src/lib/exerciseAPI/exerciseDBService.ts`
- `src/lib/exerciseAPI/nameSimplifier.ts`

---

## Documentation Commands

### `Maestro scan`
**Triggers:** Feature Documentation Synchronization

**What it does:**
- Scans all GymRats worktrees for feature updates
- Reads feature documentation from each repository
- Accumulates and synchronizes changes to current repository
- Updates FEATURE-MASTER.md, progress.md, and feature files
- Preserves all existing information (additive only)

**Repositories scanned:**
- /projects/gymrats (main)
- /projects/gymrats-devs
- /projects/gymrats-qwen
- /projects/gymrats-glm

**Use when:** You want to sync feature documentation across all worktrees

---

## Debugging Commands

### `Fix errors` or `Fix expo errors`
**Triggers:** Expo Error Log Fixing Protocol

**What it does:**
1. Checks `expo-errors/` folder for latest error log
2. Analyzes error patterns
3. Applies fixes based on error type
4. Prompts user to restart development server
5. Deletes the fixed log file (keeps folder)

**Common error patterns fixed:**
- "Unable to resolve" import path errors
- TypeScript/compilation errors
- Package version mismatches
- Missing modules/files
- Metro bundler failures

**Example flow:**
```
User: "fix errors"

Claude: Checking expo-errors folder...
Found: expo-20260131-221322.log
Reading error log...

Error detected: Unable to resolve "../lib/gamification/shop"
Fixing import path...

✅ Fixed: Changed "../lib/gamification/shop" → "../gamification/shop"

Please restart: npm start
Deleting error log: expo-20260131-221322.log
```

---

## Command Reference Table

| Command | Trigger | Category | Description |
|---------|---------|----------|-------------|
| `Let's work` | Session Startup | Session Management | Full status check + task recommendations |
| `What should we do?` | Priority Assessment | Session Management | Task recommendations only |
| `Start [task]` | Jump to Task | Session Management | Skip to specific task |
| `Exercise DB sync` | Exercise Sync | Data Sync | Sync exercises from ExerciseDB API |
| `sync exercises` | Exercise Sync | Data Sync | Alias for Exercise DB sync |
| `Maestro scan` | Documentation Sync | Documentation | Sync feature docs across worktrees |
| `Fix errors` | Error Fixing | Debugging | Fix expo error logs |
| `Fix expo errors` | Error Fixing | Debugging | Alias for Fix errors |

---

## Adding New Commands

To add a new workflow command:

1. **Define the trigger** - What phrase will invoke it?
2. **Document the workflow** - What should Claude do?
3. **Add to this file** - Update this reference
4. **Update CLAUDE_WORKFLOW.md** - Add to the shortcut triggers section

**Template:**
```markdown
### `[command phrase]`
**Triggers:** [Workflow Name]

**What it does:**
1. Step one
2. Step two
3. Step three

**Use when:** [Context for when to use]
```

---

## Notes

- Commands are case-insensitive but use the exact phrases shown
- Commands can be combined with additional context
- Example: "Start Forge Lab analytics but focus on charts first"
- Claude will acknowledge the command and follow the defined workflow

---

*Last updated: 2026-02-02*

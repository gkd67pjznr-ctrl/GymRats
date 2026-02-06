# Documentation Restructuring Plan

**Created:** 2026-02-05
**Status:** Pending Approval

---

## Executive Summary

This plan outlines the restructuring of GymRats documentation to eliminate duplicates, fix naming inconsistencies, and create a navigable system. The current state has 112+ markdown files across 15+ folders with inconsistent naming (spaces, mixed case) and significant duplicate content.

### Key Changes:
- Rename 8 folders to lowercase-kebab-case
- Archive 25+ outdated/duplicate files
- Merge duplicate content into authoritative documents
- Update all cross-references in README.md and CLAUDE.md

---

## Phase 1: Document Inventory & Analysis

### Total Files Analyzed: 112+

### Folder Summary

| Current Folder | Files | Issues |
|----------------|-------|--------|
| `Codebase Analysis/` | 12 | Spaces in name; 5 duplicate/overlapping docs |
| `Feature Work Documents/` | 3 | Spaces in name; all outdated completion summaries |
| `Master Documentation/` | 12 | Spaces in name; some overlap with root docs |
| `Notifications/` | 4 | 3 duplicate summary files |
| `Project Management/` | 5 | Spaces in name; 1 consolidation plan (completed) |
| `Synchronization/` | 3 | 2 outdated sync summaries |
| `visual-style/` | 15 | 3 subfolders with spaces; 2 roadmap versions |
| `AskUQ/` | 4 | Should rename to `interviews/` |
| `Authentication/` | 3 | Fine, just needs lowercase |
| `Testing/` | 3 | Fine, just needs lowercase |
| `Themes/` | 2 | Should merge into visual-style |
| `features/` | 34 | 2 folders with caps (Avatar, Gamification) |
| `data/` | 3 | Fine |
| `infrastructure/` | 1 | Fine |

---

## Phase 2: Documents to Archive

### 2.1 Codebase Analysis Duplicates

These files cover the same topics (architecture, state management, technology stack) with 70-90% overlap:

| File | Reason | Archive To |
|------|--------|------------|
| `Codebase Analysis/analysis-summary.md` | Superseded by `3-CODEBASE-GUIDE.md` | `archive/superseded/` |
| `Codebase Analysis/codebase-analysis.md` | Superseded by `3-CODEBASE-GUIDE.md` | `archive/superseded/` |
| `Codebase Analysis/comprehensive-codebase-summary.md` | Superseded by `3-CODEBASE-GUIDE.md` | `archive/superseded/` |
| `Codebase Analysis/current-state-and-next-steps.md` | Outdated (Jan 2026), superseded by `1-PROJECT-STATUS.md` | `archive/superseded/` |
| `Codebase Analysis/architecture.md` | Superseded by `3-CODEBASE-GUIDE.md` | `archive/superseded/` |

### 2.2 Feature Work Documents (All Completed Work)

These are completion summaries for work that's now done - historically useful but cluttering active docs:

| File | Reason | Archive To |
|------|--------|------------|
| `Feature Work Documents/FINAL_SUMMARY.md` | Live Workout Together SQL - completed work | `archive/completed-work/` |
| `Feature Work Documents/IMPLEMENTATION_COMPLETE.md` | Live Workout Together SQL - completed work | `archive/completed-work/` |
| `Feature Work Documents/README.md` | Directory readme for archived folder | `archive/completed-work/` |

### 2.3 Notifications Duplicates

Three files covering the same notification implementation status:

| File | Reason | Archive To |
|------|--------|------------|
| `Notifications/NOTIFICATIONS_DOCUMENTATION_UPDATE.md` | Duplicates IMPLEMENTATION_SUMMARY | `archive/old-summaries/` |
| `Notifications/NOTIFICATIONS_UPDATE_SUMMARY.md` | Duplicates IMPLEMENTATION_SUMMARY | `archive/old-summaries/` |

**Keep:** `Notifications/NOTIFICATIONS_IMPLEMENTATION_SUMMARY.md` (most complete, merge unique content)

### 2.4 Synchronization Outdated Files

These describe a sync script run that's completed:

| File | Reason | Archive To |
|------|--------|------------|
| `Synchronization/feature-synchronization-summary.md` | Outdated script run summary | `archive/old-summaries/` |
| `Synchronization/final-synchronization-summary.md` | Outdated script run summary | `archive/old-summaries/` |
| `Synchronization/README.md` | Empty directory readme | `archive/old-summaries/` |

### 2.5 Visual Style Superseded Roadmaps

Keep v2, archive v1:

| File | Reason | Archive To |
|------|--------|------------|
| `visual-style/implementation-roadmap.md` | Superseded by implementation-roadmap-v2.md | `archive/superseded/` |

### 2.6 Root-Level Outdated Summary

| File | Reason | Archive To |
|------|--------|------------|
| `DOCUMENTATION_ORGANIZATION_SUMMARY.md` | Outdated Jan 2026 reorg summary | `archive/old-summaries/` |

### 2.7 Project Management Completed Plans

| File | Reason | Archive To |
|------|--------|------------|
| `Project Management/DOCUMENTATION_CONSOLIDATION_PLAN.md` | Plan was executed, keep for reference | `archive/completed-work/` |

---

## Phase 3: Folder Renames

| Current Name | New Name | Reason |
|--------------|----------|--------|
| `Codebase Analysis/` | `codebase-analysis/` | Remove space, lowercase |
| `Feature Work Documents/` | (delete after archive) | All files archived |
| `Master Documentation/` | `master/` | Shorter, lowercase, no space |
| `Notifications/` | `notifications/` | Lowercase |
| `Project Management/` | `project-management/` | Lowercase, hyphenate |
| `Synchronization/` | (delete after archive) | All files archived |
| `AskUQ/` | `interviews/` | More descriptive name |
| `Authentication/` | `authentication/` | Lowercase |
| `Testing/` | `testing/` | Lowercase |
| `Themes/` | (merge into visual-style) | Consolidate theme docs |
| `visual-style/Iron Forge Palette/` | `visual-style/iron-forge-palette/` | Lowercase, hyphenate |
| `visual-style/Neon Glow Palette/` | `visual-style/neon-glow-palette/` | Lowercase, hyphenate |
| `visual-style/Toxic Energy Palette/` | `visual-style/toxic-energy-palette/` | Lowercase, hyphenate |
| `features/Avatar/` | `features/avatar/` | Lowercase |
| `features/Gamification/` | `features/gamification/` | Lowercase (already exists lowercase!) |

**Note:** `features/Gamification/` appears to be a duplicate - need to check if content differs from `features/gamification/` (if it exists).

---

## Phase 4: File Renames

### 4.1 SCREAMING-CAPS to kebab-case

| Current Name | New Name |
|--------------|----------|
| `OAUTH_SETUP.md` | `oauth-setup.md` |
| `SUPABASE_SETUP.md` | `supabase-setup.md` |
| `CLAUDE_WORKFLOW.md` | `claude-workflow.md` |
| `LIVE_WORKOUT_SCHEMA_COMPLETE.md` | `live-workout-schema-complete.md` |
| `LIVE_WORKOUT_TOGETHER_TYPES.md` | `live-workout-together-types.md` |
| `QUICK_REFERENCE_SCHEMA.md` | `quick-reference-schema.md` |
| `SQL_SCHEMA_SUMMARY.md` | `sql-schema-summary.md` |
| `TYPE_DEFINITION_SUMMARY.md` | `type-definition-summary.md` |
| `PRODUCTION-SETUP.md` | `production-setup.md` |
| `PROJECT-DEPENDENCIES.md` | `project-dependencies.md` |
| `TESTING_PLAN_MASTER.md` | `testing-plan-master.md` |
| `USER_TESTING_CHECKLIST.md` | `user-testing-checklist.md` |
| `NOTIFICATIONS_IMPLEMENTATION_SUMMARY.md` | `notifications-implementation-summary.md` |
| `FEATURE-MASTER.md` | `feature-master.md` |
| `FEATURE_PRIORITIES_SUMMARY.md` | `feature-priorities-summary.md` |
| `MASTER_PLAN.md` | `master-plan.md` |
| `INTERVIEW-SUMMARY-2026-02-04.md` | `interview-summary-2026-02-04.md` |
| `VISION-AND-CULTURE.md` | `vision-and-culture.md` |
| `NAMING-GUIDE.md` | `naming-guide.md` |
| `VOICE-MEMO-SUMMARY-2026-02-05.md` | `voice-memo-summary-2026-02-05.md` |
| `BUDDY-CUES-MASTER.md` | `buddy-cues-master.md` |
| `BUDDY-CUES-TOTALS.md` | `buddy-cues-totals.md` |
| `EXERCISE-DATABASE-MASTER.md` | `exercise-database-master.md` |
| `SERVER-INFRASTRUCTURE.md` | `server-infrastructure.md` |
| `API_REFERENCE.md` | `api-reference.md` |
| `DOCUMENTATION_INDEX.md` | `documentation-index.md` |
| `LIVE_WORKOUT_TOGETHER_COMPREHENSIVE.md` | `live-workout-together-comprehensive.md` |
| `USAGE_EXAMPLES.md` | `usage-examples.md` |
| `BUSINESS-SETUP.md` | (git-ignored, skip) |
| `LAUNCH-CHECKLIST.md` | (git-ignored, skip) |
| `MONETIZATION-PLAN.md` | (git-ignored, skip) |

### 4.2 Keep Numbered Prefixes

These files should keep their numbered prefixes for sort order:

| File | Status |
|------|--------|
| `1-PROJECT-STATUS.md` | Keep as-is |
| `3-CODEBASE-GUIDE.md` | Keep as-is |

---

## Phase 5: Content Merges

### 5.1 Themes Folder Merge

**Merge:** `Themes/theme-system.md` into `visual-style/README.md` or create `visual-style/theme-overview.md`

**Action:** Archive `Themes/` folder after merge, update links.

### 5.2 Notifications Folder Cleanup

**Keep:** `NOTIFICATIONS_IMPLEMENTATION_SUMMARY.md` (rename to kebab-case)
**Merge unique content from:**
- `NOTIFICATIONS_DOCUMENTATION_UPDATE.md`
- `NOTIFICATIONS_UPDATE_SUMMARY.md`

Both duplicates have 90%+ overlap with the implementation summary.

---

## Phase 6: New Folder Structure (After Changes)

```
docs/
├── README.md                           # Documentation hub (updated)
├── 1-PROJECT-STATUS.md                 # Project status (keep numbered)
├── 3-CODEBASE-GUIDE.md                 # Codebase guide (keep numbered)
├── expo-package-migration-plan.md      # Package migration tracking
│
├── master/                             # Core master documentation
│   ├── README.md
│   ├── master-plan.md
│   ├── feature-master.md
│   ├── feature-priorities-summary.md
│   ├── production-setup.md
│   ├── project-dependencies.md
│   ├── testing-plan-master.md
│   ├── user-testing-checklist.md
│   ├── user-instructions.md
│   ├── vision-and-culture.md
│   ├── naming-guide.md
│   ├── interview-summary-2026-02-04.md
│   └── voice-memo-summary-2026-02-05.md
│
├── features/                           # Feature documentation (31 folders)
│   ├── ai-buddy/
│   ├── authentication/
│   ├── avatar/                         # Renamed from Avatar
│   ├── backend-sync/
│   ├── ... (27 more feature folders)
│   └── workout-logging/
│
├── codebase-analysis/                  # Technical analysis docs
│   ├── README.md
│   ├── exercise-db-api.md
│   ├── sql-schema-summary.md
│   ├── live-workout-schema-complete.md
│   ├── live-workout-together-types.md
│   ├── quick-reference-schema.md
│   ├── type-definition-summary.md
│   └── error-boundary-usage.md
│
├── project-management/                 # Internal processes
│   ├── README.md
│   ├── claude-workflow.md
│   ├── admin-workflow-commands.md
│   └── notes.md
│
├── authentication/                     # Auth setup guides
│   ├── README.md
│   ├── oauth-setup.md
│   └── supabase-setup.md
│
├── notifications/                      # Notification system
│   ├── README.md
│   └── notifications-implementation-summary.md
│
├── testing/                            # Testing documentation
│   ├── README.md
│   ├── test-failures.md
│   └── user-test-checklist.md
│
├── visual-style/                       # Design system
│   ├── README.md
│   ├── visual-style-guide.md
│   ├── ui-aesthetic-implementation.md
│   ├── visual-system-architecture.md
│   ├── theme-implementation-plan.md
│   ├── implementation-roadmap-v2.md    # Kept, v1 archived
│   ├── cue-system-implementation.md
│   ├── premium-content-system.md
│   ├── theme-pack-development-guide.md
│   ├── theme-database-extensions-implementation.md
│   ├── asset-integration-guide.md
│   ├── ai-image-generation-tools.md
│   ├── iron-forge-palette/
│   │   └── analysis.md
│   ├── neon-glow-palette/
│   │   └── analysis.md
│   └── toxic-energy-palette/
│       └── analysis.md
│
├── interviews/                         # User interviews (renamed from AskUQ)
│   ├── 2026-01-29-feature-brainstorm.md
│   ├── 2026-02-02-workout-ux-vision.md
│   ├── interview-2026-02-04-comprehensive.md
│   └── aesthetics/
│       └── aestheticIdeas.md
│
├── data/                               # Data reference files
│   ├── buddy-cues-master.md
│   ├── buddy-cues-totals.md
│   └── exercise-database-master.md
│
├── infrastructure/                     # Server/deployment docs
│   └── server-infrastructure.md
│
├── business/                           # Git-ignored, private
│   └── ...
│
└── archive/                            # Archived documentation
    ├── RESTRUCTURE-PLAN.md             # This file (for reference)
    ├── superseded/                     # Old versions replaced by newer
    │   ├── analysis-summary.md
    │   ├── codebase-analysis.md
    │   ├── comprehensive-codebase-summary.md
    │   ├── current-state-and-next-steps.md
    │   ├── architecture.md
    │   └── implementation-roadmap.md
    ├── completed-work/                 # Feature work that's done
    │   ├── live-workout-together-sql-final-summary.md
    │   ├── live-workout-together-sql-implementation-complete.md
    │   └── documentation-consolidation-plan.md
    └── old-summaries/                  # Outdated summary documents
        ├── notifications-documentation-update.md
        ├── notifications-update-summary.md
        ├── feature-synchronization-summary.md
        ├── final-synchronization-summary.md
        └── documentation-organization-summary.md
```

---

## Phase 7: Reference Updates

### 7.1 docs/README.md Updates

Update all paths from:
- `Master Documentation/` -> `master/`
- `Project Management/` -> `project-management/`
- `Codebase Analysis/` -> `codebase-analysis/`
- `AskUQ/` -> `interviews/`
- SCREAMING-CAPS filenames -> kebab-case

### 7.2 CLAUDE.md Updates

Update paths in:
- Feature Documentation section
- Quick Commands Summary table
- Work Session Protocol references

### 7.3 Feature File Cross-References

Search and update any internal links to renamed files/folders.

---

## Execution Order

### Step 1: Create Archive Structure
```bash
mkdir -p docs/archive/{superseded,completed-work,old-summaries}
```

### Step 2: Archive Files (mv commands)
Move all files identified in Phase 2 to appropriate archive subdirectories.

### Step 3: Delete Empty Folders
Remove `Feature Work Documents/`, `Synchronization/` after archiving.

### Step 4: Rename Folders
Rename all folders identified in Phase 3.

### Step 5: Rename Files
Rename all files identified in Phase 4.

### Step 6: Merge Content
Merge `Themes/` content and notification duplicates.

### Step 7: Update References
Update `docs/README.md` and `CLAUDE.md` with new paths.

### Step 8: Verify
Run tree command and check all links work.

---

## Risk Assessment

### Low Risk
- Archiving old files (preserves history)
- Folder renames (no content change)
- File renames (no content change)

### Medium Risk
- Content merges (may lose unique information)
- Reference updates (may miss some links)

### Mitigation
- All archived files preserved (not deleted)
- Run grep to find all internal markdown links before updating
- Verify README.md links after restructure

---

## Approval Required

Before executing Phase 3+:

1. **Review the archive list** - Any files that should NOT be archived?
2. **Review the rename list** - Any names that should stay as-is?
3. **Review the merge list** - Any content that should remain separate?

**Please confirm to proceed with execution.**

---

## Post-Execution Verification

After completion, verify:

- [ ] All folders use lowercase-kebab naming
- [ ] All files use kebab-case naming (except numbered prefixes)
- [ ] No duplicate documents exist in active folders
- [ ] docs/archive/ contains all outdated documents
- [ ] docs/README.md links all work correctly
- [ ] CLAUDE.md references are updated
- [ ] `tree docs -L 2 --dirsfirst` shows clean structure

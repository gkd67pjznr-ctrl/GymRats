# Documentation Consolidation Plan

**Date:** 2026-02-02
**Purpose:** Eliminate duplication and organize documentation efficiently

---

## Current State Analysis

### Total Documentation Files
- **3,138 lines** across 7 major master/summary documents
- **Multiple locations** tracking similar information
- **Inconsistent update patterns** - some docs updated, others stale

---

## Duplicated Content Identified

### 1. Project Status & Progress (3 files)

| File | Location | Lines | Primary Content | Duplication |
|------|----------|-------|-----------------|-------------|
| `PROJECT_STATUS.md` | Project Management | 228 | Feature status table, what's working, critical issues | 90% overlap with others |
| `progress.md` | Project Management | 620 | Timeline, milestones, recent changes | 80% overlap with PROJECT_STATUS |
| `FEATURE-MASTER.md` | Master Documentation | 705 | Feature counts, status by group | 70% overlap with PROJECT_STATUS |

**Duplicate Information:**
- Feature completion percentages
- Status tables (Done/In Progress/Planned)
- "What's Working" lists
- Critical issues lists
- Quality score metrics

---

### 2. Codebase Analysis (3 files)

| File | Location | Lines | Primary Content | Duplication |
|------|----------|-------|-----------------|-------------|
| `codebase-analysis.md` | Codebase Analysis | 456 | Architecture overview, file structure | 85% overlap with comprehensive |
| `comprehensive-codebase-summary.md` | Codebase Analysis | 326 | Tech stack, state management | 80% overlap with codebase-analysis |
| `current-state-and-next-steps.md` | Codebase Analysis | 237 | Current state, critical issues, next steps | 90% overlap with PROJECT_STATUS |

**Duplicate Information:**
- Technology stack listings
- Architecture descriptions
- Store/state management listings
- Critical issues (same as PROJECT_STATUS.md)
- Feature status summaries

---

### 3. Master Planning (2 files)

| File | Location | Lines | Primary Content | Duplication |
|------|----------|-------|-----------------|-------------|
| `MASTER_PLAN.md` | Master Documentation | 566 | Vision, core differentiators, roadmap | 50% overlap with FEATURE-MASTER |
| `FEATURE-MASTER.md` | Master Documentation | 705 | Feature breakdown, counts, status | Links to individual feature files |

**Duplicate Information:**
- Core differentiators
- Feature group descriptions
- Business model sections
- Roadmap phases

---

### 4. Feature Implementation Summaries (4 files)

| File | Location | Purpose | Overlap |
|------|----------|---------|---------|
| `forge-lab-summary.md` | features | Forge Lab completion summary | Duplicate of feature-forge-lab.md |
| `forge-lab-summary-updated.md` | features | Updated Forge Lab summary | Duplicate of above |
| `forge-lab-implementation-complete.md` | features | Forge Lab implementation complete | Duplicate of above |
| `forge-milestones-summary.md` | features | Forge Milestones summary | Duplicate of feature-forge-milestones.md |
| `forge-milestones-implementation-complete.md` | features | Forge Milestones implementation | Duplicate of above |
| `forge-dna-phase1-enhancements.md` | features | Forge DNA phase 1 updates | Duplicate of feature-forge-dna.md |

---

### 5. Visual Style Documentation (Multiple versions)

| File | Location | Lines | Issue |
|------|----------|-------|-------|
| `implementation-roadmap.md` | visual-style | ~120 | Old version |
| `implementation-roadmap-v2.md` | visual-style | ~140 | Newer version |
| `ui-aesthetic-implementation.md` | visual-style | ~240 | Main reference |
| `visual-style-guide.md` | visual-style | ~210 | Design specs |
| `theme-system.md` | docs root | ~90 | High-level theme overview |

**Duplication:** Theme system concepts spread across 5 files with varying detail levels

---

## Proposed Consolidation Structure

```
docs/
├── README.md (hub document - NEW)
│   ├── Quick links to all sections
│   └── "Where do I start?" guide
│
├── 1-PROJECT-STATUS.md (consolidated - NEW)
│   ├── Executive summary
│   ├── Feature status table (single source of truth)
│   ├── Critical issues
│   ├── Quality metrics
│   └── Recent updates (from progress.md)
│
├── 2-MASTER-PLAN.md (streamlined - KEEP)
│   ├── Vision statement
│   ├── Core differentiators
│   ├── Business model
│   └── Strategic roadmap
│
├── 3-CODEBASE-GUIDE.md (consolidated - NEW)
│   ├── Architecture overview
│   ├── Technology stack
│   ├── Directory structure
│   ├── Key patterns
│   └── State management reference
│
├── 4-FEATURE-MASTER.md (streamlined - KEEP)
│   ├── Feature group index
│   ├── Links to individual feature files
│   └── Status summary table
│
├── features/ ( KEEP - individual feature files)
│   ├── Workout/feature-workouts.md
│   ├── Auth/feature-auth.md
│   ├── Analytics/feature-forge-lab.md
│   └── (remove all -summary.md and -implementation-complete.md files)
│
├── visual-style/ ( KEEP - consolidate here)
│   ├── README.md (hub)
│   ├── design-system.md (consolidated theme reference)
│   ├── implementation-guide.md (how to implement)
│   └── asset-guidelines.md
│
├── Codebase Analysis/ ( DELETE - move useful content to 3-CODEBASE-GUIDE.md)
├── Project Management/ ( KEEP - internal docs)
│   ├── CLAUDE_WORKFLOW.md
│   ├── admin-workflow-commands.md
│   ├── notes.md
│   └── (remove PROJECT_STATUS.md and progress.md - moved to 1-PROJECT-STATUS.md)
│
└── Archive/ ( NEW - move old/unused docs here)
    ├── Old roadmaps
    ├── Duplicate summaries
    └── Deprecated implementations
```

---

## Specific Actions

### Phase 1: Consolidate Status Documents (HIGH PRIORITY)

**Create:** `docs/1-PROJECT-STATUS.md`

**Sources to combine:**
- `Project Management/PROJECT_STATUS.md` (feature tables, critical issues)
- `Project Management/progress.md` (timeline, recent updates)
- `Codebase Analysis/current-state-and-next-steps.md` (next steps)

**Structure:**
```markdown
# Project Status

## Executive Summary
[From PROJECT_STATUS.md]

## Feature Status Table
[From FEATURE-MASTER.md - single source of truth]

## Critical Issues
[From PROJECT_STATUS.md + current-state-and-next-steps.md]

## Quality Metrics
[From PROJECT_STATUS.md]

## Recent Updates
[From progress.md - last 30 days only]

## Next Steps
[From current-state-and-next-steps.md]
```

**Delete after consolidation:**
- `Project Management/PROJECT_STATUS.md`
- `Project Management/progress.md`
- `Codebase Analysis/current-state-and-next-steps.md`

---

### Phase 2: Consolidate Codebase Documentation (MEDIUM PRIORITY)

**Create:** `docs/3-CODEBASE-GUIDE.md`

**Sources to combine:**
- `Codebase Analysis/codebase-analysis.md` (main content)
- `Codebase Analysis/comprehensive-codebase-summary.md` (state management detail)
- CLAUDE.md sections on architecture

**Structure:**
```markdown
# Codebase Guide

## Getting Started
[Quick overview for new contributors]

## Architecture
[From codebase-analysis.md]

## Technology Stack
[From codebase-analysis.md]

## Directory Structure
[From codebase-analysis.md]

## State Management
[From comprehensive-codebase-summary.md - full store reference]

## Key Patterns
[From CLAUDE.md common patterns]

## Testing
[Test locations and conventions]
```

**Delete after consolidation:**
- `Codebase Analysis/codebase-analysis.md`
- `Codebase Analysis/comprehensive-codebase-summary.md`
- Keep: `Codebase Analysis/README.md` (redirect)

---

### Phase 3: Clean Feature Documentation (MEDIUM PRIORITY)

**Action:** Remove duplicate summary/implementation files

**Files to DELETE:**
```
docs/features/forge-lab-summary.md
docs/features/forge-lab-summary-updated.md
docs/features/forge-lab-implementation-complete.md
docs/features/forge-milestones-summary.md
docs/features/forge-milestones-implementation-complete.md
docs/features/forge-dna-phase1-enhancements.md
docs/features/feature-workout-replay.md (use features/Workout/ instead)
```

**Rationale:** Individual feature files in `features/` subdirectories should be the single source of truth. Add "Implementation Complete" section to the main feature file instead of creating separate summary files.

---

### Phase 4: Consolidate Visual Style Docs (LOW PRIORITY)

**Create:** `docs/visual-style/README.md` (hub)

**Consolidate into:**
- `docs/visual-style/design-system.md` (merge theme-system.md here)
- `docs/visual-style/implementation-guide.md` (merge both roadmaps)

**Files to DELETE:**
- `docs/theme-system.md` (move to visual-style/design-system.md)
- `docs/visual-style/implementation-roadmap.md` (old version)
- `docs/visual-style/implementation-roadmap-v2.md` (merge into implementation-guide.md)

---

### Phase 5: Clean Codebase Analysis Folder (LOW PRIORITY)

**Action:** Archive or delete specialized analysis files

**Files to ARCHIVE:**
```
docs/Codebase Analysis/architecture.md (nice but rarely used)
docs/Codebase Analysis/analysis-summary.md (outdated)
docs/Codebase Analysis/error-boundary-usage.md (specific topic, consider CLAUDE.md)
docs/Codebase Analysis/TYPE_DEFINITION_SUMMARY.md (specific topic)
docs/Codebase Analysis/QUICK_REFERENCE_SCHEMA.md (specific topic)
```

**Keep in Codebase Analysis:**
- `README.md` (redirect to 3-CODEBASE-GUIDE.md)
- `exercise-db-api.md` (specific feature documentation)
- `SQL_SCHEMA_SUMMARY.md` (database reference)
- `LIVE_WORKOUT_SCHEMA_COMPLETE.md` (specific feature)

---

## Benefits of Consolidation

| Before | After | Benefit |
|--------|-------|---------|
| 3 status files | 1 status file | Single source of truth |
| 3 codebase analysis files | 1 codebase guide | Easier onboarding |
| 6+ feature summary files | 0 (use main feature files) | Less confusion |
| ~3,138 lines (7 docs) | ~1,500 lines (4 docs) | 52% reduction |
| Multiple update points | Clear ownership | Always up-to-date |

---

## Implementation Priority

### Do First (This Session)
1. ✅ Create consolidation plan document
2. ⏳ Create `docs/1-PROJECT-STATUS.md`
3. ⏳ Update CLAUDE.md to reference new structure

### Do This Week
4. Create `docs/3-CODEBASE-GUIDE.md`
5. Delete duplicate feature summary files
6. Update `docs/README.md` hub document

### Do When Time Permits
7. Consolidate visual style docs
8. Archive old Codebase Analysis files
9. Clean up Master Documentation folder

---

## Questions for User

1. **Do you want me to proceed with Phase 1 consolidation?** (Create unified PROJECT-STATUS.md)
2. **Should I delete the duplicate feature summary files?** (forge-lab-summary.md, etc.)
3. **Any other documentation areas you'd like me to analyze?**

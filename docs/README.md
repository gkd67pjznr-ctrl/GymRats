# GymRats Documentation Hub

**Last Updated:** 2026-02-03

---

## Quick Navigation

**Start Here →**
- New to the codebase? Read **[3-CODEBASE-GUIDE.md](3-CODEBASE-GUIDE.md)**
- Want project status? Read **[1-PROJECT-STATUS.md](1-PROJECT-STATUS.md)**
- Want the big picture? Read **[Master Documentation/MASTER_PLAN.md](Master%20Documentation/MASTER_PLAN.md)**

---

## Core Documentation

### Project Status & Planning
| Document | Purpose | Last Updated |
|----------|---------|--------------|
| [1-PROJECT-STATUS.md](1-PROJECT-STATUS.md) | Feature status, metrics, priorities | 2026-02-03 |
| [Master Documentation/MASTER_PLAN.md](Master%20Documentation/MASTER_PLAN.md) | Vision, differentiators, roadmap | 2026-02-03 |
| [Master Documentation/FEATURE-MASTER.md](Master%20Documentation/FEATURE-MASTER.md) | Complete feature index | 2026-02-03 |

### Technical Reference
| Document | Purpose | Last Updated |
|----------|---------|--------------|
| [3-CODEBASE-GUIDE.md](3-CODEBASE-GUIDE.md) | Architecture, tech stack, patterns | 2026-02-02 |

---

## Feature Documentation

### All Features (Flat Structure)

| Feature | Folder | Status |
|---------|--------|--------|
| AI Gym Buddy | [features/ai-buddy/](features/ai-buddy/) | 11/11 ✅ |
| AI Coaching | [features/ai-coaching/](features/ai-coaching/) | Planned |
| Authentication | [features/authentication/](features/authentication/) | 8/10 |
| Avatar | [features/Avatar/](features/Avatar/) | 8/8 ✅ |
| Backend Sync | [features/backend-sync/](features/backend-sync/) | 10/10 ✅ |
| Body Model | [features/body-model/](features/body-model/) | 5/5 ✅ |
| Competitions | [features/competitions/](features/competitions/) | Planned |
| Design System | [features/design-system/](features/design-system/) | 15/15 ✅ |
| Exercises | [features/exercises/](features/exercises/) | 3/3 ✅ |
| Forge DNA | [features/forge-dna/](features/forge-dna/) | 4/4 ✅ |
| Forge Lab | [features/forge-lab/](features/forge-lab/) | 6/6 ✅ |
| Forge Milestones | [features/forge-milestones/](features/forge-milestones/) | 5/5 ✅ |
| Forge Seasons | [features/forge-seasons/](features/forge-seasons/) | Planned |
| Gamification | [features/Gamification/](features/Gamification/) | 12/12 ✅ |
| Gym Finder | [features/gym-finder/](features/gym-finder/) | Planned |
| Hangout Room | [features/hangout-room/](features/hangout-room/) | 8/8 ✅ |
| Integrations | [features/integrations/](features/integrations/) | 5/5 ✅ |
| Leaderboards | [features/leaderboards/](features/leaderboards/) | Planned |
| Live Workout Together | [features/live-workout-together/](features/live-workout-together/) | Planned |
| Notifications | [features/notifications/](features/notifications/) | 6/7 ✅ |
| Onboarding | [features/onboarding/](features/onboarding/) | 7/7 ✅ |
| Scoring | [features/scoring/](features/scoring/) | 5/5 ✅ |
| Social Feed | [features/social-feed/](features/social-feed/) | 9/15 |
| Templates Marketplace | [features/templates-marketplace/](features/templates-marketplace/) | Planned |
| Training Journal | [features/training-journal/](features/training-journal/) | 4/4 ✅ |
| UI Themes | [features/ui-themes/](features/ui-themes/) | 7/12 |
| Workout Core | [features/workout-core/](features/workout-core/) | 14/20 |
| Workout Drawer | [features/workout-drawer/](features/workout-drawer/) | 7/8 |
| Workout Logging | [features/workout-logging/](features/workout-logging/) | 10/10 ✅ |
| Workout Replay | [features/workout-replay/](features/workout-replay/) | 5/5 ✅ |

---

## Project Management

| Document | Purpose |
|----------|---------|
| [Project Management/CLAUDE_WORKFLOW.md](Project%20Management/CLAUDE_WORKFLOW.md) | Development workflow and quality gates |
| [Project Management/admin-workflow-commands.md](Project%20Management/admin-workflow-commands.md) | Quick reference commands |

---

## Specialized Documentation

### Visual Style
- [visual-style/README.md](visual-style/README.md) - Design system overview
- [visual-style/ui-aesthetic-implementation.md](visual-style/ui-aesthetic-implementation.md) - Implementation plan
- [visual-style/visual-style-guide.md](visual-style/visual-style-guide.md) - Design specifications
- [visual-style/theme-implementation-plan.md](visual-style/theme-implementation-plan.md) - **NEW** Iron Forge, Toxic Energy, Neon Glow implementation guide

### Codebase Analysis
- [Codebase Analysis/exercise-db-api.md](Codebase%20Analysis/exercise-db-api.md) - ExerciseDB API reference
- [Codebase Analysis/SQL_SCHEMA_SUMMARY.md](Codebase%20Analysis/SQL_SCHEMA_SUMMARY.md) - Database schema reference

### Testing
- [Master Documentation/TESTING_PLAN_MASTER.md](Master%20Documentation/TESTING_PLAN_MASTER.md) - Testing strategy
- [Master Documentation/USER_TESTING_CHECKLIST.md](Master%20Documentation/USER_TESTING_CHECKLIST.md) - User test cases

---

## Documentation Organization

```
docs/
├── README.md (this file)
│
├── 1-PROJECT-STATUS.md          # Project status (SINGLE SOURCE OF TRUTH)
├── 3-CODEBASE-GUIDE.md          # Technical reference
│
├── Master Documentation/
│   ├── MASTER_PLAN.md           # Vision and strategy
│   └── FEATURE-MASTER.md        # Feature index
│
├── features/                    # 31 flat feature folders
│   ├── ai-buddy/
│   ├── authentication/
│   ├── design-system/
│   ├── workout-drawer/
│   └── ... (each feature has its own folder)
│
├── visual-style/                # Design system docs + theme palettes
├── Project Management/           # Internal processes
├── Codebase Analysis/           # Technical deep-dives
└── AskUQ/                       # Interview transcripts
```

---

## Finding Things Quickly

**"What's the current project status?"**
→ Read `1-PROJECT-STATUS.md`

**"How do I add a new feature?"**
→ Read `3-CODEBASE-GUIDE.md` → "Adding a New Exercise/Screen/Store"

**"What features are implemented?"**
→ Read `1-PROJECT-STATUS.md` → "Feature Status (Single Source of Truth)"

**"How does state management work?"**
→ Read `3-CODEBASE-GUIDE.md` → "State Management"

**"What's the vision for the app?"**
→ Read `Master Documentation/MASTER_PLAN.md` → "Vision Statement"

**"Where do I find docs for [feature]?"**
→ Check `features/` folder - each feature has its own folder

---

## For Contributors

**New to GymRats? Start here:**
1. Read [CLAUDE.md](../CLAUDE.md) for project overview
2. Read [3-CODEBASE-GUIDE.md](3-CODEBASE-GUIDE.md) for architecture
3. Read [Project Management/CLAUDE_WORKFLOW.md](Project%20Management/CLAUDE_WORKFLOW.md) for workflow

**Working on a feature?**
- Find the feature folder in `features/`
- Read the feature's `feature-*.md` file for implementation details
- Follow the patterns in `3-CODEBASE-GUIDE.md`

**Updating documentation?**
- Status changes → Update `1-PROJECT-STATUS.md`
- Feature implementation → Update feature's `feature-*.md` file
- New features → Add to `Master Documentation/FEATURE-MASTER.md`

---

*Last updated: 2026-02-03*

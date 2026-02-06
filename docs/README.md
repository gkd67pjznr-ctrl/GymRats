# GymRats Documentation Hub

**Last Updated:** 2026-02-05

---

## Quick Navigation

**Start Here:**
- New to the codebase? Read **[3-CODEBASE-GUIDE.md](3-CODEBASE-GUIDE.md)**
- Want project status? Read **[1-PROJECT-STATUS.md](1-PROJECT-STATUS.md)**
- Want the big picture? Read **[master/master-plan.md](master/master-plan.md)**
- Want cultural/vision context? Read **[master/vision-and-culture.md](master/vision-and-culture.md)**

---

## Core Documentation

### Project Status & Planning
| Document | Purpose | Last Updated |
|----------|---------|--------------|
| [1-PROJECT-STATUS.md](1-PROJECT-STATUS.md) | Feature status, metrics, priorities | 2026-02-04 |
| [master/master-plan.md](master/master-plan.md) | Vision, differentiators, roadmap | 2026-02-03 |
| [master/feature-master.md](master/feature-master.md) | Complete feature index | 2026-02-03 |
| [master/interview-summary-2026-02-04.md](master/interview-summary-2026-02-04.md) | Latest decisions from comprehensive Q&A | 2026-02-04 |
| [master/vision-and-culture.md](master/vision-and-culture.md) | Cultural positioning & vision | 2026-02-04 |
| [master/naming-guide.md](master/naming-guide.md) | Canonical naming conventions | 2026-02-04 |

### Technical Reference
| Document | Purpose | Last Updated |
|----------|---------|--------------|
| [3-CODEBASE-GUIDE.md](3-CODEBASE-GUIDE.md) | Architecture, tech stack, patterns | 2026-02-02 |

### Business (Git-Ignored)
The `business/` folder contains private business documents (LLC, banking, pricing) and is not committed to git.

---

## Feature Documentation

### All Features (Flat Structure)

| Feature | Folder | Status |
|---------|--------|--------|
| AI Gym Buddy | [features/ai-buddy/](features/ai-buddy/) | 11/11 |
| AI Coaching | [features/ai-coaching/](features/ai-coaching/) | Planned |
| Authentication | [features/authentication/](features/authentication/) | 8/10 |
| Avatar | [features/avatar/](features/avatar/) | 8/8 |
| Backend Sync | [features/backend-sync/](features/backend-sync/) | 10/10 |
| Body Model | [features/body-model/](features/body-model/) | 5/5 |
| Competitions | [features/competitions/](features/competitions/) | Planned |
| Design System | [features/design-system/](features/design-system/) | 15/15 |
| Exercises | [features/exercises/](features/exercises/) | 3/3 |
| DNA | [features/forge-dna/](features/forge-dna/) | 4/4 |
| Gym Lab | [features/forge-lab/](features/forge-lab/) | 6/6 |
| Milestones | [features/forge-milestones/](features/forge-milestones/) | 5/5 |
| GymR Seasons | [features/forge-seasons/](features/forge-seasons/) | Planned |
| Gamification | [features/gamification/](features/gamification/) | 12/12 |
| Gym Finder | [features/gym-finder/](features/gym-finder/) | Planned |
| Hangout Room | [features/hangout-room/](features/hangout-room/) | 8/8 |
| Integrations | [features/integrations/](features/integrations/) | 5/5 |
| Leaderboards | [features/leaderboards/](features/leaderboards/) | Planned |
| Live Workout Together | [features/live-workout-together/](features/live-workout-together/) | Planned |
| Notifications | [features/notifications/](features/notifications/) | 6/7 |
| Onboarding | [features/onboarding/](features/onboarding/) | 7/7 |
| Scoring | [features/scoring/](features/scoring/) | 5/5 |
| Social Feed | [features/social-feed/](features/social-feed/) | 14/16 |
| Templates Marketplace | [features/templates-marketplace/](features/templates-marketplace/) | Planned |
| Training Journal & Day Log | [features/training-journal/](features/training-journal/) | 4/10 |
| UI Themes | [features/ui-themes/](features/ui-themes/) | 7/12 |
| Workout Core | [features/workout-core/](features/workout-core/) | 14/20 |
| Workout Drawer | [features/workout-drawer/](features/workout-drawer/) | 7/8 |
| Workout Logging | [features/workout-logging/](features/workout-logging/) | 10/10 |
| Workout Replay | [features/workout-replay/](features/workout-replay/) | 5/5 |
| Exercise Notes | [features/exercise-notes/](features/exercise-notes/) | 0/4 |
| Exercise Database | [features/exercise-database/](features/exercise-database/) | 1/6 |

---

## Project Management

| Document | Purpose |
|----------|---------|
| [project-management/claude-workflow.md](project-management/claude-workflow.md) | Development workflow and quality gates |
| [project-management/admin-workflow-commands.md](project-management/admin-workflow-commands.md) | Quick reference commands |

---

## Specialized Documentation

### Visual Style
- [visual-style/README.md](visual-style/README.md) - Design system overview
- [visual-style/ui-aesthetic-implementation.md](visual-style/ui-aesthetic-implementation.md) - Implementation plan
- [visual-style/visual-style-guide.md](visual-style/visual-style-guide.md) - Design specifications
- [visual-style/theme-implementation-plan.md](visual-style/theme-implementation-plan.md) - Iron Forge, Toxic Energy, Neon Glow implementation guide

### Codebase Analysis
- [codebase-analysis/exercise-db-api.md](codebase-analysis/exercise-db-api.md) - ExerciseDB API reference
- [codebase-analysis/sql-schema-summary.md](codebase-analysis/sql-schema-summary.md) - Database schema reference

### Testing
- [master/testing-plan-master.md](master/testing-plan-master.md) - Testing strategy
- [master/user-testing-checklist.md](master/user-testing-checklist.md) - User test cases

### Infrastructure
- [infrastructure/server-infrastructure.md](infrastructure/server-infrastructure.md) - Server scaling, cost projections, migration playbook (10 to 500K users)

### Interviews
- [interviews/](interviews/) - User interviews and feature brainstorms

---

## Documentation Organization

```
docs/
├── README.md                           # This file - documentation hub
│
├── 1-PROJECT-STATUS.md                 # Project status (SINGLE SOURCE OF TRUTH)
├── 3-CODEBASE-GUIDE.md                 # Technical reference
│
├── master/                             # Core master documentation
│   ├── master-plan.md                  # Vision and strategy
│   ├── feature-master.md               # Feature index
│   ├── vision-and-culture.md           # Cultural positioning
│   ├── naming-guide.md                 # Canonical naming conventions
│   └── interview-summary-*.md          # Interview summaries
│
├── features/                           # 31 flat feature folders
│   ├── ai-buddy/
│   ├── authentication/
│   ├── avatar/
│   ├── design-system/
│   ├── workout-drawer/
│   └── ... (each feature has its own folder)
│
├── project-management/                 # Internal processes
│   ├── claude-workflow.md              # Development workflow
│   └── admin-workflow-commands.md      # Quick reference
│
├── codebase-analysis/                  # Technical deep-dives
│   ├── sql-schema-summary.md           # Database schema
│   └── exercise-db-api.md              # API reference
│
├── visual-style/                       # Design system docs + theme palettes
│   ├── iron-forge-palette/
│   ├── neon-glow-palette/
│   └── toxic-energy-palette/
│
├── interviews/                         # User interviews and brainstorms
├── infrastructure/                     # Server scaling & cost docs
├── authentication/                     # Auth setup guides
├── notifications/                      # Notification system docs
├── testing/                            # Testing documentation
├── themes/                             # Theme system docs
├── data/                               # Reference data files
├── business/                           # Git-ignored - Private business docs
│
└── archive/                            # Archived documentation
    ├── superseded/                     # Old versions replaced by newer
    ├── completed-work/                 # Feature work that's done
    └── old-summaries/                  # Outdated summary documents
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
→ Read `master/master-plan.md` → "Vision Statement"
→ Read `master/vision-and-culture.md` → Cultural positioning

**"What are the naming conventions?"**
→ Read `master/naming-guide.md` (Juice, Gym Lab, DNA, GymR Seasons)

**"Where do I find docs for [feature]?"**
→ Check `features/` folder - each feature has its own folder

**"How do we scale the infrastructure?"**
→ Read `infrastructure/server-infrastructure.md` → Scaling strategy, cost projections, migration playbook

---

## For Contributors

**New to GymRats? Start here:**
1. Read [CLAUDE.md](../CLAUDE.md) for project overview
2. Read [3-CODEBASE-GUIDE.md](3-CODEBASE-GUIDE.md) for architecture
3. Read [project-management/claude-workflow.md](project-management/claude-workflow.md) for workflow

**Working on a feature?**
- Find the feature folder in `features/`
- Read the feature's `feature-*.md` file for implementation details
- Follow the patterns in `3-CODEBASE-GUIDE.md`

**Updating documentation?**
- Status changes → Update `1-PROJECT-STATUS.md`
- Feature implementation → Update feature's `feature-*.md` file
- New features → Add to `master/feature-master.md`

---

*Last updated: 2026-02-05*

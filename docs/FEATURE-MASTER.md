# FORGERANK FEATURE MASTER

**Last Updated:** 2026-01-26
**Version:** v0.1 (Pre-launch)

---

## Quick Summary

| Feature Group | Status | Progress | Details |
|---------------|--------|----------|---------|
| [Workout Core](#workout-core) | In Progress | 8/20 | [Details](features/feature-workouts.md) |
| [Exercise Library](#exercise-library) | Done | 3/3 | [Details](features/feature-exercises.md) |
| [Scoring & Ranks](#scoring--ranks) | Done | 5/5 | [Details](features/feature-scoring.md) |
| [Authentication](#authentication) | In Progress | 4/10 | [Details](features/feature-auth.md) |
| [Social & Feed](#social--feed) | Scaffolded | 2/15 | [Details](features/feature-social.md) |
| [Gamification](#gamification) | Planned | 0/12 | [Details](features/feature-gamification.md) |
| [UI & Design](#ui--design) | In Progress | 6/15 | [Details](features/feature-ui.md) |
| [Backend & Sync](#backend--sync) | Scaffolded | 3/10 | [Details](features/feature-backend.md) |

---

## Workout Core
**Status:** In Progress | **Progress:** 8/20 features

The core workout logging and tracking experience.

- Live workout session with set logging
- Exercise selection from library
- Rest timer (basic)
- Workout history storage
- Session persistence (survives app close)
- Routine builder (basic)
- Premade plan browser
- Calendar view (basic)

**Next Up:** Routine-based workout flow, input polish, PR celebration

---

## Exercise Library
**Status:** Done | **Progress:** 3/3 features

Static exercise database with metadata.

- 50+ exercises defined with IDs and display names
- Muscle group assignments
- Exercise categorization (compound/isolation)

---

## Scoring & Ranks
**Status:** Done | **Progress:** 5/5 features

The Forgerank scoring algorithm - core differentiator.

- 0-1000 score calculation (e1RM-based)
- 7 tiers: Iron, Bronze, Silver, Gold, Platinum, Diamond, Mythic
- 20 ranks per exercise
- Verified top standards (rankTops.ts)
- Anti-cheat heuristics

---

## Authentication
**Status:** In Progress | **Progress:** 4/10 features

User accounts and authentication.

- Login screen UI
- Signup screen UI
- Supabase Auth integration (scaffolded)
- Auth state management (Zustand)

**Missing:** Working login flow, OAuth (Google/Apple), password reset

---

## Social & Feed
**Status:** Scaffolded | **Progress:** 2/15 features

Social features for community engagement.

- Feed screen (UI shell)
- Friends list screen (UI shell)

**Missing:** Real data, reactions, posting, friend requests

---

## Gamification
**Status:** Planned | **Progress:** 0/12 features

XP, levels, streaks, and rewards.

**Planned:** XP system, levels, streaks, currency, achievements

---

## UI & Design
**Status:** In Progress | **Progress:** 6/15 features

Visual design and polish.

- Dark theme foundation
- Design system tokens (colors, spacing, typography)
- Accent color themes (toxic, electric, ember, ice)
- Tab navigation
- Basic screen layouts
- Error boundaries

**Missing:** Animations, PR celebration, onboarding, polish

---

## Backend & Sync
**Status:** Scaffolded | **Progress:** 3/10 features

Supabase backend integration.

- Supabase client configured
- Database schema designed (8 tables)
- Row Level Security policies

**Missing:** Cloud sync, offline queue, data migration

---

## Legend

| Status | Meaning |
|--------|---------|
| Done | Feature complete and working |
| In Progress | Actively being developed |
| Scaffolded | Code exists but not functional |
| Planned | Designed but not started |

| Symbol | Meaning |
|--------|---------|
| Done | Feature complete |
| In Progress | Work started |
| Planned | Not started |
| Future | Backlog idea |

---

## Development Phases

### Phase 0: Stabilization (Current)
- Fix existing bugs
- Complete Zustand migration
- Add error handling

### Phase 1: Core Workout Polish
- Routine-based workout flow
- Set input improvements
- Rest timer enhancements
- PR detection & celebration

### Phase 2: Backend & Auth
- Working authentication
- Cloud sync
- Data persistence

### Phase 3: Social Features
- Friends system
- Feed with posts
- Reactions

### Phase 4: Gamification
- XP & levels
- Streaks
- Gym buddy personality

### Phase 5: Launch Polish
- Onboarding
- Visual polish
- Performance

---

*See individual feature files in `docs/features/` for detailed breakdowns.*

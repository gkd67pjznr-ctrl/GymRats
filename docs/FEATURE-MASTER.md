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
| [Cue System (Gym Buddy)](#cue-system-gym-buddy) | Planned | 1/10 | [Details](features/feature-cue-system.md) |
| [Body Model](#body-model) | Planned | 0/5 | [Details](features/feature-body-model.md) |
| [Authentication](#authentication) | In Progress | 4/10 | [Details](features/feature-auth.md) |
| [Social & Feed](#social--feed) | Scaffolded | 2/15 | [Details](features/feature-social.md) |
| [Leaderboards](#leaderboards) | Planned | 0/4 | [Details](features/feature-leaderboards.md) |
| [Gamification](#gamification) | Planned | 0/12 | [Details](features/feature-gamification.md) |
| [Notifications](#notifications) | Planned | 0/5 | [Details](features/feature-notifications.md) |
| [UI & Design](#ui--design) | In Progress | 6/15 | [Details](features/feature-ui.md) |
| [Backend & Sync](#backend--sync) | Scaffolded | 3/10 | [Details](features/feature-backend.md) |
| [Integrations](#integrations) | Planned | 0/4 | [Details](features/feature-integrations.md) |
| [Onboarding](#onboarding) | Planned | 0/5 | [Details](features/feature-onboarding.md) |

**Total:** 32/123 features (26%)

---

## Core Differentiators

These features set Forgerank apart from competitors:

1. **Forgerank Scoring** - Static, verified standards (not user-inflated)
2. **Cue System** - Gym buddy with personality (text + audio)
3. **Aesthetic** - Pure-inspired dark, mysterious UI
4. **Social Loop** - Built for lifters, not general fitness

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

## Cue System (Gym Buddy)
**Status:** Planned | **Progress:** 1/10 features

The app's personality - what makes it feel alive.

- Basic PR detection cues (implemented)

**Planned:**
- Customizable gym buddy personalities (3-5 at launch)
- Text-based encouragement
- Audio voice packs (optional)
- Contextual cues (knows your state)
- PR celebration reactions
- Rank-up celebrations
- Streak milestone reactions
- Personality store integration

---

## Body Model
**Status:** Planned | **Progress:** 0/5 features

Visual muscle representation for engagement.

**Planned:**
- Detailed muscle subdivisions (upper chest, rear delts, etc.)
- Volume-based coloring (gradient based on sets)
- Primary/secondary/tertiary muscle mapping per exercise
- Default post image (if no photo uploaded)
- Interactive body stats screen

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

**Planned:**
- Global + Friends feed tabs
- Workout posts with stats
- User captions
- Optional photo upload
- Body model default image
- Rank badges on posts
- Reactions (quick emotes)
- Comments
- Friend requests
- User discovery/suggestions
- Public by default (opt-out available)
- Per-post privacy control
- Content moderation (report + block)

---

## Leaderboards
**Status:** Planned | **Progress:** 0/4 features

Competition among friends.

**Planned:**
- Per-exercise leaderboard (among friends)
- Overall Forgerank leaderboard
- Volume/consistency leaderboard
- User level leaderboard

---

## Gamification
**Status:** Planned | **Progress:** 0/12 features

XP, levels, streaks, currency, and cosmetics.

**Planned:**
- XP system (separate from Forgerank)
- User levels with visual XP bar
- Streak system (breaks after 5 days)
- Visual streak calendar (GitHub-style)
- Streak color progression
- Currency earnings (level-up, PRs, daily login, streaks, referrals)
- Cosmetic store
- Themes/color schemes (purchasable)
- Voice packs/personalities
- Card skins (post appearance)
- Profile customization (badges, frames, titles)
- Achievements

---

## Notifications
**Status:** Planned | **Progress:** 0/5 features

Push notifications and reminders.

**Planned:**
- Rest timer finished (push notification)
- Streak warnings (before it breaks)
- Rest day reminders (configurable)
- iOS Live Activities widget (dynamic island)
- Minimal/opt-in approach (don't be annoying)

---

## UI & Design
**Status:** In Progress | **Progress:** 6/15 features

Visual design and polish - Pure-inspired aesthetic.

- Dark theme foundation
- Design system tokens (colors, spacing, typography)
- Accent color themes (toxic, electric, ember, ice)
- Tab navigation
- Basic screen layouts
- Error boundaries

**Planned:**
- PR celebration animations
- Rank-up animations with sound
- Dark gradients
- Bold typography refinement
- Minimal UI chrome
- Punchy animations throughout
- Skeleton screens
- Pull-to-refresh
- Empty states

---

## Backend & Sync
**Status:** Scaffolded | **Progress:** 3/10 features

Supabase backend integration.

- Supabase client configured
- Database schema designed (8 tables)
- Row Level Security policies

**Planned:**
- Working authentication
- Cloud sync (automatic on workout complete)
- Offline queue (persist when offline, flush on reconnect)
- Conflict resolution (last-write-wins)
- Sync status indicator
- Data migration (local to cloud)
- Real-time subscriptions (feed, reactions, comments)

---

## Integrations
**Status:** Planned | **Progress:** 0/4 features

Third-party app connections.

**Planned:**
- Apple Health (weight, BMI import)
- Fitbit (weight, BMI import)
- Spotify integration (workout music controls)
- Apple Music integration

---

## Onboarding
**Status:** Planned | **Progress:** 0/5 features

First-time user experience.

**Planned:**
- Quick profile setup (name, bodyweight, experience level)
- Personality picker (choose gym buddy)
- Personality preview
- Guided first workout
- Ranking system introduction

---

## Legend

| Status | Meaning |
|--------|---------|
| Done | Feature complete and working |
| In Progress | Actively being developed |
| Scaffolded | Code exists but not functional |
| Planned | Designed but not started |

---

## Development Phases

### Phase 0: Stabilization (Current)
- Fix existing bugs
- Complete Zustand migration
- Add error handling

### Phase 1: Core Workout Polish (Month 1-2)
- Routine-based workout flow
- Set input improvements
- Rest timer enhancements
- PR detection & celebration

### Phase 2: Backend & Auth (Month 2-3)
- Working authentication
- Cloud sync
- Data persistence

### Phase 3: Social Features (Month 3-4)
- Friends system
- Full feed implementation
- Reactions
- Leaderboards

### Phase 4: Personality & Cosmetics (Month 4-5)
- Cue system with multiple personalities
- Cosmetic store
- Currency system
- Body model with muscle coloring

### Phase 5: Launch Polish
- Onboarding
- Visual polish
- Performance optimization
- Integrations

**v1 Launch Target:** 3+ months

---

## Business Model Summary

### Free Tier
- Full workout logging
- Forgerank scoring and ranks
- Social feed + friends + reactions
- Basic history/calendar
- Streak tracking
- Starter personalities
- CSV export

### Premium Tier (Yearly)
- Advanced analytics
- Body composition tracking
- Cloud sync + multi-device
- Web app access
- Early access to new features

### Cosmetic Store (No Pay-to-Win)
- Themes/color schemes
- Voice packs/personalities
- Card skins
- Profile customization

---

*See individual feature files in `docs/features/` for detailed breakdowns.*
*See `docs/MASTER_PLAN.md` for full vision and strategy.*

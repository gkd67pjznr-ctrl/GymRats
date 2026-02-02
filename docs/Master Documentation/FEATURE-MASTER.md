# FORGERANK FEATURE MASTER

**Last Updated:** 2026-02-02
**Version:** v0.4 (Post-merge)

---

## Quick Summary — Launch (v1)

| Feature Group | Status | Progress | Details |
|---------------|--------|----------|---------|
| [Workout Core](#workout-core) | In Progress | 12/20 | [Details](../features/workout-feature-workouts.md) |
| [Workout Logging UX](#workout-logging-ux) | **Done** | 10/10 | [Details](../features/workout-feature-workout-logging-ux.md) |
| [Exercise Library](#exercise-library) | Done | 3/3 | [Details](../features/workout-feature-exercises.md) |
| [Scoring & Ranks](#scoring--ranks) | Done | 5/5 | [Details](../features/workout-feature-scoring.md) |
| [AI Gym Buddy](#ai-gym-buddy) | In Progress | 9/11 | [Details](../features/ai-buddy/feature-ai-buddy.md) |
| [Body Model](#body-model) | In Progress | 3/5 | [Details](../features/body-model/feature-body-model.md) |
| [Authentication](#authentication) | In Progress | 7/10 | [Details](../features/authentication/feature-auth.md) |
| [Social & Feed](#social--feed) | In Progress | 9/15 | [Details](../features/social-feed/feature-social.md) |
| [Gamification](#gamification) | **Done** | 12/12 | [Details](../features/gamification/feature-gamification.md) |
| [Notifications](#notifications) | In Progress | 1/4 | [Details](../features/notifications/feature-notifications.md) |
| [UI & Design](#ui--design) | In Progress | 12/15 | [Details](../features/ui-design/feature-ui.md) |
| [UI Themes & Visual Style](#ui-themes--visual-style) | In Progress | 6/12 | [Details](../features/ui-themes/feature-ui-themes.md) |
| [Backend & Sync](#backend--sync) | **Done** | 10/10 | [Details](../features/backend-sync/feature-backend.md) |
| [Onboarding](#onboarding) | In Progress | 3/7 | [Details](../features/onboarding/feature-onboarding.md) |
| [Avatar & Hangout Room](#avatar--hangout-room) | In Progress | 4/8 | [Details](../features/hangout-room/feature-avatar-hangout.md) |
| [Workout Replay](#workout-replay) | **Done** | 5/5 | [Details](../features/workout-replay/feature-workout-replay.md) |
| [Forge DNA](#forge-dna) | **Done** | 4/4 | [Details](../features/forge-dna/feature-forge-dna.md) |
| [Forge Lab (Analytics)](#forge-lab-analytics) | **Done** | 6/6 | [Details](../features/forge-lab/feature-forge-lab.md) |
| [Forge Milestones](#forge-milestones) | **Done** | 5/5 | [Details](../features/gamification/feature-forge-milestones.md) |

**Launch Total:** 135/167 features (81%)

## Quick Summary — Post-Launch

| Feature Group | Status | Progress | Details |
|---------------|--------|----------|---------|
| [Leaderboards & Competitions](#leaderboards--competitions) | Planned | 0/10 | [Details](../features/leaderboards/feature-leaderboards.md) |
| [Integrations](#integrations) | Planned | 0/5 | [Details](../features/integrations/feature-integrations.md) |
| [Online Competitions](#online-competitions) | Planned | 0/8 | [Details](../features/competitions/feature-competitions.md) |
| [Gym Finder / Map](#gym-finder--map) | Planned | 0/6 | [Details](../features/gym-finder/feature-gym-finder.md) |
| [Live Workout Together](#live-workout-together) | Planned | 0/4 | [Details](../features/live-workout-together/feature-live-together.md) |
| [AI Coaching](#ai-coaching) | Planned | 0/4 | [Details](../features/ai-coaching/feature-ai-coaching.md) |
| [Templates Marketplace](#templates-marketplace) | Planned | 0/4 | [Details](../features/templates-marketplace/feature-templates-marketplace.md) |
| [Training Journal](#training-journal) | Implemented | 4/4 | [Details](../features/training-journal/feature-training-journal.md) |
| [Forge Seasons](#forge-seasons) | Planned | 0/4 | [Details](../features/forge-seasons/feature-forge-seasons.md) |

**Post-Launch Total:** 4/49 features (8%)

**Grand Total:** 139/216 features (64%)

---

## Core Differentiators

What sets Forgerank apart — the combination is the killer feature:

1. **Forgerank Scoring** — Static, verified standards (not user-inflated). Your rank means something.
2. **AI Gym Buddy** — 8-12 personality archetypes with reactive commentary. The app has a character.
3. **Avatar & Hangout Room** — Finch-inspired growing avatar + social room. Emotional investment.
4. **Aesthetic** — Pure-inspired dark, mysterious UI. Looks so good people show it off.
5. **Social Loop** — Feed, friends, live presence, competitions. Built for lifters.
6. **Workout Replay** — Cinematic post-workout summaries. The share moment.
7. **Forge DNA** — Visual training identity fingerprint. Unique to each person.

---

## Workout Core
**Status:** In Progress | **Progress:** 11/20 features

The core workout logging and tracking experience.

- Live workout session with set logging
- Exercise selection from library
- Rest timer (basic)
- Workout history storage
- Session persistence (survives app close)
- Routine builder (basic)
- Premade plan browser
- Calendar view (basic)

**Next Up:** Routine-based workout flow, rest timer enhancements

---

## Workout Logging UX
**Status:** Done | **Progress:** 10/10 features

The visual interface for logging sets — complete redesign (Fitbod/Liftoff style).

**Completed:**
- Add Exercise button (prominent, with dashed border)
- Exercise cards with collapsible header
- Set lines with weight/reps inputs and checkmark
- Empty state component
- Smart defaults (auto-fill from previous set)
- Keyboard handling (number pad, focus management)
- Editing state management (workoutEditingStore)
- Exercise reordering (drag-to-reorder with DraggableExerciseList)
- PR detection integration
- Haptic feedback
- Set completion flow with logging
- Exercise removal with confirmation dialog
- Settings toggle (useNewWorkoutUX)
- NewWorkoutSection wrapper for integration
- Integration into live-workout.tsx with UXToggle button
- Rest timer integration

---

## Exercise Library
**Status:** Done | **Progress:** 3/3 features

- 50+ exercises defined with IDs and display names
- Muscle group assignments
- Exercise categorization (compound/isolation)

---

## Scoring & Ranks
**Status:** Done | **Progress:** 5/5 features

- 0-1000 score calculation (e1RM-based)
- 7 tiers: Iron, Bronze, Silver, Gold, Platinum, Diamond, Mythic
- 20 ranks per exercise
- Verified top standards (rankTops.ts)
- Anti-cheat heuristics

---

## AI Gym Buddy
**Status:** In Progress | **Progress:** 9/11 features
**Previously:** Cue System

The app's personality — reactive commentary that makes it feel alive. Like a sports announcer, not a chatbot.

**Completed (Core):**
✅ **Fully Implemented:**
- Basic PR detection cues
- 12 personality archetypes with full message pools
- Tiered buddy system (Basic, Premium, Legendary)
- Reactive commentary engine with trigger evaluation
- Integrated session management (workout tracking)
- Buddy store with unlocked buddies, session memory, and IAP integration
- Complete message pools (70+ messages per buddy across 14 trigger types)
- Real IAP integration with expo-iap (purchase flow, product info, restoration)
- Voice playback system with tier-based audio (VoiceManager)
- Buddy selection UI in settings with purchase/restore flows

🔄 **Partially Implemented / In Progress:**
- Voice line integration (playback working, but no audio toggle UI or voice preview)
- Buddy-specific sound effects (SoundManager integration needed)
- Legendary buddy theme transformations (data structures exist, theme application logic needed)
- Forge Tokens economy (store exists, but no earning/spending mechanics)
- Audio toggle in settings (store exists, UI controls needed)

**Planned (Post-Launch):**
- Community-created personality packs
- Additional buddies beyond launch roster
- Seasonal / limited-edition buddy drops
- Analytics on buddy usage and engagement

---

## Body Model
**Status:** In Progress | **Progress:** 3/5 features

✅ **Implemented (Core Visualization):**
- Detailed muscle subdivisions with actual SVG paths (21 muscle groups)
- Volume-based coloring with weekly/monthly/all time filtering
- Primary/secondary/tertiary muscle mapping for 300+ exercises
- Interactive body stats screen with front/back view switching

🔄 **In Progress (Integration):**
- Default post image for social posts (compact body model component ready, social integration pending)
- Balance indicators (left/right, push/pull) - UI planned, calculations needed

📋 **Future Enhancements (Post-Launch):**
- Inclusive body options (gender-neutral, diverse representation)
- Enhanced interactive features (tap muscles for detailed stats and exercises)
- 3D body model visualization (if user demand warrants)
- Muscle balance analytics with recommendations

---

## Authentication
**Status:** In Progress | **Progress:** 7/10 features

**Completed:**
- Login/signup screen UI with email/password
- Supabase Auth integration (working)
- Auth state management (Zustand)
- Google OAuth flow (implemented)
- Deep link handling for OAuth callbacks
- Dev login for quick testing (DEV mode)
- User profile editing (display name, avatar)
- Avatar upload/remove functionality
- Keyboard-aware scroll views

**Remaining:**
- Apple Sign In setup
- Password reset flow
- Account deletion flow

---

## Social & Feed
**Status:** In Progress | **Progress:** 9/15 features

**Completed:**
- Feed screen UI with pull-to-refresh
- Friends list with real-time user search
- Post creation screen
- Direct messaging with typing indicators
- Social data models and stores (all sync-connected)
- Database schema + RLS policies
- Real-time subscriptions via Supabase
- Offline mutation queuing + conflict resolution
- Sync status indicators

**Planned:**
- Global + Friends feed tabs
- Auto-generated workout cards (beautiful, shareable)
- Auto-posts for milestones (rank-ups, PRs, streaks)
- Optional photo attachments
- Body model default image
- Rank badges on posts
- Reactions (quick emotes)
- Comments
- Content moderation (report + block)

---

## Gamification
**Status:** Done | **Progress:** 12/12 features

XP, levels, streaks, currency, and cosmetics. Separate from Forgerank scoring.

**Completed:**
- XP system with level thresholds
- Level-up modal with animation + sound + confetti
- Streak system (5-day break threshold)
- Currency (Forge Tokens) earned from leveling/milestones
- Stats and ranks card component
- Gamification store with backend sync
- Streak calendar (GitHub-style, 365 days)
- Streak milestone celebrations
- Cosmetic store UI (shop.tsx)
- Achievements/badges display component

---

## Notifications
**Status:** In Progress | **Progress:** 1/4 features

**Philosophy:** Minimal. Don't be annoying.

**Completed:**
- Rest timer (push notification when backgrounded) - P0 launch feature
- Notification service infrastructure (expo-notifications)
- Settings integration with toggleable preferences
- Contextual permission handling
- Android notification channels (Social, Workout, Competition)
- Comprehensive test suite (18 tests)

**Planned:**
- Friend requests - Service functions implemented, backend integration pending
- DMs received - Service functions implemented, backend integration pending
- Competition results - Service functions stubbed, requires competition feature

**NOT doing:** Streak nag, "you haven't worked out" reminders, social activity spam. Respect the user's attention.

---

## UI & Design
**Status:** In Progress | **Progress:** 12/15 features

Pure-inspired dark aesthetic — looks so good people want to show it off.

**Completed:**
- Dark theme foundation + design system tokens
- Accent color themes (toxic, electric, ember, ice)
- Tab navigation + screen layouts
- Error boundaries with retry
- PR celebration animations (4-tier, 60 celebrations)
- Sound effects + haptic feedback patterns
- Sync status indicators
- Keyboard-aware scroll views
- UI Aesthetic Implementation Plan
- Visual Style Guide
- Implementation Roadmap
- Complete design system documentation

**Planned:**
- Rank-up animations with sound
- Punchy animations throughout
- Skeleton screens
- Pull-to-refresh patterns

---

## UI Themes & Visual Style
**Status:** In Progress | **Progress:** 6/12 features

Implementation of the Forgerank visual identity with a layered approach that combines PURE's emotional personality with LIFTOFF's functional efficiency.

**Completed:**
- UI Aesthetic Implementation Plan with layered approach (documentation)
- Visual Style Guide with detailed design specifications (documentation)
- Implementation Roadmap with 12-week phased rollout (documentation)
- Emotional Language/Copy system via buddy engine

**In Progress:**
- Theme System Infrastructure (partially implemented, needs refinement)
- Color Palette System (implemented but needs alignment with visual style guide)
- Typography System (implemented but needs alignment with specifications)

**Not Started:**
- Illustration Style system (documentation exists, implementation needed)

**Documentation:**
- `docs/visual-style/ui-aesthetic-implementation.md`
- `docs/visual-style/visual-style-guide.md`
- `docs/visual-style/implementation-roadmap.md`

---

## Backend & Sync
**Status:** Done | **Progress:** 10/10 features

**Completed:**
- Supabase client + 9-table schema + RLS policies
- TypeScript types (100% coverage)
- Complete 5-phase sync system
- Offline mutation queuing + conflict resolution
- Real-time subscriptions (feed, friends, chat)
- File storage (avatar uploads)
- Sync system integration with auth (initialization, store registration)

**Post-Launch / Nice-to-Have:**
- Data migration script (local to cloud) - for existing user data import
- Apply user search migration (`005_user_search.sql`) to production Supabase

---

## Onboarding
**Status:** In Progress | **Progress:** 3/7 features

Full premium onboarding — all steps skippable.

**Completed:**
- Welcome step with feature overview
- Profile setup (name, bodyweight, experience level)
- Personality picker (4 options)

**Planned:**
- Avatar creation step (default assigned if skipped)
- Goal setting ("What are you training for?" — strength, aesthetics, health, sport)
- Guided first workout (walk through logging one real set)
- Ranking system introduction

---

## Avatar & Hangout Room
**Status:** In Progress | **Progress:** 4/8 features
**Previously:** Planned

Finch-inspired virtual gym avatar that grows as you work out, living in a shared room with friends.

**Completed:**
- Avatar creation UI with art style selection
- Avatar data storage extension in user profile
- Basic avatar display component
- Avatar growth system with calculation algorithms
- Hangout room core with database schema
- Hangout room repository with CRUD operations
- Hangout room store with Zustand state management
- Basic UI components (AvatarView, HangoutRoom, FriendAvatar)

**In Progress:**
- Real-time presence tracking with Supabase subscriptions
- Avatar leave/return animations
- Integration with workout start/end events
- Avatar cosmetics system with equipped items
- Decoration system with item management
- Forge Token integration for purchases
- Room admin controls
- Room decorations placement and management UI
- Avatar customization interface
- Presence status indicators
- Room theme selection

**Growth philosophy:** Represents the user caring about themselves and sticking to it. Inspirational, not just gamification.

---

## Workout Replay
**Status:** Implemented | **Progress:** 5/5 features
**NEW — from 2026-01-29 brainstorm

Cinematic post-workout summary — THE share moment.

**Planned:**
- Animated stat cards (exercises, volume, duration)
- PR highlights with buddy commentary
- Rank changes display
- Buddy personality sign-off
- Share to in-app feed (focus on Forgerank social, not external platforms)

---

## Forge DNA
**Status:** Done | **Progress:** 4/4 features
**NEW — from 2026-01-29 brainstorm

Visual fingerprint of your training identity — profile centerpiece.

**Completed:**
- Training identity visualization (single beautiful graphic)
- Muscle group balance display
- Training style analysis (strength vs volume vs endurance)
- Premium blur mechanic with conversion CTA

---

## Forge Lab (Analytics)
**Status:** Done | **Progress:** 6/6 features
**NEW — from 2026-01-29 brainstorm

Premium analytics dashboard for serious lifters.

**Completed:**
- Weight graph over time (victory-native charts)
- Basic e1RM trends
- Strength curves per exercise
- Volume trends (weekly/monthly)
- Muscle group balance analytics
- Correlation insights with integration data
- Forge Lab store with AsyncStorage persistence
- useIsPremiumUser integration with authStore
- All 32 tests passing

---

## Forge Milestones
**Status:** Done | **Progress:** 5/5 features
**NEW — from 2026-01-29 brainstorm

Non-repeatable lifetime achievements with tiered rarity — prestige markers.

**Completed:**
- Common tier (10 workouts, first PR, first rank-up)
- Rare tier (100 workouts, 30-day streak, 5 exercises ranked)
- Epic tier (1000lb club, all exercises Silver+, year-long streak)
- Legendary tier (top 1% achievements — genuinely hard)
- Trophy case on profile with special visual treatment by rarity
- Milestone earned toast with rarity-based animations
- Full trophy case screen at /milestones
- Zustand store with AsyncStorage persistence

---

## Leaderboards & Competitions
**Status:** Planned | **Progress:** 0/10 features
**Post-launch**

**Leaderboards:**
- Per-exercise Forgerank leaderboard (friends + global)
- Overall Forgerank leaderboard
- Volume leaderboard
- User level leaderboard
- Gym-level leaderboards (tied to Gym Finder)

**Competitions:**
- Volume challenges (fun: "most calf volume this week")
- Online powerlifting meets (video submission + judging)
- Online bodybuilding shows (posing video + judging)
- Tiered judging system (casual = community, ranked = panel, championship = AI + panel)
- Seasonal events + always-open practice stage

See [feature-leaderboards.md](../features/social-feed/feature-leaderboards.md) and [feature-competitions.md](../features/social-feed/feature-competitions.md)

---

## Online Competitions
**Status:** Planned | **Progress:** 0/8 features
**Post-launch v2**

First-of-its-kind: online powerlifting meets and bodybuilding shows inside an app.

**Powerlifting Meets:**
- Video submission for lifts
- Tiered judging (community → panel → AI+panel)
- Scored like real meets (3 white/red lights)
- Casual and ranked divisions

**Bodybuilding Shows:**
- Posing routine video submission
- Verified high-quality judges
- Seasonal championship events
- Always-open practice stage with community ratings

---

## Integrations
**Status:** Implemented | **Progress:** 5/5 features
**Post-launch**

Health data integrations only — no music player, no nutrition tracking.

**Planned:**
- Apple Health (weight, BMI import/export)
- MyFitnessPal (nutrition data for analytics)
- Whoop (recovery, strain data)
- Fitbit (weight, activity data)
- Health data display in Forge Lab (premium)

---

## Gym Finder / Map
**Status:** Planned | **Progress:** 0/6 features
**Post-launch**

Full gym ecosystem.

**Planned:**
- Gym discovery (Google/Apple Maps integration)
- Community gym profiles (ratings, reviews, equipment lists, photos)
- Friend gym mapping (see which friends go where)
- Gym-level leaderboards (top lifters at your gym)
- Gym partnerships (discounts, featured gyms — B2B revenue)
- Check-in system (optional, non-pushy — smooth UX feature)

---

## Live Workout Together
**Status:** Planned | **Progress:** 0/4 features
**Post-launch v2**

Real-time social workout experience.

**Planned:**
- Passive presence (see friends currently working out + exercise, send quick emotes)
- Shared session (workout "room" — friends see each other's sets in real-time)
- Guided partner mode (one person leads, others follow — virtual group class)
- Quick reactions/emotes during live sessions

---

## AI Coaching
**Status:** Planned | **Progress:** 0/4 features
**Post-launch**

Template-based programming with AI suggestions. Enhances, not replaces, user judgment.

**Planned:**
- Curated program template library (by level, goals, available days)
- AI suggestions after 1+ week of usage (exercise swaps, deload detection)
- Goal-based program recommendations
- Premium feature (behind subscription)

**Philosophy:** Start with templates, layer AI suggestions on top. Not "fully AI-generated" — the AI enhances the user's own direction.

---

## Templates Marketplace
**Status:** Planned | **Progress:** 0/4 features
**Post-launch**

Community-driven workout template sharing.

**Planned:**
- Create and publish workout templates/routines
- Browse/search community templates
- Popular templates ranking (rise to top)
- Creator attribution and profiles

---

## Training Journal
**Status:** Implemented | **Progress:** 4/4 features
**Post-launch**

Free-form workout notes for serious lifters.

**Implemented:**
- Per-workout notes (how you felt, what went well)
- Per-day journal entries
- Mood/energy/soreness tracking
- Journal history and search

Could feed into AI coaching suggestions over time.

---

## Forge Seasons
**Status:** Planned | **Progress:** 0/4 features
**Post-launch**

Seasonal content drops to keep things fresh.

**Planned:**
- Quarterly seasonal themes
- Limited-time earnable cosmetics (avatar items, room decorations)
- Seasonal leaderboard events
- Exclusive seasonal items (no battle-pass grind — just limited-time earnable)

---

## Legend

| Status | Meaning |
|--------|---------|
| Done | Feature complete and working |
| In Progress | Actively being developed |
| Planned | Designed but not started |

---

## Development Phases

### Phase 0: Stabilization (Complete)
- ✅ Fix existing bugs
- ✅ Complete Zustand migration
- ✅ Add error handling
- ✅ Implement authentication
- ✅ Build backend sync system

### Phase 1: Core Workout Polish
- Routine-based workout flow
- Rest timer enhancements
- Protected routes

### Phase 2: AI Gym Buddy + Avatar
- Personality engine (8-12 archetypes)
- Reactive commentary system
- AI-generated voice system
- Avatar creation + growth system
- Hangout room

### Phase 3: Social & Engagement
- Full feed with auto-generated workout cards
- Workout Replay (cinematic summaries)
- Reactions + comments
- Forge DNA + Forge Lab
- Forge Milestones

### Phase 4: Launch Polish
- Onboarding (avatar creation, goal setting, guided workout)
- Visual polish + animations
- Performance optimization
- Forge Milestones trophy case

### Phase 5: Post-Launch v2
- Leaderboards + competitions
- Online powerlifting meets
- Online bodybuilding shows
- Live Workout Together
- Integrations (Apple Health, MFP, Whoop)

### Phase 6: Ecosystem
- Gym Finder / Map
- AI Coaching
- Templates Marketplace
- Training Journal
- Forge Seasons

---

## Business Model

### Free Tier
- Full workout logging + Forgerank scoring
- Basic social feed + friends + reactions
- 2-3 starter gym buddy personalities (text-only)
- Basic history/calendar + weight graph
- Streak tracking + gamification
- Avatar (default style) + hangout room
- Forge DNA (partially blurred)
- Forge Milestones

### Pro Subscription
- Forge Lab (full analytics dashboard)
- Full Forge DNA (unblurred)
- Advanced AI coaching suggestions
- Integration data analytics (Apple Health, MFP, Whoop)

### IAP (In-App Purchases)
- Premium buddy packs (voice + text)
- Legendary buddy packs (full theme transformation)
- Avatar cosmetics (clothes, accessories, art style packs)
- Room decorations
- Seasonal items (limited-time)

**Philosophy:** No pay-to-win. Cosmetics and analytics only. Core workout experience is always free.

---

*See individual feature files in `docs/features/` for detailed breakdowns.*
*See `docs/MASTER_PLAN.md` for full vision and strategy.*
*See `docs/AskUQ/2026-01-29-feature-brainstorm.md` for the full brainstorm interview.*
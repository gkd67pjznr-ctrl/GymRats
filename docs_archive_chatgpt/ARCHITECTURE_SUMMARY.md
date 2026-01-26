# docs/ARCHITECTURE_SUMMARY.md
# Forgerank — Architecture Summary (Snapshot: 2026-01-16)

This doc describes the current structure of the Forgerank app as uploaded in:
`CURRENT_ARCHIVE_AS_OF_1_16_26_413PM.zip`

## 1) Tech Stack + App Shell

- **Expo + React Native**
- **expo-router** for navigation (file-based routing under `app/`)
- **TypeScript**
- **AsyncStorage** for persistence of “current session” (in-progress workout)
- No backend yet — state is mostly in-memory stores with lightweight subscriptions.

Key folders:
- `app/` → screens/routes
- `src/lib/` → models, stores, scoring, utilities
- `src/ui/` → theme + design system + reusable components
- `src/data/` → static datasets (exercises, verified tops)

---

## 2) Navigation / Screens

### Tabs
`app/(tabs)/` contains the main tab screens:
- `_layout.tsx` (tab navigator)
- `index.tsx`, `workout.tsx`, `feed.tsx`, `profile.tsx`, `body.tsx`, `explore.tsx`

### Non-tab routes (examples)
- `app/live-workout.tsx` (core workout logging experience)
- `app/history.tsx`, `app/workout/[sessionId].tsx` (history & detail)
- `app/routines/*` (routine browsing + creation)
- `app/chat.tsx`, `app/dm/[id].tsx`, `app/new-message.tsx` (messaging)
- `app/notifications.tsx`
- `app/create-post.tsx`, `app/post/[id].tsx`, `app/u/[id].tsx` (social/post viewing)
- `app/debug/ranks.tsx` (ranks/debug visualization)

---

## 3) State Management Pattern (Current)

Pattern used across the codebase:
- Module-level state (e.g. `let sessions: WorkoutSession[] = []`)
- `listeners = new Set<() => void>()`
- `subscribeX()` returns unsubscribe
- React hooks (`useX()`) mirror the store into UI

This is simple and works well for v1, but:
- It is not time-travel/debug friendly
- It requires consistent “contract shapes” or TS errors happen across files quickly
- Eventually we’ll want a single normalized store (Zustand, Jotai, Redux, etc.) or a backend.

---

## 4) Workout Domain (Core)

### Data types
`src/lib/workoutModel.ts`
- `WorkoutSet`:
  - `id`, `exerciseId`, `weightKg`, `reps`, `timestampMs`
- `WorkoutSession`:
  - `id`, `startedAtMs`, `endedAtMs`, `sets[]`
  - optional: `routineId`, `routineName`, `planId`
  - optional: `plannedExercises[]`
  - optional: `completionPct` (0..1)

### History storage
`src/lib/workoutStore.ts`
- In-memory array of `WorkoutSession`
- `addWorkoutSession()` prepends sessions
- `useWorkoutSessions()` subscribes

### Current in-progress workout (persisted)
`src/lib/currentSessionStore.ts`
- `CurrentSession` is the persisted “live” workout state:
  - `id`, `startedAtMs`
  - UI state: `selectedExerciseId`, `exerciseBlocks[]`
  - Data: `sets: LoggedSet[]`, `doneBySetId`
  - optional links: `planId`, `routineId`, `routineName`
- Uses AsyncStorage key `currentSession.v1`
- `hydrateCurrentSession()` loads it lazily
- `ensureCurrentSession(seed)` creates if missing
- `updateCurrentSession()` immutably updates + persists

### Workout plans (in-memory)
`src/lib/workoutPlanStore.ts`
- `currentPlan: WorkoutPlan | null`
- subscription + hook pattern

---

## 5) Live Workout Flow

`app/live-workout.tsx` is the main “workout logging” runtime.

It orchestrates:
- Plan mode vs free mode
- Exercise blocks list (visible “workout structure”)
- Selected exercise for quick add
- Set creation via `useLiveWorkoutSession(...)`
- “done” toggles per set
- Per-set cue detection + recap cues
- Persistence into `CurrentSession` so the workout can resume

When finishing:
- It converts `LoggedSet[]` → `WorkoutSet[]`
  - ensures `timestampMs` exists for each set
- Creates `WorkoutSession` and calls `addWorkoutSession(sessionObj)`
- Clears current session + clears plan

Key UI components used:
- `src/ui/components/LiveWorkout/ExerciseBlocksCard`
- `src/ui/components/LiveWorkout/QuickAddSetCard`
- `src/ui/components/LiveWorkout/ExercisePicker`
- `src/ui/components/LiveWorkout/InstantCueToast`
- `src/ui/components/RestTimerOverlay`

---

## 6) Cue System (Feedback Layer)

There are two layers:
1) **Per-set cues** (instant feedback)
   - `src/lib/perSetCue.ts` (detect cue events from set changes)
2) **Session recap cues**
   - `src/lib/simpleSession.ts` (groups sets, generates recap cues)

Design goal:
- Keep the live UX fun + “gamey” without lying
- Give motivating feedback at the right frequency (fallback every N sets)
- Keep cue generation deterministic enough to feel consistent

---

## 7) Forgerank Scoring + Ranks

### Scoring (v1 foundation)
`src/lib/forgerankScoring.ts`
- `scoreForgerank(input)` → `ScoreBreakdown`:
  - total score 0..1000
  - tier: Iron → Mythic
  - normalizedStrength 0..1 (UI friendly)
  - `e1rmKg` derived (or provided)
  - flags: missing BW, implausible sets/jumps, etc.
  - breakdown parts with reasons

Key principles:
- deterministic
- explainable breakdown
- workable without backend
- light “anti-cheat” heuristics

### Ranks ladder utilities
`src/lib/ranks.ts`
- Core ladder:
  - `buildRankThresholdsKg(topE1RMKg, cfg)`
  - `getRankFromE1RMKg(e1rmKg, thresholdsKg)`
  - `buildAllThresholds(tops, cfg)`
- Debug/app-facing helpers:
  - `RankLadder`, `ExercisePRSummary`
  - `generateDefaultScoreThresholds(numRanks)`
  - `computeExerciseScore({summary, ladder})` (normalized 0..1)
  - `scoreToRank(score, ladder)`
  - `buildRankLadderFromTop({exerciseId, topE1RMKg})`

### Verified tops dataset
`src/data/rankTops.ts`
- `VerifiedTop[]` provides `topE1RMKg` per lift/exercise id
- Used to create thresholds/ladder curves

### Debug screen
`app/debug/ranks.tsx`
- Visualizes how a ladder behaves against sample PR summaries

---

## 8) Social Layer (Friend/Feed/Chat)

Social-related lib modules exist:
- `src/lib/socialModel.ts` (types/contracts)
- `src/lib/socialStore.ts`
- `src/lib/friendsStore.ts`
- `src/lib/feedStore.ts`
- `src/lib/chatStore.ts`
- `src/lib/socialShare.ts`
- `src/lib/notificationPrefs.ts`
- `src/lib/userDirectory.ts`

Current status:
- The scaffolding is there (types + stores + screens).
- The shape is still “frontend local” (no server enforcement yet).
- Spam control, permissions, and discovery rules are modeled via types (e.g. “friendsOnly”, “mutualFollow”, etc.).

---

## 9) UI / Design System

- `src/ui/designSystem.ts` → `makeDesignSystem(...)` (tone, spacing, radii, rules)
- `src/ui/theme.ts` → `useThemeColors()` (colors)
- `src/ui/forgerankStyle.ts` → style helpers for the brand

Current vibe:
- Dark + “toxic” accent styling is supported
- Components are already using:
  - `c.bg`, `c.card`, `c.text`, `c.muted`, `c.border`
  - `ds.space.*`, `ds.radii.*`, `ds.rules.*`, `ds.tone.accent`

---

## 10) Known Current “Fault Lines” (What breaks first)

These are the common failure modes in this repo:
1) **Type drift** between stores/components (prop/type changes ripple)
2) **Feature stubs** that exist as screens but rely on missing exports
3) **Overlapping responsibilities** (LiveWorkout does orchestration + conversion + cue logic + persistence)
4) **In-memory stores** mean data disappears on reload (except CurrentSession)

This is expected for v1 scaffolding, but we should now deliberately stabilize the contracts.

---

## 11) Near-Term Architecture Targets

If we want “fast + stable” with minimal churn:
- Define **canonical domain types**:
  - `LoggedSet` vs `WorkoutSet` conversion rules in one place
  - “Social” types consolidated in `socialModel.ts`
- Pick one store layer:
  - Either keep the current pattern consistently
  - Or migrate to Zustand (recommended) once v1 scope is locked
- Add a “repo contract” policy:
  - UI components accept data via stable props
  - stores expose stable selectors/helpers

---

## 12) Next Docs We Will Add

- `docs/NOW_NEXT_LATER.md` — execution plan
- `docs/V1_SCOPE.md` — locked v1 launch scope
- `docs/SCORING_SPEC.md` — Forgerank scoring + ranking spec
- `docs/DESIGN_SYSTEM.md` — art direction rules + UI tokens

---

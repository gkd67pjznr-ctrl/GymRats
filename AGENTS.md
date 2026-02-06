# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

---

## Development Commands

```bash
# Start development server (tunnel mode for Expo Go)
npm start

# Platform-specific development
npm run android          # Android emulator/device
npm run ios              # iOS simulator/device
npm run web              # Web version

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode for TDD
npm run test:coverage    # Generate coverage report

# Run a single test file
npm test -- __tests__/lib/perSetCue.test.ts

# Run tests matching a pattern
npm test -- --testPathPattern="currentSessionStore"

# Linting
npm run lint             # ESLint via Expo config
```

---

## Project Overview

GymRats is a React Native workout tracking app built with Expo 54. Key features:
- Live workout logging with real-time PR detection
- 20-rank scoring system per exercise (Iron → Mythic)
- AI Gym Buddy with 9 personalities and voice lines
- Social feed with posts, reactions, and friend filtering
- Avatar system with hangout room
- Workout history with calendar view

**Tech Stack:** Expo 54, React Native 0.81, TypeScript 5.9, Zustand (state), AsyncStorage (persistence), Supabase (backend), Jest + RNTL (testing)

---

## Architecture

### Directory Structure

```
app/                        # Expo Router screens (file-based routing)
├── (tabs)/                 # Bottom tab navigator (Home, Workout, Feed, Profile)
├── auth/                   # Login/signup screens
├── workout/                # Workout-related screens
├── routines/               # Routine CRUD
└── live-workout.tsx        # Core workout logging experience

src/
├── lib/                    # Domain logic and state
│   ├── stores/            # Zustand stores (15+ stores with AsyncStorage)
│   ├── hooks/              # React hooks
│   ├── workoutModel.ts     # Core workout types
│   ├── gymratsScoring.ts   # Scoring algorithm (0-1000)
│   ├── ranks.ts            # 20-rank ladder per exercise
│   ├── perSetCue.ts        # PR detection (weight, rep, e1RM)
│   └── e1rm.ts             # Epley formula: e1RM = weight × (1 + reps/30)
├── ui/                     # UI layer
│   ├── designSystem.ts     # Design tokens
│   ├── themes/             # Theme system (toxic-energy, iron-forge, neon-glow)
│   └── components/         # Reusable components
└── data/                   # Static datasets (exercises.ts, rankTops.ts)
```

### Key Stores

| Store | Purpose |
|-------|---------|
| `currentSessionStore` | Active workout state (survives app close, 24h expiry) |
| `workoutStore` | Workout history |
| `workoutDrawerStore` | Drawer UI state, rest timer, PR cue pending |
| `authStore` | Authentication, OAuth |
| `buddyStore` | AI buddy personalities, triggers, voice lines |
| `userStatsStore` | Unified stats: GymRank score, PRs, lifetime totals |
| `gamificationStore` | XP, levels, streaks, Juice currency |

---

## Important Conventions

### Weights
All weights stored internally in **kilograms**. Convert at display layer using `src/lib/units.ts`.

### IDs
- Generate with `uid()` from `src/lib/uid.ts` (8-char random string)
- Exercise IDs: `bench`, `squat`, `deadlift`, `ohp`, `row`, `pullup`, etc.

### Timestamps
Always milliseconds (`Date.now()`). Field suffix: `*Ms` (e.g., `startedAtMs`)

### Path Alias
`@/` maps to project root:
```typescript
import { useThemeColors } from '@/src/ui/theme';
import { EXERCISES_V1 } from '@/src/data/exercises';
```

### Hydration
Always check hydration before rendering persisted state:
```typescript
const { data, hydrated } = useMyStore();
if (!hydrated) return <Loading />;
```

---

## Testing

- Tests: `__tests__/` and `src/lib/**/__tests__/`
- Preset: `jest-expo`
- Pattern: `**/__tests__/**/*.test.ts?(x)`
- Mock AsyncStorage and `createQueuedJSONStorage` for store tests

---

## Environment Variables

Required for Supabase:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Documentation Reference

For deeper context, see:
- `CLAUDE.md` — Detailed project guide with commands and workflow
- `docs/1-PROJECT-STATUS.md` — Feature status, priorities
- `docs/3-CODEBASE-GUIDE.md` — Architecture details, patterns
- `docs/features/` — Individual feature documentation

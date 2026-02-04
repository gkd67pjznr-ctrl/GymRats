# CODEBASE GUIDE

**Last Updated:** 2026-02-03
**Purpose:** Architecture overview, technology stack, and development patterns

---

## Quick Start for Contributors

**What is GymRats?**
- React Native workout tracking app with AI gym buddy, social features, and gamification
- Built with Expo 54, React Native 0.81, TypeScript 5.9
- Uses Zustand for state management, Supabase for backend

**Getting Started:**
1. Read: Architecture overview → Tech stack → Directory structure
2. Understand: State management pattern → Common patterns → Testing conventions
3. Contribute: Follow existing patterns, add tests, update docs

---

## Technology Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81 | Mobile framework |
| Expo | 54 | Development platform & tooling |
| TypeScript | 5.9 | Type-safe JavaScript |
| expo-router | latest | File-based navigation |
| Zustand | latest | State management |
| Supabase | latest | Backend (Postgres + Auth + Realtime) |
| Jest | latest | Testing framework |

### Key Dependencies
```json
{
  "@react-native-async-storage/async-storage": "Client persistence",
  "expo-haptics": "Haptic feedback",
  "expo-speech": "Voice playback",
  "expo-notifications": "Push notifications",
  "react-native-confetti-cannon": "Celebration effects",
  "zustand": "State management",
  "@supabase/supabase-js": "Backend integration",
  "victory-native": "Charting library"
}
```

---

## Architecture Overview

### Directory Structure

```
gymrats-glm/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── index.tsx            # Home/dashboard
│   │   ├── workout.tsx          # Start workout entry
│   │   ├── feed.tsx             # Social feed
│   │   └── profile.tsx          # User profile
│   ├── auth/                    # Login/signup screens
│   ├── workout/                 # Workout-related screens
│   ├── routines/                # Routine CRUD screens
│   ├── live-workout.tsx         # Core workout logging experience
│   └── _layout.tsx              # Root layout with error boundary
│
├── src/
│   ├── lib/                     # Domain logic and state
│   │   ├── stores/             # Zustand stores (15+ stores)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── validators/         # Input validation
│   │   ├── supabase/           # Supabase client + types
│   │   ├── auth/               # OAuth (Google, Apple)
│   │   ├── exerciseAPI/        # ExerciseDB API integration
│   │   ├── forgeLab/           # Analytics system
│   │   ├── forgeDNA/           # Training identity visualization
│   │   ├── avatar/             # Avatar system
│   │   ├── hangout/            # Hangout room + real-time presence
│   │   ├── gamification/       # XP, levels, milestones
│   │   ├── workoutModel.ts     # Core workout types
│   │   ├── gymratsScoring.ts # Scoring algorithm
│   │   ├── ranks.ts            # Rank ladder utilities
│   │   ├── perSetCue.ts        # PR detection per set
│   │   └── e1rm.ts             # 1-rep max (Epley formula)
│   │
│   ├── ui/                      # UI layer
│   │   ├── designSystem.ts     # Design tokens (legacy)
│   │   ├── theme.ts            # Theme hook (legacy)
│   │   ├── themes/             # New theme system (3 palettes)
│   │   └── components/         # Reusable components
│   │       ├── LiveWorkout/    # Workout UI components
│   │       ├── ForgeLab/       # Analytics components
│   │       ├── Celebration/    # PR celebrations
│   │       └── Social/         # Social UI components
│   │
│   └── data/                   # Static datasets
│       ├── exercises.ts        # 100+ exercises
│       └── rankTops.ts         # Verified top e1RMs
│
├── docs/                        # Documentation
├── __tests__/                   # Integration tests
└── supabase/migrations/         # Database migrations
```

---

## State Management

### Zustand Stores (15+ stores)

All stores follow the same pattern with AsyncStorage persistence:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createQueuedJSONStorage } from '@/src/lib/stores/storage/createQueuedAsyncStorage';

interface MyState {
  data: any[];
  hydrated: boolean;
  addItem: (item: any) => void;
  setHydrated: (v: boolean) => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({
      data: [],
      hydrated: false,
      addItem: (item) => set(s => ({ data: [...s.data, item] })),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: 'myStore.v2',
      storage: createQueuedJSONStorage(),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
```

### Store Reference

| Store | Purpose | Key Features |
|-------|---------|-------------|
| `currentSessionStore` | Active workout state | Session persistence, exercise blocks, 24h expiration |
| `workoutStore` | Workout history | CRUD, sync, real-time |
| `workoutDrawerStore` | Drawer UI state | Collapse/expand, rest timer, PR cue pending |
| `routinesStore` | Saved routines | CRUD, sync |
| `workoutPlanStore` | Current plan | Session management |
| `settingsStore` | User preferences | Bodyweight, units, theme, location |
| `authStore` | Authentication | OAuth, profile, session |
| `feedStore` | Social feed posts | Sync, real-time, mutations |
| `friendsStore` | Friend relationships | Sync, real-time, requests |
| `socialStore` | Social data | Reactions, comments |
| `chatStore` | Direct messages | Sync, real-time, typing |
| `gamificationStore` | XP, levels, streaks | Backend sync, achievements |
| `milestonesStore` | Milestone achievements | Backend sync, trophy case |
| `buddyStore` | AI buddy state | Personalities, IAP, triggers, voice lines |
| `journalStore` | Training journal | Entries, mood, energy |
| `avatarStore` | Avatar system | Growth, customization |
| `hangoutStore` | Hangout room | Presence, decorations, real-time |
| `forgeLabStore` | Analytics data | Calculations, caching |
| `onboardingStore` | Onboarding flow | Completion state, debug reset |
| `userStatsStore` | Unified user stats | GymRank score, PRs, lifetime stats |

### Store Patterns

**Reading state in components:**
```typescript
// Hook approach
const { data, hydrated } = useMyStore();

// Selector approach
const data = useMyStore(s => s.data);
```

**Imperative updates (for non-React code):**
```typescript
import { updateCurrentSession, clearCurrentSession } from '@/src/lib/stores/currentSessionStore';

updateCurrentSession(s => ({ ...s, sets: [...s.sets, newSet] }));
clearCurrentSession();
```

**Hydration check (always check before rendering):**
```typescript
const { data, hydrated } = useMyStore();
if (!hydrated) return <Loading />;
```

---

## Core Data Models

### Workout Types

```typescript
// Individual set logged during workout
type WorkoutSet = {
  id: string;
  exerciseId: string;    // e.g., "bench", "squat"
  weightKg: number;      // Always stored in kg
  reps: number;
  timestampMs: number;
};

// Complete workout session
type WorkoutSession = {
  id: string;
  userId: string;
  startedAtMs: number;
  endedAtMs: number;
  sets: WorkoutSet[];
  routineId?: string;
  routineName?: string;
  planId?: string;
  completionPct?: number; // 0-1 for planned workouts
};
```

### Key Conventions

**Weights:** Always stored in kg internally. Convert at display layer using `src/lib/units.ts`

**IDs:** Use `uid()` from `src/lib/uid.ts` for generating unique IDs (8-character random string)

**Exercise IDs:** Standard IDs from `src/data/exercises.ts`
- `bench`, `squat`, `deadlift`, `ohp`, `row`, `pullup`
- `incline_bench`, `rdl`, `leg_press`, `lat_pulldown`

**Timestamps:** Always use milliseconds (`Date.now()`), field naming: `*Ms` suffix

---

## Common Patterns

### Creating a New Zustand Store

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createQueuedJSONStorage } from '@/src/lib/stores/storage/createQueuedAsyncStorage';

type State = {
  items: Item[];
  hydrated: boolean;
  addItem: (item: Item) => void;
};

export const useMyStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      addItem: (item) => set(s => ({ items: [...s.items, item] })),
    }),
    {
      name: 'myStore.v1',
      storage: createQueuedJSONStorage(),
    }
  )
);
```

### Adding a New Exercise

1. Add to `EXERCISES_V1` in `src/data/exercises.ts`
2. Add verified top to `src/data/rankTops.ts`

### Adding a New Screen

1. Create file in `app/` following expo-router conventions
2. Dynamic routes: `[param].tsx`, catch-all: `[...slug].tsx`
3. Tab screens go in `app/(tabs)/`

### Safe JSON Parse

```typescript
function safeJSONParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
```

---

## Navigation Pattern

- File-based routing with expo-router
- Tab navigator in `app/(tabs)/`
- Dynamic routes using `[param].tsx` syntax
- Protected routes with authentication checks

### Route Structure

```
app/
├── (tabs)/           # Bottom tab navigator
│   ├── index.tsx     # Home
│   ├── workout.tsx   # Start workout
│   ├── feed.tsx      # Social feed
│   └── profile.tsx   # Profile
├── auth/             # Login/signup
├── workout/          # Workout screens
├── routines/         # Routine CRUD
└── live-workout.tsx  # Core workout experience
```

---

## Testing

### Test Locations
- `__tests__/` - Integration tests
- `src/lib/**/__tests__/` - Unit tests per module

### Configuration
```javascript
// jest.config.js
{
  preset: 'jest-expo',
  testMatch: '**/__tests__/**/*.test.ts?(x)',
  setupFiles: ['<rootDir>/jest.setup.js']
}
```

### Running Tests
```bash
npm test                      # All tests
npm test -- path/to/test      # Single file
npm test -- --testPathPattern="store"  # Pattern match
npm run test:watch            # Watch mode
npm run test:coverage         # Coverage report
```

### Test Patterns

**Store test with AsyncStorage mock:**
```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@/src/lib/stores/storage/createQueuedAsyncStorage', () => ({
  createQueuedJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));
```

---

## Error Handling

### Error Boundaries
- Root error boundary in `app/_layout.tsx`
- Per-tab error boundaries
- Consistent error logging pattern

### Error Handling Pattern
```typescript
try {
  // Operation
} catch (error) {
  if (__DEV__) {
    console.error('[Context] Error:', error);
  }
  // Graceful fallback
}
```

---

## Backend Integration

### Supabase Configuration

**Required environment variables:**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Sync System

**5-phase sync system:**
1. Core Infrastructure - NetworkMonitor, repositories
2. Store Integration - Workout, routines, plans
3. Social Sync - Friends, feed, chat
4. Chat Sync - Messages, typing indicators
5. Utility Hooks - useSyncStatus, useSyncState

**Sync initialization:**
```typescript
// In app/_layout.tsx
import { initializeSync } from '@/src/lib/sync/syncOrchestrator';

useEffect(() => {
  initializeSync();
}, []);
```

---

## Design System

### Usage

```typescript
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useThemeColors } from '@/src/ui/theme';

const ds = makeDesignSystem('dark', 'toxic');
const c = useThemeColors();

// Colors: c.bg, c.card, c.text, c.muted, c.accent
// Spacing: ds.space.x4 (16px)
// Radii: ds.radii.lg (20px)
// Type: ds.type.h1.size, ds.type.body.w
```

### Accent Themes (Legacy)
- `toxic` (lime green)
- `electric` (purple)
- `ember` (pink)
- `ice` (cyan)
- `ultra` (mixed)

### New Theme System (Recommended)

```typescript
import { useTheme, ThemeProvider } from '@/src/ui/themes';

// Available themes: 'toxic-energy', 'iron-forge', 'neon-glow'
const theme = useTheme();

// Theme colors
theme.colors.bg           // Background
theme.colors.card         // Card background
theme.colors.primary      // Primary accent
theme.colors.text         // Text color

// Theme motion presets
theme.motion.springTension   // Animation tension
theme.motion.prEntryDuration // PR celebration entry time

// Theme surfaces
theme.surfaces.glowIntensity // Glow effect strength
```

See `docs/visual-style/theme-implementation-plan.md` for full implementation guide.

### Rank Colors
`ds.tone.iron`, `ds.tone.bronze`, ... `ds.tone.mythic`

---

## Key Algorithms

### e1RM Calculation (Epley Formula)
```typescript
e1RM = weight × (1 + reps/30)
```

### GymRats Scoring
- Base strength: e1RM/bodyweight ratio (nonlinear curve)
- Rep quality: Bonus for quality reps at high load
- Volume bonus: Reward for actual work volume
- Consistency bonus: Sessions in last 14 days
- PR bonus: Reward for beating previous best

### PR Detection
1. Weight PR - New heaviest weight lifted
2. Rep PR - More reps at same weight bucket
3. e1RM PR - New estimated 1-rep max

Priority: Weight > Rep > e1RM

---

## Development Commands

```bash
# Start development server
npm start                    # Tunnel mode for Expo Go
npm run android              # Android emulator
npm run ios                  # iOS simulator
npm run web                  # Web version

# Testing
npm test                     # All tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report

# Linting
npm run lint                 # ESLint
```

---

## Documentation

**Key Documentation:**
- `docs/1-PROJECT-STATUS.md` - Project status and metrics
- `docs/2-MASTER-PLAN.md` - Vision and strategy
- `docs/3-CODEBASE-GUIDE.md` - This file
- `docs/Master Documentation/FEATURE-MASTER.md` - Feature breakdown
- `docs/Master Documentation/USER_TESTING_CHECKLIST.md` - Test cases

**Feature Documentation:**
- `docs/features/` - Individual feature documentation
- `docs/visual-style/` - Design system documentation
- `docs/Project Management/` - Workflow and processes

---

## Path Alias

`@/` maps to project root:
```typescript
import { useThemeColors } from '@/src/ui/theme';
import { EXERCISES_V1 } from '@/src/data/exercises';
```

---

*For feature-specific implementation details, see individual feature files in `docs/features/`*

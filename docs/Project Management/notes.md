# Development Notes

**Last Updated:** 2026-01-26

A collection of development notes, decisions, and reminders.

---

## Commands

### Development
```bash
npm start              # Start Expo dev server (tunnel mode)
npm run android        # Start Android
npm run ios            # Start iOS
npm run web            # Start web
```

### Testing
```bash
npm test               # Run all tests
npm test -- --watch    # Watch mode
npm test -- --coverage # Coverage report
npm test -- __tests__/path/file.test.ts  # Single file
```

### Linting
```bash
npm run lint           # ESLint
```

---

## Key Decisions

### State Management
**Decision:** Zustand with AsyncStorage persistence
**Why:** Simple, lightweight, good TypeScript support, easy persistence
**Date:** 2026-01-25

### Backend
**Decision:** Supabase (Postgres + Auth + Storage)
**Why:** Fast setup, good React Native support, real-time subscriptions, RLS
**Date:** 2026-01-24

### Scoring Algorithm
**Decision:** e1RM-based with static verified standards
**Why:** Honest, not gamified, users trust the ranks
**Date:** Initial design

### UI Aesthetic
**Decision:** "Pure-inspired" dark, mysterious, exclusive
**Why:** Appeals to young lifters, differentiation from boring fitness apps
**Date:** 2026-01-25

---

## Code Patterns

### Zustand Store Template
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'storeName.v2';

interface State {
  data: any[];
  hydrated: boolean;
  addItem: (item: any) => void;
  setHydrated: (v: boolean) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      data: [],
      hydrated: false,
      addItem: (item) => set(s => ({ data: [...s.data, item] })),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
```

### Safe JSON Parse
```typescript
function safeJSONParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.error('[safeJSONParse] Failed to parse');
    return fallback;
  }
}
```

### Design System Usage
```typescript
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useThemeColors } from '@/src/ui/theme';

const ds = makeDesignSystem('dark', 'toxic');
const c = useThemeColors();

// Colors: c.bg, c.card, c.text, c.muted, c.accent
// Spacing: ds.space.x4 (16px)
// Radii: ds.radii.lg (20px)
```

---

## Common Gotchas

### Hydration
Always check `hydrated` flag before rendering data-dependent UI:
```typescript
const { data, hydrated } = useStore();
if (!hydrated) return <Loading />;
```

### Weights
Internal storage is ALWAYS kg. Convert for display:
```typescript
import { kgToLb, lbToKg } from '@/src/lib/units';
```

### Timestamps
Always use milliseconds:
```typescript
const now = Date.now(); // Correct
const now = new Date(); // Wrong for storage
```

### Exercise IDs
Use standard IDs from `exercises.ts`:
- `bench`, `squat`, `deadlift`, `ohp`, `row`, `pullup`
- Not display names!

---

## Environment Variables

Required for Supabase:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Create `.env` file (gitignored).

---

## Deprecated Code

`src/lib/_old/` contains deprecated stores. Do NOT import from this directory. These are kept for reference only.

Should be deleted once fully migrated.

---

## TODO Reminders

- [ ] Delete `_old/` directory after confirming no references
- [ ] Extract `timeAgo` function to shared utility
- [ ] Extract `kgToLb` usage to import from `units.ts`
- [ ] Refactor `live-workout.tsx` (577 lines)
- [ ] Add `__DEV__` guards to console.log statements
- [ ] Standardize imports to use `@/` alias

---

## Useful Links

- [Expo Documentation](https://docs.expo.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

---

## Contact

Project Owner: Thomas
Development: Claude Code assisted

---

*Add notes here as development progresses.*

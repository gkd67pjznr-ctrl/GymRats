# Feature: Training Journal

## Overview

Comprehensive workout journaling system that combines free-form notes with structured input tracking. The Day Log system captures physical and mental state data that ties directly into Gym Lab analytics, making journaling actually useful rather than decorative.

**Status:** In Progress | **Progress:** 4/10 features
**Priority:** P1 (Launch) for Day Log, P3 for advanced features
**Source:** 2026-01-29 brainstorm + Voice Memo 7 (2026-02-05)

---

## Philosophy

> "A lot of apps have journal entries that don't affect anything. Unless you're going back and reading old notes, it doesn't matter."

GymRats solves this by:
1. **Structured inputs** — Quick-tap data entry, not tedious forms
2. **Analytics integration** — Data feeds into Gym Lab correlations
3. **Actionable insights** — "When well-rested, you hit 23% more PRs"

---

## Sub-Features

### SECTION A: Free-Form Notes (Implemented)

#### 1. Per-Workout Notes ✅
**Status:** Done

- [x] Free-form text field on workout completion
- [x] "How did this workout go?" prompt
- [x] Notes attached to workout session (via sessionId)
- [x] Visible in workout history detail view

#### 2. Per-Day Journal ✅
**Status:** Done

- [x] Daily journal entry (independent of workouts)
- [x] Rest day notes, recovery thoughts, meal notes
- [x] Accessible from profile or calendar view

#### 3. Basic Mood/Energy Tracking ✅
**Status:** Done

- [x] Quick mood selector (1-5 star rating)
- [x] Energy level indicator
- [x] Soreness tracking (which muscle groups)

#### 4. Journal History ✅
**Status:** Done

- [x] Searchable journal entries
- [x] Filter by date range
- [x] Journal statistics

---

### SECTION B: Day Log System (NEW - From Voice Memo 7)

Structured quick-input system that captures physical and mental state with analytics integration.

#### 5. Day Log Data Model
**Status:** Not Started | **Priority:** High

- [ ] Create `DayLog` type with structured fields
- [ ] Create `dayLogStore.ts` (Zustand + AsyncStorage)
- [ ] Sync to Supabase
- [ ] Link to workout session

**Data Model:**
```typescript
type DayLog = {
  id: string;
  sessionId: string;           // Links to workout
  userId: string;
  createdAt: number;

  // Physical State
  hydration: 1 | 2 | 3 | 4 | 5;           // 1=dehydrated, 5=well hydrated
  nutrition: 'none' | 'light' | 'moderate' | 'full';
  carbsLevel: 'low' | 'moderate' | 'high';

  // Pain Tracking
  hasPain: boolean;
  painLocations?: PainLocation[];

  // Mental State
  energyLevel: 1 | 2 | 3 | 4 | 5;         // 1=exhausted, 5=energized
  sleepQuality: 1 | 2 | 3 | 4 | 5;        // 1=terrible, 5=excellent

  // Optional
  notes?: string;
};

type PainLocation =
  | 'elbow_l' | 'elbow_r'
  | 'shoulder_l' | 'shoulder_r'
  | 'wrist_l' | 'wrist_r'
  | 'arm_tendon_l' | 'arm_tendon_r'
  | 'leg_tendon_l' | 'leg_tendon_r'
  | 'lower_back'
  | 'knee_l' | 'knee_r';
```

**Tasks:** #60

---

#### 6. Day Log Quick-Input UI
**Status:** Not Started | **Priority:** High

- [ ] Quick-tap interface (not tedious forms)
- [ ] Hydration: 5-segment slider with water drop icons
- [ ] Nutrition: 4 buttons (None / Light / Moderate / Full)
- [ ] Carbs: 3 buttons (Low / Moderate / High)
- [ ] Pain: Yes/No toggle → body part checkboxes if Yes
- [ ] Energy: 5-segment slider with battery icons
- [ ] Sleep: 5 buttons with emoji (😫 😕 😐 🙂 😴)
- [ ] Optional free-text note at bottom
- [ ] Can skip entirely (all fields optional)

**UI Flow Options:**
1. Prompt at workout START (before first set)
2. Prompt at workout END (during summary)
3. Always accessible via icon in workout drawer
4. Settings toggle for when to prompt

**Mockup:**
```
┌─────────────────────────────────────┐
│ How are you feeling today?          │
├─────────────────────────────────────┤
│ 💧 Hydration                        │
│ [1] [2] [3] [4] [5]                │
│                                     │
│ 🍽️ Nutrition                       │
│ [None] [Light] [Moderate] [Full]   │
│                                     │
│ ⚡ Energy                           │
│ [1] [2] [3] [4] [5]                │
│                                     │
│ 😴 Sleep Last Night                 │
│ [😫] [😕] [😐] [🙂] [😴]           │
│                                     │
│ 🤕 Any aches or pains?              │
│ [No] [Yes]                          │
│   ↓ (if Yes)                        │
│   □ L Shoulder  □ R Shoulder        │
│   □ L Elbow     □ R Elbow           │
│   □ Lower Back  □ L Knee  □ R Knee  │
├─────────────────────────────────────┤
│ [Skip]              [Save & Start] │
└─────────────────────────────────────┘
```

**Tasks:** #61

---

#### 7. Pain Location Body Picker
**Status:** Not Started | **Priority:** Medium

- [ ] Visual body diagram for pain selection
- [ ] Tap body parts to toggle pain
- [ ] Left/right distinction
- [ ] Common areas: shoulders, elbows, wrists, lower back, knees
- [ ] Tendons: arm tendons, leg tendons (hamstring/quad/achilles)

---

#### 8. Gym Lab Day Log Analytics
**Status:** Not Started | **Priority:** High

- [ ] Correlate Day Log data with workout performance
- [ ] Show insights in Gym Lab:
  - "When well hydrated + fed → 23% more likely to hit PR"
  - "When well-rested → 15% more volume on average"
  - "Shoulder pain days → -18% pressing performance"
- [ ] Charts: Sleep vs Performance, Nutrition vs Volume
- [ ] Pain frequency tracking over time
- [ ] Best/worst workout conditions summary

**Implementation:**
```typescript
// In Gym Lab analytics
function calculateDayLogCorrelations(logs: DayLog[], workouts: WorkoutSession[]) {
  // Group workouts by Day Log conditions
  const wellRested = workouts.filter(w => getDayLog(w.id)?.sleepQuality >= 4);
  const poorlyRested = workouts.filter(w => getDayLog(w.id)?.sleepQuality <= 2);

  // Calculate performance metrics for each group
  const wellRestedPRRate = calculatePRRate(wellRested);
  const poorlyRestedPRRate = calculatePRRate(poorlyRested);

  return {
    sleepImpact: {
      wellRestedPRRate,
      poorlyRestedPRRate,
      difference: wellRestedPRRate - poorlyRestedPRRate,
      insight: `You're ${Math.round((wellRestedPRRate/poorlyRestedPRRate - 1) * 100)}% more likely to hit PRs when well-rested`
    }
  };
}
```

**Tasks:** #62

---

#### 9. Day Log History View
**Status:** Not Started | **Priority:** Low

- [ ] View past Day Logs in journal history
- [ ] Filter workouts by conditions (show only "good sleep" days)
- [ ] Trend charts for each metric over time

---

#### 10. Day Log Export
**Status:** Not Started | **Priority:** Low

- [ ] Include Day Log data in CSV export
- [ ] Separate columns for each metric

---

## Database Schema

```sql
-- Day Log table (extends existing journal system)
CREATE TABLE day_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id UUID REFERENCES workout_sessions,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Physical
  hydration SMALLINT CHECK (hydration BETWEEN 1 AND 5),
  nutrition TEXT CHECK (nutrition IN ('none', 'light', 'moderate', 'full')),
  carbs_level TEXT CHECK (carbs_level IN ('low', 'moderate', 'high')),

  -- Pain
  has_pain BOOLEAN DEFAULT false,
  pain_locations TEXT[],  -- Array of pain location IDs

  -- Mental
  energy_level SMALLINT CHECK (energy_level BETWEEN 1 AND 5),
  sleep_quality SMALLINT CHECK (sleep_quality BETWEEN 1 AND 5),

  -- Optional
  notes TEXT
);

-- Index for analytics queries
CREATE INDEX idx_day_logs_user_date ON day_logs(user_id, created_at);
CREATE INDEX idx_day_logs_session ON day_logs(session_id);
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/stores/dayLogStore.ts` | Day Log state management |
| `src/ui/components/DayLog/DayLogInput.tsx` | Quick-input UI |
| `src/ui/components/DayLog/PainLocationPicker.tsx` | Body part selector |
| `src/ui/components/ForgeLab/DayLogCorrelations.tsx` | Analytics integration |
| `app/journal.tsx` | Existing journal screen |

---

## Dependencies

- Workout Drawer (prompt integration)
- Gym Lab (analytics display)
- Backend Sync (data persistence)
- Design System (consistent UI)

---

## Related Tasks

- #60: Create DayLog data model and store
- #61: Build Day Log input UI (quick-tap style)
- #62: Build Gym Lab correlation analytics for day logs

---

## Acceptance Criteria

### Day Log
1. User can quickly log physical/mental state before workout (< 30 seconds)
2. All inputs are optional (can skip entirely)
3. Pain tracking shows body part checkboxes when "Yes" selected
4. Data persists and syncs to cloud
5. Gym Lab shows meaningful correlations with workout performance
6. User can see trends over time

### Analytics Integration
1. Gym Lab displays at least 3 correlation insights
2. Correlations are statistically meaningful (show only with sufficient data)
3. Insights are actionable and clearly written

---

## Future Enhancements

- AI-powered workout recommendations based on Day Log
- Pre-workout suggestions ("You're tired today, consider lighter weights")
- Integration with sleep tracking apps (Apple Health, Whoop)
- Predictive performance based on conditions
- Share Day Log patterns with coach/trainer

---

*Updated: 2026-02-05*
*Sources: 2026-01-29 brainstorm, Voice Memo 7 (2026-02-05)*

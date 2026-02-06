<objective>
Refactor and implement the Day Log feature - a structured physical/mental state logging system for workouts that provides actionable analytics.

Unlike empty journal text boxes, this captures specific data points that correlate with workout performance, giving users insights like "You hit 23% more PRs when well-hydrated and rested."
</objective>

<context>
This is a React Native/Expo app using:
- Zustand for state management
- Supabase for backend
- expo-router for navigation

**CRITICAL**: There is existing broken code for this feature. You must:
1. Find and audit the existing day log/journal implementation
2. Remove the broken popup code
3. Implement the new UX flow described below

Read these files first:
- `@CLAUDE.md` for project conventions
- `@src/lib/stores/` - find any existing day log or journal store
- `@src/ui/components/LiveWorkout/` - find existing journal/log UI
- `@app/live-workout.tsx` - main workout screen
- `@src/lib/workoutModel.ts` for session data patterns
</context>

<research>
Before implementing, search for existing day log code:
1. Grep for "dayLog", "journal", "DayLog", "Journal" across the codebase
2. Find the broken popup component and understand what's wrong
3. Identify any existing store or data structure
4. Document what exists vs what needs to be built
</research>

<requirements>
## UX Flow (Specific)

1. **Icon Placement**: Small icon (placeholder for now, will be custom later) in TOP RIGHT corner of the workout drawer/live-workout screen

2. **First Load Prompt**:
   - Small text bubble below icon: "Log your physical/mental?"
   - This only shows on first workout load (not after user interacts)

3. **First Tap Flow**:
   - User taps icon → Small yes/no confirmation box appears
   - If "No" → Remove text bubble, don't prompt again this session
   - If "Yes" → Show full Day Log form

4. **Return Access**:
   - Even after dismissing, user can tap icon again to access Day Log
   - Icon remains visible throughout workout

5. **Full Day Log Form** (top third of screen):
   - Appears as overlay/modal in top portion
   - Does NOT cover the entire workout UI

## Data Fields

```typescript
type DayLog = {
  id: string;
  sessionId: string;  // Links to workout session
  timestamp: number;

  // Hydration (1-5 scale)
  hydration: 1 | 2 | 3 | 4 | 5 | null;

  // Nutrition
  calorieEstimate: 'fasted' | 'light' | 'moderate' | 'well-fed' | null;
  carbEstimate: 'low' | 'moderate' | 'high' | null;

  // Physical State
  achesAndPains: {
    hasAches: boolean;
    areas?: ('shoulders' | 'elbows' | 'wrists' | 'knees' | 'lower_back' | 'upper_back' | 'neck' | 'hips')[];
    notes?: string;
  };

  // Mental State
  energyLevel: 1 | 2 | 3 | 4 | 5 | null;  // 1=exhausted, 5=energized
  mood: 'stressed' | 'neutral' | 'focused' | 'motivated' | null;

  // Sleep
  sleepQuality: 1 | 2 | 3 | 4 | 5 | null;  // 1=terrible, 3=normal, 5=exceptional
}
```

## Analytics Requirements

Create analytics utilities that can:
1. Correlate day log data with workout performance:
   - PR frequency vs hydration/sleep/energy
   - Volume completed vs nutrition/energy
   - Workout completion % vs all factors

2. Generate insights like:
   - "Your PR rate is 35% higher on days you report 4+ hydration"
   - "You complete 20% more volume when well-fed"
   - "Consider more rest - you report aches 3 workouts in a row"

3. Store aggregated stats for the insights dashboard (future feature)
</requirements>

<implementation>
1. **Remove broken code first** - delete the existing broken popup/journal implementation

2. **Create clean architecture**:
   - `dayLogStore.ts` - Zustand store with persistence
   - `DayLogIcon.tsx` - The icon + text bubble component
   - `DayLogPrompt.tsx` - The yes/no confirmation
   - `DayLogForm.tsx` - The full form (top third modal)
   - `dayLogAnalytics.ts` - Correlation and insight functions

3. **Form UX**:
   - Use slider or segmented controls for scales (not text input)
   - Aches/pains: Toggle "Any aches?" → reveals checkboxes if yes
   - Quick to complete - optimize for speed during workout

4. **Supabase schema** (create migration, don't run):
   - Table: `day_logs`
   - Enable correlation queries with workout_sessions
</implementation>

<output>
Create/modify files:

1. DELETE or refactor broken existing day log/journal code (document what you removed)
2. `./src/lib/stores/dayLogStore.ts` - Zustand store
3. `./src/ui/components/DayLog/DayLogIcon.tsx` - Icon with text bubble
4. `./src/ui/components/DayLog/DayLogPrompt.tsx` - Yes/No confirmation
5. `./src/ui/components/DayLog/DayLogForm.tsx` - Full form modal
6. `./src/lib/dayLogAnalytics.ts` - Analytics utilities
7. `./supabase/migrations/YYYYMMDD_day_logs.sql` - Supabase schema
8. Integrate DayLogIcon into live-workout.tsx header area
</output>

<verification>
Before completing:
- [ ] Broken old code removed/replaced
- [ ] Icon appears in top right of workout screen
- [ ] Text bubble shows on first load
- [ ] Yes/No flow works correctly
- [ ] Full form appears in top third (doesn't cover whole screen)
- [ ] Data persists with workout session
- [ ] Analytics functions return meaningful correlations
- [ ] No TypeScript errors
- [ ] Design system tokens used
</verification>

<success_criteria>
- Clean removal of broken existing implementation
- New UX flow matches specification exactly
- Data structure supports analytics queries
- Analytics utilities can correlate log data with workout performance
- Form is quick to complete (not burdensome during workout)
- Follows existing codebase patterns
</success_criteria>

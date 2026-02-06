<objective>
Implement a per-exercise notes system that allows users to attach persistent notes to any exercise. These notes stick to the exercise for that user until they change them.

This feature lets users record exercise-specific reminders like:
- Machine weight calibration differences ("This brand runs heavy")
- Form cues ("Keep elbows tucked on descent")
- Equipment preferences ("Use the second bench from the wall")
- Personal modifications ("Skip last set due to shoulder")
</objective>

<context>
This is a React Native/Expo app using:
- Zustand for state management with AsyncStorage persistence
- Supabase for backend sync
- expo-router for navigation
- Design system in `src/ui/designSystem.ts`

Read these files first to understand patterns:
- `@CLAUDE.md` for project conventions
- `@src/lib/stores/currentSessionStore.ts` for Zustand store patterns
- `@src/ui/components/LiveWorkout/` for live workout UI components
- `@src/lib/workoutModel.ts` for data model patterns
</context>

<requirements>
1. **UI Component**: Small note icon on each exercise card in the workout drawer
   - Icon placement: Right side of exercise card header
   - Tap to expand: Reveals text input below the exercise card
   - Visual indicator: Show filled vs empty icon based on note existence
   - Character limit: 200 characters max

2. **Data Storage** (local-first + sync):
   - Create Zustand store: `exerciseNotesStore.ts`
   - Schema: `{ [exerciseId: string]: string }` per user
   - Persist to AsyncStorage with key `exerciseNotes.v1`
   - Prepare Supabase table schema (create migration file, don't run it)

3. **Behavior**:
   - Notes persist across workouts and app sessions
   - Notes are tied to exerciseId, not workout session
   - Empty notes should not be stored (clean up on save)
   - Debounce saves (500ms) to avoid excessive writes

4. **Integration**:
   - Display note preview (truncated) on exercise card when collapsed
   - Full note visible when expanded
   - Works in both live-workout and routine builder contexts
</requirements>

<implementation>
Follow existing patterns:
- Use `createQueuedJSONStorage()` for persistence (see other stores)
- Use design system tokens: `ds.tone.textMuted`, `ds.space.x2`, etc.
- Component should be self-contained: `ExerciseNoteInput.tsx`

Avoid:
- Don't modify core workout flow or session data
- Don't add notes to WorkoutSet or WorkoutSession types
- Don't auto-sync to Supabase yet (just prepare the schema)
</implementation>

<output>
Create/modify files:

1. `./src/lib/stores/exerciseNotesStore.ts` - Zustand store with persistence
2. `./src/ui/components/ExerciseNoteInput.tsx` - Note icon + expandable input
3. `./supabase/migrations/YYYYMMDD_exercise_notes.sql` - Supabase schema (date = today)
4. Integrate into existing exercise card component(s) in LiveWorkout folder
</output>

<verification>
Before completing:
- [ ] Note persists after app restart
- [ ] Note appears on same exercise in different workouts
- [ ] Empty notes are cleaned up
- [ ] Icon shows filled/empty state correctly
- [ ] No TypeScript errors
- [ ] Design system tokens used consistently
</verification>

<success_criteria>
- User can tap note icon on any exercise card
- Text input expands/collapses smoothly
- Notes persist across sessions via AsyncStorage
- Supabase migration file ready for future sync
- Follows existing codebase patterns
</success_criteria>

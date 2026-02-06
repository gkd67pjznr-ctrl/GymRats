<objective>
Perform a comprehensive code analysis of the CORE WORKOUT LOGGING feature - the most critical path in GymRats.

This is Part 1 of a systematic feature-by-feature codebase analysis. Focus on:
- Live workout session management
- Set logging and persistence
- Exercise selection and blocks
- Session state (currentSessionStore)

WHY: The workout logging flow is the heart of the app. Any performance issues, bugs, or anti-patterns here directly impact user experience during workouts.
</objective>

<context>
GymRats is a React Native workout tracking app built with:
- Expo 54, React Native 0.81 (New Architecture enabled)
- Zustand for state management with AsyncStorage persistence
- expo-router for navigation
- TypeScript 5.9 strict mode

Read CLAUDE.md first for project conventions and patterns.
</context>

<scope>
<files_to_analyze>
Primary files (READ ALL):
- `app/live-workout.tsx` - Core workout screen
- `src/lib/stores/currentSessionStore.ts` - Active session state
- `src/lib/hooks/useLiveWorkoutSession.ts` - Workout logic hook
- `src/lib/workoutModel.ts` - Core types

Supporting files:
- `src/ui/components/LiveWorkout/*.tsx` - All UI components
- `src/lib/hooks/useWorkoutTimer.ts` - Timer functionality
- `src/lib/validators/*.ts` - Input validation
</files_to_analyze>

<analysis_checklist>
For each file, analyze:

1. **Performance**
   - Unnecessary re-renders (missing useMemo/useCallback)
   - Heavy computations in render path
   - Memory leaks (uncleared timeouts, subscriptions)
   - Bundle size impact

2. **Best Practices** (validate with Context7)
   - React Native patterns (use mcp__context7__query-docs with /facebook/react-native)
   - Expo patterns (use mcp__context7__query-docs with /expo/expo)
   - Zustand patterns (use mcp__context7__query-docs with /pmndrs/zustand)
   - TypeScript strictness

3. **Integration Points**
   - Store hydration handling
   - Navigation state management
   - Persistence reliability
   - Error boundaries

4. **Testing Coverage**
   - Existing tests in `__tests__/`
   - Missing test cases
   - Edge cases not covered
</analysis_checklist>
</scope>

<process>
1. **Read CLAUDE.md** for project conventions
2. **Map the feature** - Create a dependency graph of all files involved
3. **Context7 validation** - Query docs for each major library pattern used
4. **Deep analysis** - Go through each file systematically
5. **Identify issues** - Categorize by severity (Critical/High/Medium/Low)
6. **Implement fixes** - Make all identified improvements
7. **Document gaps** - Note any integration issues with other features
</process>

<context7_queries>
Before analyzing, query Context7 for best practices:

1. Query: "React Native performance optimization memo useCallback"
   Library: /facebook/react-native

2. Query: "Zustand persist middleware async storage patterns"
   Library: /pmndrs/zustand

3. Query: "Expo router navigation state management"
   Library: /expo/expo
</context7_queries>

<output>
<analysis_report>
Create: `./docs/analyses/feature-analysis-core-workout.md`

Structure:
```markdown
# Core Workout Feature Analysis

## Summary
[Executive summary of findings]

## Files Analyzed
[List with line counts and complexity assessment]

## Issues Found

### Critical (Must Fix)
- [Issue]: [File:Line] - [Description] - [Fix Applied]

### High Priority
- ...

### Medium Priority
- ...

### Low Priority
- ...

## Performance Optimizations Applied
[List of changes made with before/after]

## Best Practices Updates
[Changes made to align with Context7 recommendations]

## Integration Gaps
[Issues that affect other features]

## Testing Recommendations
[New tests needed]

## Questions for User
[Any decisions that need user input]
```
</analysis_report>

<code_changes>
Make all identified improvements directly to the codebase.
For each change:
- Add a comment explaining why (if not obvious)
- Ensure TypeScript compiles without errors
- Run existing tests to verify no regressions
</code_changes>
</output>

<verification>
Before completing:
1. Run `npm run lint` - No new errors
2. Run `npm test` - All tests pass
3. Verify TypeScript: No type errors in modified files
4. Analysis document is comprehensive and actionable
</verification>

<success_criteria>
- All files in scope thoroughly analyzed
- Context7 queried for each major library
- All Critical and High priority issues fixed
- Analysis document created with clear findings
- No regressions introduced
- Integration gaps documented for next prompt
</success_criteria>

<next_prompt>
After completing, the next prompt will analyze: PR Detection & Scoring System
Document any dependencies or gaps that affect that feature.
</next_prompt>

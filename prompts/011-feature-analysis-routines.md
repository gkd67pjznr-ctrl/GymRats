<objective>
Perform a comprehensive code analysis of ROUTINES & WORKOUT PLANS - the planning layer.

This is Part 9 of a systematic feature-by-feature codebase analysis. Focus on:
- Routine builder/editor
- Pre-made workout plans
- Plan categories and navigation
- Routine-to-workout integration

WHY: Good planning features increase workout consistency. Users should be able to quickly start structured workouts.
</objective>

<context>
Read all previous analyses for integration context.

Routines vs Plans:
- Routines: User-created, custom exercises
- Plans: Pre-made, categorized (strength, hypertrophy, etc.)
</context>

<scope>
<files_to_analyze>
Routines:
- `app/routines/` - Routine screens
- Routine store/management
- Routine editor components

Plans:
- `app/workout/plans/` - Plan browsing
- `app/workout/plan-detail/` - Plan details
- `src/lib/premadePlans/` - Plan data

Integration:
- How routines start workouts
- Completion tracking
- Progress through plans
</files_to_analyze>

<analysis_checklist>
1. **Routine Builder**
   - CRUD operations
   - Exercise selection
   - Set/rep configuration
   - Persistence

2. **Plan System**
   - Category organization
   - Plan detail display
   - Starting a plan workout

3. **Integration**
   - Routine → Live workout
   - Completion tracking
   - Plan progress

4. **UX**
   - Navigation clarity
   - Quick start paths
   - Error handling
</analysis_checklist>
</scope>

<context7_queries>
1. Query: "React Native form handling validation"
   Library: /facebook/react-native

2. Query: "Zustand computed selectors derived state"
   Library: /pmndrs/zustand
</context7_queries>

<output>
<analysis_report>
Create: `./docs/analyses/feature-analysis-routines.md`

Include:
- Routine system architecture
- Plan catalog assessment
- Integration flow analysis
- UX recommendations
</analysis_report>

<code_changes>
- Fix routine CRUD issues
- Improve plan navigation
- Optimize integration
- Enhance error handling
</code_changes>
</output>

<verification>
1. Routines save/load correctly
2. Plans display properly
3. Starting workouts works
4. Progress tracks correctly
</verification>

<success_criteria>
- Routine system analyzed
- Plan system verified
- Integration working
- UX improved
</success_criteria>

<next_prompt>
After completing, the next prompt will analyze: Final Gap Analysis & Summary
</next_prompt>

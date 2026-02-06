<objective>
Implement a comprehensive CSV export and import system for workout data in GymRats.

This is a core feature that allows users to:
1. Export all their workout data as a CSV file (portable, timestamped, complete)
2. Import workout data from CSV files to populate their history

This feature is critical for user data ownership and portability - users should never feel trapped in the app.
</objective>

<existing_code_analysis>
IMPORTANT: Partial implementation already exists. You MUST analyze all existing code first, then refactor/rewrite to meet the standards in this prompt.

**Existing file to analyze:**
- `src/lib/migration/dataMigrator.ts` - Contains partial CSV import logic

**What exists (analyze thoroughly before proceeding):**
1. `importFromCSV()` function - basic CSV parsing for Strong/Hevy format
2. `parseCSVWorkouts()` helper - simple line-by-line parsing
3. `uploadWorkoutToCloud()` - uploads to Supabase
4. Local-to-cloud migration logic (separate feature, don't break)

**Known gaps in existing code:**
- NO CSV export functionality at all
- CSV import is basic - minimal validation, no fuzzy exercise matching
- No `isImported` flag implementation
- No UI for export/import
- Hardcoded to Strong/Hevy format only
- Basic error handling

**Your task:**
1. Read and analyze `src/lib/migration/dataMigrator.ts` completely
2. Decide what to keep, refactor, or rewrite
3. Implement missing functionality (especially export)
4. Bring everything up to the standards defined in this prompt
5. Preserve the local-to-cloud migration functionality (don't break it)
</existing_code_analysis>

<context>
Read CLAUDE.md for project conventions and patterns.

Key files to examine:
- `src/lib/migration/dataMigrator.ts` - EXISTING CODE - analyze first
- `src/lib/workoutModel.ts` - Core workout types (WorkoutSet, WorkoutSession)
- `src/lib/stores/workoutStore.ts` - Workout history storage
- `src/lib/stores/currentSessionStore.ts` - Current session patterns
- `src/data/exercises.ts` - Exercise definitions and IDs

Tech stack:
- React Native with Expo 54
- Zustand for state management
- AsyncStorage for persistence
- expo-document-picker for file selection
- expo-sharing or expo-file-system for export
</context>

<requirements>
<export_requirements>
1. Export ALL workout sessions and sets to CSV format
2. Include all relevant data fields:
   - Session: id, startedAtMs, endedAtMs, routineId, planId
   - Set: id, exerciseId, weightKg, reps, timestampMs
3. Use human-readable timestamps (ISO 8601) alongside epoch ms
4. Include exercise names (not just IDs) for portability
5. Single CSV file with denormalized data (one row per set)
6. Include header row with clear column names
7. Handle empty data gracefully
</export_requirements>

<import_requirements>
1. Parse CSV files with proper error handling
2. Validate data structure and types before import
3. Map exercise names back to exercise IDs (fuzzy matching for common variations)
4. Handle unknown exercises gracefully (skip with warning or create custom)
5. Create WorkoutSession records from imported data
6. Group sets into sessions based on timestamps or session identifiers
7. Provide clear feedback: success count, skipped rows, errors
</import_requirements>

<ranking_integration>
CRITICAL: Imported data must be flagged as "imported" and excluded from the ranking system.

1. Add an `isImported: boolean` field to WorkoutSession (or similar marker)
2. Imported sessions:
   - Appear in workout history for analytics
   - Do NOT trigger rank calculations
   - Do NOT contribute to GymRank scoring
   - Do NOT trigger PR detection
3. Only natively-logged workouts (where isImported is false/undefined) count for ranks
4. Update any ranking/scoring logic to filter out imported sessions
</ranking_integration>
</requirements>

<implementation>
<csv_format>
Design a clear, portable CSV structure:

```csv
session_id,session_start,session_start_ms,session_end,session_end_ms,set_id,exercise_id,exercise_name,weight_kg,reps,set_timestamp,set_timestamp_ms,routine_id,plan_id
abc123,2024-01-15T10:30:00Z,1705315800000,2024-01-15T11:45:00Z,1705320300000,set001,bench,Bench Press,80,8,2024-01-15T10:35:00Z,1705316100000,,
abc123,2024-01-15T10:30:00Z,1705315800000,2024-01-15T11:45:00Z,1705320300000,set002,bench,Bench Press,85,6,2024-01-15T10:40:00Z,1705316400000,,
```
</csv_format>

<file_structure>
Create these files:

1. `src/lib/csvExport.ts` - Export logic
   - Function to serialize workout data to CSV string
   - Function to trigger file download/share

2. `src/lib/csvImport.ts` - Import logic
   - CSV parsing with validation
   - Data transformation to WorkoutSession format
   - Exercise ID mapping/resolution
   - Import result reporting

3. `src/lib/csvSchema.ts` - Shared types and constants
   - CSV column definitions
   - Validation schemas
   - Exercise name normalization utilities

4. UI components for export/import in profile or settings area
</file_structure>

<patterns_to_follow>
- Use existing uid() function for generating IDs
- Follow existing Zustand store patterns
- Use TypeScript strict mode
- Handle kg storage (all weights stored in kg internally)
- Use ms timestamps with *Ms suffix convention
</patterns_to_follow>

<what_to_avoid>
- Don't modify existing WorkoutSet type if possible - add isImported at session level
- Don't create separate storage for imported data - use same workoutStore
- Don't require exact exercise ID matches - support fuzzy name matching
- Don't silently fail on import errors - provide clear feedback
</what_to_avoid>
</implementation>

<output>
**Refactor existing code and create new files as needed:**

Analyze and refactor:
- `./src/lib/migration/dataMigrator.ts` - Refactor CSV import logic, or extract to separate files if cleaner

Create new files:
- `./src/lib/csvSchema.ts` - CSV format definitions and types (if separate from dataMigrator)
- `./src/lib/csvExport.ts` - Export functionality (DOES NOT EXIST - must create)
- `./src/lib/csvImport.ts` - Import functionality with validation (may extract from dataMigrator)
- `./src/lib/stores/workoutStore.ts` - Update to support isImported flag
- `./app/profile/data-export.tsx` - UI screen for export/import (or integrate into existing profile)

Update ranking/scoring logic to exclude imported sessions:
- Check `./src/lib/GrScoring.ts`
- Check `./src/lib/perSetCue.ts` (PR detection)
- Check any other files that calculate ranks or PRs
</output>

<verification>
Before declaring complete, verify:

**Refactoring verification:**
1. Existing local-to-cloud migration in dataMigrator.ts still works (don't break it)
2. Code organization is clean - separate concerns between export/import/migration
3. No duplicate logic between old and new code

**Functional verification:**
4. Export produces valid CSV that can be opened in Excel/Google Sheets
5. Import correctly parses the exported CSV (round-trip test)
6. Imported sessions have isImported: true
7. Imported sessions appear in workout history
8. Imported sessions do NOT affect rank calculations (check GrScoring.ts integration)
9. Imported sessions do NOT trigger PR detection (check perSetCue.ts)
10. Error handling works for malformed CSV files
11. Exercise name mapping handles common variations (e.g., "Bench Press" → "bench")

**Test the edge cases:**
12. Empty workout history exports correctly
13. Import of empty/header-only CSV handled gracefully
14. Import of CSV with unknown exercises provides clear feedback
</verification>

<success_criteria>
1. Users can export all workout data with one tap
2. Exported CSV is human-readable and importable to other apps
3. Users can import CSV data from other apps or previous exports
4. Import provides clear success/error feedback
5. Imported data is clearly separated from native data for ranking purposes
6. Zero data loss on export → import round trip
7. Graceful handling of edge cases (empty data, unknown exercises, malformed files)
</success_criteria>

<objective>
Generate a comprehensive, human-editable master list of ALL exercises in the GymRats database as a markdown file.

This file becomes the **source of truth** for the exercise database. The founder will manually edit exercise names in this file to clean them up, and future syncs will pull from this file back into the codebase.

WHY this matters: The current exercise names are verbose and inconsistent (e.g., "Barbell Bench Press - Medium Grip" should just be "Bench Press"). This file enables manual curation of 1,590+ exercises.
</objective>

<context>
GymRats is a React Native fitness app with a large exercise database.

Key files to read:
- `src/data/exercises-raw.json` - The raw exercise data (1,590+ exercises)
- `src/data/exerciseDatabase.ts` - How exercises are processed
- `src/data/exerciseTypes.ts` - Type definitions for exercises

The exercise data structure includes:
- `id`: Unique identifier
- `name`: Exercise name (often verbose, needs cleanup)
- `primaryMuscles`: Array of muscle groups
- `secondaryMuscles`: Array of secondary muscles
- `equipment`: Equipment type (barbell, dumbbell, machine, etc.)
- `force`: push/pull/static
- `category`: strength/cardio/stretching/plyometrics
</context>

<requirements>
Create `./docs/data/EXERCISE-MASTER-LIST.md` with this exact structure:

1. **Header section** with:
   - Title: "GymRats Exercise Master List"
   - Last updated date
   - Total exercise count
   - Instructions for editing

2. **Exercises organized by PRIMARY MUSCLE GROUP** (alphabetically within groups):
   - Chest
   - Back (Lats, Middle Back, Lower Back grouped)
   - Shoulders
   - Arms (Biceps, Triceps, Forearms grouped)
   - Legs (Quadriceps, Hamstrings, Glutes, Calves grouped)
   - Core (Abdominals, Obliques)
   - Full Body / Compound
   - Cardio / Plyometrics
   - Other / Unclassified (for exercises without clear muscle mapping)

3. **For each exercise, create a table row with:**

| ID | Name | Primary | Secondary | BB | DB | M | KB | BW | CB | BD | Other |
|----|------|---------|-----------|----|----|---|----|----|----|----|-------|

Where equipment columns are:
- BB = Barbell (1 or 0)
- DB = Dumbbell (1 or 0)
- M = Machine (1 or 0)
- KB = Kettlebell (1 or 0)
- BW = Bodyweight (1 or 0)
- CB = Cable (1 or 0)
- BD = Band (1 or 0)
- Other = Any other equipment (1 or 0)

4. **Equipment mapping rules:**
   - "barbell", "ez bar", "trap bar", "olympic barbell" → BB=1
   - "dumbbell" → DB=1
   - "machine", "smith machine", "lever" → M=1
   - "kettlebell" → KB=1
   - "body only", "bodyweight", "body weight", "none" → BW=1
   - "cable" → CB=1
   - "band", "resistance band" → BD=1
   - Anything else → Other=1

5. **Sort order within each muscle group:** Alphabetical by exercise name

6. **For exercises with empty/missing primaryMuscles:**
   - Try to infer from name (e.g., "Chest Press" → Chest)
   - If truly unclassifiable (running, stretches, warmups) → "Other / Cardio / Plyometrics" section
</requirements>

<implementation>
1. Read `src/data/exercises-raw.json` completely
2. Parse all exercises and categorize by primary muscle
3. For each exercise, determine equipment flags
4. Generate markdown tables with proper formatting
5. Ensure the markdown is valid and renders correctly
6. Save to `./docs/data/EXERCISE-MASTER-LIST.md`
</implementation>

<example>
## Chest

| ID | Name | Primary | Secondary | BB | DB | M | KB | BW | CB | BD | Other |
|----|------|---------|-----------|----|----|---|----|----|----|----|-------|
| Barbell_Bench_Press_-_Medium_Grip | Barbell Bench Press - Medium Grip | chest | shoulders, triceps | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Dumbbell_Bench_Press | Dumbbell Bench Press | chest | shoulders, triceps | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| Push-ups | Push-ups | chest | shoulders, triceps | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
</example>

<output>
Save the complete exercise master list to: `./docs/data/EXERCISE-MASTER-LIST.md`

The file must include:
- ALL exercises (1,590+)
- Properly categorized by muscle group
- Equipment flags as 0/1 values
- Valid markdown table formatting
</output>

<verification>
Before completing:
1. Count exercises in output - should be ~1,590
2. Verify every muscle group section has a header
3. Confirm tables render correctly in markdown preview
4. Ensure no exercises are missing (compare count to source JSON)
5. Check that equipment flags make sense (bodyweight exercises have BW=1, etc.)
</verification>

<success_criteria>
- File created at `./docs/data/EXERCISE-MASTER-LIST.md`
- Contains ALL exercises from `exercises-raw.json`
- Organized by primary muscle group
- Each exercise has correct equipment flags
- Markdown tables are valid and render properly
- File can be used as source of truth for future exercise data
</success_criteria>

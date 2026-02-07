<objective>
Thoroughly analyze the exercise database to identify naming patterns, duplicates, and variants.

The goal is to understand how exercises are named so we can:
1. Identify true duplicates (same exercise, different wording)
2. Group exercises by common movement patterns
3. Create an organization strategy for the master list

This analysis will inform a cleanup effort to deduplicate and standardize 637 exercises.
</objective>

<data_sources>
Read and analyze: `src/data/exercises-raw.json` (637 exercises)
Reference: `docs/data/EXERCISE-MASTER-LIST.md` (organized by muscle group)
</data_sources>

<analysis_requirements>

## Part 1: Core Movement Pattern Analysis

Identify and count exercises containing these movement keywords:

**Pressing Movements:**
- press, bench press, chest press, shoulder press, overhead press, military press
- push-up, pushup, push up (variants)
- dip, dips

**Pulling Movements:**
- row, rows (bent over, cable, dumbbell, etc.)
- pull-up, pullup, pull up, chin-up, chinup
- pulldown, pull-down, pull down
- face pull

**Squatting/Leg Movements:**
- squat (back, front, goblet, hack, etc.)
- lunge, lunges
- leg press, leg extension, leg curl
- deadlift, rdl, romanian

**Arm Isolation:**
- curl, curls (bicep, hammer, preacher, etc.)
- tricep extension, pushdown, skull crusher
- kickback

**Shoulder Isolation:**
- raise (lateral, front, rear)
- fly, flye, flies
- shrug

**Core:**
- crunch, crunches
- sit-up, situp
- plank
- twist, rotation

For each keyword pattern, output:
- Total count of exercises containing that pattern
- List of exercise names (grouped)

## Part 2: Variant/Duplicate Detection

Find exercises that are likely the same movement with different names:

**Spelling Variants:**
- push-up vs pushup vs push up
- pull-up vs pullup vs chin-up vs chinup
- fly vs flye vs flies

**Word Order Variants:**
- "Dumbbell Bench Press" vs "Bench Press Dumbbell"
- "Incline Barbell Bench Press" vs "Barbell Incline Bench Press"

**Descriptor Variants:**
- Same exercise with/without grip descriptor (medium grip, wide grip)
- Same exercise with/without stance descriptor (narrow, wide)
- Same exercise with/without equipment descriptor

**Abbreviation Variants:**
- "DB Curl" vs "Dumbbell Curl"
- "BB Row" vs "Barbell Row"

For each variant group found:
- List all names that appear to be the same exercise
- Recommend which name should be the canonical one

## Part 3: Equipment + Movement Matrix

Create a matrix showing:
- How many exercises exist for each equipment × movement combination

Example format:
| Movement | Barbell | Dumbbell | Cable | Machine | Bodyweight |
|----------|---------|----------|-------|---------|------------|
| Press    | 15      | 22       | 8     | 12      | 6          |
| Curl     | 5       | 18       | 12    | 4       | 0          |
| ...      | ...     | ...      | ...   | ...     | ...        |

## Part 4: Organization Recommendations

Based on the analysis, propose:

1. **Primary Grouping Strategy** - How should exercises be organized?
   - By movement pattern (all presses together)?
   - By equipment (all dumbbell exercises)?
   - By muscle group (current approach)?
   - Hybrid approach?

2. **Canonical Naming Convention** - For each movement type, what should the standard name format be?
   - Example: `[Equipment] [Modifier] [Movement] [Variation]`
   - "Dumbbell Incline Bench Press Wide Grip"

3. **Deduplication Candidates** - List exercises that should be merged or deleted

4. **Naming Cleanup Priorities** - Rank which patterns need the most cleanup work

</analysis_requirements>

<output_format>
Save the complete analysis to: `./docs/data/EXERCISE-NAME-PATTERN-ANALYSIS.md`

Structure:
```markdown
# Exercise Name Pattern Analysis

## Executive Summary
- Total exercises: X
- Unique movement patterns identified: X
- Potential duplicates found: X
- Recommended deletions: X

## Part 1: Movement Pattern Counts
[Tables and lists for each category]

## Part 2: Duplicate/Variant Groups
[Groups of exercises that appear to be duplicates]

## Part 3: Equipment × Movement Matrix
[Matrix table]

## Part 4: Organization Recommendations
[Strategic recommendations]

## Appendix: Full Pattern Lists
[Complete lists for reference]
```
</output_format>

<verification>
Before completing:
1. All 637 exercises have been categorized
2. Movement pattern counts are accurate
3. Duplicate groups are clearly identified
4. Recommendations are actionable
5. Output file is properly formatted markdown
</verification>

<success_criteria>
- Comprehensive pattern analysis covering all major movement types
- Clear identification of duplicate/variant exercise names
- Actionable recommendations for organization and cleanup
- Analysis saved to specified output path
- Data-driven insights (counts, percentages) not just observations
</success_criteria>

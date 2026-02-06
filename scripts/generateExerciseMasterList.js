#!/usr/bin/env node
/**
 * Generate Exercise Master List
 *
 * Reads exercises-raw.json and generates a human-editable markdown file
 * organized by muscle group with equipment flags.
 */

const fs = require('fs');
const path = require('path');

// Read raw exercises
const exercisesPath = path.join(__dirname, '../src/data/exercises-raw.json');
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

console.log(`Loaded ${exercises.length} exercises`);

// Equipment mapping
function getEquipmentFlags(equipment) {
  const eq = (equipment || '').toLowerCase();
  return {
    BB: ['barbell', 'ez bar', 'trap bar', 'olympic barbell', 'ez barbell'].some(e => eq.includes(e)) ? 1 : 0,
    DB: eq.includes('dumbbell') ? 1 : 0,
    M: ['machine', 'smith machine', 'lever', 'assisted'].some(e => eq.includes(e)) ? 1 : 0,
    KB: eq.includes('kettlebell') ? 1 : 0,
    BW: ['body only', 'bodyweight', 'body weight', 'none'].some(e => eq.includes(e)) ? 1 : 0,
    CB: eq.includes('cable') ? 1 : 0,
    BD: ['band', 'resistance band'].some(e => eq.includes(e)) ? 1 : 0,
    Other: 0, // Will set if no other flags
  };
}

// Muscle group categorization
const muscleGroupCategories = {
  'Chest': ['chest', 'pectorals'],
  'Back': ['lats', 'middle back', 'lower back', 'back', 'latissimus'],
  'Shoulders': ['shoulders', 'deltoids', 'delts'],
  'Biceps': ['biceps'],
  'Triceps': ['triceps'],
  'Forearms': ['forearms'],
  'Quadriceps': ['quadriceps', 'quads'],
  'Hamstrings': ['hamstrings'],
  'Glutes': ['glutes', 'gluteal'],
  'Calves': ['calves'],
  'Abdominals': ['abdominals', 'abs', 'core', 'obliques'],
  'Traps': ['traps', 'trapezius'],
  'Neck': ['neck'],
  'Adductors': ['adductors'],
  'Abductors': ['abductors'],
};

// Determine primary category for an exercise
function getPrimaryCategory(exercise) {
  const primaryMuscles = (exercise.primaryMuscles || []).map(m => m.toLowerCase());
  const name = (exercise.name || '').toLowerCase();
  const category = (exercise.category || '').toLowerCase();

  // Check primary muscles first
  for (const [groupName, keywords] of Object.entries(muscleGroupCategories)) {
    for (const muscle of primaryMuscles) {
      if (keywords.some(k => muscle.includes(k))) {
        return groupName;
      }
    }
  }

  // Try to infer from name
  const nameInferences = {
    'Chest': ['bench', 'chest', 'push-up', 'pushup', 'fly', 'pec'],
    'Back': ['row', 'pull-up', 'pullup', 'lat ', 'pulldown', 'back'],
    'Shoulders': ['shoulder', 'press', 'lateral raise', 'delt', 'military'],
    'Biceps': ['bicep', 'curl'],
    'Triceps': ['tricep', 'pushdown', 'skull crusher', 'dip'],
    'Quadriceps': ['squat', 'leg press', 'lunge', 'leg extension', 'quad'],
    'Hamstrings': ['deadlift', 'rdl', 'leg curl', 'hamstring'],
    'Glutes': ['hip thrust', 'glute', 'kickback'],
    'Calves': ['calf', 'calves'],
    'Abdominals': ['crunch', 'sit-up', 'situp', 'plank', 'ab ', 'abs', 'core'],
  };

  for (const [groupName, keywords] of Object.entries(nameInferences)) {
    if (keywords.some(k => name.includes(k))) {
      return groupName;
    }
  }

  // Check category
  if (category === 'cardio') return 'Cardio';
  if (category === 'stretching') return 'Stretching';
  if (category === 'plyometrics') return 'Plyometrics';

  return 'Other';
}

// Group exercises by category
const grouped = {};
for (const ex of exercises) {
  const category = getPrimaryCategory(ex);
  if (!grouped[category]) {
    grouped[category] = [];
  }
  grouped[category].push(ex);
}

// Sort exercises within each group alphabetically
for (const category of Object.keys(grouped)) {
  grouped[category].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

// Define category order
const categoryOrder = [
  'Chest',
  'Back',
  'Shoulders',
  'Traps',
  'Biceps',
  'Triceps',
  'Forearms',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Adductors',
  'Abductors',
  'Abdominals',
  'Neck',
  'Cardio',
  'Plyometrics',
  'Stretching',
  'Other',
];

// Generate markdown
let markdown = `# GymRats Exercise Master List

> **Source of Truth** for the GymRats exercise database.
>
> **Last Updated:** ${new Date().toISOString().split('T')[0]}
> **Total Exercises:** ${exercises.length}

---

## How to Use This File

1. **Edit exercise names** directly in the "Name" column to clean them up
2. **Do NOT change IDs** - these link to the codebase
3. **Equipment flags**: 1 = uses this equipment, 0 = does not
4. After editing, a sync script will update the codebase

### Equipment Legend
| Code | Equipment |
|------|-----------|
| BB | Barbell (includes EZ bar, trap bar) |
| DB | Dumbbell |
| M | Machine (includes Smith machine, lever) |
| KB | Kettlebell |
| BW | Bodyweight |
| CB | Cable |
| BD | Band (resistance band) |
| Other | Other equipment |

---

`;

let totalCount = 0;

for (const category of categoryOrder) {
  const exercisesInCategory = grouped[category];
  if (!exercisesInCategory || exercisesInCategory.length === 0) continue;

  markdown += `## ${category}\n\n`;
  markdown += `*${exercisesInCategory.length} exercises*\n\n`;
  markdown += `| ID | Name | Primary | Secondary | BB | DB | M | KB | BW | CB | BD | Other |\n`;
  markdown += `|----|------|---------|-----------|----|----|---|----|----|----|----|-------|\n`;

  for (const ex of exercisesInCategory) {
    const flags = getEquipmentFlags(ex.equipment);

    // If no equipment flags are set, mark as Other
    const hasAnyFlag = Object.values(flags).some(v => v === 1);
    if (!hasAnyFlag) {
      flags.Other = 1;
    }

    const primary = (ex.primaryMuscles || []).join(', ') || '-';
    const secondary = (ex.secondaryMuscles || []).join(', ') || '-';

    // Escape pipe characters in names
    const safeName = (ex.name || '').replace(/\|/g, '\\|');
    const safeId = (ex.id || '').replace(/\|/g, '\\|');

    markdown += `| ${safeId} | ${safeName} | ${primary} | ${secondary} | ${flags.BB} | ${flags.DB} | ${flags.M} | ${flags.KB} | ${flags.BW} | ${flags.CB} | ${flags.BD} | ${flags.Other} |\n`;
    totalCount++;
  }

  markdown += `\n`;
}

// Summary at the end
markdown += `---

## Summary

| Category | Count |
|----------|-------|
`;

for (const category of categoryOrder) {
  const count = (grouped[category] || []).length;
  if (count > 0) {
    markdown += `| ${category} | ${count} |\n`;
  }
}

markdown += `| **Total** | **${totalCount}** |\n`;

// Write output
const outputDir = path.join(__dirname, '../docs/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'EXERCISE-MASTER-LIST.md');
fs.writeFileSync(outputPath, markdown);

console.log(`\nGenerated ${outputPath}`);
console.log(`Total exercises: ${totalCount}`);
console.log(`\nCategory breakdown:`);
for (const category of categoryOrder) {
  const count = (grouped[category] || []).length;
  if (count > 0) {
    console.log(`  ${category}: ${count}`);
  }
}

/**
 * Generate Exercise Database Master File
 * Creates a human-readable markdown file of all exercises
 */

const fs = require('fs');
const path = require('path');

const exercises = require('../src/data/exercises-raw.json');

// Equipment column mappings
const EQUIPMENT_COLS = ['barbell', 'dumbbell', 'machine', 'cable', 'bands', 'kettlebells', 'body only'];

// Normalize equipment for column matching
function getEquipmentFlags(equipment) {
  const eq = (equipment || '').toLowerCase();
  return EQUIPMENT_COLS.map(col => {
    if (col === 'body only' && (eq === 'body only' || eq === 'none' || eq === '')) return 1;
    if (eq.includes(col.replace('s', '')) || eq === col) return 1;
    return 0;
  });
}

// Group exercises by primary muscle
const byMuscle = {};
exercises.forEach(ex => {
  const primary = (ex.primaryMuscles[0] || 'other').toLowerCase();
  if (!byMuscle[primary]) byMuscle[primary] = [];
  byMuscle[primary].push(ex);
});

// Sort each group alphabetically by name
Object.keys(byMuscle).forEach(muscle => {
  byMuscle[muscle].sort((a, b) => a.name.localeCompare(b.name));
});

// Muscle group display order
const MUSCLE_ORDER = [
  'chest',
  'lats',
  'middle back',
  'lower back',
  'traps',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'adductors',
  'abductors',
  'abdominals',
  'neck',
  'other'
];

// Build markdown
let md = `# GymRats Exercise Database - Master File

**Source of Truth** for all exercises in the app.

**Total Exercises:** ${exercises.length}

**Last Generated:** ${new Date().toISOString().split('T')[0]}

---

## How to Use This File

1. **Review exercises** - Check names, muscles, equipment
2. **Edit names** - Clean up verbose/redundant naming
3. **Add/remove** - Mark exercises for addition or deletion
4. **Sync** - Run sync script to update \`exercises-raw.json\`

---

## Equipment Key

| Abbrev | Meaning |
|--------|---------|
| BB | Barbell |
| DB | Dumbbell |
| M | Machine |
| C | Cable |
| BN | Bands |
| KB | Kettlebells |
| BW | Body Only |

---

`;

// Process each muscle group
MUSCLE_ORDER.forEach(muscle => {
  const exercisesInGroup = byMuscle[muscle];
  if (!exercisesInGroup || exercisesInGroup.length === 0) return;

  const displayName = muscle.charAt(0).toUpperCase() + muscle.slice(1);

  md += `## ${displayName} (${exercisesInGroup.length})\n\n`;
  md += `| # | Exercise Name | Secondary | Equipment | BB | DB | M | C | BN | KB | BW |\n`;
  md += `|---|--------------|-----------|-----------|----|----|---|---|----|----|----|\n`;

  exercisesInGroup.forEach((ex, i) => {
    const secondary = ex.secondaryMuscles.slice(0, 2).join(', ') || '-';
    const equipFlags = getEquipmentFlags(ex.equipment);

    md += `| ${i + 1} | ${ex.name} | ${secondary} | ${ex.equipment || 'body only'} | ${equipFlags.join(' | ')} |\n`;
  });

  md += '\n---\n\n';
});

// Handle any muscles not in our order
Object.keys(byMuscle).forEach(muscle => {
  if (!MUSCLE_ORDER.includes(muscle)) {
    const exercisesInGroup = byMuscle[muscle];
    const displayName = muscle.charAt(0).toUpperCase() + muscle.slice(1);

    md += `## ${displayName} (${exercisesInGroup.length})\n\n`;
    md += `| # | Exercise Name | Secondary | Equipment | BB | DB | M | C | BN | KB | BW |\n`;
    md += `|---|--------------|-----------|-----------|----|----|---|---|----|----|----|\n`;

    exercisesInGroup.forEach((ex, i) => {
      const secondary = ex.secondaryMuscles.slice(0, 2).join(', ') || '-';
      const equipFlags = getEquipmentFlags(ex.equipment);

      md += `| ${i + 1} | ${ex.name} | ${secondary} | ${ex.equipment || 'body only'} | ${equipFlags.join(' | ')} |\n`;
    });

    md += '\n---\n\n';
  }
});

// Write output
const outputPath = path.join(__dirname, '../docs/data/EXERCISE-DATABASE-MASTER.md');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, md);

console.log(`✅ Generated ${outputPath}`);
console.log(`   Total exercises: ${exercises.length}`);
console.log(`   Muscle groups: ${Object.keys(byMuscle).length}`);

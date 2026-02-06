#!/usr/bin/env node
/**
 * Reorder Exercise Master List by Movement Pattern
 * Groups exercises by their primary movement (press, curl, row, etc.)
 * Then sorts by equipment within each group
 */

const fs = require('fs');
const path = require('path');

const exercises = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../src/data/exercises-raw.json'), 'utf8'
));

console.log(`Reordering ${exercises.length} exercises by movement pattern...\n`);

// Movement pattern definitions (order matters - more specific patterns first)
const movementPatterns = [
  // Chest Pressing
  { name: 'Bench Press', regex: /bench\s*press/i, category: 'Pressing' },
  { name: 'Chest Press', regex: /chest\s*press/i, category: 'Pressing' },
  { name: 'Floor Press', regex: /floor\s*press/i, category: 'Pressing' },
  { name: 'Push-Up', regex: /push[-\s]?up/i, category: 'Pressing' },
  { name: 'Dip', regex: /\bdips?\b/i, category: 'Pressing' },
  { name: 'Fly', regex: /\bfl(y|ye|ies)\b/i, category: 'Pressing' },
  { name: 'Pullover', regex: /pull[-\s]?over/i, category: 'Pressing' },

  // Shoulder Pressing
  { name: 'Shoulder Press', regex: /shoulder\s*press/i, category: 'Pressing' },
  { name: 'Overhead Press', regex: /overhead/i, category: 'Pressing' },
  { name: 'Military Press', regex: /military\s*press/i, category: 'Pressing' },
  { name: 'Arnold Press', regex: /arnold/i, category: 'Pressing' },
  { name: 'Landmine Press', regex: /landmine.*press|press.*landmine/i, category: 'Pressing' },
  { name: 'Press (Other)', regex: /\bpress\b/i, category: 'Pressing' },

  // Lateral/Raises
  { name: 'Lateral Raise', regex: /lateral/i, category: 'Shoulders' },
  { name: 'Front Raise', regex: /front\s*raise/i, category: 'Shoulders' },
  { name: 'Rear Delt', regex: /rear\s*delt|reverse\s*fl/i, category: 'Shoulders' },
  { name: 'Shrug', regex: /\bshrugs?\b/i, category: 'Shoulders' },
  { name: 'Upright Row', regex: /upright/i, category: 'Shoulders' },
  { name: 'Raise (Other)', regex: /\braise/i, category: 'Shoulders' },
  { name: 'Deltoid', regex: /deltoid|delt\b/i, category: 'Shoulders' },

  // Back - Rows
  { name: 'Row', regex: /\brows?\b/i, category: 'Back' },

  // Back - Vertical Pull
  { name: 'Pull-Up', regex: /pull[-\s]?ups?/i, category: 'Back' },
  { name: 'Chin-Up', regex: /chin[-\s]?ups?/i, category: 'Back' },
  { name: 'Lat Pulldown', regex: /pull[-\s]?down/i, category: 'Back' },
  { name: 'Face Pull', regex: /face\s*pull/i, category: 'Back' },
  { name: 'Pull (Other)', regex: /\bpull\b/i, category: 'Back' },
  { name: 'Back Extension', regex: /back\s*ext|hyper\s*ext|reverse\s*hyper/i, category: 'Back' },
  { name: 'Lat', regex: /\blat\b|\blats\b/i, category: 'Back' },

  // Biceps
  { name: 'Bicep Curl', regex: /bicep.*curl|curl.*bicep/i, category: 'Arms - Biceps' },
  { name: 'Hammer Curl', regex: /hammer/i, category: 'Arms - Biceps' },
  { name: 'Preacher Curl', regex: /preacher/i, category: 'Arms - Biceps' },
  { name: 'Concentration Curl', regex: /concentration/i, category: 'Arms - Biceps' },
  { name: 'Incline Curl', regex: /incline.*curl/i, category: 'Arms - Biceps' },
  { name: 'Cable Curl', regex: /cable.*curl/i, category: 'Arms - Biceps' },
  { name: 'Curl (Other)', regex: /\bcurls?\b/i, category: 'Arms - Biceps' },

  // Triceps
  { name: 'Tricep Extension', regex: /tricep|trice/i, category: 'Arms - Triceps' },
  { name: 'Skull Crusher', regex: /skull|crush/i, category: 'Arms - Triceps' },
  { name: 'Tricep Kickback', regex: /kick[-\s]?back/i, category: 'Arms - Triceps' },

  // Legs - Squatting
  { name: 'Squat', regex: /\bsquats?\b/i, category: 'Legs - Quad Dominant' },
  { name: 'Leg Press', regex: /leg\s*press/i, category: 'Legs - Quad Dominant' },
  { name: 'Leg Extension', regex: /leg\s*ext/i, category: 'Legs - Quad Dominant' },
  { name: 'Lunge', regex: /\blunges?\b/i, category: 'Legs - Quad Dominant' },
  { name: 'Step Up', regex: /step[-\s]?up/i, category: 'Legs - Quad Dominant' },
  { name: 'Hack', regex: /\bhack\b/i, category: 'Legs - Quad Dominant' },
  { name: 'Split', regex: /split\s*squat|bulgarian/i, category: 'Legs - Quad Dominant' },

  // Legs - Hip Hinge
  { name: 'Deadlift', regex: /dead[-\s]?lift/i, category: 'Legs - Hip Hinge' },
  { name: 'Romanian Deadlift', regex: /romanian|\brdl\b/i, category: 'Legs - Hip Hinge' },
  { name: 'Hip Thrust', regex: /hip\s*thrust/i, category: 'Legs - Hip Hinge' },
  { name: 'Glute Bridge', regex: /bridge/i, category: 'Legs - Hip Hinge' },
  { name: 'Good Morning', regex: /good\s*morning/i, category: 'Legs - Hip Hinge' },
  { name: 'Leg Curl', regex: /leg\s*curl|hamstring/i, category: 'Legs - Hip Hinge' },
  { name: 'Glute', regex: /\bglute/i, category: 'Legs - Hip Hinge' },
  { name: 'Hip', regex: /\bhip\b/i, category: 'Legs - Hip Hinge' },

  // Legs - Calves
  { name: 'Calf', regex: /\bcalf\b|\bcalves\b/i, category: 'Legs - Calves' },

  // Legs - Adductors/Abductors
  { name: 'Adductor', regex: /adduct/i, category: 'Legs - Adductors/Abductors' },
  { name: 'Abductor', regex: /abduct/i, category: 'Legs - Adductors/Abductors' },
  { name: 'Inner Thigh', regex: /inner\s*thigh/i, category: 'Legs - Adductors/Abductors' },

  // Core
  { name: 'Crunch', regex: /\bcrunche?s?\b/i, category: 'Core' },
  { name: 'Sit-Up', regex: /sit[-\s]?ups?/i, category: 'Core' },
  { name: 'Plank', regex: /\bplanks?\b/i, category: 'Core' },
  { name: 'Leg Raise', regex: /leg\s*raise|hanging.*raise|knee\s*raise/i, category: 'Core' },
  { name: 'Ab Wheel/Rollout', regex: /ab\s*wheel|roll[-\s]?out|ab\s*roller/i, category: 'Core' },
  { name: 'Twist/Rotation', regex: /\btwist|rotation|russian|woodchop/i, category: 'Core' },
  { name: 'Side Bend', regex: /side\s*bend/i, category: 'Core' },
  { name: 'Ab/Core', regex: /\babs?\b|abdom|core/i, category: 'Core' },
  { name: 'Oblique', regex: /oblique/i, category: 'Core' },
  { name: 'Bird Dog', regex: /bird\s*dog/i, category: 'Core' },
  { name: 'Dead Bug', regex: /dead\s*bug/i, category: 'Core' },
  { name: 'Hollow', regex: /\bhollow/i, category: 'Core' },
  { name: 'Superman', regex: /superman|superwoman|back\s*ext/i, category: 'Core' },
  { name: 'Body-Up', regex: /body[-\s]?ups?|butt[-\s]?ups?/i, category: 'Core' },
  { name: 'V-Up', regex: /v[-\s]?up|v[-\s]?sit/i, category: 'Core' },
  { name: 'Heel Touch', regex: /heel\s*touch/i, category: 'Core' },
  { name: 'Flutter Kick', regex: /flutter|scissor/i, category: 'Core' },
  { name: 'Pallof', regex: /pallof/i, category: 'Core' },

  // Olympic Lifts
  { name: 'Clean', regex: /\bcleans?\b/i, category: 'Olympic/Power' },
  { name: 'Snatch', regex: /\bsnatch/i, category: 'Olympic/Power' },
  { name: 'Jerk', regex: /\bjerk/i, category: 'Olympic/Power' },
  { name: 'Thruster', regex: /thruster/i, category: 'Olympic/Power' },
  { name: 'Power', regex: /power/i, category: 'Olympic/Power' },

  // Strongman
  { name: 'Farmers Walk', regex: /farmer|carry|walk/i, category: 'Strongman' },
  { name: 'Atlas', regex: /atlas/i, category: 'Strongman' },
  { name: 'Yoke', regex: /yoke/i, category: 'Strongman' },
  { name: 'Tire', regex: /tire|tyre/i, category: 'Strongman' },
  { name: 'Sled', regex: /sled|prowler/i, category: 'Strongman' },

  // Cardio/Plyometric
  { name: 'Jump', regex: /\bjumps?\b|box\s*jump|jumping|bound/i, category: 'Cardio/Plyometric' },
  { name: 'Burpee', regex: /burpee/i, category: 'Cardio/Plyometric' },
  { name: 'Mountain Climber', regex: /mountain|climber/i, category: 'Cardio/Plyometric' },
  { name: 'Sprint/Run', regex: /sprint|running|\brun\b/i, category: 'Cardio/Plyometric' },
  { name: 'Swing', regex: /\bswings?\b/i, category: 'Cardio/Plyometric' },
  { name: 'Bike', regex: /\bbike\b|cycling|bicycling/i, category: 'Cardio/Plyometric' },
  { name: 'Skip/Rope', regex: /skip|rope|jumping\s*jack/i, category: 'Cardio/Plyometric' },
  { name: 'Battle Ropes', regex: /battle|battling|ropes/i, category: 'Cardio/Plyometric' },
  { name: 'Ball Slam', regex: /slam|throw|toss/i, category: 'Cardio/Plyometric' },
  { name: 'Drag/Push', regex: /\bdrag\b|backward.*drag|forward.*drag/i, category: 'Cardio/Plyometric' },

  // Stretching/Mobility
  { name: 'Stretch', regex: /stretch/i, category: 'Stretching/Mobility' },
  { name: 'Foam Roll/SMR', regex: /foam|smr|roller|massage|blackroll/i, category: 'Stretching/Mobility' },
  { name: 'Mobility', regex: /mobil|warm[-\s]?up|activation/i, category: 'Stretching/Mobility' },
  { name: 'Yoga/Flexibility', regex: /yoga|pose|pigeon|downward|child|cobra|arabesque/i, category: 'Stretching/Mobility' },
  { name: 'Circle/Rotation', regex: /circle/i, category: 'Stretching/Mobility' },
  { name: 'Ankle', regex: /\bankle/i, category: 'Stretching/Mobility' },
  { name: 'Butterfly', regex: /butterfly/i, category: 'Stretching/Mobility' },
  { name: 'Thoracic', regex: /thoracic|t[-\s]?spine/i, category: 'Stretching/Mobility' },
  { name: 'Cat/Cow', regex: /cat|cow/i, category: 'Stretching/Mobility' },
  { name: 'World\'s Greatest', regex: /world.*greatest|spiderman/i, category: 'Stretching/Mobility' },
  { name: 'Knee', regex: /\bknee\b/i, category: 'Stretching/Mobility' },
  { name: 'Balance/Stability', regex: /balance|stability|stabiliz/i, category: 'Stretching/Mobility' },

  // Forearms
  { name: 'Wrist', regex: /\bwrist/i, category: 'Forearms' },
  { name: 'Forearm', regex: /\bforearm/i, category: 'Forearms' },
  { name: 'Grip', regex: /\bgrip\b/i, category: 'Forearms' },

  // Neck
  { name: 'Neck', regex: /\bneck/i, category: 'Neck' },

  // Catch-all categories based on equipment in name
  { name: 'Kettlebell', regex: /kettlebell|\bkb\b/i, category: 'Kettlebell Exercises' },
  { name: 'Cable', regex: /\bcable\b/i, category: 'Cable Exercises' },
  { name: 'Machine', regex: /\bmachine\b/i, category: 'Machine Exercises' },
  { name: 'Dumbbell', regex: /dumbbell|\bdb\b/i, category: 'Dumbbell Exercises' },
  { name: 'Barbell', regex: /barbell|\bbb\b/i, category: 'Barbell Exercises' },
  { name: 'Band', regex: /\bband\b|resistance/i, category: 'Band Exercises' },
  { name: 'TRX/Suspension', regex: /\btrx\b|suspension/i, category: 'TRX/Suspension' },
  { name: 'Medicine Ball', regex: /medicine|med\s*ball/i, category: 'Medicine Ball Exercises' },
  { name: 'Plate', regex: /\bplate\b/i, category: 'Plate Exercises' },
  { name: 'Lever/Pulley', regex: /\blever\b|\bpulley\b|jalón|jalón/i, category: 'Machine Exercises' },

  // Body part catch-alls
  { name: 'Chest', regex: /\bchest\b|pectoral|pec\b/i, category: 'Pressing' },
  { name: 'Back', regex: /\bback\b|dorsal/i, category: 'Back' },
  { name: 'Arm', regex: /\barm\b|\barms\b/i, category: 'Arms - Biceps' },
  { name: 'Leg', regex: /\bleg\b|\blegs\b|quadricep|quad\b/i, category: 'Legs - Quad Dominant' },
  { name: 'Shoulder', regex: /\bshoulder/i, category: 'Shoulders' },

  // Spanish exercise terms
  { name: 'Spanish - Press', regex: /supino|fondo|flexion/i, category: 'Pressing' },
  { name: 'Spanish - Curl', regex: /bíceps|biceps|curl/i, category: 'Arms - Biceps' },
  { name: 'Spanish - Row/Pull', regex: /remo|jalón|dominada/i, category: 'Back' },
  { name: 'Spanish - Squat', regex: /sentadilla|sentadillas/i, category: 'Legs - Quad Dominant' },
  { name: 'Spanish - Extension', regex: /extensión|extension|extensiones/i, category: 'Arms - Triceps' },

  // Misc exercises
  { name: 'Around The World', regex: /around.*world/i, category: 'Shoulders' },
  { name: 'Isometric Hold', regex: /\bhold\b|isometric|iso\b/i, category: 'Stretching/Mobility' },
  { name: 'Wall', regex: /\bwall\b/i, category: 'Stretching/Mobility' },
  { name: 'Seated/Lying', regex: /\bseated\b|\blying\b|\bprone\b|\bsupine\b/i, category: 'Stretching/Mobility' },
  { name: 'Standing', regex: /\bstanding\b/i, category: 'Stretching/Mobility' },
  { name: 'Bent Over', regex: /bent\s*over/i, category: 'Back' },
  { name: 'Side', regex: /\bside\b/i, category: 'Core' },
  { name: 'Reverse', regex: /\breverse\b/i, category: 'Back' },

  // Gymnastics/Calisthenics
  { name: 'Gymnastics', regex: /muscle\s*up|handstand|l[-\s]?sit|planche|dragon|frog|tuck|pike|flag/i, category: 'Calisthenics' },
  { name: 'Hang', regex: /hang|hanging|deadhang/i, category: 'Back' },

  // Cardio Machines
  { regex: /elliptical|stair\s*master|stairmaster|treadmill|step\s*mill|climb\s*mill|rowing/i, category: 'Cardio/Plyometric' },
  { regex: /jogging|cardio/i, category: 'Cardio/Plyometric' },

  // Strongman misc
  { name: 'Strongman Misc', regex: /keg|conan|circus|sandbag|log\s*lift/i, category: 'Strongman' },

  // More body movements
  { name: 'Toe/Foot', regex: /\btoe\b|\btoes\b|\bfoot\b|\bfeet\b/i, category: 'Stretching/Mobility' },
  { name: 'Head/Neck', regex: /\bhead\b|chin\s*tuck/i, category: 'Neck' },
  { name: 'Wiper', regex: /wiper|windmill|windshield/i, category: 'Core' },

  // Turkish Get-Up and misc
  { name: 'Turkish Get-Up', regex: /turkish|get[-\s]?up/i, category: 'Olympic/Power' },
  { name: 'Cross', regex: /\bcross\b|crucifix/i, category: 'Shoulders' },

  // Spanish/Italian/German catch-alls
  { name: 'Italian', regex: /impugnatura|trazioni|femorale/i, category: 'Back' },
  { name: 'Spanish Misc', regex: /estiramiento|patada|respiración|meditación/i, category: 'Stretching/Mobility' },
  { name: 'German', regex: /schwimmen/i, category: 'Cardio/Plyometric' },

  // Pull/Push variations
  { name: 'Rack', regex: /\brack\b/i, category: 'Olympic/Power' },
  { name: 'Pin', regex: /\bpin\b/i, category: 'Pressing' },
  { name: 'Inchworm', regex: /inchworm|spider|crawl/i, category: 'Cardio/Plyometric' },
  { name: 'Hops', regex: /\bhops?\b/i, category: 'Cardio/Plyometric' },
];

// Equipment priority for sorting within groups
const equipmentOrder = [
  'barbell', 'dumbbell', 'ez bar', 'kettlebell', 'cable', 'machine',
  'smith machine', 'body only', 'bodyweight', 'band', 'other'
];

function getEquipmentPriority(equipment) {
  const eq = (equipment || '').toLowerCase();
  for (let i = 0; i < equipmentOrder.length; i++) {
    if (eq.includes(equipmentOrder[i])) return i;
  }
  return equipmentOrder.length;
}

// Categorize each exercise
function categorizeExercise(exercise) {
  const name = exercise.name;

  for (const pattern of movementPatterns) {
    if (pattern.regex.test(name)) {
      return {
        movement: pattern.name,
        category: pattern.category,
      };
    }
  }

  return {
    movement: 'Other',
    category: 'Uncategorized',
  };
}

// Group exercises
const grouped = {};

for (const ex of exercises) {
  const { movement, category } = categorizeExercise(ex);

  if (!grouped[category]) {
    grouped[category] = {};
  }
  if (!grouped[category][movement]) {
    grouped[category][movement] = [];
  }

  grouped[category][movement].push(ex);
}

// Sort exercises within each movement group by equipment, then alphabetically
for (const category of Object.keys(grouped)) {
  for (const movement of Object.keys(grouped[category])) {
    grouped[category][movement].sort((a, b) => {
      const equipPriorityA = getEquipmentPriority(a.equipment);
      const equipPriorityB = getEquipmentPriority(b.equipment);

      if (equipPriorityA !== equipPriorityB) {
        return equipPriorityA - equipPriorityB;
      }

      return a.name.localeCompare(b.name);
    });
  }
}

// Category order for output
const categoryOrder = [
  'Pressing',
  'Shoulders',
  'Back',
  'Arms - Biceps',
  'Arms - Triceps',
  'Legs - Quad Dominant',
  'Legs - Hip Hinge',
  'Legs - Calves',
  'Legs - Adductors/Abductors',
  'Core',
  'Olympic/Power',
  'Strongman',
  'Cardio/Plyometric',
  'Forearms',
  'Neck',
  'Stretching/Mobility',
  'Kettlebell Exercises',
  'Cable Exercises',
  'Machine Exercises',
  'Dumbbell Exercises',
  'Barbell Exercises',
  'Band Exercises',
  'TRX/Suspension',
  'Medicine Ball Exercises',
  'Plate Exercises',
  'Calisthenics',
  'Uncategorized',
];

// Equipment flag function
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
    Other: 0,
  };
}

// Generate markdown
let markdown = `# GymRats Exercise Master List

> **Source of Truth** for the GymRats exercise database.
> **Organization:** Grouped by Movement Pattern
>
> **Last Updated:** ${new Date().toISOString().split('T')[0]}
> **Total Exercises:** ${exercises.length}

---

## How to Use This File

1. **Find exercises** by movement pattern (all presses together, all curls together, etc.)
2. **Edit exercise names** directly in the "Name" column to clean them up
3. **Do NOT change IDs** - these link to the codebase
4. **Equipment flags**: 1 = uses this equipment, 0 = does not

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

## Table of Contents

`;

// Build TOC
let totalCount = 0;
for (const category of categoryOrder) {
  if (!grouped[category]) continue;

  let categoryCount = 0;
  for (const movement of Object.keys(grouped[category])) {
    categoryCount += grouped[category][movement].length;
  }

  if (categoryCount > 0) {
    const anchor = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    markdown += `- [${category}](#${anchor}) (${categoryCount})\n`;
    totalCount += categoryCount;
  }
}

markdown += `\n**Total: ${totalCount} exercises**\n\n---\n\n`;

// Generate tables for each category
for (const category of categoryOrder) {
  if (!grouped[category]) continue;

  const movements = Object.keys(grouped[category]).sort();
  if (movements.length === 0) continue;

  let categoryCount = 0;
  for (const m of movements) {
    categoryCount += grouped[category][m].length;
  }

  markdown += `## ${category}\n\n`;
  markdown += `*${categoryCount} exercises*\n\n`;

  for (const movement of movements) {
    const exercisesInMovement = grouped[category][movement];
    if (exercisesInMovement.length === 0) continue;

    markdown += `### ${movement} (${exercisesInMovement.length})\n\n`;
    markdown += `| ID | Name | Primary | Secondary | BB | DB | M | KB | BW | CB | BD | Other |\n`;
    markdown += `|----|------|---------|-----------|----|----|---|----|----|----|----|-------|\n`;

    for (const ex of exercisesInMovement) {
      const flags = getEquipmentFlags(ex.equipment);
      const hasAnyFlag = Object.values(flags).some(v => v === 1);
      if (!hasAnyFlag) flags.Other = 1;

      const primary = (ex.primaryMuscles || []).join(', ') || '-';
      const secondary = (ex.secondaryMuscles || []).join(', ') || '-';
      const safeName = (ex.name || '').replace(/\|/g, '\\|');
      const safeId = (ex.id || '').replace(/\|/g, '\\|');

      markdown += `| ${safeId} | ${safeName} | ${primary} | ${secondary} | ${flags.BB} | ${flags.DB} | ${flags.M} | ${flags.KB} | ${flags.BW} | ${flags.CB} | ${flags.BD} | ${flags.Other} |\n`;
    }

    markdown += `\n`;
  }

  markdown += `---\n\n`;
}

// Summary
markdown += `## Summary by Movement\n\n`;
markdown += `| Category | Movement | Count |\n`;
markdown += `|----------|----------|-------|\n`;

for (const category of categoryOrder) {
  if (!grouped[category]) continue;

  const movements = Object.keys(grouped[category]).sort();
  for (const movement of movements) {
    const count = grouped[category][movement].length;
    if (count > 0) {
      markdown += `| ${category} | ${movement} | ${count} |\n`;
    }
  }
}

markdown += `| **Total** | | **${totalCount}** |\n`;

// Write output
const outputPath = path.join(__dirname, '../docs/data/EXERCISE-MASTER-LIST.md');
fs.writeFileSync(outputPath, markdown);

console.log(`Reordering complete!`);
console.log(`Output saved to: ${outputPath}`);
console.log(`\nCategory breakdown:`);

for (const category of categoryOrder) {
  if (!grouped[category]) continue;

  let count = 0;
  for (const m of Object.keys(grouped[category])) {
    count += grouped[category][m].length;
  }

  if (count > 0) {
    console.log(`  ${category}: ${count}`);
  }
}

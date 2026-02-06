#!/usr/bin/env node
/**
 * Generate Exercise Image Prompts
 *
 * Creates:
 * 1. Style guide for exercise icons
 * 2. CSV with AI image generation prompts for each exercise
 * 3. Priority list for image generation order
 */

const fs = require('fs');
const path = require('path');

// Read raw exercises
const exercisesPath = path.join(__dirname, '../src/data/exercises-raw.json');
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

console.log(`Processing ${exercises.length} exercises for image prompts`);

// Output directory
const outputDir = path.join(__dirname, '../docs/assets');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ============================================
// PART 1: Style Guide
// ============================================

const styleGuide = `# GymRats Exercise Icon Style Guide

> Visual style specification for exercise illustration icons.
>
> **Last Updated:** ${new Date().toISOString().split('T')[0]}
> **Target:** ${exercises.length} exercises

---

## Chosen Style: Minimal Silhouette with Accent

### Rationale

After considering multiple options, **Minimal Silhouette with Accent** is the optimal choice because:

1. **Scalability**: Works at all sizes (24px to 256px)
2. **Consistency**: Easy to maintain uniform style across 1,500+ icons
3. **Recognizability**: Clear body positions are instantly recognizable
4. **App Aesthetic**: Matches GymRats' dark, minimalist "pure" design
5. **Generation Reliability**: AI models produce consistent silhouettes
6. **Accessibility**: High contrast works for colorblind users

---

## Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Transparent | N/A | All icons |
| Primary Silhouette | Dark Gray | #1A1A1A | Human figure |
| Secondary Silhouette | Medium Gray | #404040 | Equipment, weights |
| Accent Highlight | Lime (Toxic) | #AAFF00 | Active muscle group or motion line |
| Alt Accent | Cyan (Ice) | #00FFFF | Alternative theme |
| Alt Accent | Purple (Electric) | #9D4EDD | Alternative theme |
| Alt Accent | Pink (Ember) | #FF4081 | Alternative theme |

---

## Size Requirements

| Use Case | Size | Notes |
|----------|------|-------|
| Exercise List (small) | 48x48px | Must be recognizable |
| Exercise Card | 64x64px | Standard detail |
| Exercise Detail | 128x128px | Full detail |
| Marketing | 256x256px | High resolution |

All icons should be designed at 256x256 and scaled down.

---

## Master Prompt Template

### For Midjourney / DALL-E / Stable Diffusion:

\`\`\`
[STYLE PREFIX]
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A),

[EXERCISE DESCRIPTION]
{person performing [EXERCISE NAME], [KEY BODY POSITION], [EQUIPMENT IF ANY]},

[STYLE SUFFIX]
lime green accent line showing movement direction, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition

[NEGATIVE PROMPT]
--no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

### Template Variables:

- \`[EXERCISE NAME]\`: Name of exercise (e.g., "barbell bench press")
- \`[KEY BODY POSITION]\`: Main pose (e.g., "lying on bench, arms extended upward")
- \`[EQUIPMENT IF ANY]\`: Equipment shown (e.g., "holding barbell") or "bodyweight only"

---

## Example Prompts (Top 10 Exercises)

### 1. Bench Press
\`\`\`
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing barbell bench press, lying on flat bench with back arched, arms extended upward holding barbell, lime green accent line showing upward pressing motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

### 2. Back Squat
\`\`\`
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing barbell back squat, standing with barbell across upper back, knees bent in squat position, thighs parallel to ground, lime green accent line showing upward movement from squat, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

### 3. Deadlift
\`\`\`
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing barbell deadlift, bent over with flat back, arms straight gripping barbell at floor level, lime green accent line showing vertical pull motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

### 4. Overhead Press
\`\`\`
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing standing military press, arms extended overhead holding barbell, standing upright, lime green accent line showing upward pressing motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

### 5. Barbell Row
\`\`\`
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing bent over barbell row, torso bent forward at 45 degrees, pulling barbell toward lower chest, lime green accent line showing pulling motion toward body, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

### 6. Pull-Up
\`\`\`
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing pull-up, hanging from bar with arms wide, chin above bar level, lime green accent line showing upward pulling motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

### 7. Dumbbell Curl
\`\`\`
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing standing dumbbell bicep curl, one arm curling dumbbell upward with elbow fixed at side, lime green accent line showing curling motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

### 8. Tricep Pushdown
\`\`\`
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing cable tricep pushdown, standing upright, arms pressing cable attachment downward with elbows fixed, lime green accent line showing downward pressing motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

### 9. Leg Press
\`\`\`
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing seated leg press on machine, back against pad, legs pressing platform away at 45 degree angle, lime green accent line showing pushing motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

### 10. Plank
\`\`\`
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing plank hold, body in straight line from head to heels, supported on forearms and toes, lime green accent line along spine showing body alignment, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
\`\`\`

---

## Tips for Consistency

1. **Always show the exercise at peak contraction** or the most recognizable position
2. **Include equipment** when it defines the exercise (barbell vs dumbbell)
3. **Side view** works best for most exercises (shows body position clearly)
4. **Front view** for exercises like front raises, lateral raises
5. **Keep poses generic** - no specific body types
6. **Accent line** should follow the direction of force or movement
7. **Generate in batches** by muscle group for consistency

---

## Generation Workflow

1. **Export prompts** from \`exercise-image-prompts.csv\`
2. **Generate in batches** of 20-50 (by muscle group)
3. **Review for consistency** - regenerate outliers
4. **Export at 256x256** PNG with transparency
5. **Name files** as \`{exercise_id}.png\`
6. **Store in** \`assets/exercise-icons/\`

---

## Accessibility Notes

- High contrast (dark silhouette on transparent/light) meets WCAG 2.1 AA
- Accent colors chosen to be distinguishable by colorblind users
- Motion lines help convey movement without relying on color alone
`;

fs.writeFileSync(path.join(outputDir, 'EXERCISE-ICON-STYLE-GUIDE.md'), styleGuide);
console.log('Created: EXERCISE-ICON-STYLE-GUIDE.md');

// ============================================
// PART 2: Exercise Prompts CSV
// ============================================

// Body position descriptions by exercise type keywords
const bodyPositionMap = {
  // Pressing movements
  'bench press': 'lying on flat bench, arms pressing barbell/dumbbells upward',
  'incline press': 'lying on inclined bench at 30-45 degrees, arms pressing upward',
  'decline press': 'lying on declined bench, arms pressing upward',
  'overhead press': 'standing upright, arms pressing weight overhead',
  'military press': 'standing upright, arms pressing barbell overhead',
  'shoulder press': 'seated or standing, arms pressing weight overhead',
  'push-up': 'prone position, body straight, arms pushing body up from floor',
  'pushup': 'prone position, body straight, arms pushing body up from floor',
  'dip': 'suspended between parallel bars, arms pressing body upward',

  // Pulling movements
  'pull-up': 'hanging from bar, pulling chin above bar',
  'pullup': 'hanging from bar, pulling chin above bar',
  'chin-up': 'hanging from bar with underhand grip, pulling chin above bar',
  'pulldown': 'seated at cable machine, pulling bar down to chest',
  'row': 'torso bent forward, pulling weight toward body',
  'bent over row': 'torso bent at 45 degrees, pulling weight toward lower chest',
  'cable row': 'seated at cable station, pulling handle toward torso',
  'face pull': 'standing at cable, pulling rope toward face',

  // Squatting movements
  'squat': 'standing with weight, lowering into squat with thighs parallel',
  'front squat': 'barbell at front shoulders, squatting down',
  'goblet squat': 'holding weight at chest, squatting down',
  'leg press': 'seated in machine, legs pressing platform away',
  'hack squat': 'back against pad, squatting down on angled machine',
  'lunge': 'one leg forward in lunge position, rear knee near floor',
  'split squat': 'one leg forward, rear leg elevated, lowering body',

  // Hip hinge movements
  'deadlift': 'bent over with flat back, gripping barbell at floor',
  'rdl': 'standing, hinging at hips with slight knee bend, lowering weight',
  'romanian deadlift': 'standing, hinging at hips, lowering weight along legs',
  'hip thrust': 'back on bench, hips thrusting barbell upward',
  'glute bridge': 'lying on back, hips raised, glutes contracted',
  'good morning': 'standing with bar on back, hinging forward at hips',

  // Arm movements
  'curl': 'standing or seated, arm curling weight toward shoulder',
  'bicep curl': 'standing, arms curling dumbbells toward shoulders',
  'hammer curl': 'standing, arms curling with neutral grip',
  'preacher curl': 'arms on preacher bench, curling weight up',
  'tricep extension': 'arms overhead, extending weight behind head',
  'tricep pushdown': 'standing at cable, pushing handle downward',
  'skull crusher': 'lying on bench, lowering weight toward forehead, extending arms',
  'kickback': 'bent over, extending arm backward',

  // Shoulder movements
  'lateral raise': 'standing, arms raising dumbbells out to sides',
  'front raise': 'standing, arms raising weight in front of body',
  'rear delt': 'bent over, arms raising weights out to sides',
  'shrug': 'standing, shoulders shrugging upward',
  'upright row': 'standing, pulling weight up along body to chin',

  // Core movements
  'crunch': 'lying on back, curling shoulders toward knees',
  'sit-up': 'lying on back, sitting up fully',
  'plank': 'prone position, body straight, supported on forearms and toes',
  'leg raise': 'lying or hanging, raising legs upward',
  'russian twist': 'seated, torso twisting side to side',
  'ab wheel': 'kneeling, rolling wheel forward, body extending',
  'hanging': 'hanging from bar',

  // Leg isolation
  'leg extension': 'seated in machine, extending legs outward',
  'leg curl': 'lying or seated, curling legs toward body',
  'calf raise': 'standing on edge, raising heels upward',
  'hip abduction': 'standing or seated, leg moving outward',
  'hip adduction': 'standing or seated, leg moving inward',

  // Cardio/Plyometric
  'jump': 'explosive jumping motion',
  'burpee': 'full body movement from standing to plank to jump',
  'box jump': 'jumping onto elevated platform',
  'mountain climber': 'plank position, alternating knee drives',
  'run': 'running stride motion',
  'sprint': 'explosive running stride',

  // Default
  'default': 'performing exercise with proper form',
};

// Equipment descriptions
const equipmentDescriptions = {
  'barbell': 'holding barbell',
  'dumbbell': 'holding dumbbells',
  'kettlebell': 'holding kettlebell',
  'cable': 'at cable machine',
  'machine': 'using exercise machine',
  'band': 'using resistance band',
  'body only': 'bodyweight only',
  'bodyweight': 'bodyweight only',
  'body weight': 'bodyweight only',
  'none': 'bodyweight only',
};

function getBodyPosition(exerciseName) {
  const lowerName = exerciseName.toLowerCase();

  for (const [keyword, position] of Object.entries(bodyPositionMap)) {
    if (lowerName.includes(keyword)) {
      return position;
    }
  }

  return bodyPositionMap['default'];
}

function getEquipmentDescription(equipment) {
  const lowerEquip = (equipment || '').toLowerCase();

  for (const [keyword, desc] of Object.entries(equipmentDescriptions)) {
    if (lowerEquip.includes(keyword)) {
      return desc;
    }
  }

  return lowerEquip ? `using ${lowerEquip}` : 'bodyweight only';
}

function generatePrompt(exercise) {
  const name = exercise.name || '';
  const bodyPosition = getBodyPosition(name);
  const equipmentDesc = getEquipmentDescription(exercise.equipment);

  const prompt = `minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing ${name.toLowerCase()}, ${bodyPosition}, ${equipmentDesc}, lime green accent line showing movement direction, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic`;

  return prompt;
}

// Generate CSV
const csvHeader = 'exercise_id,exercise_name,equipment_in_image,body_position_description,image_prompt\n';
let csvContent = csvHeader;

for (const ex of exercises) {
  const id = (ex.id || '').replace(/,/g, ' '); // Remove commas
  const name = (ex.name || '').replace(/,/g, ' ').replace(/"/g, '""'); // Escape for CSV
  const equipment = (ex.equipment || '').toLowerCase();
  const hasEquipment = !['body only', 'bodyweight', 'body weight', 'none', ''].includes(equipment) ? 'yes' : 'no';
  const bodyPosition = getBodyPosition(ex.name).replace(/,/g, ';').replace(/"/g, '""');
  const prompt = generatePrompt(ex).replace(/"/g, '""');

  csvContent += `"${id}","${name}","${hasEquipment}","${bodyPosition}","${prompt}"\n`;
}

fs.writeFileSync(path.join(outputDir, 'exercise-image-prompts.csv'), csvContent);
console.log('Created: exercise-image-prompts.csv');

// ============================================
// PART 3: Priority List
// ============================================

// Popular exercises (P0)
const p0Keywords = [
  'bench press', 'squat', 'deadlift', 'overhead press', 'military press',
  'barbell row', 'pull-up', 'pullup', 'chin-up', 'dip',
  'bicep curl', 'tricep', 'lat pulldown', 'cable row', 'leg press',
  'romanian deadlift', 'rdl', 'hip thrust', 'plank', 'crunch',
  'lunge', 'shoulder press', 'lateral raise', 'face pull', 'shrug',
  'calf raise', 'leg extension', 'leg curl', 'incline press', 'decline press',
  'hammer curl', 'preacher curl', 'skull crusher', 'cable fly', 'dumbbell fly',
  'front squat', 'goblet squat', 'hack squat', 'good morning', 'hyperextension',
  'push-up', 'pushup', 'cable crossover', 'chest press', 'seated row',
];

// Important exercises (P1)
const p1Keywords = [
  'extension', 'curl', 'raise', 'press', 'row', 'fly', 'pull',
  'squat', 'lunge', 'thrust', 'bridge', 'kick', 'step',
  'crunch', 'twist', 'rotation', 'hold', 'hang',
  'machine', 'cable', 'dumbbell', 'barbell', 'kettlebell',
];

function getPriority(exercise) {
  const lowerName = (exercise.name || '').toLowerCase();

  // Check P0
  for (const keyword of p0Keywords) {
    if (lowerName.includes(keyword)) {
      return 'P0';
    }
  }

  // Check P1
  for (const keyword of p1Keywords) {
    if (lowerName.includes(keyword)) {
      return 'P1';
    }
  }

  return 'P2';
}

// Group exercises by priority
const priorityGroups = { P0: [], P1: [], P2: [] };
for (const ex of exercises) {
  const priority = getPriority(ex);
  priorityGroups[priority].push(ex);
}

// Sort each group alphabetically
for (const priority of Object.keys(priorityGroups)) {
  priorityGroups[priority].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

const priorityList = `# Exercise Image Priority List

> Prioritized list for exercise icon generation.
>
> **Last Updated:** ${new Date().toISOString().split('T')[0]}
> **Total Exercises:** ${exercises.length}

---

## Priority Breakdown

| Priority | Count | Description |
|----------|-------|-------------|
| **P0 - Critical** | ${priorityGroups.P0.length} | Most common exercises, generate first |
| **P1 - Important** | ${priorityGroups.P1.length} | Popular exercises, generate second |
| **P2 - Nice to Have** | ${priorityGroups.P2.length} | Less common, generate last |

---

## P0 - Critical (${priorityGroups.P0.length} exercises)

Generate these first. These are the most commonly used exercises.

| # | ID | Name |
|---|----|----- |
${priorityGroups.P0.map((ex, i) => `| ${i + 1} | ${ex.id} | ${ex.name} |`).join('\n')}

---

## P1 - Important (${priorityGroups.P1.length} exercises)

Generate after P0. Popular exercises that users will encounter.

| # | ID | Name |
|---|----|----- |
${priorityGroups.P1.map((ex, i) => `| ${i + 1} | ${ex.id} | ${ex.name} |`).join('\n')}

---

## P2 - Nice to Have (${priorityGroups.P2.length} exercises)

Generate last. Less common exercises, stretches, and obscure movements.

| # | ID | Name |
|---|----|----- |
${priorityGroups.P2.map((ex, i) => `| ${i + 1} | ${ex.id} | ${ex.name} |`).join('\n')}

---

## Quick Start Commands

To generate P0 icons first, extract them from the CSV:

\`\`\`bash
# Extract P0 exercises from CSV
head -1 exercise-image-prompts.csv > p0-prompts.csv
grep -E "(bench press|squat|deadlift|pull-up|pullup)" exercise-image-prompts.csv >> p0-prompts.csv
\`\`\`

Or use the exercise IDs listed above with your image generation workflow.
`;

fs.writeFileSync(path.join(outputDir, 'EXERCISE-IMAGE-PRIORITY.md'), priorityList);
console.log('Created: EXERCISE-IMAGE-PRIORITY.md');

// Summary
console.log(`\n=== Summary ===`);
console.log(`Total exercises: ${exercises.length}`);
console.log(`P0 (Critical): ${priorityGroups.P0.length}`);
console.log(`P1 (Important): ${priorityGroups.P1.length}`);
console.log(`P2 (Nice to Have): ${priorityGroups.P2.length}`);
console.log(`\nFiles created in ${outputDir}:`);
console.log('  - EXERCISE-ICON-STYLE-GUIDE.md');
console.log('  - exercise-image-prompts.csv');
console.log('  - EXERCISE-IMAGE-PRIORITY.md');

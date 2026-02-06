#!/usr/bin/env node
/**
 * Exercise Name Pattern Analysis
 * Analyzes naming patterns, duplicates, and variants in the exercise database
 */

const fs = require('fs');
const path = require('path');

const exercises = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../src/data/exercises-raw.json'), 'utf8'
));

console.log(`Analyzing ${exercises.length} exercises...\n`);

// ============================================
// PART 1: Movement Pattern Analysis
// ============================================

const movementPatterns = {
  // Pressing
  'bench press': { regex: /bench\s*press/i, exercises: [] },
  'chest press': { regex: /chest\s*press/i, exercises: [] },
  'shoulder press': { regex: /shoulder\s*press/i, exercises: [] },
  'overhead press': { regex: /overhead\s*press/i, exercises: [] },
  'military press': { regex: /military\s*press/i, exercises: [] },
  'push-up/pushup': { regex: /push[-\s]?up/i, exercises: [] },
  'dip': { regex: /\bdips?\b/i, exercises: [] },
  'press (general)': { regex: /\bpress\b/i, exercises: [] },

  // Pulling
  'row': { regex: /\brows?\b/i, exercises: [] },
  'pull-up/pullup': { regex: /pull[-\s]?ups?/i, exercises: [] },
  'chin-up/chinup': { regex: /chin[-\s]?ups?/i, exercises: [] },
  'pulldown': { regex: /pull[-\s]?down/i, exercises: [] },
  'face pull': { regex: /face\s*pull/i, exercises: [] },

  // Squatting/Legs
  'squat': { regex: /\bsquats?\b/i, exercises: [] },
  'lunge': { regex: /\blunges?\b/i, exercises: [] },
  'leg press': { regex: /leg\s*press/i, exercises: [] },
  'leg extension': { regex: /leg\s*extension/i, exercises: [] },
  'leg curl': { regex: /leg\s*curl/i, exercises: [] },
  'deadlift': { regex: /dead\s*lift/i, exercises: [] },
  'rdl/romanian': { regex: /\brdl\b|romanian/i, exercises: [] },
  'hip thrust': { regex: /hip\s*thrust/i, exercises: [] },
  'calf raise': { regex: /calf\s*raise/i, exercises: [] },

  // Arms
  'curl': { regex: /\bcurls?\b/i, exercises: [] },
  'bicep curl': { regex: /bicep.*curl|curl.*bicep/i, exercises: [] },
  'hammer curl': { regex: /hammer.*curl/i, exercises: [] },
  'preacher curl': { regex: /preacher.*curl/i, exercises: [] },
  'tricep extension': { regex: /tricep.*extension/i, exercises: [] },
  'tricep pushdown': { regex: /tricep.*push\s*down|push\s*down.*tricep/i, exercises: [] },
  'skull crusher': { regex: /skull\s*crush/i, exercises: [] },
  'kickback': { regex: /kick\s*back/i, exercises: [] },

  // Shoulders
  'lateral raise': { regex: /lateral\s*raise/i, exercises: [] },
  'front raise': { regex: /front\s*raise/i, exercises: [] },
  'rear delt': { regex: /rear\s*delt/i, exercises: [] },
  'fly/flye': { regex: /\bfl(y|ye|ies)\b/i, exercises: [] },
  'shrug': { regex: /\bshrugs?\b/i, exercises: [] },

  // Core
  'crunch': { regex: /\bcrunche?s?\b/i, exercises: [] },
  'sit-up/situp': { regex: /sit[-\s]?ups?/i, exercises: [] },
  'plank': { regex: /\bplanks?\b/i, exercises: [] },
  'twist/rotation': { regex: /\btwist|rotation\b/i, exercises: [] },
  'ab/abs': { regex: /\babs?\b/i, exercises: [] },

  // Other
  'stretch': { regex: /\bstretch/i, exercises: [] },
  'rollout': { regex: /roll[-\s]?out/i, exercises: [] },
  'swing': { regex: /\bswings?\b/i, exercises: [] },
  'clean': { regex: /\bcleans?\b/i, exercises: [] },
  'snatch': { regex: /\bsnatch/i, exercises: [] },
};

// Categorize each exercise
for (const ex of exercises) {
  const name = ex.name;
  for (const [pattern, data] of Object.entries(movementPatterns)) {
    if (data.regex.test(name)) {
      data.exercises.push({ id: ex.id, name: ex.name });
    }
  }
}

// ============================================
// PART 2: Variant/Duplicate Detection
// ============================================

// Normalize name for comparison
function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .split(' ')
    .sort()
    .join(' ');
}

// Group by normalized name
const normalizedGroups = {};
for (const ex of exercises) {
  const norm = normalize(ex.name);
  if (!normalizedGroups[norm]) {
    normalizedGroups[norm] = [];
  }
  normalizedGroups[norm].push({ id: ex.id, name: ex.name });
}

// Find groups with multiple entries (potential duplicates)
const duplicateGroups = Object.entries(normalizedGroups)
  .filter(([_, group]) => group.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

// Spelling variant detection
const spellingVariants = {
  'push-up variants': exercises.filter(e => /push[-\s]?up/i.test(e.name)).map(e => e.name),
  'pull-up variants': exercises.filter(e => /pull[-\s]?up|chin[-\s]?up/i.test(e.name)).map(e => e.name),
  'fly/flye variants': exercises.filter(e => /\bfl(y|ye|ies)\b/i.test(e.name)).map(e => e.name),
  'sit-up variants': exercises.filter(e => /sit[-\s]?up/i.test(e.name)).map(e => e.name),
};

// ============================================
// PART 3: Equipment × Movement Matrix
// ============================================

const equipmentKeywords = {
  'Barbell': /\bbarbell\b|\bbb\b/i,
  'Dumbbell': /\bdumbbell\b|\bdb\b/i,
  'Cable': /\bcable\b/i,
  'Machine': /\bmachine\b|\blever\b|\bsmith\b/i,
  'Kettlebell': /\bkettlebell\b|\bkb\b/i,
  'Bodyweight': /\bbody\s*(weight|only)\b|\bbodyweight\b/i,
  'Band': /\bband\b|\bresistance\b/i,
  'EZ Bar': /\bez\s*bar\b/i,
};

const movementKeywords = {
  'Press': /\bpress\b/i,
  'Row': /\brows?\b/i,
  'Curl': /\bcurls?\b/i,
  'Squat': /\bsquats?\b/i,
  'Deadlift': /\bdead\s*lift\b/i,
  'Fly': /\bfl(y|ye|ies)\b/i,
  'Raise': /\braise\b/i,
  'Extension': /\bextension\b/i,
  'Pull': /\bpull\b/i,
  'Crunch': /\bcrunche?s?\b/i,
  'Lunge': /\blunges?\b/i,
};

const matrix = {};
for (const movement of Object.keys(movementKeywords)) {
  matrix[movement] = {};
  for (const equipment of Object.keys(equipmentKeywords)) {
    matrix[movement][equipment] = 0;
  }
}

for (const ex of exercises) {
  const name = ex.name;
  const equip = ex.equipment || '';

  for (const [movement, mRegex] of Object.entries(movementKeywords)) {
    if (mRegex.test(name)) {
      for (const [equipment, eRegex] of Object.entries(equipmentKeywords)) {
        if (eRegex.test(name) || eRegex.test(equip)) {
          matrix[movement][equipment]++;
        }
      }
    }
  }
}

// ============================================
// PART 4: Generate Report
// ============================================

let report = `# Exercise Name Pattern Analysis

> **Generated:** ${new Date().toISOString().split('T')[0]}
> **Total Exercises:** ${exercises.length}

---

## Executive Summary

- **Total exercises:** ${exercises.length}
- **Unique movement patterns identified:** ${Object.keys(movementPatterns).length}
- **Potential duplicate groups:** ${duplicateGroups.length}
- **Exercises in duplicate groups:** ${duplicateGroups.reduce((sum, [_, g]) => sum + g.length, 0)}

---

## Part 1: Movement Pattern Counts

### Top Movement Patterns (by count)

| Pattern | Count | % of Total |
|---------|-------|------------|
`;

// Sort patterns by count
const sortedPatterns = Object.entries(movementPatterns)
  .map(([name, data]) => ({ name, count: data.exercises.length }))
  .sort((a, b) => b.count - a.count);

for (const { name, count } of sortedPatterns) {
  if (count > 0) {
    const pct = ((count / exercises.length) * 100).toFixed(1);
    report += `| ${name} | ${count} | ${pct}% |\n`;
  }
}

report += `\n### Detailed Pattern Breakdown\n\n`;

// Group patterns by category
const categories = {
  'Pressing Movements': ['bench press', 'chest press', 'shoulder press', 'overhead press', 'military press', 'push-up/pushup', 'dip', 'press (general)'],
  'Pulling Movements': ['row', 'pull-up/pullup', 'chin-up/chinup', 'pulldown', 'face pull'],
  'Leg Movements': ['squat', 'lunge', 'leg press', 'leg extension', 'leg curl', 'deadlift', 'rdl/romanian', 'hip thrust', 'calf raise'],
  'Arm Movements': ['curl', 'bicep curl', 'hammer curl', 'preacher curl', 'tricep extension', 'tricep pushdown', 'skull crusher', 'kickback'],
  'Shoulder Movements': ['lateral raise', 'front raise', 'rear delt', 'fly/flye', 'shrug'],
  'Core Movements': ['crunch', 'sit-up/situp', 'plank', 'twist/rotation', 'ab/abs'],
  'Other': ['stretch', 'rollout', 'swing', 'clean', 'snatch'],
};

for (const [category, patterns] of Object.entries(categories)) {
  report += `#### ${category}\n\n`;
  for (const pattern of patterns) {
    const data = movementPatterns[pattern];
    if (data && data.exercises.length > 0) {
      report += `**${pattern}** (${data.exercises.length})\n`;
      // Show first 5 examples
      const examples = data.exercises.slice(0, 5).map(e => e.name);
      report += `> Examples: ${examples.join(', ')}${data.exercises.length > 5 ? '...' : ''}\n\n`;
    }
  }
}

report += `---

## Part 2: Duplicate/Variant Groups

### Potential Duplicates (same words, different order)

Found **${duplicateGroups.length}** groups of exercises that may be duplicates.

`;

// Show top 30 duplicate groups
const topDuplicates = duplicateGroups.slice(0, 30);
for (const [normalized, group] of topDuplicates) {
  report += `#### Group: "${normalized.substring(0, 50)}${normalized.length > 50 ? '...' : ''}" (${group.length} variants)\n`;
  for (const ex of group) {
    report += `- ${ex.name}\n`;
  }
  report += `\n`;
}

if (duplicateGroups.length > 30) {
  report += `\n*...and ${duplicateGroups.length - 30} more duplicate groups*\n\n`;
}

report += `### Spelling Variants\n\n`;

for (const [variant, names] of Object.entries(spellingVariants)) {
  const unique = [...new Set(names)];
  report += `**${variant}** (${unique.length} unique names)\n`;
  unique.slice(0, 10).forEach(n => report += `- ${n}\n`);
  if (unique.length > 10) report += `- ...and ${unique.length - 10} more\n`;
  report += `\n`;
}

report += `---

## Part 3: Equipment × Movement Matrix

| Movement | Barbell | Dumbbell | Cable | Machine | Kettlebell | Bodyweight | Band | EZ Bar |
|----------|---------|----------|-------|---------|------------|------------|------|--------|
`;

for (const [movement, equipCounts] of Object.entries(matrix)) {
  const row = [
    movement,
    equipCounts['Barbell'],
    equipCounts['Dumbbell'],
    equipCounts['Cable'],
    equipCounts['Machine'],
    equipCounts['Kettlebell'],
    equipCounts['Bodyweight'],
    equipCounts['Band'],
    equipCounts['EZ Bar'],
  ];
  report += `| ${row.join(' | ')} |\n`;
}

report += `
---

## Part 4: Organization Recommendations

### Primary Grouping Strategy

**Recommended: Hybrid Approach**

1. **Primary sort: Movement Pattern** (press, curl, row, squat, etc.)
2. **Secondary sort: Equipment** (barbell, dumbbell, cable, etc.)
3. **Tertiary sort: Variation** (incline, decline, wide grip, etc.)

This groups similar exercises together, making duplicates obvious.

### Canonical Naming Convention

**Format:** \`[Equipment] [Modifier] [Movement] [Variation]\`

Examples:
- ✅ \`Barbell Incline Bench Press\`
- ✅ \`Dumbbell Hammer Curl\`
- ✅ \`Cable Tricep Pushdown\`
- ❌ \`Incline Barbell Bench Press\` (equipment should come first)
- ❌ \`Hammer Curl Dumbbell\` (movement should come before variation)

### Deduplication Priorities

Based on the analysis, focus cleanup on:

1. **Press variants** (${movementPatterns['press (general)'].exercises.length} exercises) - highest volume
2. **Curl variants** (${movementPatterns['curl'].exercises.length} exercises) - many duplicates
3. **Row variants** (${movementPatterns['row'].exercises.length} exercises)
4. **Raise variants** (${movementPatterns['lateral raise'].exercises.length + movementPatterns['front raise'].exercises.length} exercises)
5. **Push-up spelling** (${movementPatterns['push-up/pushup'].exercises.length} exercises) - normalize to "Push-Up"

### Specific Cleanup Actions

1. **Standardize spelling:**
   - "Push-Up" (not pushup, push up)
   - "Pull-Up" (not pullup, pull up)
   - "Fly" (not flye, flies)
   - "Sit-Up" (not situp, sit up)

2. **Remove redundant descriptors:**
   - "- Medium Grip" (remove unless Wide/Narrow variant exists)
   - "- NB" (unclear abbreviation)

3. **Expand abbreviations:**
   - "DB" → "Dumbbell"
   - "BB" → "Barbell"

4. **Merge duplicates:**
   - Keep the most descriptive/clear name
   - Add other names to legacyIds

---

## Appendix: Full Duplicate Groups

`;

// List all duplicate groups
for (let i = 0; i < duplicateGroups.length; i++) {
  const [normalized, group] = duplicateGroups[i];
  report += `${i + 1}. ${group.map(e => e.name).join(' | ')}\n`;
}

// Write report
const outputPath = path.join(__dirname, '../docs/data/EXERCISE-NAME-PATTERN-ANALYSIS.md');
fs.writeFileSync(outputPath, report);

console.log(`Analysis complete!`);
console.log(`Report saved to: ${outputPath}`);
console.log(`\nSummary:`);
console.log(`- Total exercises: ${exercises.length}`);
console.log(`- Potential duplicate groups: ${duplicateGroups.length}`);
console.log(`- Top patterns: ${sortedPatterns.slice(0, 5).map(p => `${p.name}(${p.count})`).join(', ')}`);

#!/usr/bin/env node

/**
 * Exercise Icon Prompt Refinement Script
 *
 * Reads exercise-prompts.csv and applies the master template consistently,
 * adds negative prompts, and outputs refined-prompts.csv ready for batch generation.
 *
 * Usage: node scripts/art/refine-exercise-prompts.js [--priority P0|P1|P2|ALL]
 *
 * Output: docs/art/generation/refined-prompts.csv
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  inputFile: path.join(__dirname, '../../docs/art/generation/exercise-prompts.csv'),
  outputFile: path.join(__dirname, '../../docs/art/generation/refined-prompts.csv'),
  priorityFile: path.join(__dirname, '../../docs/art/generation/exercise-priorities.json'),

  // Master style template based on EXERCISE-ICON-STYLE-GUIDE.md
  stylePrefix: 'minimalist exercise icon, single human silhouette in solid light gray (#F2F4FF)',
  styleSuffix: 'lime green (#A6FF00) accent line showing movement direction, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition, side view preferred',

  // Negative prompt for consistent exclusion
  negativePrompt: 'text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic, watermark, signature, face features, facial details, eyes, nose, mouth, fingers details, photo, photograph, realistic',

  // API-specific parameters
  apiParams: {
    stabilityAI: {
      aspect_ratio: '1:1',
      output_format: 'png',
      style_preset: 'digital-art'
    },
    replicate: {
      width: 512,
      height: 512,
      num_outputs: 1
    },
    falai: {
      image_size: 'square',
      num_inference_steps: 28,
      guidance_scale: 3.5
    }
  }
};

// Priority 0 (P0) exercises - Top ~50 most common, generate first for testing
// Strict exact matches only (normalized to lowercase with underscores)
const P0_EXACT_MATCHES = new Set([
  // The Big 5 compounds (exact IDs/names)
  'barbell_bench_press', 'bench_press', 'flat_bench_press', 'flat_barbell_bench_press',
  'squat', 'back_squat', 'barbell_squat', 'barbell_back_squat',
  'deadlift', 'conventional_deadlift', 'barbell_deadlift',
  'barbell_row', 'bent_over_row', 'bent_over_barbell_row', 'pendlay_row',
  'overhead_press', 'military_press', 'standing_military_press', 'barbell_shoulder_press',

  // Major compound movements
  'incline_bench_press', 'incline_barbell_press', 'incline_dumbbell_press',
  'decline_bench_press', 'decline_barbell_press',
  'pull_up', 'pullup', 'wide_grip_pull_up', 'pull_ups',
  'chin_up', 'chinup', 'chin_ups',
  'dip', 'dips', 'parallel_bar_dip', 'chest_dip', 'tricep_dip',
  'lat_pulldown', 'wide_grip_lat_pulldown', 'close_grip_lat_pulldown',
  'leg_press', 'seated_leg_press',
  'romanian_deadlift', 'rdl', 'stiff_leg_deadlift',
  'front_squat', 'goblet_squat',
  'sumo_deadlift', 'trap_bar_deadlift',

  // Core accessories
  'bicep_curl', 'barbell_curl', 'dumbbell_curl', 'hammer_curl', 'preacher_curl',
  'tricep_pushdown', 'tricep_extension', 'skull_crusher', 'overhead_tricep_extension',
  'lateral_raise', 'dumbbell_lateral_raise', 'side_lateral_raise',
  'front_raise', 'dumbbell_front_raise',
  'rear_delt_fly', 'reverse_fly',
  'face_pull',
  'seated_cable_row', 'cable_row', 'seated_row',
  'leg_curl', 'lying_leg_curl', 'seated_leg_curl',
  'leg_extension',
  'calf_raise', 'standing_calf_raise', 'seated_calf_raise',
  'hip_thrust', 'barbell_hip_thrust',

  // Bodyweight basics
  'push_up', 'pushup', 'push_ups',
  'plank', 'forearm_plank',
  'lunge', 'walking_lunge', 'forward_lunge', 'reverse_lunge',
  'crunch', 'sit_up', 'situp',
  'mountain_climber', 'burpee'
]);

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    priority: 'ALL', // P0, P1, P2, or ALL
    dryRun: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--priority' && args[i + 1]) {
      options.priority = args[i + 1].toUpperCase();
      i++;
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      options.verbose = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Exercise Icon Prompt Refinement Script

Usage: node refine-exercise-prompts.js [options]

Options:
  --priority <P0|P1|P2|ALL>  Filter by priority (default: ALL)
  --dry-run                   Show what would be done without writing
  --verbose, -v               Show detailed output
  --help, -h                  Show this help message

Priority Levels:
  P0: Top 50 most common exercises (generate first for testing)
  P1: Next 223 common exercises (273 total for MVP)
  P2: Remaining 1317 exercises (full coverage)
  ALL: All 1590 exercises
      `);
      process.exit(0);
    }
  }

  return options;
}

// Parse CSV file
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      rows.push(row);
    }
  }

  return rows;
}

// Parse a single CSV line (handles quoted fields)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Determine priority level for an exercise
function getPriority(exerciseId, exerciseName) {
  // Normalize for comparison - lowercase, spaces/dashes to underscores
  const normalizedId = exerciseId.toLowerCase().replace(/[-\s]+/g, '_').replace(/_+/g, '_');
  const normalizedName = exerciseName.toLowerCase().replace(/[-\s]+/g, '_').replace(/_+/g, '_');

  // P0: Exact matches only for the top ~50 core exercises
  if (P0_EXACT_MATCHES.has(normalizedId) || P0_EXACT_MATCHES.has(normalizedName)) {
    return 'P0';
  }

  // P1: Common exercises (keywords indicating standard gym movements)
  const p1Keywords = [
    'bench_press', 'shoulder_press', 'chest_press',
    'curl', 'row', 'raise', 'extension', 'fly', 'flye',
    'pulldown', 'pushdown', 'pullup', 'chinup',
    'squat', 'deadlift', 'lunge', 'press',
    'kickback', 'shrug', 'crunch', 'plank'
  ];

  const hasP1Keyword = p1Keywords.some(keyword =>
    normalizedName.includes(keyword) || normalizedId.includes(keyword)
  );

  if (hasP1Keyword) return 'P1';

  // P1 also includes exercises with standard equipment
  const p1Equipment = ['dumbbell', 'barbell', 'cable', 'machine', 'kettlebell'];
  const hasP1Equipment = p1Equipment.some(eq =>
    normalizedName.includes(eq) || normalizedId.includes(eq)
  );

  if (hasP1Equipment) return 'P1';

  // Everything else is P2
  return 'P2';
}

// Refine a single prompt
function refinePrompt(row) {
  const { exercise_id, exercise_name, equipment_in_image, body_position_description } = row;

  // Build the refined prompt
  const exerciseAction = exercise_name.toLowerCase();
  const bodyPosition = body_position_description || 'performing exercise with proper form';
  const equipment = equipment_in_image === 'yes' ?
    extractEquipment(exercise_name, row.image_prompt) : 'bodyweight only';

  // Construct refined prompt following master template
  const refinedPrompt = [
    CONFIG.stylePrefix,
    `person performing ${exerciseAction}`,
    bodyPosition,
    equipment !== 'bodyweight only' ? `with ${equipment}` : equipment,
    CONFIG.styleSuffix
  ].join(', ');

  return {
    exercise_id,
    exercise_name,
    priority: getPriority(exercise_id, exercise_name),
    positive_prompt: refinedPrompt,
    negative_prompt: CONFIG.negativePrompt,
    original_prompt: row.image_prompt,
    api_params_stability: JSON.stringify(CONFIG.apiParams.stabilityAI),
    api_params_replicate: JSON.stringify(CONFIG.apiParams.replicate),
    api_params_falai: JSON.stringify(CONFIG.apiParams.falai)
  };
}

// Extract equipment type from exercise name or prompt
function extractEquipment(exerciseName, originalPrompt) {
  const name = exerciseName.toLowerCase();
  const prompt = (originalPrompt || '').toLowerCase();

  if (name.includes('barbell') || prompt.includes('barbell')) return 'barbell';
  if (name.includes('dumbbell') || prompt.includes('dumbbell')) return 'dumbbells';
  if (name.includes('kettlebell') || prompt.includes('kettlebell')) return 'kettlebell';
  if (name.includes('cable') || prompt.includes('cable machine')) return 'cable machine';
  if (name.includes('machine') || prompt.includes('exercise machine')) return 'exercise machine';
  if (name.includes('band') || prompt.includes('resistance band')) return 'resistance band';
  if (name.includes('ez bar') || name.includes('ez-bar')) return 'EZ bar';
  if (name.includes('smith')) return 'Smith machine';
  if (name.includes('trap bar') || name.includes('hex bar')) return 'trap bar';
  if (name.includes('pull-up') || name.includes('pullup') || name.includes('chin-up')) return 'pull-up bar';
  if (name.includes('bench')) return 'weight bench';

  return 'gym equipment';
}

// Generate CSV output
function generateCSV(refinedPrompts) {
  const headers = [
    'exercise_id',
    'exercise_name',
    'priority',
    'positive_prompt',
    'negative_prompt',
    'original_prompt',
    'api_params_stability',
    'api_params_replicate',
    'api_params_falai'
  ];

  const lines = [headers.join(',')];

  for (const prompt of refinedPrompts) {
    const values = headers.map(h => {
      const value = prompt[h] || '';
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

// Main execution
async function main() {
  const options = parseArgs();

  console.log('========================================');
  console.log('Exercise Icon Prompt Refinement');
  console.log('========================================\n');

  // Read input file
  console.log(`Reading: ${CONFIG.inputFile}`);
  if (!fs.existsSync(CONFIG.inputFile)) {
    console.error(`Error: Input file not found: ${CONFIG.inputFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(CONFIG.inputFile, 'utf-8');
  const rows = parseCSV(content);
  console.log(`Found ${rows.length} exercises\n`);

  // Refine prompts
  console.log('Refining prompts...');
  const refinedPrompts = rows.map(refinePrompt);

  // Count by priority
  const counts = { P0: 0, P1: 0, P2: 0 };
  refinedPrompts.forEach(p => counts[p.priority]++);

  console.log(`\nPriority Distribution:`);
  console.log(`  P0 (Core): ${counts.P0} exercises`);
  console.log(`  P1 (Common): ${counts.P1} exercises`);
  console.log(`  P2 (Extended): ${counts.P2} exercises`);
  console.log(`  Total: ${refinedPrompts.length} exercises\n`);

  // Filter by priority if specified
  let filtered = refinedPrompts;
  if (options.priority !== 'ALL') {
    const priorities = [];
    if (options.priority.includes('P0')) priorities.push('P0');
    if (options.priority.includes('P1')) priorities.push('P0', 'P1');
    if (options.priority.includes('P2')) priorities.push('P0', 'P1', 'P2');
    if (options.priority === 'P0') {
      filtered = refinedPrompts.filter(p => p.priority === 'P0');
    } else if (options.priority === 'P1') {
      filtered = refinedPrompts.filter(p => ['P0', 'P1'].includes(p.priority));
    }
    console.log(`Filtered to ${filtered.length} exercises (priority: ${options.priority})\n`);
  }

  // Sort by priority
  const priorityOrder = { P0: 0, P1: 1, P2: 2 };
  filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Verbose output
  if (options.verbose) {
    console.log('Sample P0 exercises:');
    filtered.filter(p => p.priority === 'P0').slice(0, 5).forEach(p => {
      console.log(`  - ${p.exercise_name} (${p.exercise_id})`);
    });
    console.log('');
  }

  // Generate output
  const csv = generateCSV(filtered);

  if (options.dryRun) {
    console.log('DRY RUN - Would write to:', CONFIG.outputFile);
    console.log(`Output would contain ${filtered.length} refined prompts`);
    console.log('\nSample refined prompt:');
    console.log(JSON.stringify(filtered[0], null, 2));
  } else {
    fs.writeFileSync(CONFIG.outputFile, csv, 'utf-8');
    console.log(`Written: ${CONFIG.outputFile}`);
    console.log(`Total: ${filtered.length} refined prompts\n`);

    // Also save priorities as JSON for other scripts
    const priorities = {};
    refinedPrompts.forEach(p => {
      priorities[p.exercise_id] = p.priority;
    });
    fs.writeFileSync(CONFIG.priorityFile, JSON.stringify(priorities, null, 2), 'utf-8');
    console.log(`Written: ${CONFIG.priorityFile}`);
  }

  console.log('\n========================================');
  console.log('Refinement Complete');
  console.log('========================================');
  console.log(`\nNext step: node scripts/art/generate-icons.js --test`);
}

main().catch(console.error);

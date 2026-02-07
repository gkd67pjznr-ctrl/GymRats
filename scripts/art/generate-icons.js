#!/usr/bin/env node

/**
 * Exercise Icon Batch Generation Script
 *
 * Generates exercise icons from refined prompts using various AI image APIs.
 * Supports multiple providers: Stability AI, Replicate, fal.ai, and local DiffuGen.
 *
 * Usage:
 *   node scripts/art/generate-icons.js --test           # Generate 10 test icons
 *   node scripts/art/generate-icons.js --priority P0    # Generate P0 icons (273)
 *   node scripts/art/generate-icons.js --all            # Generate all icons
 *   node scripts/art/generate-icons.js --resume         # Resume from last checkpoint
 *
 * Environment Variables:
 *   STABILITY_AI_API_KEY  - Stability AI API key
 *   REPLICATE_API_TOKEN   - Replicate API token
 *   FAL_KEY               - fal.ai API key
 *
 * Output: scripts/art/output/icons/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  inputFile: path.join(__dirname, '../../docs/art/generation/refined-prompts.csv'),
  outputDir: path.join(__dirname, 'output/icons'),
  progressFile: path.join(__dirname, 'output/generation-progress.json'),
  errorLog: path.join(__dirname, 'output/generation-errors.log'),

  // Generation settings
  imageSize: 512, // 512x512 for quality, scaled down later
  maxRetries: 3,
  retryDelayMs: 5000,
  rateLimitDelayMs: 1000,
  concurrentRequests: 3,

  // Provider configuration
  providers: {
    stabilityAI: {
      endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      costPerImage: 0.035,
      headers: (apiKey) => ({
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*'
      })
    },
    replicate: {
      endpoint: 'https://api.replicate.com/v1/predictions',
      model: 'black-forest-labs/flux-schnell',
      costPerImage: 0.003,
      headers: (apiKey) => ({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      })
    },
    falai: {
      endpoint: 'https://fal.run/fal-ai/flux/schnell',
      costPerImage: 0.003,
      headers: (apiKey) => ({
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      })
    }
  },

  // Test exercises (top 10 for validation)
  testExercises: [
    'Barbell_Bench_Press_-_Medium_Grip',
    'Squat',
    'Deadlift',
    'Overhead_Press',
    'Barbell_Row',
    'Pull_Up',
    'Dumbbell_Curl',
    'Tricep_Pushdown',
    'Leg_Press',
    'Plank'
  ]
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: 'test', // test, priority, all, resume, single
    priority: 'P0',
    provider: 'stabilityAI',
    exerciseId: null,
    dryRun: false,
    verbose: false,
    limit: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--test') {
      options.mode = 'test';
      options.limit = 10;
    } else if (arg === '--priority' && args[i + 1]) {
      options.mode = 'priority';
      options.priority = args[i + 1].toUpperCase();
      i++;
    } else if (arg === '--all') {
      options.mode = 'all';
    } else if (arg === '--resume') {
      options.mode = 'resume';
    } else if (arg === '--single' && args[i + 1]) {
      options.mode = 'single';
      options.exerciseId = args[i + 1];
      i++;
    } else if (arg === '--provider' && args[i + 1]) {
      options.provider = args[i + 1];
      i++;
    } else if (arg === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Exercise Icon Batch Generation Script

Usage: node generate-icons.js [options]

Modes:
  --test                    Generate 10 test icons for validation
  --priority <P0|P1|P2>     Generate icons by priority level
  --all                     Generate all icons
  --resume                  Resume from last checkpoint
  --single <exercise_id>    Generate a single icon

Options:
  --provider <name>         API provider: stabilityAI, replicate, falai (default: stabilityAI)
  --limit <n>               Maximum number of icons to generate
  --dry-run                 Show what would be done without generating
  --verbose, -v             Show detailed output
  --help, -h                Show this help message

Environment Variables (required):
  STABILITY_AI_API_KEY      For Stability AI
  REPLICATE_API_TOKEN       For Replicate
  FAL_KEY                   For fal.ai

Examples:
  node generate-icons.js --test --provider stabilityAI
  node generate-icons.js --priority P0 --limit 50
  node generate-icons.js --resume --provider replicate
  node generate-icons.js --single Barbell_Bench_Press
  `);
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
    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      rows.push(row);
    }
  }

  return rows;
}

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

// Progress tracking
class ProgressTracker {
  constructor(progressFile) {
    this.file = progressFile;
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.file)) {
        return JSON.parse(fs.readFileSync(this.file, 'utf-8'));
      }
    } catch (e) {
      console.warn('Could not load progress file, starting fresh');
    }
    return {
      completed: [],
      failed: [],
      lastRun: null,
      totalCost: 0
    };
  }

  save() {
    const dir = path.dirname(this.file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  markCompleted(exerciseId, cost = 0) {
    if (!this.data.completed.includes(exerciseId)) {
      this.data.completed.push(exerciseId);
      this.data.totalCost += cost;
      this.data.lastRun = new Date().toISOString();
      this.save();
    }
  }

  markFailed(exerciseId, error) {
    const existing = this.data.failed.find(f => f.id === exerciseId);
    if (existing) {
      existing.attempts++;
      existing.lastError = error;
    } else {
      this.data.failed.push({
        id: exerciseId,
        attempts: 1,
        lastError: error
      });
    }
    this.data.lastRun = new Date().toISOString();
    this.save();
  }

  isCompleted(exerciseId) {
    return this.data.completed.includes(exerciseId);
  }

  getStats() {
    return {
      completed: this.data.completed.length,
      failed: this.data.failed.length,
      totalCost: this.data.totalCost.toFixed(2)
    };
  }
}

// Error logging
function logError(exerciseId, error, errorLog) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${exerciseId}: ${error}\n`;
  fs.appendFileSync(errorLog, message);
}

// HTTP request helper
function makeRequest(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const req = protocol.request(url, options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.toString()}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// Provider implementations
async function generateWithStabilityAI(prompt, apiKey, outputPath) {
  const FormData = require('form-data');
  const form = new FormData();

  form.append('prompt', prompt);
  form.append('output_format', 'png');
  form.append('aspect_ratio', '1:1');
  form.append('model', 'sd3-large');
  form.append('negative_prompt', CONFIG.providers.stabilityAI.negativePrompt || '');

  const response = await makeRequest(
    CONFIG.providers.stabilityAI.endpoint,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*',
        ...form.getHeaders()
      }
    },
    form
  );

  fs.writeFileSync(outputPath, response.data);
  return { success: true, cost: CONFIG.providers.stabilityAI.costPerImage };
}

async function generateWithReplicate(prompt, apiKey, outputPath) {
  // Create prediction
  const createResponse = await makeRequest(
    CONFIG.providers.replicate.endpoint,
    {
      method: 'POST',
      headers: CONFIG.providers.replicate.headers(apiKey)
    },
    {
      version: 'black-forest-labs/flux-schnell',
      input: {
        prompt: prompt,
        num_outputs: 1,
        aspect_ratio: '1:1',
        output_format: 'png',
        output_quality: 90
      }
    }
  );

  const prediction = JSON.parse(createResponse.data.toString());
  const predictionId = prediction.id;

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60;

  while (attempts < maxAttempts) {
    await sleep(2000);

    const statusResponse = await makeRequest(
      `${CONFIG.providers.replicate.endpoint}/${predictionId}`,
      {
        method: 'GET',
        headers: CONFIG.providers.replicate.headers(apiKey)
      }
    );

    const status = JSON.parse(statusResponse.data.toString());

    if (status.status === 'succeeded') {
      const imageUrl = status.output[0];
      const imageResponse = await makeRequest(imageUrl, { method: 'GET' });
      fs.writeFileSync(outputPath, imageResponse.data);
      return { success: true, cost: CONFIG.providers.replicate.costPerImage };
    } else if (status.status === 'failed') {
      throw new Error(`Replicate generation failed: ${status.error}`);
    }

    attempts++;
  }

  throw new Error('Replicate generation timed out');
}

async function generateWithFalAI(prompt, apiKey, outputPath) {
  const response = await makeRequest(
    CONFIG.providers.falai.endpoint,
    {
      method: 'POST',
      headers: CONFIG.providers.falai.headers(apiKey)
    },
    {
      prompt: prompt,
      image_size: 'square',
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true
    }
  );

  const result = JSON.parse(response.data.toString());

  // Check if it's a queued response
  if (result.request_id) {
    // Poll for result
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await sleep(2000);

      const statusResponse = await makeRequest(
        `https://queue.fal.run/fal-ai/flux/schnell/status/${result.request_id}`,
        {
          method: 'GET',
          headers: CONFIG.providers.falai.headers(apiKey)
        }
      );

      const status = JSON.parse(statusResponse.data.toString());

      if (status.status === 'COMPLETED') {
        const imageUrl = status.response.images[0].url;
        const imageResponse = await makeRequest(imageUrl, { method: 'GET' });
        fs.writeFileSync(outputPath, imageResponse.data);
        return { success: true, cost: CONFIG.providers.falai.costPerImage };
      } else if (status.status === 'FAILED') {
        throw new Error(`fal.ai generation failed: ${status.error}`);
      }

      attempts++;
    }

    throw new Error('fal.ai generation timed out');
  }

  // Direct response with image
  if (result.images && result.images[0]) {
    const imageUrl = result.images[0].url;
    const imageResponse = await makeRequest(imageUrl, { method: 'GET' });
    fs.writeFileSync(outputPath, imageResponse.data);
    return { success: true, cost: CONFIG.providers.falai.costPerImage };
  }

  throw new Error('Unexpected response from fal.ai');
}

// Fallback: create placeholder
function createPlaceholder(exerciseId, outputPath) {
  // Create a simple text file as placeholder
  const placeholderContent = `PLACEHOLDER: ${exerciseId}\nGeneration failed - manual review required`;
  fs.writeFileSync(outputPath.replace('.png', '.placeholder.txt'), placeholderContent);
  return { success: false, placeholder: true };
}

// Main generation function
async function generateIcon(exercise, provider, apiKey, options) {
  const outputPath = path.join(CONFIG.outputDir, `${exercise.exercise_id}.png`);

  // Skip if already exists (unless forced)
  if (fs.existsSync(outputPath) && !options.force) {
    if (options.verbose) {
      console.log(`  Skipping ${exercise.exercise_id} (already exists)`);
    }
    return { success: true, skipped: true };
  }

  if (options.dryRun) {
    console.log(`  [DRY RUN] Would generate: ${exercise.exercise_id}`);
    return { success: true, dryRun: true };
  }

  const prompt = exercise.positive_prompt;

  let lastError;
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      if (options.verbose) {
        console.log(`  Generating ${exercise.exercise_id} (attempt ${attempt}/${CONFIG.maxRetries})`);
      }

      let result;
      switch (provider) {
        case 'stabilityAI':
          result = await generateWithStabilityAI(prompt, apiKey, outputPath);
          break;
        case 'replicate':
          result = await generateWithReplicate(prompt, apiKey, outputPath);
          break;
        case 'falai':
          result = await generateWithFalAI(prompt, apiKey, outputPath);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      return result;
    } catch (error) {
      lastError = error;
      if (options.verbose) {
        console.warn(`  Attempt ${attempt} failed: ${error.message}`);
      }

      if (attempt < CONFIG.maxRetries) {
        await sleep(CONFIG.retryDelayMs * attempt);
      }
    }
  }

  // All retries failed
  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get API key for provider
function getApiKey(provider) {
  const envKeys = {
    stabilityAI: 'STABILITY_AI_API_KEY',
    replicate: 'REPLICATE_API_TOKEN',
    falai: 'FAL_KEY'
  };

  const key = process.env[envKeys[provider]];
  if (!key) {
    console.error(`Error: ${envKeys[provider]} environment variable not set`);
    console.error(`\nTo set up:`);
    console.error(`  export ${envKeys[provider]}="your-api-key-here"`);
    console.error(`\nOr create a .env file with:`);
    console.error(`  ${envKeys[provider]}=your-api-key-here`);
    process.exit(1);
  }
  return key;
}

// Main execution
async function main() {
  const options = parseArgs();

  console.log('========================================');
  console.log('Exercise Icon Batch Generation');
  console.log('========================================\n');

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Check for refined prompts file
  if (!fs.existsSync(CONFIG.inputFile)) {
    console.error(`Error: Refined prompts file not found: ${CONFIG.inputFile}`);
    console.error(`\nRun first: node scripts/art/refine-exercise-prompts.js`);
    process.exit(1);
  }

  // Load prompts
  const content = fs.readFileSync(CONFIG.inputFile, 'utf-8');
  const allExercises = parseCSV(content);
  console.log(`Loaded ${allExercises.length} exercises from refined prompts\n`);

  // Filter exercises based on mode
  let exercises;
  switch (options.mode) {
    case 'test':
      exercises = allExercises.filter(e =>
        CONFIG.testExercises.some(test =>
          e.exercise_id.toLowerCase().includes(test.toLowerCase()) ||
          e.exercise_name.toLowerCase().includes(test.toLowerCase())
        )
      ).slice(0, 10);
      console.log(`Test mode: ${exercises.length} exercises selected\n`);
      break;

    case 'priority':
      const priorities = options.priority === 'P0' ? ['P0'] :
                        options.priority === 'P1' ? ['P0', 'P1'] :
                        ['P0', 'P1', 'P2'];
      exercises = allExercises.filter(e => priorities.includes(e.priority));
      console.log(`Priority mode (${options.priority}): ${exercises.length} exercises\n`);
      break;

    case 'single':
      exercises = allExercises.filter(e => e.exercise_id === options.exerciseId);
      if (exercises.length === 0) {
        console.error(`Exercise not found: ${options.exerciseId}`);
        process.exit(1);
      }
      break;

    case 'resume':
    case 'all':
    default:
      exercises = allExercises;
      break;
  }

  // Apply limit
  if (options.limit) {
    exercises = exercises.slice(0, options.limit);
    console.log(`Limited to ${exercises.length} exercises\n`);
  }

  // Get API key
  let apiKey = null;
  if (!options.dryRun) {
    apiKey = getApiKey(options.provider);
    console.log(`Provider: ${options.provider}`);
    console.log(`API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}\n`);
  }

  // Initialize progress tracker
  const progress = new ProgressTracker(CONFIG.progressFile);

  // Filter out completed exercises (for resume mode)
  if (options.mode === 'resume') {
    const beforeCount = exercises.length;
    exercises = exercises.filter(e => !progress.isCompleted(e.exercise_id));
    console.log(`Resume mode: ${beforeCount - exercises.length} already completed, ${exercises.length} remaining\n`);
  }

  // Calculate estimated cost
  const costPerImage = CONFIG.providers[options.provider]?.costPerImage || 0.03;
  const estimatedCost = exercises.length * costPerImage;
  console.log(`Estimated cost: $${estimatedCost.toFixed(2)}`);
  console.log(`Time estimate: ~${Math.ceil(exercises.length / 60)} minutes\n`);

  if (options.dryRun) {
    console.log('DRY RUN - No images will be generated\n');
  }

  // Generate icons
  let completed = 0;
  let failed = 0;
  let skipped = 0;

  console.log('Starting generation...\n');

  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    const progressStr = `[${i + 1}/${exercises.length}]`;

    try {
      const result = await generateIcon(exercise, options.provider, apiKey, options);

      if (result.skipped) {
        skipped++;
        if (options.verbose) {
          console.log(`${progressStr} Skipped: ${exercise.exercise_name}`);
        }
      } else {
        completed++;
        progress.markCompleted(exercise.exercise_id, result.cost || 0);
        console.log(`${progressStr} Generated: ${exercise.exercise_name}`);
      }

      // Rate limiting
      if (!result.skipped && !result.dryRun && i < exercises.length - 1) {
        await sleep(CONFIG.rateLimitDelayMs);
      }
    } catch (error) {
      failed++;
      progress.markFailed(exercise.exercise_id, error.message);
      logError(exercise.exercise_id, error.message, CONFIG.errorLog);
      console.error(`${progressStr} FAILED: ${exercise.exercise_name} - ${error.message}`);
    }

    // Progress update every 10 exercises
    if ((i + 1) % 10 === 0) {
      const stats = progress.getStats();
      console.log(`\n--- Progress: ${stats.completed} completed, ${stats.failed} failed, $${stats.totalCost} spent ---\n`);
    }
  }

  // Final summary
  const stats = progress.getStats();
  console.log('\n========================================');
  console.log('Generation Complete');
  console.log('========================================');
  console.log(`  Completed: ${completed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total cost: $${stats.totalCost}`);
  console.log(`\nOutput directory: ${CONFIG.outputDir}`);

  if (failed > 0) {
    console.log(`\nError log: ${CONFIG.errorLog}`);
    console.log(`\nTo retry failed icons: node scripts/art/generate-icons.js --resume`);
  }

  console.log(`\nNext step: node scripts/art/check-icon-quality.js`);
}

// Load .env if present
try {
  const envPath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  }
} catch (e) {
  // Ignore .env errors
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

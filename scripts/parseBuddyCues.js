#!/usr/bin/env node
/**
 * Parse Buddy Text Cues from Markdown → JSON
 *
 * Reads the three source-of-truth markdown files and outputs:
 * 1. Individual JSON files per personality (for seeding Supabase)
 * 2. A combined JSON file (for backup/reference)
 *
 * Usage: node scripts/parseBuddyCues.js
 * Output: scripts/output/cues/*.json
 */

const fs = require('fs');
const path = require('path');

// Source files
const DOCS_DIR = path.join(__dirname, '../docs/data');
const OUTPUT_DIR = path.join(__dirname, 'output/cues');

// Personality ID mapping from document names to database IDs
// Handles multiple formats with/without spaces around slashes, parentheticals, etc.
const PERSONALITY_MAP = {
  // V1 Master (original 8)
  'DEFAULT': 'default',
  'GYM BRO': 'gym_bro',
  'FIT INFLUENCER': 'fit_influencer',
  'TERMINALLY ONLINE': 'terminally_online',
  'COUNTERCULTURE/DEMONS': 'counterculture',
  'COUNTERCULTURE / DEMONS': 'counterculture',
  'POWERLIFTING': 'powerlifting',
  'BODYBUILDING': 'bodybuilding',
  'B-BOY/CALISTHENICS': 'bboy',
  'B-BOY / CALISTHENICS': 'bboy',
  // V2 Master (new personalities)
  'ANIME/WEEB': 'anime',
  'ANIME / WEEB': 'anime',
  'OLD SCHOOL/IRON ERA': 'old_school',
  'OLD SCHOOL / IRON ERA': 'old_school',
  'MILITARY/TACTICAL': 'military',
  'MILITARY / TACTICAL': 'military',
  'STOIC': 'stoic',
};

/**
 * Normalize a personality name by removing parenthetical suffixes and extra whitespace
 */
function normalizePersonalityName(name) {
  return name
    .replace(/\s*\([^)]*\)\s*$/g, '')  // Remove (parenthetical suffix)
    .replace(/\s+/g, ' ')               // Normalize whitespace
    .trim()
    .toUpperCase();
}

// Category normalization
const CATEGORY_MAP = {
  'SHORT': 'SHORT',
  'HYPE': 'HYPE',
  'CULTURE': 'CULTURE',
  'START': 'START',
  'END': 'END',
  'REST': 'REST',
  'NUDGE': 'NUDGE',
  'FAILURE': 'FAILURE',
  'COMEBACK': 'COMEBACK',
  'MILESTONE': 'MILESTONE',
};

/**
 * Parse a markdown file and extract cues by personality and category
 */
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const results = {};
  let currentPersonality = null;
  let currentCategory = null;
  let inCueList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect personality header (multiple formats):
    // - "# PERSONALITY 1: DEFAULT (Balanced Coach)"
    // - "# PERSONALITY 2: GYM BRO - New Categories"
    // - "# PERSONALITY: STOIC"
    const personalityMatch = line.match(/^#\s*PERSONALITY\s*\d*:?\s*(.+?)(?:\s*-\s*New Categories)?$/i);
    if (personalityMatch) {
      const rawName = personalityMatch[1].trim();
      const normalizedName = normalizePersonalityName(rawName);

      // Try normalized name (without parenthetical)
      let mappedId = PERSONALITY_MAP[normalizedName];

      // If not found, try exact match
      if (!mappedId) {
        mappedId = PERSONALITY_MAP[rawName.toUpperCase()];
      }

      currentPersonality = mappedId;
      if (currentPersonality) {
        if (!results[currentPersonality]) {
          results[currentPersonality] = {};
        }
      } else {
        console.log(`   ⚠️ Unknown personality: "${rawName}" (normalized: "${normalizedName}")`);
      }
      currentCategory = null;
      inCueList = false;
      continue;
    }

    // Detect category header (## CATEGORY (count))
    const categoryMatch = line.match(/^##\s*([A-Z]+)\s*\(\d+\)/);
    if (categoryMatch && currentPersonality) {
      const rawCategory = categoryMatch[1].trim().toUpperCase();
      currentCategory = CATEGORY_MAP[rawCategory];
      if (currentCategory) {
        if (!results[currentPersonality][currentCategory]) {
          results[currentPersonality][currentCategory] = [];
        }
        inCueList = true;
      }
      continue;
    }

    // Detect numbered cue line (1. Cue text here)
    const cueMatch = line.match(/^\d+\.\s+(.+)$/);
    if (cueMatch && currentPersonality && currentCategory && inCueList) {
      const cueText = cueMatch[1].trim();
      if (cueText && cueText.length > 0) {
        results[currentPersonality][currentCategory].push(cueText);
      }
      continue;
    }

    // Reset on horizontal rule or empty personality section
    if (line === '---') {
      inCueList = false;
    }
  }

  return results;
}

/**
 * Merge multiple parsed results into one
 * Note: We keep ALL cues including duplicates - repetition adds variety
 */
function mergeResults(allResults) {
  const merged = {};

  for (const result of allResults) {
    for (const [personalityId, categories] of Object.entries(result)) {
      if (!merged[personalityId]) {
        merged[personalityId] = {};
      }
      for (const [category, cues] of Object.entries(categories)) {
        if (!merged[personalityId][category]) {
          merged[personalityId][category] = [];
        }
        // Add ALL cues (including duplicates for variety)
        merged[personalityId][category].push(...cues);
      }
    }
  }

  return merged;
}

/**
 * Generate Supabase seed SQL
 */
function generateSeedSQL(allCues) {
  let sql = `-- Buddy Cues Seed Data
-- Generated: ${new Date().toISOString()}
-- Total cues: ${Object.values(allCues).reduce((sum, p) => sum + Object.values(p).reduce((s, c) => s + c.length, 0), 0)}

-- Clear existing cues (be careful in production!)
-- TRUNCATE buddy_cues RESTART IDENTITY CASCADE;

-- Insert cues
INSERT INTO buddy_cues (personality_id, category, text) VALUES
`;

  const values = [];
  for (const [personalityId, categories] of Object.entries(allCues)) {
    for (const [category, cues] of Object.entries(categories)) {
      for (const cue of cues) {
        // Escape single quotes for SQL
        const escapedCue = cue.replace(/'/g, "''");
        values.push(`('${personalityId}', '${category}', '${escapedCue}')`);
      }
    }
  }

  sql += values.join(',\n') + ';\n';
  return sql;
}

/**
 * Main execution
 */
function main() {
  console.log('🏋️ Parsing Buddy Text Cues...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Parse the single source of truth file
  const files = [
    'BUDDY-CUES-MASTER.md',
  ];

  const allResults = [];

  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);
    if (fs.existsSync(filePath)) {
      console.log(`📖 Parsing ${file}...`);
      const result = parseMarkdownFile(filePath);
      allResults.push(result);

      // Log stats
      for (const [personality, categories] of Object.entries(result)) {
        const totalCues = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);
        if (totalCues > 0) {
          console.log(`   └─ ${personality}: ${totalCues} cues`);
        }
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }

  // Merge all results
  console.log('\n🔀 Merging results...');
  const merged = mergeResults(allResults);

  // Output individual personality JSON files
  console.log('\n📁 Writing individual JSON files...');
  for (const [personalityId, categories] of Object.entries(merged)) {
    const outputPath = path.join(OUTPUT_DIR, `${personalityId}.json`);
    const data = {
      id: personalityId,
      generatedAt: new Date().toISOString(),
      cues: categories,
      stats: {
        totalCues: Object.values(categories).reduce((sum, arr) => sum + arr.length, 0),
        byCategory: Object.fromEntries(
          Object.entries(categories).map(([cat, cues]) => [cat, cues.length])
        ),
      },
    };
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`   └─ ${personalityId}.json (${data.stats.totalCues} cues)`);
  }

  // Output combined JSON
  const combinedPath = path.join(OUTPUT_DIR, '_all_cues.json');
  const combinedData = {
    generatedAt: new Date().toISOString(),
    personalities: merged,
    stats: {
      totalPersonalities: Object.keys(merged).length,
      totalCues: Object.values(merged).reduce(
        (sum, p) => sum + Object.values(p).reduce((s, c) => s + c.length, 0),
        0
      ),
      byPersonality: Object.fromEntries(
        Object.entries(merged).map(([id, cats]) => [
          id,
          Object.values(cats).reduce((sum, arr) => sum + arr.length, 0)
        ])
      ),
    },
  };
  fs.writeFileSync(combinedPath, JSON.stringify(combinedData, null, 2));
  console.log(`\n📦 Combined file: _all_cues.json`);

  // Generate Supabase seed SQL
  const sqlPath = path.join(OUTPUT_DIR, 'seed_cues.sql');
  const sql = generateSeedSQL(merged);
  fs.writeFileSync(sqlPath, sql);
  console.log(`📊 Supabase seed: seed_cues.sql`);

  // Final summary
  console.log('\n✅ Done!\n');
  console.log('Summary:');
  console.log(`   Personalities: ${combinedData.stats.totalPersonalities}`);
  console.log(`   Total Cues: ${combinedData.stats.totalCues}`);
  console.log('\nPer Personality:');
  for (const [id, count] of Object.entries(combinedData.stats.byPersonality)) {
    console.log(`   ${id}: ${count}`);
  }

  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
}

main();

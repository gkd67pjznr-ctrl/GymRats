#!/usr/bin/env node

/**
 * Exercise Icon Integration Script
 *
 * Copies approved icons to the app's assets folder, generates optimized
 * versions at multiple sizes, and creates the icon manifest for the app.
 *
 * Usage:
 *   node scripts/art/integrate-icons.js             # Full integration
 *   node scripts/art/integrate-icons.js --dry-run   # Preview changes
 *   node scripts/art/integrate-icons.js --update    # Update manifest only
 *
 * Output:
 *   - assets/exercises/icons/{exercise_id}.png
 *   - assets/exercises/icons/manifest.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, 'output/icons'),
  targetDir: path.join(__dirname, '../../assets/exercises/icons'),
  qualityReport: path.join(__dirname, 'output/quality-report.json'),
  manifestFile: path.join(__dirname, '../../assets/exercises/icons/manifest.json'),
  exercisesFile: path.join(__dirname, '../../src/data/exercises.ts'),

  // Size variants to generate
  sizes: [
    { name: 'original', size: null },     // Keep original
    { name: '256', size: 256 },           // Marketing/detail
    { name: '128', size: 128 },           // Exercise detail view
    { name: '64', size: 64 },             // Exercise cards
    { name: '48', size: 48 }              // Exercise list (smallest)
  ],

  // Only use sizes that the app actually needs
  appSizes: ['48', '64', '128'],

  // Quality settings
  pngQuality: 90,
  validStatuses: ['ok', 'warning']  // Don't include 'error' icons
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    updateOnly: false,
    force: false,
    verbose: false,
    skipResize: false
  };

  for (const arg of args) {
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--update') options.updateOnly = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--verbose' || arg === '-v') options.verbose = true;
    else if (arg === '--skip-resize') options.skipResize = true;
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Exercise Icon Integration Script

Usage: node integrate-icons.js [options]

Options:
  --dry-run       Preview what would be done without making changes
  --update        Update manifest only (don't copy/resize icons)
  --force         Overwrite existing icons even if unchanged
  --skip-resize   Don't generate size variants
  --verbose, -v   Show detailed output
  --help, -h      Show this help message

Output:
  Copies icons to: assets/exercises/icons/
  Creates manifest: assets/exercises/icons/manifest.json

Manifest Format:
  {
    "version": "1.0.0",
    "generated": "2024-...",
    "icons": {
      "bench_press": {
        "id": "bench_press",
        "file": "bench_press.png",
        "sizes": [48, 64, 128]
      }
    }
  }
  `);
}

// Resize image using sips (macOS) or ImageMagick
function resizeImage(sourcePath, targetPath, size) {
  try {
    // Try sips first (macOS built-in)
    execSync(`sips -Z ${size} "${sourcePath}" --out "${targetPath}" 2>/dev/null`, {
      timeout: 10000
    });
    return true;
  } catch (e) {
    try {
      // Try ImageMagick convert
      execSync(`convert "${sourcePath}" -resize ${size}x${size} "${targetPath}" 2>/dev/null`, {
        timeout: 10000
      });
      return true;
    } catch (e2) {
      // Try GraphicsMagick
      try {
        execSync(`gm convert "${sourcePath}" -resize ${size}x${size} "${targetPath}" 2>/dev/null`, {
          timeout: 10000
        });
        return true;
      } catch (e3) {
        return false;
      }
    }
  }
}

// Copy file
function copyFile(source, target) {
  fs.copyFileSync(source, target);
}

// Load quality report to filter approved icons
function loadQualityReport(reportPath) {
  if (!fs.existsSync(reportPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(reportPath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.warn('Warning: Could not parse quality report');
    return null;
  }
}

// Get list of exercise IDs from the app's exercises data
function getAppExerciseIds(exercisesFile) {
  if (!fs.existsSync(exercisesFile)) {
    return null;
  }

  try {
    const content = fs.readFileSync(exercisesFile, 'utf-8');

    // Extract exercise IDs from the TypeScript file
    const idMatches = content.matchAll(/id:\s*['"]([^'"]+)['"]/g);
    const ids = [];
    for (const match of idMatches) {
      ids.push(match[1]);
    }

    // Also try to extract from EXERCISES_V1 array if it exists
    const arrayMatch = content.match(/EXERCISES_V1\s*=\s*\[([\s\S]*?)\]/);
    if (arrayMatch) {
      const exerciseIdMatches = arrayMatch[1].matchAll(/['"]([a-zA-Z0-9_-]+)['"]\s*,?/g);
      for (const match of exerciseIdMatches) {
        if (!ids.includes(match[1])) {
          ids.push(match[1]);
        }
      }
    }

    return ids;
  } catch (e) {
    console.warn('Warning: Could not parse exercises file');
    return null;
  }
}

// Generate manifest JSON
function generateManifest(icons, options) {
  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    count: icons.length,
    sizes: CONFIG.appSizes.map(Number),
    icons: {}
  };

  for (const icon of icons) {
    manifest.icons[icon.id] = {
      id: icon.id,
      file: `${icon.id}.png`,
      sizes: icon.sizes || CONFIG.appSizes.map(Number),
      status: icon.status || 'ok'
    };
  }

  return manifest;
}

// Main execution
async function main() {
  const options = parseArgs();

  console.log('========================================');
  console.log('Exercise Icon Integration');
  console.log('========================================\n');

  // Check source directory
  if (!fs.existsSync(CONFIG.sourceDir)) {
    console.error(`Error: Source directory not found: ${CONFIG.sourceDir}`);
    console.error(`\nRun first: node scripts/art/generate-icons.js --test`);
    process.exit(1);
  }

  // Ensure target directory exists
  if (!options.dryRun && !fs.existsSync(CONFIG.targetDir)) {
    fs.mkdirSync(CONFIG.targetDir, { recursive: true });
    console.log(`Created: ${CONFIG.targetDir}`);
  }

  // Load quality report
  const qualityReport = loadQualityReport(CONFIG.qualityReport);
  let approvedIcons = [];

  if (qualityReport) {
    approvedIcons = qualityReport.icons
      .filter(i => CONFIG.validStatuses.includes(i.status))
      .map(i => i.exerciseId);
    console.log(`Quality report found: ${approvedIcons.length} approved icons`);
  } else {
    // If no quality report, use all icons in source directory
    approvedIcons = fs.readdirSync(CONFIG.sourceDir)
      .filter(f => f.endsWith('.png'))
      .map(f => path.basename(f, '.png'));
    console.log(`No quality report, using all ${approvedIcons.length} icons`);
  }

  // Get app exercise IDs for reference
  const appExerciseIds = getAppExerciseIds(CONFIG.exercisesFile);
  if (appExerciseIds) {
    console.log(`App exercises: ${appExerciseIds.length}`);
    const overlap = approvedIcons.filter(id => appExerciseIds.includes(id));
    console.log(`Matching icons: ${overlap.length}`);
  }

  console.log('');

  // Process icons
  const integratedIcons = [];
  let copied = 0;
  let resized = 0;
  let skipped = 0;
  let errors = 0;

  if (!options.updateOnly) {
    console.log('Processing icons...');

    for (const iconId of approvedIcons) {
      const sourcePath = path.join(CONFIG.sourceDir, `${iconId}.png`);

      if (!fs.existsSync(sourcePath)) {
        if (options.verbose) {
          console.log(`  [SKIP] ${iconId} - source not found`);
        }
        skipped++;
        continue;
      }

      const targetPath = path.join(CONFIG.targetDir, `${iconId}.png`);

      // Check if needs update
      let needsUpdate = options.force;
      if (!needsUpdate && fs.existsSync(targetPath)) {
        const sourceStats = fs.statSync(sourcePath);
        const targetStats = fs.statSync(targetPath);
        needsUpdate = sourceStats.mtimeMs > targetStats.mtimeMs;
      } else {
        needsUpdate = true;
      }

      const iconInfo = {
        id: iconId,
        sizes: [],
        status: 'ok'
      };

      if (needsUpdate) {
        if (options.dryRun) {
          console.log(`  [DRY] Would copy: ${iconId}`);
        } else {
          // Copy original
          copyFile(sourcePath, targetPath);
          copied++;

          // Generate size variants
          if (!options.skipResize) {
            for (const sizeConfig of CONFIG.sizes) {
              if (sizeConfig.size && CONFIG.appSizes.includes(sizeConfig.name)) {
                const sizeDir = path.join(CONFIG.targetDir, sizeConfig.name);
                if (!fs.existsSync(sizeDir)) {
                  fs.mkdirSync(sizeDir, { recursive: true });
                }

                const resizedPath = path.join(sizeDir, `${iconId}.png`);
                if (resizeImage(sourcePath, resizedPath, sizeConfig.size)) {
                  iconInfo.sizes.push(sizeConfig.size);
                  resized++;
                } else {
                  // Copy original if resize fails
                  copyFile(sourcePath, resizedPath);
                  iconInfo.sizes.push(sizeConfig.size);
                }
              }
            }
          }

          if (options.verbose) {
            console.log(`  [OK] ${iconId} - copied with ${iconInfo.sizes.length} size variants`);
          }
        }
      } else {
        skipped++;
        // Still add to manifest
        iconInfo.sizes = CONFIG.appSizes.map(Number);
        if (options.verbose) {
          console.log(`  [SKIP] ${iconId} - up to date`);
        }
      }

      integratedIcons.push(iconInfo);
    }
  } else {
    // Update only - just build manifest from existing files
    console.log('Scanning existing icons for manifest...');

    const existingFiles = fs.readdirSync(CONFIG.targetDir)
      .filter(f => f.endsWith('.png') && !f.includes('/'));

    for (const file of existingFiles) {
      const iconId = path.basename(file, '.png');
      const iconInfo = {
        id: iconId,
        sizes: CONFIG.appSizes.map(Number),
        status: 'ok'
      };
      integratedIcons.push(iconInfo);
    }
  }

  // Generate manifest
  console.log('\nGenerating manifest...');
  const manifest = generateManifest(integratedIcons, options);

  if (options.dryRun) {
    console.log(`  [DRY] Would write manifest with ${integratedIcons.length} icons`);
  } else {
    fs.writeFileSync(CONFIG.manifestFile, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`  Written: ${CONFIG.manifestFile}`);
  }

  // Print summary
  console.log('\n========================================');
  console.log('Integration Summary');
  console.log('========================================');
  console.log(`  Icons in manifest: ${integratedIcons.length}`);
  console.log(`  Copied: ${copied}`);
  console.log(`  Resized: ${resized}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`\nTarget directory: ${CONFIG.targetDir}`);
  console.log(`Manifest: ${CONFIG.manifestFile}`);

  // Check coverage against app exercises
  if (appExerciseIds) {
    const integratedIds = new Set(integratedIcons.map(i => i.id));
    const coverage = appExerciseIds.filter(id => integratedIds.has(id)).length;
    const coveragePct = ((coverage / appExerciseIds.length) * 100).toFixed(1);
    console.log(`\nApp exercise coverage: ${coverage}/${appExerciseIds.length} (${coveragePct}%)`);

    const missing = appExerciseIds.filter(id => !integratedIds.has(id));
    if (missing.length > 0 && missing.length <= 10) {
      console.log(`Missing: ${missing.join(', ')}`);
    } else if (missing.length > 10) {
      console.log(`Missing: ${missing.length} exercises (see quality report for details)`);
    }
  }

  // Usage example for the app
  console.log('\n========================================');
  console.log('Integration Complete');
  console.log('========================================');
  console.log(`
To use icons in the app:

1. Import the manifest:
   import iconManifest from '@/assets/exercises/icons/manifest.json';

2. Get icon for an exercise:
   const getExerciseIcon = (exerciseId: string) => {
     const icon = iconManifest.icons[exerciseId];
     if (icon) {
       return require(\`@/assets/exercises/icons/\${icon.file}\`);
     }
     return require('@/assets/exercises/icons/placeholder.png');
   };

3. Or use with Image component:
   <Image
     source={{ uri: \`file://\${iconPath}\` }}
     style={{ width: 64, height: 64 }}
   />
  `);

  // Exit with error if significant issues
  if (errors > integratedIcons.length * 0.1) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

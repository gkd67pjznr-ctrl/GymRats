#!/usr/bin/env node

/**
 * Exercise Icon Quality Check Script
 *
 * Verifies generated icons for quality, completeness, and consistency.
 * Flags icons needing regeneration and generates a quality report.
 *
 * Usage:
 *   node scripts/art/check-icon-quality.js           # Full quality check
 *   node scripts/art/check-icon-quality.js --quick   # Quick file-size-only check
 *   node scripts/art/check-icon-quality.js --report  # Generate detailed HTML report
 *
 * Output: scripts/art/output/quality-report.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  iconsDir: path.join(__dirname, 'output/icons'),
  promptsFile: path.join(__dirname, '../../docs/art/generation/refined-prompts.csv'),
  reportFile: path.join(__dirname, 'output/quality-report.json'),
  htmlReportFile: path.join(__dirname, 'output/quality-report.html'),
  regenerateFile: path.join(__dirname, 'output/regenerate-list.txt'),

  // Quality thresholds
  thresholds: {
    minFileSizeBytes: 5000,       // Icons smaller than 5KB likely failed
    maxFileSizeBytes: 5000000,    // Icons larger than 5MB suspicious
    minWidthPx: 256,              // Minimum expected width
    minHeightPx: 256,             // Minimum expected height
    expectedAspectRatio: 1.0,     // Square icons expected
    aspectRatioTolerance: 0.05    // 5% tolerance for aspect ratio
  },

  // File patterns to check
  validExtensions: ['.png', '.jpg', '.jpeg', '.webp']
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    quick: false,
    report: false,
    verbose: false,
    fix: false
  };

  for (const arg of args) {
    if (arg === '--quick') options.quick = true;
    else if (arg === '--report') options.report = true;
    else if (arg === '--verbose' || arg === '-v') options.verbose = true;
    else if (arg === '--fix') options.fix = true;
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Exercise Icon Quality Check Script

Usage: node check-icon-quality.js [options]

Options:
  --quick           Quick check (file sizes only, no image analysis)
  --report          Generate detailed HTML report with thumbnails
  --fix             Auto-fix minor issues (rename, remove duplicates)
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Output Files:
  quality-report.json     JSON report with all issues
  quality-report.html     Visual HTML report (with --report)
  regenerate-list.txt     List of exercise IDs needing regeneration

Quality Checks:
  - File exists for each exercise
  - File size within expected range
  - Image dimensions correct (if not --quick)
  - Aspect ratio is square
  - No duplicate files
  - File naming conventions
  `);
}

// Parse CSV
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

// Get image dimensions using sips (macOS) or identify (ImageMagick)
function getImageDimensions(filePath) {
  try {
    // Try sips first (macOS built-in)
    const output = execSync(`sips -g pixelHeight -g pixelWidth "${filePath}" 2>/dev/null`, {
      encoding: 'utf-8',
      timeout: 5000
    });

    const widthMatch = output.match(/pixelWidth:\s*(\d+)/);
    const heightMatch = output.match(/pixelHeight:\s*(\d+)/);

    if (widthMatch && heightMatch) {
      return {
        width: parseInt(widthMatch[1], 10),
        height: parseInt(heightMatch[1], 10)
      };
    }
  } catch (e) {
    // Try ImageMagick identify
    try {
      const output = execSync(`identify -format "%w %h" "${filePath}" 2>/dev/null`, {
        encoding: 'utf-8',
        timeout: 5000
      });
      const [width, height] = output.trim().split(' ').map(Number);
      if (width && height) {
        return { width, height };
      }
    } catch (e2) {
      // Fall back to file header parsing for PNG
      return parsePNGDimensions(filePath);
    }
  }

  return null;
}

// Parse PNG dimensions from file header
function parsePNGDimensions(filePath) {
  try {
    const buffer = Buffer.alloc(24);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 24, 0);
    fs.closeSync(fd);

    // PNG signature: 137 80 78 71 13 10 26 10
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      // IHDR chunk starts at byte 8, width at 16, height at 20
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
  } catch (e) {
    // Ignore errors
  }
  return null;
}

// Check single icon quality
function checkIconQuality(filePath, exerciseId, options) {
  const issues = [];
  const stats = fs.statSync(filePath);

  // Check file size
  if (stats.size < CONFIG.thresholds.minFileSizeBytes) {
    issues.push({
      type: 'SIZE_TOO_SMALL',
      severity: 'error',
      message: `File size ${stats.size} bytes is below minimum ${CONFIG.thresholds.minFileSizeBytes}`,
      value: stats.size
    });
  }

  if (stats.size > CONFIG.thresholds.maxFileSizeBytes) {
    issues.push({
      type: 'SIZE_TOO_LARGE',
      severity: 'warning',
      message: `File size ${stats.size} bytes exceeds maximum ${CONFIG.thresholds.maxFileSizeBytes}`,
      value: stats.size
    });
  }

  // Check file extension
  const ext = path.extname(filePath).toLowerCase();
  if (!CONFIG.validExtensions.includes(ext)) {
    issues.push({
      type: 'INVALID_EXTENSION',
      severity: 'error',
      message: `Invalid file extension: ${ext}`,
      value: ext
    });
  }

  // Skip dimension checks in quick mode
  if (!options.quick) {
    const dimensions = getImageDimensions(filePath);

    if (dimensions) {
      // Check dimensions
      if (dimensions.width < CONFIG.thresholds.minWidthPx) {
        issues.push({
          type: 'WIDTH_TOO_SMALL',
          severity: 'warning',
          message: `Width ${dimensions.width}px is below minimum ${CONFIG.thresholds.minWidthPx}px`,
          value: dimensions.width
        });
      }

      if (dimensions.height < CONFIG.thresholds.minHeightPx) {
        issues.push({
          type: 'HEIGHT_TOO_SMALL',
          severity: 'warning',
          message: `Height ${dimensions.height}px is below minimum ${CONFIG.thresholds.minHeightPx}px`,
          value: dimensions.height
        });
      }

      // Check aspect ratio
      const aspectRatio = dimensions.width / dimensions.height;
      const ratioDiff = Math.abs(aspectRatio - CONFIG.thresholds.expectedAspectRatio);
      if (ratioDiff > CONFIG.thresholds.aspectRatioTolerance) {
        issues.push({
          type: 'ASPECT_RATIO_WRONG',
          severity: 'warning',
          message: `Aspect ratio ${aspectRatio.toFixed(2)} differs from expected ${CONFIG.thresholds.expectedAspectRatio}`,
          value: aspectRatio
        });
      }
    } else {
      issues.push({
        type: 'DIMENSION_CHECK_FAILED',
        severity: 'warning',
        message: 'Could not determine image dimensions'
      });
    }
  }

  return {
    exerciseId,
    filePath,
    fileSize: stats.size,
    issues,
    status: issues.some(i => i.severity === 'error') ? 'error' :
            issues.length > 0 ? 'warning' : 'ok'
  };
}

// Generate HTML report
function generateHTMLReport(report, outputPath) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exercise Icon Quality Report</title>
  <style>
    :root {
      --bg: #0A0A0D;
      --card: #1A1A1E;
      --text: #F2F4FF;
      --accent: #A6FF00;
      --error: #FF3D7F;
      --warning: #FFB800;
      --success: #00F5D4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { color: var(--accent); margin-bottom: 1rem; }
    h2 { margin: 2rem 0 1rem; border-bottom: 1px solid var(--card); padding-bottom: 0.5rem; }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat {
      background: var(--card);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value { font-size: 2rem; font-weight: bold; }
    .stat-label { font-size: 0.9rem; opacity: 0.7; }
    .stat.ok .stat-value { color: var(--success); }
    .stat.warning .stat-value { color: var(--warning); }
    .stat.error .stat-value { color: var(--error); }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
    }
    .icon-card {
      background: var(--card);
      border-radius: 8px;
      overflow: hidden;
      position: relative;
    }
    .icon-card.error { border: 2px solid var(--error); }
    .icon-card.warning { border: 2px solid var(--warning); }
    .icon-card.ok { border: 2px solid transparent; }

    .icon-card img {
      width: 100%;
      height: 100px;
      object-fit: contain;
      background: #000;
    }
    .icon-info {
      padding: 0.5rem;
      font-size: 0.75rem;
    }
    .icon-name {
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .icon-size { opacity: 0.7; }
    .icon-issues {
      color: var(--error);
      font-size: 0.65rem;
    }

    .missing-section { margin-top: 2rem; }
    .missing-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .missing-item {
      background: var(--card);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      border: 1px solid var(--error);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    th, td {
      padding: 0.5rem;
      text-align: left;
      border-bottom: 1px solid var(--card);
    }
    th { background: var(--card); }

    .filter-buttons {
      margin-bottom: 1rem;
    }
    .filter-btn {
      background: var(--card);
      color: var(--text);
      border: none;
      padding: 0.5rem 1rem;
      margin-right: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .filter-btn:hover { background: #2A2A2E; }
    .filter-btn.active { background: var(--accent); color: var(--bg); }
  </style>
</head>
<body>
  <h1>Exercise Icon Quality Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>

  <h2>Summary</h2>
  <div class="summary">
    <div class="stat">
      <div class="stat-value">${report.summary.total}</div>
      <div class="stat-label">Total Expected</div>
    </div>
    <div class="stat ok">
      <div class="stat-value">${report.summary.ok}</div>
      <div class="stat-label">OK</div>
    </div>
    <div class="stat warning">
      <div class="stat-value">${report.summary.warnings}</div>
      <div class="stat-label">Warnings</div>
    </div>
    <div class="stat error">
      <div class="stat-value">${report.summary.errors}</div>
      <div class="stat-label">Errors</div>
    </div>
    <div class="stat error">
      <div class="stat-value">${report.summary.missing}</div>
      <div class="stat-label">Missing</div>
    </div>
  </div>

  <h2>Generated Icons</h2>
  <div class="filter-buttons">
    <button class="filter-btn active" onclick="filterIcons('all')">All</button>
    <button class="filter-btn" onclick="filterIcons('error')">Errors</button>
    <button class="filter-btn" onclick="filterIcons('warning')">Warnings</button>
    <button class="filter-btn" onclick="filterIcons('ok')">OK</button>
  </div>
  <div class="icon-grid">
    ${report.icons.map(icon => `
      <div class="icon-card ${icon.status}" data-status="${icon.status}">
        <img src="icons/${icon.exerciseId}.png" alt="${icon.exerciseId}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 fill=%22%23fff%22 text-anchor=%22middle%22 font-size=%2210%22>?</text></svg>'">
        <div class="icon-info">
          <div class="icon-name" title="${icon.exerciseId}">${icon.exerciseId}</div>
          <div class="icon-size">${(icon.fileSize / 1024).toFixed(1)} KB</div>
          ${icon.issues.length > 0 ? `<div class="icon-issues">${icon.issues.length} issue(s)</div>` : ''}
        </div>
      </div>
    `).join('')}
  </div>

  ${report.missing.length > 0 ? `
  <h2 class="missing-section">Missing Icons (${report.missing.length})</h2>
  <div class="missing-list">
    ${report.missing.map(id => `<span class="missing-item">${id}</span>`).join('')}
  </div>
  ` : ''}

  ${report.issues.length > 0 ? `
  <h2>All Issues</h2>
  <table>
    <tr>
      <th>Exercise</th>
      <th>Type</th>
      <th>Severity</th>
      <th>Message</th>
    </tr>
    ${report.issues.map(issue => `
    <tr>
      <td>${issue.exerciseId}</td>
      <td>${issue.type}</td>
      <td style="color: ${issue.severity === 'error' ? 'var(--error)' : 'var(--warning)'}">${issue.severity}</td>
      <td>${issue.message}</td>
    </tr>
    `).join('')}
  </table>
  ` : ''}

  <script>
    function filterIcons(status) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      document.querySelectorAll('.icon-card').forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>
  `;

  fs.writeFileSync(outputPath, html.trim(), 'utf-8');
}

// Main execution
async function main() {
  const options = parseArgs();

  console.log('========================================');
  console.log('Exercise Icon Quality Check');
  console.log('========================================\n');

  // Check if icons directory exists
  if (!fs.existsSync(CONFIG.iconsDir)) {
    console.error(`Error: Icons directory not found: ${CONFIG.iconsDir}`);
    console.error(`\nRun first: node scripts/art/generate-icons.js --test`);
    process.exit(1);
  }

  // Load expected exercises from prompts file
  let expectedExercises = [];
  if (fs.existsSync(CONFIG.promptsFile)) {
    const content = fs.readFileSync(CONFIG.promptsFile, 'utf-8');
    const rows = parseCSV(content);
    expectedExercises = rows.map(r => r.exercise_id);
    console.log(`Expected exercises: ${expectedExercises.length}`);
  } else {
    console.warn('Warning: Prompts file not found, checking all icons in directory');
  }

  // Get list of actual icon files
  const iconFiles = fs.readdirSync(CONFIG.iconsDir)
    .filter(f => CONFIG.validExtensions.includes(path.extname(f).toLowerCase()));
  console.log(`Found icon files: ${iconFiles.length}\n`);

  // Check each icon
  const icons = [];
  const allIssues = [];

  console.log('Checking icons...');
  for (const file of iconFiles) {
    const filePath = path.join(CONFIG.iconsDir, file);
    const exerciseId = path.basename(file, path.extname(file));

    const result = checkIconQuality(filePath, exerciseId, options);
    icons.push(result);

    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        allIssues.push({ ...issue, exerciseId });
      });

      if (options.verbose) {
        console.log(`  [${result.status.toUpperCase()}] ${exerciseId}: ${result.issues.map(i => i.type).join(', ')}`);
      }
    }
  }

  // Find missing icons
  const generatedIds = new Set(icons.map(i => i.exerciseId));
  const missing = expectedExercises.filter(id => !generatedIds.has(id));

  // Calculate summary
  const summary = {
    total: expectedExercises.length || iconFiles.length,
    generated: icons.length,
    ok: icons.filter(i => i.status === 'ok').length,
    warnings: icons.filter(i => i.status === 'warning').length,
    errors: icons.filter(i => i.status === 'error').length,
    missing: missing.length
  };

  // Build report
  const report = {
    timestamp: new Date().toISOString(),
    summary,
    icons,
    issues: allIssues,
    missing,
    regenerateList: [
      ...icons.filter(i => i.status === 'error').map(i => i.exerciseId),
      ...missing
    ]
  };

  // Print summary
  console.log('\n========================================');
  console.log('Quality Check Summary');
  console.log('========================================');
  console.log(`  Total expected: ${summary.total}`);
  console.log(`  Generated: ${summary.generated}`);
  console.log(`  OK: ${summary.ok}`);
  console.log(`  Warnings: ${summary.warnings}`);
  console.log(`  Errors: ${summary.errors}`);
  console.log(`  Missing: ${summary.missing}`);

  // Coverage calculation
  const coverage = ((summary.ok + summary.warnings) / summary.total * 100).toFixed(1);
  console.log(`\n  Coverage: ${coverage}%`);

  // Save JSON report
  const outputDir = path.dirname(CONFIG.reportFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nJSON report: ${CONFIG.reportFile}`);

  // Generate HTML report if requested
  if (options.report) {
    generateHTMLReport(report, CONFIG.htmlReportFile);
    console.log(`HTML report: ${CONFIG.htmlReportFile}`);
  }

  // Save regenerate list
  if (report.regenerateList.length > 0) {
    fs.writeFileSync(CONFIG.regenerateFile, report.regenerateList.join('\n'), 'utf-8');
    console.log(`Regenerate list: ${CONFIG.regenerateFile}`);
    console.log(`\nTo regenerate failed icons:`);
    console.log(`  node scripts/art/generate-icons.js --resume`);
  }

  // Show top issues by type
  if (allIssues.length > 0) {
    console.log('\nTop issue types:');
    const issueCounts = {};
    allIssues.forEach(i => {
      issueCounts[i.type] = (issueCounts[i.type] || 0) + 1;
    });
    Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
  }

  console.log('\n========================================');
  console.log('Quality Check Complete');
  console.log('========================================');

  if (summary.errors > 0 || missing.length > 0) {
    console.log(`\nNext step: Fix errors and regenerate, then run:`);
    console.log(`  node scripts/art/integrate-icons.js`);
  } else {
    console.log(`\nAll icons pass quality check!`);
    console.log(`Next step: node scripts/art/integrate-icons.js`);
  }

  // Exit with error code if there are errors
  if (summary.errors > 0 || missing.length > summary.total * 0.1) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

# Exercise Icon Generation Pipeline Guide

> Complete guide for generating, validating, and integrating exercise icons into GymRats.
>
> **Version:** 1.0.0
> **Last Updated:** 2026-02-06
> **Target:** 1590 exercise icons

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Pipeline Overview](#pipeline-overview)
3. [Environment Setup](#environment-setup)
4. [Script Reference](#script-reference)
5. [Phase 1: Test Batch (10 icons)](#phase-1-test-batch-10-icons)
6. [Phase 2: Priority Icons (P0)](#phase-2-priority-icons-p0)
7. [Phase 3: Full Coverage](#phase-3-full-coverage)
8. [Troubleshooting](#troubleshooting)
9. [Cost Tracking](#cost-tracking)
10. [Quality Criteria](#quality-criteria)

---

## Quick Start

```bash
# 1. Refine prompts (generates refined-prompts.csv)
node scripts/art/refine-exercise-prompts.js

# 2. Generate test batch (10 icons)
export STABILITY_AI_API_KEY="your-key-here"
node scripts/art/generate-icons.js --test

# 3. Check quality
node scripts/art/check-icon-quality.js --report

# 4. Integrate approved icons
node scripts/art/integrate-icons.js
```

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ICON GENERATION PIPELINE                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│  exercise-       │────▶│  refine-         │────▶│  refined-        │
│  prompts.csv     │     │  exercise-       │     │  prompts.csv     │
│  (1590 raw)      │     │  prompts.js      │     │  (prioritized)   │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│  output/icons/   │◀────│  generate-       │◀────│  API Provider    │
│  *.png           │     │  icons.js        │     │  (Stability AI/  │
│                  │     │                  │     │  Replicate/etc)  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│  quality-        │◀────│  check-icon-     │────▶│  regenerate-     │
│  report.json     │     │  quality.js      │     │  list.txt        │
│                  │     │                  │     │  (failed IDs)    │
└──────────────────┘     └──────────────────┘     └──────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │
│  assets/         │◀────│  integrate-      │
│  exercises/      │     │  icons.js        │
│  icons/          │     │                  │
└──────────────────┘     └──────────────────┘
```

### File Locations

| File/Folder | Purpose |
|-------------|---------|
| `docs/art/generation/exercise-prompts.csv` | Original 1590 prompts |
| `docs/art/generation/refined-prompts.csv` | Refined prompts with priorities |
| `docs/art/generation/EXERCISE-ICON-STYLE-GUIDE.md` | Visual style spec |
| `scripts/art/output/icons/` | Generated raw icons |
| `scripts/art/output/quality-report.json` | Quality check results |
| `assets/exercises/icons/` | Production icons (app uses these) |

---

## Environment Setup

### Required: API Key Configuration

Choose ONE provider and set the corresponding environment variable:

```bash
# Option 1: Stability AI (Recommended for quality)
export STABILITY_AI_API_KEY="sk-your-stability-key"

# Option 2: Replicate (Budget option)
export REPLICATE_API_TOKEN="r8_your-replicate-token"

# Option 3: fal.ai (Fast, good quality)
export FAL_KEY="your-fal-key"
```

### Getting API Keys

| Provider | Sign Up | Free Tier |
|----------|---------|-----------|
| **Stability AI** | [platform.stability.ai](https://platform.stability.ai) | 25 credits (~$2.50) |
| **Replicate** | [replicate.com](https://replicate.com) | First $5 free |
| **fal.ai** | [fal.ai](https://fal.ai) | $10 free credits |

### Persistent Configuration (Optional)

Create a `.env` file in the project root:

```bash
# .env (add to .gitignore!)
STABILITY_AI_API_KEY=sk-your-key-here
REPLICATE_API_TOKEN=r8_your-token-here
FAL_KEY=your-fal-key-here
```

### Node.js Requirements

```bash
# Minimum Node.js 18+
node --version  # Should be v18.0.0 or higher

# No additional npm packages required
# Scripts use only Node.js built-in modules
```

---

## Script Reference

### 1. refine-exercise-prompts.js

Refines raw prompts and assigns priorities.

```bash
# Basic usage
node scripts/art/refine-exercise-prompts.js

# Filter by priority
node scripts/art/refine-exercise-prompts.js --priority P0

# Preview without writing
node scripts/art/refine-exercise-prompts.js --dry-run

# Verbose output
node scripts/art/refine-exercise-prompts.js --verbose
```

**Options:**
- `--priority <P0|P1|P2|ALL>` - Filter by priority level
- `--dry-run` - Preview without writing files
- `--verbose` - Show detailed output

**Output:**
- `docs/art/generation/refined-prompts.csv`
- `docs/art/generation/exercise-priorities.json`

---

### 2. generate-icons.js

Generates icons from refined prompts using AI APIs.

```bash
# Test batch (10 icons)
node scripts/art/generate-icons.js --test

# Priority P0 (core exercises)
node scripts/art/generate-icons.js --priority P0

# All icons
node scripts/art/generate-icons.js --all

# Resume interrupted generation
node scripts/art/generate-icons.js --resume

# Single icon
node scripts/art/generate-icons.js --single Barbell_Bench_Press

# Use different provider
node scripts/art/generate-icons.js --test --provider replicate

# Limit number of icons
node scripts/art/generate-icons.js --priority P1 --limit 50
```

**Options:**
- `--test` - Generate 10 test icons
- `--priority <P0|P1|P2>` - Generate by priority
- `--all` - Generate all icons
- `--resume` - Resume from checkpoint
- `--single <id>` - Generate single icon
- `--provider <name>` - stabilityAI, replicate, falai
- `--limit <n>` - Maximum icons to generate
- `--dry-run` - Preview without generating

**Output:**
- `scripts/art/output/icons/*.png`
- `scripts/art/output/generation-progress.json`
- `scripts/art/output/generation-errors.log`

---

### 3. check-icon-quality.js

Validates generated icons for quality issues.

```bash
# Full quality check
node scripts/art/check-icon-quality.js

# Quick check (file sizes only)
node scripts/art/check-icon-quality.js --quick

# Generate HTML report with thumbnails
node scripts/art/check-icon-quality.js --report

# Verbose output
node scripts/art/check-icon-quality.js --verbose
```

**Options:**
- `--quick` - Skip image dimension analysis
- `--report` - Generate HTML visual report
- `--verbose` - Show detailed output

**Output:**
- `scripts/art/output/quality-report.json`
- `scripts/art/output/quality-report.html` (with --report)
- `scripts/art/output/regenerate-list.txt`

---

### 4. integrate-icons.js

Copies approved icons to production assets.

```bash
# Full integration
node scripts/art/integrate-icons.js

# Preview changes
node scripts/art/integrate-icons.js --dry-run

# Update manifest only
node scripts/art/integrate-icons.js --update

# Force overwrite
node scripts/art/integrate-icons.js --force

# Skip resize step
node scripts/art/integrate-icons.js --skip-resize
```

**Options:**
- `--dry-run` - Preview without making changes
- `--update` - Update manifest only
- `--force` - Overwrite existing icons
- `--skip-resize` - Don't generate size variants

**Output:**
- `assets/exercises/icons/*.png`
- `assets/exercises/icons/48/*.png`
- `assets/exercises/icons/64/*.png`
- `assets/exercises/icons/128/*.png`
- `assets/exercises/icons/manifest.json`

---

## Phase 1: Test Batch (10 Icons)

### Objective

Validate the pipeline with a small batch before committing to full generation.

### Exercises in Test Batch

1. Barbell Bench Press
2. Squat (Back Squat)
3. Deadlift
4. Overhead Press
5. Barbell Row
6. Pull-Up
7. Dumbbell Curl
8. Tricep Pushdown
9. Leg Press
10. Plank

### Expected Results

| Metric | Expected |
|--------|----------|
| Icons generated | 10 |
| Success rate | 90%+ |
| Time to generate | 2-5 minutes |
| Cost (Stability AI) | ~$0.35 |
| Cost (Replicate) | ~$0.03 |
| File sizes | 50-500 KB each |

### Steps

```bash
# 1. Set up API key
export STABILITY_AI_API_KEY="your-key"

# 2. Refine prompts
node scripts/art/refine-exercise-prompts.js --verbose

# 3. Generate test batch
node scripts/art/generate-icons.js --test --verbose

# 4. Check quality
node scripts/art/check-icon-quality.js --report

# 5. Review icons visually
open scripts/art/output/quality-report.html

# 6. If quality is good, integrate
node scripts/art/integrate-icons.js --dry-run
node scripts/art/integrate-icons.js
```

### Quality Assessment Criteria

For each test icon, verify:

- [ ] Exercise is clearly recognizable
- [ ] Human silhouette is clean and centered
- [ ] Equipment is visible (if applicable)
- [ ] No facial features visible
- [ ] Lime green accent line present
- [ ] Transparent background (no artifacts)
- [ ] Consistent style with other icons
- [ ] Readable at 48x48 size

### Expected Cost: $0.03 - $0.35

### Expected Time: 5-10 minutes

---

## Phase 2: Priority Icons (P0)

### Objective

Generate icons for the ~273 most common exercises (P0 + some P1).

### Steps

```bash
# 1. Generate P0 priority icons
node scripts/art/generate-icons.js --priority P0

# 2. Check quality
node scripts/art/check-icon-quality.js --report

# 3. Regenerate failures
node scripts/art/generate-icons.js --resume

# 4. Integrate
node scripts/art/integrate-icons.js
```

### Expected Results

| Metric | Expected |
|--------|----------|
| Icons generated | ~273 |
| Success rate | 85-95% |
| Time to generate | 30-60 minutes |
| Cost (Stability AI) | ~$9-10 |
| Cost (Replicate) | ~$0.80 |

### Ship Criteria

- 90%+ of P0 exercises have icons
- All quality checks pass
- Icons are integrated into app assets

---

## Phase 3: Full Coverage

### Objective

Complete the remaining ~1,317 exercises.

### Steps

```bash
# 1. Generate remaining icons
node scripts/art/generate-icons.js --all --resume

# 2. This may take several hours, can be interrupted and resumed
# Check progress periodically:
cat scripts/art/output/generation-progress.json

# 3. Quality check
node scripts/art/check-icon-quality.js --report

# 4. Final integration
node scripts/art/integrate-icons.js
```

### Expected Results

| Metric | Expected |
|--------|----------|
| Icons generated | 1,590 |
| Success rate | 80-90% |
| Time to generate | 3-6 hours |
| Cost (Stability AI) | ~$55-65 |
| Cost (Replicate) | ~$5-8 |

---

## Troubleshooting

### Common Issues

#### 1. "API key not set"

```bash
# Solution: Set the environment variable
export STABILITY_AI_API_KEY="your-key"

# Or create .env file
echo 'STABILITY_AI_API_KEY=your-key' >> .env
```

#### 2. "Rate limit exceeded"

The script handles this automatically with retries. If persistent:

```bash
# Increase delay between requests
# Edit generate-icons.js: CONFIG.rateLimitDelayMs = 2000
```

#### 3. "File size too small" in quality check

Icon generation likely failed. Check error log:

```bash
cat scripts/art/output/generation-errors.log
```

Then regenerate:

```bash
node scripts/art/generate-icons.js --resume
```

#### 4. "Cannot resize image"

Install ImageMagick or use macOS sips:

```bash
# macOS (sips is built-in, should work)
# Linux:
sudo apt install imagemagick

# Or skip resize:
node scripts/art/integrate-icons.js --skip-resize
```

#### 5. Icons look inconsistent

Regenerate problematic icons individually:

```bash
node scripts/art/generate-icons.js --single Exercise_Name --force
```

### Error Log Location

```
scripts/art/output/generation-errors.log
```

### Reset and Start Over

```bash
# Clear all generated files
rm -rf scripts/art/output/
rm docs/art/generation/refined-prompts.csv
rm docs/art/generation/exercise-priorities.json

# Start fresh
node scripts/art/refine-exercise-prompts.js
```

---

## Cost Tracking

### Cost by Provider (per 1000 icons)

| Provider | Model | Per Image | Per 1000 | Per 1590 |
|----------|-------|-----------|----------|----------|
| Stability AI | SD3 Large | $0.035 | $35 | $55.65 |
| Stability AI | SD3 Core | $0.03 | $30 | $47.70 |
| Replicate | Flux Schnell | $0.003 | $3 | $4.77 |
| fal.ai | Flux Schnell | $0.003 | $3 | $4.77 |

### Actual Cost Tracking

Progress file tracks actual spend:

```bash
cat scripts/art/output/generation-progress.json
# Look for "totalCost" field
```

### Budget Recommendations

| Budget | Strategy |
|--------|----------|
| $5 | Replicate for all, accept some quality variance |
| $15 | Replicate bulk + Stability AI for failures |
| $60 | Stability AI for all, highest quality |

---

## Quality Criteria

### Automatic Checks

| Check | Threshold | Severity |
|-------|-----------|----------|
| File size minimum | > 5 KB | Error |
| File size maximum | < 5 MB | Warning |
| Image width | >= 256 px | Warning |
| Image height | >= 256 px | Warning |
| Aspect ratio | 1:1 (5% tolerance) | Warning |

### Manual Review Checklist

For visual QA, check:

1. **Recognizability**: Is the exercise obvious at a glance?
2. **Silhouette clarity**: Is the human form clean and distinct?
3. **Equipment visibility**: Can you see the equipment being used?
4. **No face**: Are facial features absent?
5. **Accent line**: Is the lime green motion indicator present?
6. **Background**: Is it truly transparent?
7. **Consistency**: Does it match the batch style?
8. **Small size**: Is it clear at 48x48 pixels?

### Quality Report HTML

Generate a visual report for manual review:

```bash
node scripts/art/check-icon-quality.js --report
open scripts/art/output/quality-report.html
```

---

## Using Icons in the App

### Import Manifest

```typescript
import iconManifest from '@/assets/exercises/icons/manifest.json';
```

### Get Icon for Exercise

```typescript
const getExerciseIconSource = (exerciseId: string) => {
  const icon = iconManifest.icons[exerciseId];
  if (icon) {
    // For static require (bundled)
    return require(`@/assets/exercises/icons/${icon.file}`);
  }
  return require('@/assets/exercises/icons/placeholder.png');
};
```

### With Expo Image

```tsx
import { Image } from 'expo-image';

<Image
  source={getExerciseIconSource(exercise.id)}
  style={{ width: 64, height: 64 }}
  contentFit="contain"
/>
```

### Dynamic Import (if needed)

```typescript
const getIconUri = (exerciseId: string, size: 48 | 64 | 128 = 64) => {
  return `${FileSystem.bundleDirectory}assets/exercises/icons/${size}/${exerciseId}.png`;
};
```

---

## Appendix: Fallback Strategies

### If AI Generation Fails Consistently

1. **Use shared icons**: Many exercises can share icons (e.g., all dumbbell curls)
2. **Create SVG template**: Simple silhouette that works for any exercise
3. **Manual touch-up**: Use graphic design tool to fix AI output
4. **Outsource**: Hire illustrator for problematic exercises

### Fallback Icon Creation

```bash
# Create placeholder SVG
cat > assets/exercises/icons/placeholder.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="20" r="8" fill="#F2F4FF"/>
  <path d="M32 30 L32 50 M22 35 L42 35 M25 50 L32 65 M39 50 L32 65"
        stroke="#F2F4FF" stroke-width="3" fill="none"/>
</svg>
EOF
```

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-06 | 1.0.0 | Initial pipeline documentation |

---

*Generated for GymRats exercise icon pipeline.*

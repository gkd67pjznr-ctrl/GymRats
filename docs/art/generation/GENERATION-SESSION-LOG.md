# Art Generation Session Log

> Track all art generation work sessions. Updated each time `/run-prompt 019` is executed.
>
> **Created:** 2026-02-06
> **Last Session:** 2026-02-07

---

## Quick Reference

| Metric | Value |
|--------|-------|
| Total Sessions | 3 |
| Total Assets Generated | ~1,500+ (v1+v2 batches) + 4 Recraft accepted |
| Hours Invested | ~5 |
| Current Phase | Recraft API Testing |

---

## Session History

<!-- Sessions will be added here in reverse chronological order -->

## Session 3: 2026-02-07
**Duration:** ~2 hours
**Phase:** Full Generation + Paid Service Testing
**Category:** Content Generation

### Accomplished
- ✅ Generated full v1 icon set (839 icons) - SDXL-Turbo without ControlNet
- ✅ Created 14 SVG stick figure poses for ControlNet guidance
  - stand_bb, stand_db, squat_bb, lying_bb, pullup, pushup, hinge_bb, dip, plank, seat_machine, legpress, row_bent, olympic, farmer
- ✅ Converted SVG poses to PNG for ControlNet input
- ✅ Generated full v2 icon set (637 icons) - SDXL-Turbo WITH ControlNet
- ✅ Set up Recraft API ($10 loaded)
- ✅ Tested digital_illustration style ($0.04/image)
- ✅ Tested vector_illustration style ($0.08/image, returns actual SVG!)
- ✅ Found winning prompts for core exercises
- ✅ Reorganized exercise-master-list.md by primary muscle → equipment → alphabetical

### Winning Recraft Configuration
```
API: https://external.api.recraft.ai/v1/images/generations
Style: digital_illustration (or vector_illustration for SVG)
Model: recraftv3
Size: 1024x1024
```

### Winning Prompts (Recraft)
- **Squat:** "fitness icon, black silhouette of person doing barbell back squat, barbell resting across upper back and shoulders, knees bent in squat position, thin lime green accent line on barbell, white background, simple flat design"
- **Deadlift:** "fitness icon, black silhouette of person doing conventional deadlift, bent at hips gripping barbell, thin lime green accent line on barbell, white background, simple flat design"
- **Bench Press:** "black silhouette of one person lying on bench, pushing one barbell straight up with both arms, flat bench press exercise, side profile view"
- **Barbell Row:** "black silhouette of one person bent forward at waist, pulling one barbell up toward stomach, bent over row exercise, side profile view"

### Accepted Icons (4)
Location: `docs/art/recraft-test/accepted/`
- squat_01.png ✅
- deadlift_v2.png ✅
- bench_press_v3.png ✅
- barbell_row_v3.png ✅

### Still Needs Work
- overhead_press (green swoosh instead of equipment accent)

### Local Generation Notes
- v1 batch (no ControlNet): Inconsistent poses, multiple equipment issues
- v2 batch (ControlNet): Better consistency but still "goofy"
- Best local settings: CFG 1.5, ControlNet strength 0.6
- Decision: Use Recraft for final production icons

### File Locations
- v1 icons: `docs/art/icons-v1/` (839 files)
- v2 icons: `docs/art/icons-v2/` (637 files)
- Recraft tests: `docs/art/recraft-test/`
- Accepted finals: `docs/art/recraft-test/accepted/`
- Pose templates: `docs/art/poses/`

### Next Session
- Iterate overhead_press until accepted
- Generate remaining top 50 P0 exercises with Recraft
- Consider vector_illustration for scalable SVG output
- Begin batch generation once all 5 core exercises approved

---

## Session 2: 2026-02-06
**Duration:** ~1 hour
**Phase:** Local Generation Testing + Database Cleanup
**Category:** Content Generation + Data Management

### Accomplished
- ✅ SDXL-Turbo download complete (6.5GB)
- ✅ ComfyUI local generation working with MPS (Metal) GPU
- ✅ Generated 29 test icons locally covering core exercises
- ✅ ControlNet OpenPose model downloaded (5GB) for pose-guided generation
- ✅ Exercise database cleaned: 1,590 → 637 exercises
- ✅ Updated all documentation with new exercise counts
- ✅ Regenerated exercise-prompts.csv (637 prompts)
- ✅ Updated P0/P1/P2 priority lists (318/173/146)
- ✅ Synced 99 exercise name changes to prompts

### Quality Notes
- Local generation produces "goofy but usable" silhouette icons
- Style is consistent - minimalist dark silhouettes on white
- Some anatomical issues (extra barbells, wrong poses) but recognizable
- User interested in embracing surreal AI aesthetic rather than chasing perfection
- Best results: bench press, pullup, bicep curl

### Generated Icons
Location: `/Users/tmac/ComfyUI-stable/output/`
- bench_press, squat, deadlift, pullup, ohp
- bicep_curl, barbell_row, lat_pulldown, tricep_pushdown
- lunge, leg_press, leg_curl, leg_extension
- plank, crunch, cable_fly, face_pull, dumbbell_row
- Plus multiple v2/v3/v4 variations

### Database Changes
| Metric | Before | After |
|--------|--------|-------|
| Total exercises | 1,590 | 637 |
| P0 (Critical) | 273 | 318 |
| P1 (Important) | 685 | 173 |
| P2 (Nice to Have) | 632 | 146 |

### Next Session
- Test ControlNet OpenPose for consistent poses
- Generate batch of P0 icons with best prompts
- Move generated icons to app assets folder
- Integrate icons into exercise picker UI

---

## Session 1: 2026-02-06
**Duration:** ~1 hour
**Phase:** Setup
**Category:** Pipeline Configuration

### Accomplished
- ✅ Configured fal.ai API key in `.env`
- ✅ Fixed fal.ai endpoint in generate-icons.js (was using queue endpoint, needed sync endpoint)
- ✅ Generated first test icon: `Barbell_Deadlift.png` (18KB)
- ✅ Installed ComfyUI v0.3.10 for local generation
- ✅ Created Python 3.13 venv with all dependencies
- ✅ ComfyUI running on http://127.0.0.1:8188
- 🔄 Downloading SDXL-Turbo model (~6GB) for local generation

### Quality Notes
- First generated icon is functional but needs prompt refinement:
  - Missing lime accent line
  - Background not transparent (gray instead of transparent)
  - Silhouette too light (should be #1A1A1A)
- Will need to update prompts in refined-prompts.csv

### Issues
- fal.ai initial 403 error (needed to add credits - $10 added)
- fal.ai 405 error (fixed by changing endpoint from queue to sync)
- ComfyUI latest version has unreleased dependencies (comfy-kitchen, comfy-aimdo)
- Switched to ComfyUI v0.3.10 stable release

### Tools Configured
| Tool | Status | Location |
|------|--------|----------|
| fal.ai API | ✅ Working | FAL_KEY in .env |
| ComfyUI | ✅ Running | /Users/tmac/ComfyUI-stable |
| SDXL-Turbo | 🔄 Downloading | models/checkpoints/ |

### Next Session
- Complete SDXL-Turbo download
- Test local generation with ComfyUI
- Refine prompts for better icon style (darker silhouette, lime accent, transparent bg)
- Generate test batch of 10 P0 icons
- Compare fal.ai vs local quality

---

## Notes

- Each session entry should include: date, duration, what was accomplished, issues, and next steps
- This log is read by the art generation executor prompt to resume where you left off
- Commit this file after each session

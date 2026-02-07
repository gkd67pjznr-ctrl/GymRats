# GymRats Art Asset Master Tracker

> **THE source of truth** for all art assets across the GymRats app.
>
> **Last Updated:** 2026-02-07
> **Version:** 1.1
> **Status:** Generation In Progress - Recraft API Testing

---

## Quick Stats

| Metric | Count |
|--------|-------|
| **Total Assets Needed** | 2,010 |
| **P0 (Launch Blockers)** | 509 |
| **P1 (Launch Nice-to-Have)** | 729 |
| **P2 (Post-Launch)** | 772 |
| **Generated (Draft)** | ~1,500 (local batches) |
| **Accepted (Final)** | 4 (Recraft) |
| **Remaining** | 2,006 |

---

## Executive Summary

### Current Status

- **Research:** COMPLETE - Tools and costs documented in `AI-IMAGE-GEN-RESEARCH.md`
- **Prompts:** COMPLETE - All 2,010 prompts ready in CSV files
- **Pipeline:** IN PROGRESS - ComfyUI local + Recraft API configured
- **Generation:** IN PROGRESS - Testing Recraft for production quality
  - Local batches: v1 (839) + v2 (637) generated for reference
  - Recraft accepted: 4 icons (squat, deadlift, bench_press, barbell_row)
  - Remaining to validate: overhead_press, then top 50

### Immediate Next Actions

1. **Set up generation pipeline** (1-2 hours)
   - Install Stability AI MCP or DiffuGen local
   - Test with 10 sample icons

2. **Generate P0 Exercise Icons** (24-48 hours)
   - 273 critical exercise icons
   - Batch process via CSV

3. **Generate P0 Avatar Assets** (8-12 hours)
   - 20 base bodies + 6 skin tones + 8 faces = 34 core assets

### Budget Summary

| Priority | Assets | Est. Cost (Local) | Est. Cost (API) |
|----------|--------|-------------------|-----------------|
| P0 | 509 | $0 + ~$5 electricity | ~$25 |
| P1 | 729 | $0 + ~$5 electricity | ~$35 |
| P2 | 772 | $0 + ~$5 electricity | ~$40 |
| **Total** | **2,010** | **~$15** | **~$100** |

**Recommended approach:** Local DiffuGen ($0) with API fallback for quality issues (~$10-20 budget for fixes)

---

## Asset Inventory

### Category 1: Exercise Icons

**Source:** `docs/art/generation/exercise-prompts.csv`

| Priority | Count | Description | Status |
|----------|-------|-------------|--------|
| P0 - Critical | 318 | Core gym movements (bench, squat, deadlift, etc.) | 4 Accepted, Testing |
| P1 - Important | 173 | Popular exercises | Drafts Ready |
| P2 - Nice to Have | 146 | Less common exercises | Drafts Ready |
| **Total** | **637** | | |

**Specifications:**
- Format: PNG
- Size: 256x256 (exported to 128, 64, 48)
- Style: Minimal silhouette with lime accent line
- Background: Transparent

**Style Guide:** `docs/art/generation/EXERCISE-ICON-STYLE-GUIDE.md`

---

### Category 2: UI Elements

**Source:** `docs/art/generation/ui-asset-prompts.csv` and `docs/art/UI-ASSET-INVENTORY.md`

#### Borders & Frames (13 items)

| Asset ID | Priority | Status | Notes |
|----------|----------|--------|-------|
| `card-border-standard` | P0 | **DONE** | Code-based (View) |
| `card-border-premium` | P2 | Needed | Grayscale SVG + tint |
| `card-border-legendary` | P3 | Needed | Theme-specific variants (~3) |
| `achievement-frame-standard` | P1 | Needed | Tintable SVG |
| `achievement-frame-gold` | P1 | Needed | Fixed gold color SVG |
| `pr-celebration-frame` | P1 | Needed | Code + Lottie |
| `rank-badge-border-iron` | P1 | Needed | Fixed color SVG |
| `rank-badge-border-bronze` | P1 | Needed | Fixed color SVG |
| `rank-badge-border-silver` | P1 | Needed | Fixed color SVG |
| `rank-badge-border-gold` | P1 | Needed | Fixed color SVG |
| `rank-badge-border-platinum` | P1 | Needed | Fixed color SVG |
| `rank-badge-border-diamond` | P1 | Needed | Fixed color SVG |
| `rank-badge-border-mythic` | P1 | Needed | Grayscale + theme tint |

**Subtotal: 11 needed** (2 already done via code)

#### Backgrounds (8 items)

| Asset ID | Priority | Status | Notes |
|----------|----------|--------|-------|
| `card-bg-default` | P0 | **DONE** | Code-based |
| `card-bg-texture-noise` | P2 | Needed | PNG grayscale overlay |
| `modal-bg-blur` | P0 | **DONE** | expo-blur |
| `modal-bg-gradient` | P1 | Needed | Code (LinearGradient) |
| `celebration-overlay-confetti` | P1 | Needed | Lottie |
| `celebration-overlay-particles` | P2 | Needed | Code (Reanimated) |
| `gradient-mesh-hero` | P3 | Needed | PNG per theme (~6) |
| `gradient-mesh-card` | P2 | Needed | Code (LinearGradient) |

**Subtotal: 4 needed** (rest are code-based)

#### Effects & Particles (10 items)

| Asset ID | Priority | Status | Notes |
|----------|----------|--------|-------|
| `glow-soft` | P1 | **DONE** | Code (shadow) |
| `glow-accent` | P1 | **DONE** | Code (shadow) |
| `particle-confetti` | P2 | Needed | Code (Reanimated) |
| `particle-confetti-sprite` | P3 | Optional | PNG 8x8 |
| `particle-star-sprite` | P2 | Needed | SVG 16x16 |
| `particle-ember-sprite` | P2 | Needed | SVG 16x16 |
| `particle-spark-sprite` | P2 | Needed | SVG 16x16 |
| `sparkle-animation` | P2 | Needed | Lottie |
| `shine-sweep` | P3 | Needed | Lottie |
| `progress-ring` | P0 | **DONE** | Code (SVG) |
| `progress-bar-fill` | P0 | **DONE** | Code (Animated.View) |

**Subtotal: 6 needed**

#### UI Summary

| Category | Total | Code-Based | Needed |
|----------|-------|------------|--------|
| Borders/Frames | 13 | 2 | 11 |
| Backgrounds | 8 | 4 | 4 |
| Effects | 10 | 4 | 6 |
| Buttons | 8 | 8 | 0 |
| **Total** | **39** | **18** | **21** |

---

### Category 3: Celebration Assets

**Source:** `docs/art/UI-ASSET-INVENTORY.md`

| Asset ID | Type | Priority | Status | Notes |
|----------|------|----------|--------|-------|
| `pr-badge-weight` | SVG | P0 | Needed | Weight PR indicator, tintable |
| `pr-badge-rep` | SVG | P0 | Needed | Rep PR indicator, tintable |
| `pr-badge-e1rm` | SVG | P0 | Needed | e1RM PR indicator, tintable |
| `rank-up-badge` | SVG | P1 | Needed | 7 variants (Iron-Mythic) |
| `streak-badge` | SVG | P2 | Needed | Streak milestone badge |
| `level-up-burst` | Lottie | P1 | Needed | XP level-up animation |
| `workout-complete-check` | Lottie | P1 | Needed | Completion animation |
| `confetti-burst` | Lottie | P1 | Needed | Generic celebration burst |
| `rank-glow-reveal` | Lottie | P2 | Needed | 7 tier variants |

**Total: 23 assets** (counting variants)

---

### Category 4: Avatar System

**Source:** `docs/art/generation/avatar-prompts.csv` and `docs/art/AVATAR-SYSTEM-DESIGN.md`

#### Base Components (34 items - P0)

| Category | Count | Variants | Total PNGs | Priority |
|----------|-------|----------|------------|----------|
| Base Bodies | 4 types | 5 stages each | 20 | P0 |
| Skin Tones | 6 tones | 1 each | 6 | P0 |
| Faces | 8 expressions | 1 each | 8 | P0 |
| **Subtotal** | | | **34** | |

#### Hair Styles (67 items - P0)

| Style | Colors | Total |
|-------|--------|-------|
| Short Straight | 6 | 6 |
| Short Curly | 6 | 6 |
| Medium Wavy | 6 | 6 |
| Long Straight | 6 | 6 |
| Ponytail | 6 | 6 |
| Bun | 6 | 6 |
| Buzz Cut | 6 | 6 |
| Fade | 6 | 6 |
| Braids | 6 | 6 |
| Afro | 6 | 6 |
| Undercut | 6 | 6 |
| Bald | 1 | 1 |
| **Subtotal** | | **67** |

#### Outfits (72 items - P0)

| Category | Items | Color Variants | Total |
|----------|-------|----------------|-------|
| Tops | 10 | 4 | 40 |
| Bottoms | 8 | 4 | 32 |
| **Subtotal** | | | **72** |

#### Footwear (10 items - P0)

| Type | Color Variants | Total |
|------|----------------|-------|
| Sneakers | 3 | 3 |
| Trainers | 3 | 3 |
| Lifting Shoes | 3 | 3 |
| Barefoot | 1 | 1 |
| **Subtotal** | | **10** |

#### Accessories (12 items - P1)

| Item | Variants | Priority |
|------|----------|----------|
| Headband | 2 | P1 |
| Wristbands | 2 | P1 |
| Lifting Belt | 2 | P1 |
| Baseball Cap | 2 | P1 |
| Lifting Straps | 2 | P1 |
| Knee Sleeves | 2 | P1 |
| **Subtotal** | **12** | |

#### Effects (8 items - P2)

| Effect | Variants | Priority |
|--------|----------|----------|
| Aura (rank-based) | 5 | P2 |
| Particles | 2 | P2 |
| Glow | 1 | P2 |
| **Subtotal** | **8** | |

#### Avatar Summary

| Category | P0 | P1 | P2 | Total |
|----------|----|----|-----|-------|
| Base Bodies | 20 | 0 | 0 | 20 |
| Skin Tones | 6 | 0 | 0 | 6 |
| Faces | 8 | 0 | 0 | 8 |
| Hair | 67 | 0 | 0 | 67 |
| Tops | 40 | 0 | 0 | 40 |
| Bottoms | 32 | 0 | 0 | 32 |
| Footwear | 10 | 0 | 0 | 10 |
| Accessories | 0 | 12 | 0 | 12 |
| Effects | 0 | 0 | 8 | 8 |
| **Total** | **183** | **12** | **8** | **203** |

---

### Category 5: Theme Assets

**Source:** `docs/art/themes/`

| Asset Type | Per Theme | Themes | Total | Priority |
|------------|-----------|--------|-------|----------|
| Theme Preview Card | 1 | 6 | 6 | P2 |
| Gradient Mesh Hero | 1 | 6 | 6 | P3 |
| Legendary Border | 1 | 3 | 3 | P3 |
| Theme Particles | 2 | 4 | 8 | P2 |
| **Total** | | | **23** | |

Current themes:
- Toxic Energy (Free - default)
- Iron Forge (Free)
- Neon Glow (Premium)
- Infernal Cosmos (Premium)
- Midnight Ice (Planned)
- Royal Chrome (Planned)

---

### Category 6: Future (Post-Launch)

**Source:** `docs/art/AVATAR-SYSTEM-DESIGN.md` - Hangout Room section

These are documented for future reference but NOT prioritized for launch.

#### Hangout Room Assets (Estimated)

| Category | Items | Notes |
|----------|-------|-------|
| Room Backgrounds | 5 | Basic Gym, Home Gym, Pro Gym, Champion Arena, Legendary Hall |
| Furniture | ~20 | Benches, racks, mirrors, etc. |
| Equipment Decorations | ~15 | Dumbbells, barbells, kettlebells |
| Trophy Displays | ~10 | Achievement showcases |
| Lighting Effects | ~5 | Neon signs, spotlights |
| Plants/Decorations | ~10 | Various aesthetic items |
| **Subtotal** | **~65** | |

#### Exercise Animations (Future)

| Type | Estimated Count | Notes |
|------|-----------------|-------|
| Animated exercise demos | ~50 | Top exercises only |
| Video loops | ~50 | Alternative to animations |
| **Subtotal** | **~50-100** | |

#### Seasonal Items (Future)

| Season | Items | Notes |
|--------|-------|-------|
| Holiday | ~10 | Santa hat, reindeer headband, etc. |
| Summer | ~10 | Beach gear, sunglasses |
| Halloween | ~10 | Costumes, spooky effects |
| **Subtotal** | **~30** | |

**Total Future Assets: ~145-195** (not included in main count)

---

## Priority Matrix

### P0 - LAUNCH BLOCKERS (509 assets)

Must have for v1.0 launch. Without these, the app feels incomplete.

| Category | Count | Est. Cost | Est. Time |
|----------|-------|-----------|-----------|
| Exercise Icons (Top 318) | 318 | $13-25 (Recraft) | 8-16 hrs |
| PR Badges (3) | 3 | $0.15 | 10 min |
| Avatar Base (20 bodies) | 20 | $0-1 | 2 hrs |
| Avatar Skins (6) | 6 | $0-0.30 | 30 min |
| Avatar Faces (8) | 8 | $0-0.40 | 30 min |
| Avatar Hair (67) | 67 | $0-3.50 | 4 hrs |
| Avatar Tops (40) | 40 | $0-2 | 3 hrs |
| Avatar Bottoms (32) | 32 | $0-1.60 | 2 hrs |
| Avatar Footwear (10) | 10 | $0-0.50 | 1 hr |
| UI Elements (code-based) | 18 | $0 | Already done |
| **Total P0** | **509** | **$0-25** | **~40 hrs** |

### P1 - LAUNCH NICE-TO-HAVE (729 assets)

Improves launch quality but app is functional without them.

| Category | Count | Est. Cost | Est. Time |
|----------|-------|-----------|-----------|
| Exercise Icons (Remaining P1) | 173 | $7-14 (Recraft) | 4-8 hrs |
| Rank Badge Borders (7) | 7 | $0.35 | 30 min |
| Achievement Frames (2) | 2 | $0.10 | 10 min |
| Rank-up Badge Variants (7) | 7 | $0.35 | 30 min |
| Lottie Animations (4) | 4 | $2-20 | 2-8 hrs |
| Avatar Accessories (12) | 12 | $0-0.60 | 1 hr |
| Particle Star Sprite (1) | 1 | $0.05 | 5 min |
| **Total P1** | **729** | **$3-60** | **~60 hrs** |

### P2 - POST-LAUNCH (772 assets)

Can ship after launch. Polish and expansion content.

| Category | Count | Est. Cost | Est. Time |
|----------|-------|-----------|-----------|
| Exercise Icons (P2) | 146 | $6-12 (Recraft) | 3-6 hrs |
| Avatar Effects (8) | 8 | $0-0.40 | 1 hr |
| Avatar Growth Stages (extended) | 0 | - | - |
| Theme Preview Cards (6) | 6 | $0-0.30 | 30 min |
| Theme Particles (8) | 8 | $0-0.40 | 30 min |
| Rank Glow Reveals (7) | 7 | $3-30 | 2-6 hrs |
| Background Textures (2) | 2 | $0.10 | 10 min |
| Particle Sprites (3) | 3 | $0.15 | 15 min |
| Streak Badge (1) | 1 | $0.05 | 5 min |
| Premium UI Elements (5) | 5 | $0.25 | 15 min |
| **Total P2** | **772** | **$4-65** | **~55 hrs** |

---

## Cost & Time Projections

### Detailed Cost Breakdown

#### Option A: Full Local Generation (Recommended)

| Phase | Assets | Tool | Cost | Time |
|-------|--------|------|------|------|
| P0 Icons | 273 | DiffuGen | $0 | 24 hrs |
| P0 Avatar | 183 | DiffuGen | $0 | 12 hrs |
| P0 UI | 3 | DiffuGen | $0 | 1 hr |
| P1 Icons | 685 | DiffuGen | $0 | 48 hrs |
| P1 Other | 44 | DiffuGen | $0 | 4 hrs |
| P2 All | 772 | DiffuGen | $0 | 60 hrs |
| Electricity | - | - | ~$15 | - |
| **Total** | **2,010** | | **~$15** | **~150 hrs** |

**Notes:**
- Time is generation time (mostly unattended)
- Actual human time: ~20-30 hrs for review/fixes
- Requires 8GB+ VRAM GPU

#### Option B: Hybrid (Local + API Fallback)

| Phase | Assets | Tool | Cost | Time |
|-------|--------|------|------|------|
| P0 Test | 50 | Stability AI | $2.50 | 1 hr |
| P0 Bulk | 459 | DiffuGen | $0 | 36 hrs |
| P0 Fixes | ~50 | fal.ai | $2.50 | 1 hr |
| P1 Bulk | 729 | DiffuGen | $0 | 52 hrs |
| P1 Fixes | ~75 | fal.ai | $3.75 | 2 hrs |
| P2 Bulk | 772 | DiffuGen | $0 | 60 hrs |
| P2 Fixes | ~80 | fal.ai | $4 | 2 hrs |
| **Total** | **2,010** | | **~$15-25** | **~155 hrs** |

**Notes:**
- Best balance of cost and quality
- API used for test validation and fixing failed generations
- Estimated 10% regeneration rate

#### Option C: Full API (Speed Priority)

| Phase | Assets | Tool | Cost | Time |
|-------|--------|------|------|------|
| All Icons | 637 | fal.ai Flux | ~$80 | 8 hrs |
| All Avatar | 203 | Stability AI | ~$10 | 3 hrs |
| All UI | 44 | Stability AI | ~$2.50 | 1 hr |
| All Celebrations | 23 | Stability AI | ~$1.50 | 30 min |
| All Theme | 23 | Stability AI | ~$1.50 | 30 min |
| **Total** | **2,010** | | **~$100** | **~13 hrs** |

**Notes:**
- Fastest option
- Best for tight deadlines
- Still need human review time (~10 hrs)

### Lottie Animation Costs

Lottie animations require separate consideration:

| Animation | Options | Est. Cost |
|-----------|---------|-----------|
| level-up-burst | LottieFiles purchase | $5-15 |
| workout-complete-check | LottieFiles purchase | $5-15 |
| confetti-burst | LottieFiles purchase | $5-15 |
| rank-glow-reveal (7) | Custom or LottieFiles | $20-50 |
| sparkle-animation | LottieFiles purchase | $5-10 |
| shine-sweep | LottieFiles purchase | $5-10 |

**Total Lottie Budget: $45-115**

**Alternative:** Use free LottieFiles or create with Haiku Animator (free)

---

## Generation Pipeline Status

### Tools Setup

| Tool | Status | Purpose | Notes |
|------|--------|---------|-------|
| ComfyUI | ✅ Working | Local generation | v0.3.10 at /Users/tmac/ComfyUI-stable |
| SDXL-Turbo | ✅ Installed | Fast local model | 6.5GB, good for drafts |
| ControlNet OpenPose | ✅ Installed | Pose-guided generation | 5GB, improves consistency |
| Recraft API | ✅ Configured | Production quality | $10 loaded, $0.04-0.08/image |
| fal.ai | ✅ Configured | Fast cloud fallback | $10 loaded |
| DiffuGen | Not Installed | Bulk local generation | May not need with Recraft |
| Stability AI MCP | Not Configured | Alternative API | Recraft preferred |

### MCP Configuration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "stability-ai": {
      "command": "npx",
      "args": ["-y", "mcp-server-stability-ai"],
      "env": {
        "STABILITY_AI_API_KEY": "YOUR_KEY"
      }
    }
  }
}
```

### File Organization

```
assets/
├── exercise-icons/
│   ├── raw/              # Original 256x256 generations
│   ├── reviewed/         # QA-passed icons
│   ├── rejected/         # Failed quality check
│   ├── 128/              # Scaled exports
│   ├── 64/               # Scaled exports
│   └── 48/               # Scaled exports
├── avatar/
│   ├── bodies/
│   ├── skins/
│   ├── faces/
│   ├── hair/
│   ├── tops/
│   ├── bottoms/
│   ├── footwear/
│   ├── accessories/
│   └── effects/
├── ui/
│   ├── borders/
│   ├── backgrounds/
│   ├── effects/
│   └── celebrations/
└── animations/
    └── lottie/
```

---

## Action Plan

### Week 1: Setup & Test

**Goal:** Validate pipeline, generate first 50 P0 icons

| Day | Task | Output |
|-----|------|--------|
| Day 1 | Install DiffuGen or configure Stability AI MCP | Working generation tool |
| Day 2 | Generate 10 test icons, validate style | 10 test icons reviewed |
| Day 3 | Adjust prompts if needed, generate 40 more | 50 P0 icons |
| Day 4 | Review quality, document issues | Quality report |
| Day 5 | Begin bulk P0 icon generation | Batch running |

**Milestone:** 50 validated P0 exercise icons

### Week 2: P0 Icons & Avatar Core

**Goal:** Complete all P0 icons, start avatar base

| Day | Task | Output |
|-----|------|--------|
| Day 1-2 | Continue P0 icon batch (223 remaining) | 273 total icons |
| Day 3 | Generate avatar bodies (20) | 20 body PNGs |
| Day 4 | Generate avatar skins (6) + faces (8) | 14 PNGs |
| Day 5 | Review all P0 icons, regenerate failed | QA complete |

**Milestone:** All P0 exercise icons + avatar base complete

### Week 3: Avatar Clothing

**Goal:** Complete MVP avatar clothing options

| Day | Task | Output |
|-----|------|--------|
| Day 1-2 | Generate hair styles (67) | 67 hair PNGs |
| Day 3 | Generate tops (40) | 40 top PNGs |
| Day 4 | Generate bottoms (32) + footwear (10) | 42 PNGs |
| Day 5 | Integration testing, fix layering issues | Working avatar system |

**Milestone:** MVP avatar system complete

### Week 4: Polish & P1 Start

**Goal:** Complete P0, begin P1

| Day | Task | Output |
|-----|------|--------|
| Day 1 | Generate PR badges (3) | 3 SVGs |
| Day 2 | Final P0 quality review | All P0 signed off |
| Day 3-5 | Begin P1 exercise icons (685) | ~200 icons |

**Milestone:** P0 COMPLETE, P1 in progress

### Weeks 5-8: P1 & P2 Completion

| Week | Focus | Output |
|------|-------|--------|
| Week 5 | P1 icons continued (~485) | P1 icons complete |
| Week 6 | P1 UI elements, Lottie sourcing | P1 complete |
| Week 7 | P2 icons (~632) | P2 icons complete |
| Week 8 | P2 polish, final review | ALL COMPLETE |

---

## Tracking Progress

### Progress Dashboard

Update this section as generation progresses:

| Category | Total | Generated | Reviewed | Approved | % Complete |
|----------|-------|-----------|----------|----------|------------|
| P0 Icons | 318 | ~318 (drafts) | 5 | 4 | 1.3% |
| P0 Avatar | 183 | 0 | 0 | 0 | 0% |
| P0 UI | 3 | 0 | 0 | 0 | 0% |
| P1 Icons | 173 | ~173 (drafts) | 0 | 0 | 0% |
| P1 Other | 44 | 0 | 0 | 0 | 0% |
| P2 All | 772 | ~146 (drafts) | 0 | 0 | 0% |
| **Total** | **2,010** | **~637 drafts** | **5** | **4** | **0.2%** |

**Note:** Draft icons generated locally via ComfyUI (v1+v2 batches). Production icons being generated via Recraft API.

**Accepted Recraft Icons (4):**
- squat_01.png
- deadlift_v2.png
- bench_press_v3.png
- barbell_row_v3.png

**Location:** `docs/art/recraft-test/accepted/`

### CSV Tracking

Detailed tracking in: `docs/art/generation/asset-tracking.csv`

---

## Quality Checklist

Before approving any generated asset:

### Exercise Icons
- [ ] Single silhouette figure (not multiple people)
- [ ] Dark gray silhouette (#1A1A1A)
- [ ] Lime green accent line showing movement
- [ ] Transparent background
- [ ] No text, labels, or UI elements
- [ ] No gradients, shadows, or 3D effects
- [ ] Centered composition
- [ ] Correct exercise form depicted
- [ ] 256x256 dimensions

### Avatar Assets
- [ ] Light gray base color (#F2F4FF) for tintable assets
- [ ] Correct layer positioning (anchor at 256, 480)
- [ ] Transparent background
- [ ] No face details on body layers
- [ ] Consistent style across related items
- [ ] 512x512 dimensions
- [ ] Proper naming convention

### UI Elements
- [ ] Correct dimensions as specified
- [ ] Grayscale for tintable assets
- [ ] Transparent backgrounds where needed
- [ ] Clean edges, no artifacts
- [ ] Optimized file size (SVG < 5KB, PNG < 50KB)

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [AI Image Gen Research](./generation/AI-IMAGE-GEN-RESEARCH.md) | Tools, costs, setup guides |
| [Exercise Icon Style Guide](./generation/EXERCISE-ICON-STYLE-GUIDE.md) | Icon visual specifications |
| [Exercise Image Priority](./generation/EXERCISE-IMAGE-PRIORITY.md) | Full priority list |
| [Avatar System Design](./AVATAR-SYSTEM-DESIGN.md) | Avatar architecture |
| [Avatar Asset Specs](./generation/avatar-asset-specs.md) | Technical specs for avatars |
| [UI Asset Inventory](./UI-ASSET-INVENTORY.md) | Complete UI breakdown |
| [Style Guide](./style-guide.md) | Overall visual design |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-07 | 1.1 | Updated with generation progress: ComfyUI working, Recraft API configured, 4 icons accepted |
| 2026-02-06 | 1.0 | Initial master tracker created |

---

*This document is THE source of truth for GymRats art assets. Update it as generation progresses.*

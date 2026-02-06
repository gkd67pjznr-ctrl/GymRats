# GymRats Assets

Organized asset structure for the GymRats application.

---

## Directory Structure

```
assets/
├── README.md                    # This file
├── images/                      # App icons and branding (existing)
│   ├── icon.png
│   ├── splash-icon.png
│   ├── favicon.png
│   └── android-icon-*.png
│
├── exercises/                   # Exercise-related assets
│   ├── icons/                   # Exercise icons (256x256 PNG)
│   │   ├── raw/                 # Original generations
│   │   ├── reviewed/            # QA-passed icons
│   │   └── rejected/            # Failed QC (for regeneration)
│   └── animations/              # Exercise animations (future)
│
├── ui/                          # UI elements
│   ├── borders/                 # Border/frame assets
│   ├── backgrounds/             # Background textures
│   ├── buttons/                 # Button assets
│   └── effects/                 # Visual effects (glow, particles)
│
├── avatars/                     # Avatar system assets
│   ├── base/                    # Base avatar shapes
│   ├── clothing/                # Clothing items
│   ├── accessories/             # Accessories
│   ├── expressions/             # Facial expressions
│   └── growth-stages/           # Progression visuals
│
├── celebrations/                # Achievement/PR assets
│   └── cue-animations/          # PR toast animations
│
└── hangout/                     # Avatar hangout room
    └── decorations/             # Room decoration items
```

---

## Naming Conventions

### Exercise Icons

Format: `{exercise_id}.png`

Examples:
- `bench_press.png`
- `squat.png`
- `deadlift.png`
- `wger_1470.png` (external database ID)

### UI Elements

Format: `{element-type}_{variant}_{state}.{ext}`

Examples:
- `border_rank_gold.svg`
- `button_primary_pressed.png`
- `bg_texture_noise.png`

### Avatar Assets

Format: `{category}_{item-name}_{tier}.png`

Examples:
- `clothing_tank-top_basic.png`
- `accessory_headband_premium.png`
- `expression_focused.png`

---

## Asset Specifications

### Exercise Icons

| Property | Specification |
|----------|---------------|
| Size | 256x256 pixels (source) |
| Format | PNG with transparency |
| Export sizes | 256, 128, 64, 48 |
| Style | Minimal silhouette with accent |
| Background | Transparent |

### UI Elements

| Element | Format | Notes |
|---------|--------|-------|
| Borders/Frames | SVG | Vector for scaling |
| Backgrounds | PNG (tileable) | 512x512 base |
| Buttons | PNG or SVG | Include states |
| Effects | PNG sequence or Lottie | 60fps target |

### Avatar Assets

| Property | Specification |
|----------|---------------|
| Size | 512x512 (source) |
| Format | PNG with transparency |
| Layers | Separate for compositing |
| Style | Consistent with art direction |

---

## Integration Guide

### Loading Assets in Code

```typescript
// Static require for bundled assets
const icon = require('@/assets/exercises/icons/bench_press.png');

// Dynamic loading for theme-specific
import { getThemeAsset } from '@/src/lib/themes/themeAssets';
const prIllustration = getThemeAsset(themeId, 'pr-weight');
```

### Adding New Assets

1. Place asset in appropriate folder
2. Follow naming convention
3. Update asset registry if needed
4. Test loading in development

---

## Asset Generation Status

| Category | Status | Count | Notes |
|----------|--------|-------|-------|
| Exercise Icons | Pending | 0/1590 | See EXERCISE-IMAGE-PRIORITY.md |
| UI Borders | Pending | 0/~12 | Rank frames + achievement frames |
| UI Backgrounds | Pending | 0/1 | Noise texture only (rest are code) |
| UI Effects | Pending | 0/~5 | Particle sprites |
| Celebrations | Pending | 0/~15 | PR badges + Lottie animations |
| Avatar Base | Pending | 0/~100 | Future feature |

**Note:** Many UI elements are implemented in code (no image assets needed).
See [UI Asset Inventory](../docs/art/UI-ASSET-INVENTORY.md) for full breakdown.

---

## Quality Checklist

Before adding assets, verify:

- [ ] Correct dimensions
- [ ] Transparent background (where applicable)
- [ ] Follows naming convention
- [ ] Matches style guide
- [ ] Optimized file size
- [ ] Works at all required sizes

---

## Related Documentation

- [Art Documentation](../docs/art/README.md) - Full art docs
- [Style Guide](../docs/art/style-guide.md) - Visual specifications
- [UI Asset Inventory](../docs/art/UI-ASSET-INVENTORY.md) - Complete UI asset breakdown
- [Exercise Icon Style Guide](../docs/art/generation/EXERCISE-ICON-STYLE-GUIDE.md)
- [AI Generation Research](../docs/art/generation/AI-IMAGE-GEN-RESEARCH.md)
- [UI Asset Prompts](../docs/art/generation/ui-asset-prompts.csv) - AI generation prompts

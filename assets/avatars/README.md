# Avatar Assets

This directory contains all avatar customization assets for the GymRats avatar system.

## Directory Structure

```
avatars/
├── README.md              # This file
├── body/                  # Base body shapes (4 types x 5 stages = 20 PNGs)
├── skin/                  # Skin tone overlays (6 PNGs)
├── face/                  # Facial expressions (8 PNGs)
├── hair/                  # Hairstyles (12 styles x 6 colors + 1 bald = 67 PNGs)
├── top/                   # Upper body clothing (10 items x 4 colors = 40 PNGs)
├── bottom/                # Lower body clothing (8 items x 4 colors = 32 PNGs)
├── foot/                  # Footwear (3 shoes x 3 colors + 1 barefoot = 10 PNGs)
├── acc/                   # Accessories (6 items x ~2 variants = 12 PNGs)
├── equip/                 # Held equipment (dumbbells, kettlebells, etc.)
├── fx/                    # Effects and auras (rank auras, particles, glows)
└── templates/             # Alignment reference templates
```

## Asset Specifications

- **Canvas Size**: 512x512 pixels
- **Format**: PNG-32 with transparency
- **Anchor Point**: (256, 480) - bottom-center of character's feet
- **Color Space**: sRGB

## File Naming Convention

```
{layer}_{item}_{variant}_{stage}.png
```

Examples:
- `body_athletic_male_stage3.png`
- `hair_ponytail_blonde.png`
- `top_tanktop_black.png`
- `fx_aura_diamond.png`

## Layer Composition Order

Render from bottom to top:
1. body (z-index: 0)
2. skin (z-index: 1)
3. face (z-index: 2)
4. hair (z-index: 3)
5. top (z-index: 4)
6. bottom (z-index: 5)
7. foot (z-index: 6)
8. acc (z-index: 7)
9. equip (z-index: 8)
10. fx (z-index: 9)

## Documentation

- **System Design**: `docs/art/AVATAR-SYSTEM-DESIGN.md`
- **Technical Specs**: `docs/art/generation/avatar-asset-specs.md`
- **Generation Prompts**: `docs/art/generation/avatar-prompts.csv`

## MVP Asset Count

| Category | Items | Variants | Total PNGs |
|----------|-------|----------|------------|
| Body | 4 | 5 stages | 20 |
| Skin | 6 | 1 | 6 |
| Face | 8 | 1 | 8 |
| Hair | 12 | 6 colors | 67 |
| Top | 10 | 4 colors | 40 |
| Bottom | 8 | 4 colors | 32 |
| Foot | 4 | 3 colors | 10 |
| Accessory | 6 | ~2 | 12 |
| **Total MVP** | **58 items** | | **~195 PNGs** |

## Quality Checklist

Before adding assets:
- [ ] Canvas is exactly 512x512 pixels
- [ ] Background is 100% transparent
- [ ] Anchor point alignment correct (check templates/)
- [ ] No artifacts or jagged edges
- [ ] Consistent style with existing assets
- [ ] File naming follows convention

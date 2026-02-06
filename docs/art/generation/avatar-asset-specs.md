# Avatar Asset Specifications

> Technical specifications for generating and integrating avatar assets.
>
> **Last Updated:** 2026-02-06
> **Version:** 1.0
> **Related:** [AVATAR-SYSTEM-DESIGN.md](../AVATAR-SYSTEM-DESIGN.md)

---

## Image Specifications

### Dimensions

| Property | Value | Notes |
|----------|-------|-------|
| Canvas Size | 512 x 512 px | Master size for all layers |
| Export Sizes | 512, 256, 128, 64 px | Scale down from master |
| Aspect Ratio | 1:1 | Square format |
| DPI | 72 | Screen display standard |

### File Format

| Property | Value |
|----------|-------|
| Format | PNG-32 |
| Color Space | sRGB |
| Bit Depth | 32-bit (RGBA) |
| Compression | Maximum (lossless) |
| Interlacing | None |

### Transparency

- **Background**: 100% transparent (alpha = 0)
- **Anti-aliasing**: Enabled for smooth edges
- **Edge treatment**: No glow, shadow, or border effects

---

## Anchor Point System

All layers MUST align to a common anchor point for proper compositing.

### Master Anchor

```
Anchor Point: (256, 480)
Position: Bottom-center of character's feet
Reference: All body parts positioned relative to this point
```

### Alignment Grid

```
+-----------------------------------+
|          32px safe zone           |
|   +---------------------------+   |
|   |                           |   |
|   |     HEAD ZONE (top)       |   |
|   |     ~256-300px height     |   |
|   |                           |   |
|   +---------------------------+   |
|   |                           |   |
|   |     BODY ZONE (middle)    |   |
|   |     ~200-250px height     |   |
|   |                           |   |
|   +---------------------------+   |
|   |     FEET ZONE (bottom)    |   |
|   |     ~50-80px height       |   |
|   +---------------------------+   |
|       ANCHOR (256, 480)          |
+-----------------------------------+
```

### Layer-Specific Guidelines

| Layer | Positioning Notes |
|-------|-------------------|
| Body | Full figure from head to feet, centered on anchor |
| Skin | Overlay on visible body areas, match body shape exactly |
| Face | Center in head area, ~100x100px feature zone |
| Hair | Anchor to top of head, extend above and around |
| Top | Align shoulder seams with body template |
| Bottom | Align waist with body template |
| Footwear | Feet touching anchor baseline |
| Accessories | Position per slot (head, wrist, waist) |
| Effects | Centered on body or specific effect point |

---

## Layer Composition Order

Render layers bottom-to-top in this exact order:

```
Z-Index  Layer         Blend Mode    Opacity
----------------------------------------------
0        body          Normal        100%
1        skin          Overlay       100%*
2        face          Normal        100%
3        hair          Normal        100%
4        top           Normal        100%
5        bottom        Normal        100%
6        footwear      Normal        100%
7        accessories   Normal        100%
8        equipment     Normal        100%
9        effects       Screen/Add    50-100%**

* Skin layer uses overlay blend for natural color application
** Effects use additive blending with variable opacity
```

---

## File Naming Convention

### Pattern

```
{layer}_{item}_{variant}_{stage}.png
```

### Components

| Component | Description | Examples |
|-----------|-------------|----------|
| `layer` | Layer category prefix | `body`, `skin`, `face`, `hair`, `top`, `bottom`, `foot`, `acc`, `equip`, `fx` |
| `item` | Item identifier | `tanktop`, `ponytail`, `sneakers`, `headband` |
| `variant` | Color or variation | `black`, `brown`, `theme_accent`, `default` |
| `stage` | Growth stage (if applicable) | `stage1`, `stage2`, ..., `stage5` |

### Examples

```
body_athletic_male_stage1.png
body_athletic_male_stage2.png
body_athletic_female_stage3.png
skin_tone1.png
skin_tone6.png
face_neutral.png
face_determined.png
hair_short_straight_black.png
hair_ponytail_blonde.png
hair_afro_theme_accent.png
top_tanktop_black.png
top_sportsbra_white.png
bottom_shorts_gray.png
bottom_leggings_black.png
foot_sneakers_white.png
foot_barefoot.png
acc_headband_neon.png
acc_belt_leather.png
equip_dumbbells_light.png
equip_barbell.png
fx_aura_diamond.png
fx_particles_gold.png
```

---

## Directory Structure

```
assets/avatars/
├── README.md                    # Asset overview and usage
├── body/                        # Base body shapes
│   ├── body_athletic_male_stage1.png
│   ├── body_athletic_male_stage2.png
│   └── ...
├── skin/                        # Skin tone overlays
│   ├── skin_tone1.png
│   └── ...
├── face/                        # Facial expressions
│   ├── face_neutral.png
│   └── ...
├── hair/                        # Hairstyles
│   ├── hair_short_straight_black.png
│   ├── hair_short_straight_brown.png
│   └── ...
├── top/                         # Upper body clothing
│   ├── top_tanktop_black.png
│   └── ...
├── bottom/                      # Lower body clothing
│   ├── bottom_shorts_black.png
│   └── ...
├── foot/                        # Footwear
│   ├── foot_sneakers_white.png
│   └── ...
├── acc/                         # Accessories
│   ├── acc_headband_neon.png
│   └── ...
├── equip/                       # Held equipment
│   ├── equip_dumbbells_light.png
│   └── ...
├── fx/                          # Effects and auras
│   ├── fx_aura_diamond.png
│   └── ...
└── templates/                   # Reference templates
    ├── alignment_grid.png
    ├── body_template_male.png
    └── body_template_female.png
```

---

## Color Specifications

### Skin Tones

| ID | Name | Hex | RGB |
|----|------|-----|-----|
| tone1 | Porcelain | #FFE0BD | 255, 224, 189 |
| tone2 | Warm Ivory | #F5D0A9 | 245, 208, 169 |
| tone3 | Sand | #D4A76A | 212, 167, 106 |
| tone4 | Warm Brown | #A67B5B | 166, 123, 91 |
| tone5 | Deep Brown | #6B4423 | 107, 68, 35 |
| tone6 | Ebony | #3D2314 | 61, 35, 20 |

### Hair Colors

| ID | Name | Hex | RGB |
|----|------|-----|-----|
| black | Black | #1A1A1A | 26, 26, 26 |
| brown | Brown | #654321 | 101, 67, 33 |
| blonde | Blonde | #D4AF37 | 212, 175, 55 |
| red | Red | #8B0000 | 139, 0, 0 |
| gray | Gray | #808080 | 128, 128, 128 |
| theme_accent | Theme | [Dynamic] | Inherits from active theme |

### Outfit Colors

| ID | Name | Hex | RGB |
|----|------|-----|-----|
| black | Black | #1A1A1A | 26, 26, 26 |
| white | White | #F5F5F5 | 245, 245, 245 |
| gray | Gray | #4A4A4A | 74, 74, 74 |
| theme_accent | Theme | [Dynamic] | Inherits from active theme |

### Theme Accent Colors

| Theme | Accent Hex | RGB |
|-------|-----------|-----|
| Toxic Energy | #ADFF2F | 173, 255, 47 |
| Iron Forge | #FF6B35 | 255, 107, 53 |
| Neon Glow | #FF00FF | 255, 0, 255 |
| Infernal Cosmos | #FF2D2D | 255, 45, 45 |

---

## Silhouette Color Guidelines

To match GymRats exercise icon style:

| Element | Color | Hex |
|---------|-------|-----|
| Primary silhouette | Light Gray | #F2F4FF |
| Secondary details | Medium Gray | #D4D4D8 |
| Shadow areas | Dark Gray | #1A1A1A |
| Accent highlights | Theme-reactive | [Dynamic] |

---

## Quality Control Checklist

Before accepting each generated asset:

- [ ] Canvas is exactly 512x512 pixels
- [ ] Background is 100% transparent
- [ ] Anchor point alignment is correct (check against template)
- [ ] No artifacts or jagged edges
- [ ] Consistent style with other assets in batch
- [ ] File naming follows convention
- [ ] Color accuracy matches specification
- [ ] Silhouette is recognizable at 64px scale

---

## Generation Tool Settings

### Midjourney (v6+)

```
[prompt] --ar 1:1 --style raw --s 200 --no text, watermark, face details, background, shadow, border
```

### DALL-E 3

- Request 1024x1024, scale to 512x512
- Include "transparent background" in prompt
- Include "centered on canvas" for alignment
- Use "flat illustration style, clean edges"

### Stable Diffusion (SDXL)

```
Positive: [prompt], transparent background, centered composition, clean edges, flat style
Negative: text, watermark, background, shadow, 3D, realistic, photographic, gradient
CFG Scale: 7-8
Steps: 40-50
Sampler: DPM++ 2M Karras
```

---

## Post-Processing Pipeline

### Step 1: Background Removal

If generator doesn't support transparency:
1. Use remove.bg API or similar
2. Manual cleanup in Photoshop/GIMP
3. Verify alpha channel is clean

### Step 2: Alignment Correction

1. Open generated image and alignment template
2. Overlay layers with 50% opacity
3. Transform to align with template anchor points
4. Crop to exact 512x512

### Step 3: Color Correction

1. Sample key colors from specification
2. Adjust hue/saturation if needed
3. Ensure consistency with batch

### Step 4: Export

1. Save as PNG-32 with transparency
2. Name according to convention
3. Generate scaled versions (256, 128, 64)
4. Place in correct directory

---

## Batch Processing Script

```bash
#!/bin/bash
# avatar-export.sh - Export avatar assets to multiple sizes

SOURCE_DIR="assets/avatars/raw"
OUTPUT_DIR="assets/avatars"

for png in $SOURCE_DIR/*.png; do
  filename=$(basename "$png" .png)

  # Get layer type from filename
  layer=$(echo "$filename" | cut -d'_' -f1)

  # Create output directory if needed
  mkdir -p "$OUTPUT_DIR/$layer"

  # Copy original (512px)
  cp "$png" "$OUTPUT_DIR/$layer/$filename.png"

  # Generate scaled versions
  convert "$png" -resize 256x256 "$OUTPUT_DIR/$layer/$filename@256.png"
  convert "$png" -resize 128x128 "$OUTPUT_DIR/$layer/$filename@128.png"
  convert "$png" -resize 64x64 "$OUTPUT_DIR/$layer/$filename@64.png"
done

echo "Export complete!"
```

---

## Related Documentation

- [AVATAR-SYSTEM-DESIGN.md](../AVATAR-SYSTEM-DESIGN.md) - Full system design
- [avatar-prompts.csv](./avatar-prompts.csv) - Generation prompts
- [EXERCISE-ICON-STYLE-GUIDE.md](./EXERCISE-ICON-STYLE-GUIDE.md) - Reference for silhouette style
- [style-guide.md](../style-guide.md) - GymRats visual style

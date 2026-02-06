# GymRats Exercise Icon Style Guide

> Visual style specification for exercise illustration icons.
>
> **Last Updated:** 2026-02-05
> **Version:** 1.1
> **Target:** 1590 exercises

---

## Chosen Style: Minimal Silhouette with Accent

### Style Research Summary

We evaluated four style options before selecting the final approach:

| Style | Pros | Cons | Score |
|-------|------|------|-------|
| **Silhouette with Accent** | Scalable, consistent, fast to generate | Less detail at small sizes | 9/10 |
| Line Art | Clean, modern look | Harder to show equipment clearly | 7/10 |
| Flat Illustration | Colorful, friendly | Inconsistent across 1,500+ exercises | 6/10 |
| Icon Style (24px) | Ultra-compact | Too abstract for exercise recognition | 5/10 |

### Rationale

After considering multiple options, **Minimal Silhouette with Accent** is the optimal choice because:

1. **Scalability**: Works at all sizes (24px to 256px)
2. **Consistency**: Easy to maintain uniform style across 1,500+ icons
3. **Recognizability**: Clear body positions are instantly recognizable
4. **App Aesthetic**: Matches GymRats' dark, minimalist "pure" design
5. **Generation Reliability**: AI models produce consistent silhouettes
6. **Accessibility**: High contrast works for colorblind users

### Competitor Analysis

| App | Style | What Works | What We Avoid |
|-----|-------|------------|---------------|
| Strong | Photo-based | Realistic | Hard to scale, inconsistent |
| Fitbod | 3D renders | Detailed | Expensive, slow |
| Hevy | Line drawings | Clean | Too minimal for some exercises |
| Gymshark | Flat icons | Modern | Loses detail at small sizes |

---

## Color Palette

### Primary Colors (aligned with GymRats Design System)

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Transparent | N/A | All icons (or dark #0A0A0D for previews) |
| Primary Silhouette | Light Gray | #F2F4FF | Human figure (matches ds.tone.text) |
| Secondary Silhouette | Medium Gray | #D4D4D8 | Equipment, weights |
| Accent Highlight | Lime (Toxic) | #A6FF00 | Active muscle group or motion line |
| Alt Accent | Cyan (Ice) | #00F5D4 | Alternative theme |
| Alt Accent | Purple (Electric) | #6D5BFF | Alternative theme |
| Alt Accent | Pink (Ember) | #FF3D7F | Alternative theme |

### Dark Mode Preview Background

When previewing icons, use the app's background color (#0A0A0D) to ensure proper contrast.

---

## Size Requirements

| Use Case | Size | Notes |
|----------|------|-------|
| Exercise List (small) | 48x48px | Must be recognizable |
| Exercise Card | 64x64px | Standard detail |
| Exercise Detail | 128x128px | Full detail |
| Marketing | 256x256px | High resolution |

All icons should be designed at 256x256 and scaled down.

---

## Master Prompt Template

### For Midjourney / DALL-E / Stable Diffusion:

```
[STYLE PREFIX]
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A),

[EXERCISE DESCRIPTION]
{person performing [EXERCISE NAME], [KEY BODY POSITION], [EQUIPMENT IF ANY]},

[STYLE SUFFIX]
lime green accent line showing movement direction, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition

[NEGATIVE PROMPT]
--no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

### Template Variables:

- `[EXERCISE NAME]`: Name of exercise (e.g., "barbell bench press")
- `[KEY BODY POSITION]`: Main pose (e.g., "lying on bench, arms extended upward")
- `[EQUIPMENT IF ANY]`: Equipment shown (e.g., "holding barbell") or "bodyweight only"

---

## Example Prompts (Top 10 Exercises)

### 1. Bench Press
```
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing barbell bench press, lying on flat bench with back arched, arms extended upward holding barbell, lime green accent line showing upward pressing motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

### 2. Back Squat
```
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing barbell back squat, standing with barbell across upper back, knees bent in squat position, thighs parallel to ground, lime green accent line showing upward movement from squat, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

### 3. Deadlift
```
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing barbell deadlift, bent over with flat back, arms straight gripping barbell at floor level, lime green accent line showing vertical pull motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

### 4. Overhead Press
```
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing standing military press, arms extended overhead holding barbell, standing upright, lime green accent line showing upward pressing motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

### 5. Barbell Row
```
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing bent over barbell row, torso bent forward at 45 degrees, pulling barbell toward lower chest, lime green accent line showing pulling motion toward body, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

### 6. Pull-Up
```
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing pull-up, hanging from bar with arms wide, chin above bar level, lime green accent line showing upward pulling motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

### 7. Dumbbell Curl
```
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing standing dumbbell bicep curl, one arm curling dumbbell upward with elbow fixed at side, lime green accent line showing curling motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

### 8. Tricep Pushdown
```
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing cable tricep pushdown, standing upright, arms pressing cable attachment downward with elbows fixed, lime green accent line showing downward pressing motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

### 9. Leg Press
```
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing seated leg press on machine, back against pad, legs pressing platform away at 45 degree angle, lime green accent line showing pushing motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

### 10. Plank
```
minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing plank hold, body in straight line from head to heels, supported on forearms and toes, lime green accent line along spine showing body alignment, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition --no text, labels, multiple people, detailed face, realistic skin, shadows, 3D effects, gradients, busy background, photorealistic
```

---

## Tips for Consistency

1. **Always show the exercise at peak contraction** or the most recognizable position
2. **Include equipment** when it defines the exercise (barbell vs dumbbell)
3. **Side view** works best for most exercises (shows body position clearly)
4. **Front view** for exercises like front raises, lateral raises
5. **Keep poses generic** - no specific body types
6. **Accent line** should follow the direction of force or movement
7. **Generate in batches** by muscle group for consistency

---

## Generation Workflow

1. **Export prompts** from `exercise-image-prompts.csv`
2. **Generate in batches** of 20-50 (by muscle group)
3. **Review for consistency** - regenerate outliers
4. **Export at 256x256** PNG with transparency
5. **Name files** as `{exercise_id}.png`
6. **Store in** `assets/exercise-icons/`

---

## Accessibility Notes

- High contrast (dark silhouette on transparent/light) meets WCAG 2.1 AA
- Accent colors chosen to be distinguishable by colorblind users
- Motion lines help convey movement without relying on color alone

---

## Generator-Specific Parameters

### Midjourney (v6+)

```
[prompt] --ar 1:1 --style raw --s 250 --no text, watermark, face details, realistic skin
```

- Use `--style raw` for cleaner, more controlled output
- Stylize value of 250 balances consistency with visual appeal
- Always specify `--ar 1:1` for square icons

### DALL-E 3

- Include "no face details, no text, no watermark" in the main prompt (no negative prompt field)
- Use "digital illustration style" or "flat icon style"
- Request 1024x1024 and scale down to target sizes
- Add "centered composition" for proper framing

### Stable Diffusion (SDXL or SD 1.5)

```
Positive: [prompt]
Negative: realistic, photographic, face, facial features, text, watermark, signature, 3D render, gradient background, multiple figures, busy background
CFG Scale: 7-9
Steps: 30-50
Sampler: DPM++ 2M Karras
```

### Flux / Other Models

- Use similar negative prompt structure
- Focus on "minimalist", "silhouette", "icon style" keywords
- Test with a batch of 10 common exercises first for consistency

---

## Batch Generation Strategy

### Phase 1: Core Exercises (P0 - Top 50)

Generate the most important exercises first to establish visual consistency:

1. Big 5 compounds: Bench, Squat, Deadlift, Row, Overhead Press
2. Major variations: Incline, Decline, Front Squat, Sumo Deadlift
3. Popular accessories: Curls, Extensions, Lateral Raises
4. Bodyweight basics: Push-ups, Pull-ups, Dips, Planks

### Phase 2: By Muscle Group

Generate remaining exercises in muscle group batches for consistency:

1. Chest (178 exercises)
2. Back (218 exercises)
3. Shoulders (225 exercises)
4. Arms - Biceps (121 exercises)
5. Arms - Triceps (117 exercises)
6. Legs - Quadriceps (227 exercises)
7. Legs - Hamstrings (116 exercises)
8. Core - Abdominals (171 exercises)
9. Other (remaining)

### Quality Control Checklist

Before accepting each generated icon:

- [ ] Exercise is recognizable at 48x48px
- [ ] Equipment is clearly visible (if applicable)
- [ ] No facial features visible
- [ ] Consistent style with other icons in batch
- [ ] Clean edges, no artifacts
- [ ] Centered composition with proper padding
- [ ] Matches body position description

---

## File Organization

### Naming Convention

```
{exercise_id}.png
```

Examples:
- `Barbell_Bench_Press_-_Medium_Grip.png`
- `wger_73.png`
- `Dumbbell_Bicep_Curl.png`

### Directory Structure

```
assets/
  exercise-icons/
    raw/           # Original 256x256 or larger
    128/           # 128x128 exports
    64/            # 64x64 exports
    48/            # 48x48 exports
```

### Export Formats

| Format | Usage |
|--------|-------|
| PNG (transparent) | Primary format for app |
| WebP | Web/marketing (smaller file size) |
| SVG | Future scalable version (if available) |

---

## Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| Silhouette too detailed | Add "minimalist" and "simple shapes" to prompt |
| Equipment not visible | Describe equipment explicitly in body position |
| Inconsistent poses | Use seed locking for similar exercises |
| Text appearing in image | Strengthen negative prompt for "text, labels, numbers" |
| Multiple figures | Add "single person" and "one figure" to prompt |
| Wrong exercise | Be more specific about body position and movement |

---

## Related Files

- `exercise-image-prompts.csv` - All 1,590 exercise prompts
- `EXERCISE-IMAGE-PRIORITY.md` - Priority ranking for generation order
- `../data/EXERCISE-MASTER-LIST.md` - Source exercise database

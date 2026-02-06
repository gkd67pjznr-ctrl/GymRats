# GymRats Exercise Icon Style Guide

> Visual style specification for exercise illustration icons.
>
> **Last Updated:** 2026-02-06
> **Target:** 1590 exercises

---

## Chosen Style: Minimal Silhouette with Accent

### Rationale

After considering multiple options, **Minimal Silhouette with Accent** is the optimal choice because:

1. **Scalability**: Works at all sizes (24px to 256px)
2. **Consistency**: Easy to maintain uniform style across 1,500+ icons
3. **Recognizability**: Clear body positions are instantly recognizable
4. **App Aesthetic**: Matches GymRats' dark, minimalist "pure" design
5. **Generation Reliability**: AI models produce consistent silhouettes
6. **Accessibility**: High contrast works for colorblind users

---

## Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Transparent | N/A | All icons |
| Primary Silhouette | Dark Gray | #1A1A1A | Human figure |
| Secondary Silhouette | Medium Gray | #404040 | Equipment, weights |
| Accent Highlight | Lime (Toxic) | #AAFF00 | Active muscle group or motion line |
| Alt Accent | Cyan (Ice) | #00FFFF | Alternative theme |
| Alt Accent | Purple (Electric) | #9D4EDD | Alternative theme |
| Alt Accent | Pink (Ember) | #FF4081 | Alternative theme |

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

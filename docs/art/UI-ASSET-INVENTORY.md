# UI Asset Inventory

Comprehensive inventory of UI visual assets needed for GymRats, with theming strategies and implementation approaches.

---

## Design Principles

### Theming Constraint
The theme system (see `src/lib/themes/`) defines **colors only**, not images. This means UI assets must either:

1. **Grayscale + Code Tinting** - Single neutral asset, color applied via `tintColor` prop or opacity overlay
2. **CSS/SVG/Code-Only** - No image needed, pure code implementation
3. **Theme-Specific Variants** - Multiple versions per theme (higher maintenance cost)

**Decision Framework:**
- Simple shapes/glows: Use code (React Native views, shadows, gradients)
- Complex textures/patterns: Use grayscale image + tint
- Highly themed (legendary packs): Theme-specific variants

### Performance Targets
| Metric | Target |
|--------|--------|
| Asset load time | < 200ms (cached) |
| Bundle size impact | < 500KB total UI assets |
| Runtime tint application | < 16ms (60fps) |

---

## Asset Categories

### Borders & Frames

| Asset | Approach | Theme Variants | Priority | Status | Notes |
|-------|----------|----------------|----------|--------|-------|
| `card-border-standard` | Code (View) | No | P0 | **DONE** | Using `borderWidth` + `borderColor` |
| `card-border-premium` | Grayscale SVG + tint | No | P2 | Needed | Subtle glow effect on border |
| `card-border-legendary` | Theme-specific | Yes (per legendary pack) | P3 | Needed | Animated gradient border |
| `achievement-frame-standard` | SVG | No | P1 | Needed | Simple decorative frame |
| `achievement-frame-gold` | SVG | No | P1 | Needed | Ornate gold-style frame |
| `pr-celebration-frame` | Code + Lottie | No | P1 | Needed | Animated frame for PR moments |

#### Rank Badges (28 assets)

**See [RANK-SYSTEM.md](./RANK-SYSTEM.md) for complete specifications.**

Each tier has 3 variants (I, II, III) with progressive enhancement, except G.O.A.T which has 1.
All badges include a **square inlay text box** at the bottom showing rank name (e.g., "Gold II").

| Tier | Variants | Priority | Status | Color | Visual Style |
|------|----------|----------|--------|-------|--------------|
| Copper | I, II, III | P1 | Needed | `#B87333` | Simple oxidized ring |
| Bronze | I, II, III | P1 | Needed | `#CD7F32` | Slightly polished |
| Iron | I, II, III | P1 | Needed | `#6B6B6B` | Industrial, forged |
| Silver | I, II, III | P1 | Needed | `#C0C0C0` | Polished, elegant |
| Gold | I, II, III | P1 | Needed | `#FFD700` | Ornate flourishes |
| Master | I, II, III | P1 | Needed | `#FFF8DC` | Circular + spikes + glow |
| Legendary | I, II, III | P1 | Needed | `#9B30FF` | Mystical aura, gems |
| Mythic | I, II, III | P1 | Needed | `#00CED1` | Ethereal, particles |
| Supreme Being | I, II, III | P2 | Needed | TBD | Cosmic/celestial |
| G.O.A.T | (single) | P2 | Needed | TBD | Ultimate, prismatic |

**Level Enhancement (I → II → III):**
- Level I: Base design
- Level II: Added decorative elements
- Level III: Maximum ornamentation for that tier

**File naming:** `rank-badge-{tier}-{level}.png` (e.g., `rank-badge-copper-1.png`, `rank-badge-goat.png`)
**Size:** 512x512 base, scales down for display
**Location:** `assets/ui/badges/rank/`

**Rationale:**
- Standard card borders use code because React Native's border system is sufficient
- Premium borders need subtle effects that require image assets
- Legendary borders justify theme-specific variants for maximum impact
- Rank borders are fixed tier colors with progressive visual complexity

---

### Backgrounds

| Asset | Approach | Theme Variants | Priority | Status | Notes |
|-------|----------|----------------|----------|--------|-------|
| `card-bg-default` | Code | No | P0 | **DONE** | Solid `surface` color |
| `card-bg-texture-noise` | PNG (grayscale) + opacity | No | P2 | Needed | Subtle grain overlay at 5% opacity |
| `modal-bg-blur` | Code (expo-blur) | No | P0 | **DONE** | Using BlurView component |
| `modal-bg-gradient` | Code (LinearGradient) | No | P1 | Needed | Top-to-bottom fade |
| `celebration-overlay-confetti` | Lottie | No | P1 | Needed | Animated confetti background |
| `celebration-overlay-particles` | Code (Reanimated) | No | P2 | Needed | Particle system in JS |
| `gradient-mesh-hero` | PNG per theme | Yes | P3 | Needed | Complex gradient for hero sections |
| `gradient-mesh-card` | Code (LinearGradient) | No | P2 | Needed | Subtle gradient overlays |

**Rationale:**
- Solid backgrounds are pure code (no assets needed)
- Textures work well as grayscale overlays with controlled opacity
- Celebration overlays are better as Lottie for animation control
- Complex gradient meshes require per-theme generation but are low priority

---

### Buttons

| Asset | Approach | Theme Variants | Priority | Status | Notes |
|-------|----------|----------------|----------|--------|-------|
| `button-primary` | Code | No | P0 | **DONE** | View with accent color fill |
| `button-primary-pressed` | Code | No | P0 | **DONE** | Opacity reduction on press |
| `button-secondary` | Code | No | P0 | **DONE** | Border + transparent fill |
| `button-icon-bg` | Code | No | P0 | **DONE** | Circle/rounded rect View |
| `button-glow-ring` | Code (shadow) | No | P1 | Partial | Using shadowColor from theme |
| `button-legendary-gradient` | LinearGradient | No | P2 | Needed | Gradient fill for premium buttons |
| `toggle-track` | Code | No | P0 | **DONE** | Standard Switch styling |
| `toggle-thumb` | Code | No | P0 | **DONE** | Standard Switch styling |

**Rationale:**
- All buttons use code-based implementation for flexibility
- Glow effects use React Native shadows with theme colors
- No image assets needed for standard button patterns

---

### Effects

| Asset | Approach | Theme Variants | Priority | Status | Notes |
|-------|----------|----------------|----------|--------|-------|
| `glow-soft` | Code (shadow) | No | P1 | **DONE** | `shadowColor` + `shadowRadius` |
| `glow-accent` | Code (shadow) | No | P1 | **DONE** | Uses `accentGlow` from theme |
| `particle-confetti` | Code (Reanimated) | No | P2 | Needed | Animated particles in JS |
| `particle-confetti-sprite` | PNG (8x8) | No | P3 | Optional | For native particle systems |
| `particle-star-sprite` | SVG | No | P2 | Needed | Star shape for celebrations |
| `particle-ember-sprite` | SVG | No | P2 | Needed | Ember shape for Iron Forge theme |
| `particle-spark-sprite` | SVG | No | P2 | Needed | Spark for Midnight Ice theme |
| `sparkle-animation` | Lottie | No | P2 | Needed | Generic sparkle effect |
| `shine-sweep` | Lottie | No | P3 | Needed | Sweeping shine effect |
| `progress-ring` | Code (SVG) | No | P0 | **DONE** | Animated SVG circle |
| `progress-bar-fill` | Code (Animated.View) | No | P0 | **DONE** | Animated width change |

**Rationale:**
- Glow effects are pure shadows with theme colors
- Particle systems should be code-based for performance (Reanimated)
- Sprite assets are optional fallbacks for lower-end devices
- Lottie for complex repeating animations

---

### Celebration Assets

| Asset | Approach | Theme Variants | Priority | Status | Notes |
|-------|----------|----------------|----------|--------|-------|
| `pr-badge-weight` | SVG + tint | No | P0 | Needed | Weight PR indicator |
| `pr-badge-rep` | SVG + tint | No | P0 | Needed | Rep PR indicator |
| `pr-badge-e1rm` | SVG + tint | No | P0 | Needed | e1RM PR indicator |
| `rank-up-badge` | SVG | Per rank tier | P1 | Needed | 7 variants (Iron-Mythic) |
| `streak-badge` | SVG | No | P2 | Needed | Streak milestone badge |
| `level-up-burst` | Lottie | No | P1 | Needed | XP level-up animation |
| `workout-complete-check` | Lottie | No | P1 | Needed | Completion animation |
| `confetti-burst` | Lottie | No | P1 | Needed | Generic celebration burst |
| `rank-glow-reveal` | Lottie per tier | Yes (7 tiers) | P2 | Needed | Rank-specific reveal animations |

**Rationale:**
- PR badges use grayscale SVG with code-applied tint
- Rank-up badges are per-tier due to distinct colors
- Lottie animations for complex multi-element effects

---

## Generation Queue

Assets that need AI generation or manual creation:

### Priority 0 (Critical Path)
| Asset | Type | Prompt/Description | Est. Count |
|-------|------|-------------------|------------|
| `pr-badge-weight` | SVG | Minimal dumbbell/weight icon, flat style, 48x48 | 1 |
| `pr-badge-rep` | SVG | Stylized "x" or repetition icon, flat style, 48x48 | 1 |
| `pr-badge-e1rm` | SVG | Crown or star icon for 1RM achievement, flat style, 48x48 | 1 |

### Priority 1 (Launch Features)
| Asset | Type | Prompt/Description | Est. Count |
|-------|------|-------------------|------------|
| `rank-badge-border-*` | SVG | Decorative badge frames per rank tier (10 tiers × 3 levels + G.O.A.T), 128x128 | 28 |
| `achievement-frame-standard` | SVG | Simple decorative frame, 128x128 | 1 |
| `achievement-frame-gold` | SVG | Ornate gold-style frame with flourishes, 128x128 | 1 |
| `level-up-burst` | Lottie | Radial burst with stars, 2 sec loop | 1 |
| `confetti-burst` | Lottie | Colorful confetti explosion, 3 sec play-once | 1 |
| `workout-complete-check` | Lottie | Checkmark with celebratory effect, 1.5 sec | 1 |
| `particle-star-sprite` | SVG | 4-point star, 16x16 | 1 |

### Priority 2 (Polish)
| Asset | Type | Prompt/Description | Est. Count |
|-------|------|-------------------|------------|
| `card-bg-texture-noise` | PNG | Uniform noise pattern, 256x256, tileable | 1 |
| `particle-ember-sprite` | SVG | Ember/fire particle, 16x16 | 1 |
| `particle-spark-sprite` | SVG | Electric spark, 16x16 | 1 |
| `sparkle-animation` | Lottie | Single sparkle effect, 0.5 sec | 1 |
| `streak-badge` | SVG | Flame or streak icon, 48x48 | 1 |
| `rank-glow-reveal` | Lottie | Tier-colored glow reveal | 7 |

### Priority 3 (Premium/Legendary)
| Asset | Type | Prompt/Description | Est. Count |
|-------|------|-------------------|------------|
| `gradient-mesh-hero` | PNG | Complex gradient per theme, 512x512 | ~6 |
| `card-border-legendary` | SVG/Lottie | Animated gradient border per legendary pack | ~3 |
| `shine-sweep` | Lottie | Horizontal shine sweep, 1 sec | 1 |

**Total Estimated Assets:** ~35 unique assets

---

## CSS/Code Solutions

Assets that do NOT need image files (pure code implementation):

### Currently Implemented
```typescript
// Card backgrounds - solid color from theme
style={{ backgroundColor: colors.surface }}

// Card borders - View borderWidth/Color
style={{
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16
}}

// Button states - opacity and color changes
style={{
  backgroundColor: colors.accent,
  opacity: pressed ? 0.7 : 1
}}

// Glow effects - shadow properties
style={{
  shadowColor: colors.accentGlow,
  shadowOpacity: 0.4,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 }
}}

// Progress rings - react-native-svg
<Svg><Circle strokeDasharray={...} /></Svg>

// Modal blur - expo-blur
<BlurView intensity={60} />
```

### Recommended Code Implementations

**Gradient Backgrounds:**
```typescript
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={[colors.surface, colors.background]}
  style={{ ...StyleSheet.absoluteFillObject }}
/>
```

**Particle Systems:**
```typescript
// Use react-native-reanimated for 60fps particles
// See: src/ui/components/ParticleSystem.tsx (future)
```

**Animated Borders:**
```typescript
// Use Reanimated for rotating gradient effect
// Or Skia for GPU-accelerated gradients
```

---

## Implementation Notes

### Asset Loading Strategy

1. **Critical assets** (P0): Bundle with app, load synchronously
2. **Feature assets** (P1-P2): Lazy load on first use, cache in memory
3. **Theme-specific** (P3): Download on theme purchase, persist to disk

### Tinting Implementation

```typescript
// For SVG assets (react-native-svg)
<SvgUri uri={assetUri} fill={colors.accent} />

// For PNG assets (Image component)
<Image
  source={require('./asset.png')}
  style={{ tintColor: colors.accent }}
/>

// For Lottie (colorFilters)
<LottieView
  colorFilters={[
    { keypath: 'Layer 1', color: colors.accent }
  ]}
/>
```

### File Organization

```
assets/ui/
├── borders/
│   ├── card-border-premium.svg
│   ├── achievement-frame-standard.svg
│   ├── achievement-frame-gold.svg
├── badges/
│   └── rank/
│       ├── rank-badge-copper-1.png
│       ├── rank-badge-copper-2.png
│       ├── rank-badge-copper-3.png
│       ├── rank-badge-bronze-1.png
│       ├── ... (28 total)
│       └── rank-badge-goat.png
├── backgrounds/
│   └── card-bg-texture-noise.png
├── buttons/
│   └── (empty - all code-based)
├── effects/
│   ├── particles/
│   │   ├── particle-star-sprite.svg
│   │   ├── particle-ember-sprite.svg
│   │   └── particle-spark-sprite.svg
│   └── animations/
│       ├── sparkle-animation.json (Lottie)
│       └── shine-sweep.json (Lottie)
└── celebrations/
    ├── badges/
    │   ├── pr-badge-weight.svg
    │   ├── pr-badge-rep.svg
    │   ├── pr-badge-e1rm.svg
    │   ├── streak-badge.svg
    │   └── rank/
    │       └── rank-up-badge-*.svg
    └── animations/
        ├── level-up-burst.json
        ├── confetti-burst.json
        ├── workout-complete-check.json
        └── rank-glow/
            └── rank-glow-reveal-*.json
```

---

## Theme Integration

### How Assets Work with Theme System

The theme system (`src/lib/themes/types.ts`) provides:

```typescript
interface ThemePackColors {
  accent: string;        // Primary tint color
  accentGlow: string;    // Glow effect color
  secondary: string;     // Secondary tint
  // ... rank colors
}

interface ThemePackParticles {
  shape: 'confetti' | 'star' | 'spark' | 'ember';
  colors: string[];      // Particle color palette
}
```

**Asset Selection Logic:**
```typescript
function getParticleSpriteForTheme(themeId: string): string {
  const theme = getPackById(themeId);
  switch (theme?.particles?.shape) {
    case 'ember': return 'particle-ember-sprite.svg';
    case 'spark': return 'particle-spark-sprite.svg';
    case 'star': return 'particle-star-sprite.svg';
    default: return 'particle-confetti-sprite.svg';
  }
}
```

---

## Quality Checklist

Before adding UI assets:

- [ ] Follows naming convention (`type-variant-state.ext`)
- [ ] Correct dimensions (see specifications above)
- [ ] Grayscale/neutral for tintable assets
- [ ] Transparent background where applicable
- [ ] Optimized file size (SVG < 5KB, PNG < 50KB, Lottie < 100KB)
- [ ] Works at all required sizes (test at 1x, 2x, 3x)
- [ ] Matches style guide aesthetic
- [ ] Tested with multiple theme colors

---

## Related Documentation

- [Style Guide](./style-guide.md) - Visual design specifications
- [Theme System](./themes/theme-system.md) - Theme pack architecture
- [Asset Integration Guide](./implementation/asset-integration-guide.md) - How to integrate assets
- [Assets README](../../assets/README.md) - Asset folder structure
- [Exercise Icon Style Guide](./generation/EXERCISE-ICON-STYLE-GUIDE.md) - Icon generation reference

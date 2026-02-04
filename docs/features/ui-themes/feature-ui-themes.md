# Feature: UI Themes & Visual Style

## Overview
Implementation of the GymRats visual identity with a layered approach that combines PURE's emotional personality with LIFTOFF's functional efficiency. This system creates a unique aesthetic that maintains workout tracking performance while adding distinctive personality elements.

**Status:** In Progress | **Progress:** 6/8 sub-features complete (75%)
**Last Updated:** 2026-02-03

---

## Related: Modern Design System Architecture

A new layered design system has been implemented that supersedes some of the technical infrastructure here:

**See:** `docs/features/design-system/feature-design-system.md`

**New System Features:**
- Token-based architecture (primitives → semantic → components)
- Surface elevation system (6 depth levels)
- Theme installation system (toxic, electric, ember, ice)
- Primitive components (Surface, Card, Text, Button)
- Art/celebration system with particle effects
- Full backwards compatibility with legacy `useThemeColors()` and `makeDesignSystem()`

**New Imports:**
```typescript
// Tokens
import { colors, surface, text, border, spacing, corners } from '@/src/design';

// Components
import { Surface, Card, Text, Button } from '@/src/design/primitives';

// Gradients
import { backgroundGradients, cardGradients } from '@/src/design';
```

---

## Sub-Features

### ✅ Done - UI Aesthetic Implementation Plan
- [x] Core design philosophy: Layered approach (personality over function)
- [x] Complete implementation strategy documentation
- [x] Phased rollout plan with 4 stages
- [x] Technical architecture for theme system
- [x] Success metrics and brand differentiation elements

**Implementation:** `docs/visual-style/ui-aesthetic-implementation.md`

### ✅ Done - Visual Style Guide
- [x] Primary and secondary color palette systems
- [x] Typography hierarchy with personality treatments
- [x] Hand-drawn illustration style guide
- [x] Emotional language/copy guidelines
- [x] Key implementation areas and moments
- [x] Technical specifications for theming system

**Implementation:** `docs/visual-style/visual-style-guide.md`

### ✅ Done - Implementation Roadmap
- [x] 12-week phased implementation plan
- [x] Resource requirements and team allocation
- [x] Success metrics and evaluation criteria
- [x] Risk mitigation strategies
- [x] Timeline with milestone checkpoints

**Implementation:** `docs/visual-style/implementation-roadmap.md`

### 🔄 In Progress - Theme System Infrastructure
- [x] Design tokens factory with color, spacing, typography, radii, motion
- [x] Theme context provider for palette switching (`ThemeProvider.tsx`)
- [ ] CSS custom properties for color palettes (React Native uses StyleSheet)
- [ ] Adaptive color utilities for accessibility
- [ ] Dynamic theme application based on user context (partial)
- [ ] Performance optimization for theme switching

**Implementation:** `src/ui/theme/`, `src/ui/designSystem.ts`, `src/lib/stores/themeStore.ts`

### 🔄 In Progress - Color Palette System
- [x] Foundation dark backgrounds (#0A0A0D to #111118)
- [ ] Multiple accent palette options aligned with visual style guide:
  - Current: 5 themes (toxic, electric, ember, ice, ultra) with different hex values
  - Target: 4 themes from visual style guide (Toxic Energy, Iron Forge, Neon Glow, Cosmic Strength)
- [ ] Color palette alignment needed between `designSystem.ts` and visual style guide
- [x] Application strategy for core vs emotional moments
- [ ] Color progression for development visualization

**Implementation:** `src/ui/designSystem.ts` (needs alignment update)

### 🔄 In Progress - Typography System
- [x] Typography scale with font sizes, weights, line heights
- [ ] Alignment with visual style guide specifications needed:
  - Current: hero: 34px, h1: 26px, h2: 20px, etc.
  - Target: Display Large: 32px, Display Medium: 24px, etc.
- [ ] Personality layer treatments for key elements (hand-drawn elements, letter spacing variations)
- [x] Bold weights for motivational headers
- [ ] Slight irregularities in letter spacing for human feel
- [ ] Selective hand-drawn elements for quotes/moments
- [x] Hierarchy system (Headlines, Body Text, Quotes/Moments, Numbers)

**Implementation:** `src/ui/designSystem.ts` (needs typography scale update)

### ❌ Not Started - Illustration Style
- [x] Artistic direction documentation (hand-drawn aesthetic with surreal/psychedelic elements)
- [x] Thematic elements documented:
  - Strength/Power motifs (abstract representations, fluid movement, geometric interpretations)
  - Growth/Progression (evolving forms, layered elements, organic patterns)
  - Abstract Energy (kinetic lines, gradient flows, light bursts)
  - Health & Self-Care (organic forms, calming shapes, balanced compositions)
- [ ] Implementation areas (badges, emblems, micro-feedback, loading screens) - **Not implemented**
- [ ] Illustration component system - **Not implemented**
- [ ] SVG optimization pipeline - **Not implemented**

**Status:** Documentation complete, implementation not started. Directory `src/ui/components/illustrations/` does not exist.

### ✅ Done - Emotional Language/Copy
- [x] Tone guidelines (slightly edgy, confident but realistic)
- [x] Copy examples for key moments in buddy system:
  - Workout Start: "Time to earn it."
  - Workout Completion: "You showed up. That's what matters."
  - Personal Record: "That's a statement lift."
  - Rank Progression: "You climbed. Respect."
  - Rest Timer: "Recovery is where champions are made."
  - Empty State: "Your journey starts with showing up."
- [x] Application strategy for core vs emotional moments (via buddy system)
- [x] Multiple buddy archetypes with distinct voices

**Implementation:** `src/lib/buddyData.ts`, `src/lib/buddyEngine.ts`

---

## Technical Notes

**Key Files:**
- `docs/visual-style/ui-aesthetic-implementation.md` - Complete strategy and implementation plan
- `docs/visual-style/visual-style-guide.md` - Detailed design specifications
- `docs/visual-style/implementation-roadmap.md` - Phased approach with timelines
- `docs/visual-style/theme-implementation-plan.md` - **NEW** First 3 themes implementation guide
- `src/ui/designSystem.ts` - Design tokens factory and theme system
- `src/ui/theme.ts` - Theme colors hook and context provider
- `src/ui/theme/ThemeProvider.tsx` - Theme context provider (illustration system not yet implemented)
- `src/lib/buddyData.ts` - Personality-driven copy system

**New Theme System Files:**
- `src/ui/themes/themeTokens.ts` - Theme token type definitions
- `src/ui/themes/ironForge.ts` - Iron Forge theme (medieval blacksmith)
- `src/ui/themes/toxicEnergy.ts` - Toxic Energy theme (radioactive neon)
- `src/ui/themes/neonGlow.ts` - Neon Glow theme (cosmic cyberpunk)
- `src/ui/themes/ThemeProvider.tsx` - New theme context provider
- `src/ui/themes/themeAssets.ts` - Theme-specific asset loading
- `src/ui/themes/index.ts` - Barrel exports

**Theming System Usage:**
```typescript
// Theme context usage
const theme = useTheme();
const ds = makeDesignSystem(theme.mode, theme.accent);

// Color access
ds.tone.bg       // Background color
ds.tone.card     // Card background
ds.tone.text     // Primary text
ds.tone.accent   // Accent color
ds.tone.iron     // Rank color (Iron tier)

// Spacing
ds.space.x4      // 16px
ds.space.x6      // 24px

// Typography
ds.type.h1       // Heading 1 styles
ds.type.body     // Body text styles
```

**Theme Switching:**
```typescript
// Theme context provider
<ThemeProvider>
  <App />
</ThemeProvider>

// Using theme in components
const MyComponent = () => {
  const ds = useDesignSystem();
  return (
    <View style={{ backgroundColor: ds.tone.card }}>
      <Text style={{ color: ds.tone.text, ...ds.type.h1 }}>
        Themed Content
      </Text>
    </View>
  );
};
```

**Color Palette Management:**
```typescript
// Available accent themes
type AccentTheme = 'toxic' | 'electric' | 'ember' | 'ice' | 'ultra';

// Theme context
interface ThemeContext {
  mode: 'dark' | 'light';
  accent: AccentTheme;
  setColorTheme: (mode: 'dark' | 'light') => void;
  setAccentTheme: (accent: AccentTheme) => void;
}
```

---

## Visual Style Documentation

All visual style documentation is located in `docs/visual-style/`:

1. **UI Aesthetic Implementation Plan** (`ui-aesthetic-implementation.md`)
   - Core design philosophy and layered approach
   - Color palette system with emotional meaning
   - Typography system balancing clarity with personality
   - Illustration style with fitness-specific themes
   - Emotional language/copy guidelines
   - Key implementation areas and moments
   - Technical implementation architecture
   - Rollout strategy with phased approach
   - Success metrics and brand differentiation

2. **Visual Style Guide** (`visual-style-guide.md`)
   - Detailed color specifications with hex values
   - Typography treatments and hierarchy
   - Illustration guidelines and examples
   - Iconography system
   - Layout and spacing specifications
   - Component design specifications
   - Motion and animation guidelines
   - Accessibility considerations

3. **Implementation Roadmap** (`implementation-roadmap.md`)
   - 12-week phased implementation timeline
   - Resource requirements and team allocation
   - Milestone checkpoints and deliverables
   - Success metrics and evaluation criteria
   - Risk mitigation strategies

4. **Theme Implementation Plan** (`theme-implementation-plan.md`) - **NEW**
   - Complete implementation plan for Iron Forge, Toxic Energy, Neon Glow themes
   - Theme token system architecture
   - Asset requirements (21 illustrations, 3 textures, 3 badge frames)
   - Component theming patterns
   - Animation specifications per theme
   - Step-by-step implementation checklist

---

## Components Library

**Theming Components:**
- `ThemeProvider` - Context provider for theme management
- `useTheme` - Hook for accessing current theme
- `DesignSystemProvider` - Provider for design system tokens
- `useDesignSystem` - Hook for accessing design system

**Visual Components:**
- Design system tokens for consistent styling (implemented)
- Theme-aware color system (implemented)
- Illustration components for key moments (planned - not implemented)
- Badge components with themed styling (planned - not implemented)
- Animated elements with theme-aware colors (planned - not implemented)
- Loading screen artwork components (planned - not implemented)
- Achievement display components (planned - not implemented)

---

## Animation Guidelines

**Theme Transitions:**
- Smooth palette switching with color interpolation
- Component re-styling with staggered timing
- Loading states with theme-appropriate colors
- Micro-interactions with accent color feedback

**Performance Considerations:**
- SVG illustrations for scalability and performance
- Lazy loading for non-critical decorative elements
- Optimized animations for smooth interactions
- Fallbacks for low-performance scenarios

---

## Accessibility

**Color Contrast:**
- All text meets WCAG AA (4.5:1) contrast requirements
- Accent colors tested against background variants
- Theme-aware contrast adjustments for readability

**Theme Preferences:**
- System preference detection (light/dark mode)
- User override settings persistence
- Reduced motion respect for animations

---

## Dependencies

- React Native StyleSheet
- React Context API
- CSS custom properties (via inline styles)
- expo-haptics (for theme interaction feedback)
- expo-av (for theme transition sound effects)
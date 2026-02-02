# Forgerank Theme Pack Development Guide

## Overview

This guide outlines the process for creating and integrating new theme packs into Forgerank's visual system.

## Theme Pack Structure

```
src/lib/themePacks/
├── [themeId]/
│   ├── index.ts
│   ├── palette.ts
│   ├── illustrations.ts
│   ├── audio.ts
│   ├── motion.ts
│   └── assets/
│       ├── illustrations/
│       ├── audio/
│       └── animations/
```

## Creating a New Theme Pack

### 1. Theme Pack Index

```typescript
// src/lib/themePacks/[themeId]/index.ts
import { ThemePack } from '../types';
import { palette } from './palette';
import { illustrations } from './illustrations';
import { audio } from './audio';
import { motion } from './motion';

export const themePack: ThemePack = {
  id: '[themeId]',
  name: '[Theme Name]',
  description: '[Theme Description]',
  palette,
  illustrations,
  audio,
  motion,
  isPremium: false, // or true for premium themes
  isLegendary: false, // or true for legendary themes
  dependencies: [],
  tags: ['tag1', 'tag2']
};
```

### 2. Palette Definition

```typescript
// src/lib/themePacks/[themeId]/palette.ts
export const palette = {
  // Core UI colors
  background: '#0A0A0D',
  card: '#111118',
  border: '#26263A',
  text: '#F2F4FF',
  muted: '#A9AEC7',

  // Semantic colors
  success: '#20FF9A',
  danger: '#FF2D55',
  warning: '#FFB020',
  info: '#3A8DFF',

  // Accent system
  primary: '#FF00FF',
  secondary: '#00FFFF',
  accent: '#A6FF00',
  accent2: '#00FFB3',
  soft: '#203018',

  // Rank colors
  iron: '#7B7E8A',
  bronze: '#B07A4A',
  silver: '#BFC7D5',
  gold: '#FFCC4A',
  platinum: '#64E6C2',
  diamond: '#53A8FF',
  mythic: '#FF4DFF'
};
```

### 3. Illustrations Catalog

```typescript
// src/lib/themePacks/[themeId]/illustrations.ts
export const illustrations = [
  {
    id: '[themeId]-weight-pr',
    name: 'Weight PR Celebration',
    category: 'pr',
    style: 'hand-drawn',
    assetPath: '[themeId]/weight-pr.svg',
    variants: {
      small: '[themeId]/weight-pr-small.svg',
      medium: '[themeId]/weight-pr-medium.svg',
      large: '[themeId]/weight-pr-large.svg'
    },
    themes: ['strength', 'achievement'],
    isPremium: false,
    isLegendary: false,
    animationType: 'pulse'
  }
  // Additional illustrations...
];
```

### 4. Audio Assets

```typescript
// src/lib/themePacks/[themeId]/audio.ts
export const audio = [
  {
    id: '[themeId]-pr-sound',
    name: 'PR Achievement Sound',
    category: 'pr',
    assetPath: '[themeId]/pr-sound.mp3',
    volume: 0.8,
    isPremium: false,
    isLegendary: false
  }
  // Additional audio assets...
];
```

### 5. Motion Definitions

```typescript
// src/lib/themePacks/[themeId]/motion.ts
export const motion = {
  id: '[themeId]-motion',
  name: '[Theme Name] Motion Profile',
  duration: {
    fast: 120,
    medium: 180,
    slow: 260
  },
  easing: {
    easeOut: [0.16, 1, 0.3, 1]
  },
  spring: {
    tension: 280,
    friction: 22
  },
  haptics: {
    light: 'light',
    medium: 'medium',
    heavy: 'heavy'
  },
  isPremium: false
};
```

## Integration Process

### 1. Register Theme Pack

Add the new theme pack to the theme registry:

```typescript
// src/lib/themePacks/registry.ts
import { toxicEnergyPack } from './toxicEnergy';
import { ironForgePack } from './ironForge';
import { neonGlowPack } from './neonGlow';
// Import new theme pack
import { newThemePack } from './newTheme';

export const THEME_PACKS = {
  'toxic-energy': toxicEnergyPack,
  'iron-forge': ironForgePack,
  'neon-glow': neonGlowPack,
  // Register new theme pack
  'new-theme-id': newThemePack
};
```

### 2. Update Theme Database

Ensure the theme database includes the new theme configuration:

```typescript
// src/lib/themeDatabase.ts
export const DEFAULT_CONFIGURATIONS: ThemeConfiguration[] = [
  // Existing configurations...
  {
    id: 'new-theme-config',
    name: 'New Theme Configuration',
    paletteId: 'new-theme-id',
    typographyId: 'functional-base',
    illustrationId: 'new-theme-id-illustration-set',
    audioId: 'new-theme-id-audio-set',
    motionId: 'new-theme-id-motion',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: false,
    isDefault: false,
    isPremium: false, // or true
    isLegendary: false // or true
  }
];
```

## Asset Creation Guidelines

### Illustrations
- Style: Follow the hand-drawn aesthetic with surreal/psychedelic elements
- Format: SVG for scalability and performance
- Size: Create multiple variants (small, medium, large)
- Animation: Design with animation in mind (separate layers, simple paths)

### Audio
- Format: MP3 or WAV for compatibility
- Duration: Keep sounds short (1-3 seconds)
- Volume: Normalize to consistent levels
- Context: Match emotional tone of theme

### Animations
- Performance: Optimize for 60fps on mobile devices
- Library: Use Lottie for complex animations
- Simplicity: Prefer simple, punchy animations over complex sequences
- Fallback: Provide static versions for low-performance scenarios

## Quality Assurance

### Testing Checklist
- [ ] Theme renders correctly in both light and dark modes
- [ ] All illustrations display properly
- [ ] Audio assets play without errors
- [ ] Animations perform well on target devices
- [ ] Color contrast meets accessibility standards
- [ ] Premium/legendary gating works correctly
- [ ] Fallbacks function when assets are missing

### Performance Benchmarks
- Initial load time: < 2 seconds
- Asset loading time: < 500ms per asset
- Memory usage: < 50MB for theme assets
- Animation frame rate: ≥ 55fps on modern devices

## Distribution

### Free Themes
- Included in base app download
- No additional cost to users
- Limited to core aesthetic elements

### Premium Themes
- Available through in-app purchase
- Enhanced visual elements
- Additional illustrations and audio

### Legendary Themes
- Premium tier with theme transformation capabilities
- Unique visual identity that overrides base theme
- Special effects and animations
- Voice lines and full audio experiences

This guide provides a standardized approach to creating and integrating theme packs, ensuring consistency and quality across all visual content in Forgerank.
# GymRats Visual System Architecture

## Overview

This document outlines the enhanced architecture for GymRats's visual system, building upon the existing layered approach of PURE's emotional personality over LIFTOFF's functional efficiency.

## Enhanced Theme Database Structure

The theme system is extended to support dynamic visual content through a comprehensive database structure.

### Theme Palette Extension

```typescript
interface ExtendedThemePalette {
  id: string;
  name: string;
  description: string;
  emotionalMeaning: string;
  isPremium: boolean;
  isLegendary: boolean;
  tags: string[];
  colors: {
    // Core UI colors
    background: string;
    card: string;
    border: string;
    text: string;
    muted: string;

    // Semantic colors
    success: string;
    danger: string;
    warning: string;
    info: string;

    // Accent system
    primary: string;
    secondary: string;
    accent: string;
    accent2: string;
    soft: string;

    // Rank colors
    iron: string;
    bronze: string;
    silver: string;
    gold: string;
    platinum: string;
    diamond: string;
    mythic: string;
  };
}
```

### Audio Themes

```typescript
interface ThemeAudio {
  id: string;
  name: string;
  category: 'pr' | 'rank-up' | 'workout-start' | 'workout-end' | 'set-logged' | 'error';
  assetPath: string;
  volume: number;
  isPremium: boolean;
  isLegendary: boolean;
}
```

### Illustrations

```typescript
interface ThemeIllustration {
  id: string;
  name: string;
  category: 'achievement' | 'rank' | 'pr' | 'emotional' | 'loading' | 'empty-state';
  style: 'hand-drawn' | 'surreal' | 'psychedelic' | 'minimal';
  assetPath: string;
  variants: {
    small: string;
    medium: string;
    large: string;
  };
  themes: string[];
  isPremium: boolean;
  isLegendary: boolean;
  animationType?: 'none' | 'pulse' | 'bounce' | 'float' | 'custom';
}
```

### Motion and Haptics

```typescript
interface ThemeMotion {
  id: string;
  name: string;
  duration: {
    fast: number;
    medium: number;
    slow: number;
  };
  easing: {
    easeOut: [number, number, number, number];
  };
  spring: {
    tension: number;
    friction: number;
  };
  haptics: {
    light: string;
    medium: string;
    heavy: string;
  };
  isPremium: boolean;
}
```

## Asset Organization Structure

```
assets/
├── illustrations/
│   ├── achievements/
│   ├── ranks/
│   ├── prs/
│   ├── emotional/
│   └── loading/
├── audio/
│   ├── pr/
│   ├── rank-ups/
│   ├── workout/
│   └── ui/
├── animations/
│   ├── pr/
│   ├── rank-ups/
│   └── ui/
└── icons/
    ├── workout/
    ├── ui/
    └── social/
```

## Visual Cue System

### Cue Types

The visual cue system supports various types of user interactions and achievements:

- `weight-pr`: New heaviest weight lifted
- `rep-pr`: More reps at same weight bucket
- `e1rm-pr`: New estimated 1-rep max
- `rank-up`: Progression in rank system
- `workout-start`: Beginning of workout session
- `workout-end`: Completion of workout session
- `set-logged`: Recording of a set
- `rest-timer`: Rest period between sets
- `achievement-unlocked`: Unlocking achievements
- `streak-continued`: Maintaining workout streak

### Intensity Levels

Each cue has an intensity level:
- `low`: Subtle feedback
- `medium`: Noticeable feedback
- `high`: Prominent celebration

## Implementation Components

### Asset Loader

Dynamic asset loading system with caching:

```typescript
class AssetLoader {
  private cache: Map<string, any> = new Map();

  async loadAsset(type: 'illustration' | 'audio' | 'animation', id: string): Promise<any> {
    const cacheKey = `${type}:${id}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Load asset based on type and ID
    const asset = await import(`@/assets/${type}/${id}`);
    this.cache.set(cacheKey, asset);
    return asset;
  }
}
```

### Visual Cue Engine

Centralized system for orchestrating themed feedback:

```typescript
class VisualCueSystem {
  async triggerCue(cueType: CueType, intensity: Intensity) {
    const theme = getActiveTheme();
    const cueConfig = getCueConfiguration(cueType, theme.id);

    // Coordinate visual, audio, and haptic feedback
    await Promise.all([
      this.showVisual(cueConfig.visual),
      this.playAudio(cueConfig.audio),
      this.triggerHaptic(cueConfig.haptic)
    ]);
  }
}
```

## Premium Content System

Content gating for different user tiers:
- Free: Basic themes and standard assets
- Premium: Additional themes and enhanced assets
- Legendary: Full theme transformation with unique visual flair

## Performance Considerations

1. Lazy loading of assets based on usage
2. Memory-efficient caching strategies
3. Fallback mechanisms for low-performance scenarios
4. Asset compression and optimization
5. Progressive enhancement approach

## Accessibility

1. WCAG 2.1 compliance for color contrast
2. Respect for user motion preferences
3. Audio alternatives for visual cues
4. Screen reader compatibility
5. Keyboard navigation support

This architecture provides a scalable foundation for GymRats's evolving visual system while maintaining the core principles of the PURE aesthetic.
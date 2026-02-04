# Visual Style Documentation

**Last Updated:** 2026-02-03

This folder contains all documentation for the GymRats visual identity system, including design specifications, theme definitions, and implementation guides.

---

## Quick Start

| If you want to... | Read this |
|-------------------|-----------|
| Understand the design philosophy | [ui-aesthetic-implementation.md](ui-aesthetic-implementation.md) |
| Get detailed design specs | [visual-style-guide.md](visual-style-guide.md) |
| Implement a theme | [theme-implementation-plan.md](theme-implementation-plan.md) |
| See the system architecture | [visual-system-architecture.md](visual-system-architecture.md) |

---

## Documentation Index

### Core Design Documents

| Document | Description |
|----------|-------------|
| [visual-style-guide.md](visual-style-guide.md) | Complete design specifications - colors, typography, spacing, animations |
| [ui-aesthetic-implementation.md](ui-aesthetic-implementation.md) | Design philosophy and layered approach strategy |
| [visual-system-architecture.md](visual-system-architecture.md) | Technical architecture for the theme system |

### Implementation Guides

| Document | Description |
|----------|-------------|
| [theme-implementation-plan.md](theme-implementation-plan.md) | **NEW** Step-by-step guide for Iron Forge, Toxic Energy, Neon Glow themes |
| [implementation-roadmap.md](implementation-roadmap.md) | Original 12-week phased implementation timeline |
| [implementation-roadmap-v2.md](implementation-roadmap-v2.md) | Updated roadmap with refined phases |
| [cue-system-implementation.md](cue-system-implementation.md) | PR celebration and cue system implementation |

### Asset & Content Guides

| Document | Description |
|----------|-------------|
| [asset-integration-guide.md](asset-integration-guide.md) | How to add and integrate visual assets |
| [ai-image-generation-tools.md](ai-image-generation-tools.md) | Tools and prompts for generating theme artwork |
| [premium-content-system.md](premium-content-system.md) | IAP content and premium theme system |
| [theme-pack-development-guide.md](theme-pack-development-guide.md) | Creating new theme packs |
| [theme-database-extensions-implementation.md](theme-database-extensions-implementation.md) | Database schema for themes |

### Individual Palette Analyses

| Palette | Location | Aesthetic |
|---------|----------|-----------|
| Iron Forge | [Iron Forge Palette/analysis.md](Iron%20Forge%20Palette/analysis.md) | Medieval blacksmith, orange/gold |
| Toxic Energy | [Toxic Energy Palette/analysis.md](Toxic%20Energy%20Palette/analysis.md) | Radioactive neon, lime/magenta |
| Neon Glow | [Neon Glow Palette/analysis.md](Neon%20Glow%20Palette/analysis.md) | Cosmic cyberpunk, magenta/cyan |

---

## Theme System Overview

### Available Themes

| Theme ID | Name | Primary | Secondary | Mood |
|----------|------|---------|-----------|------|
| `toxic-energy` | Toxic Energy | `#ADFF2F` (Lime) | `#FF00FF` (Magenta) | Electric, aggressive |
| `iron-forge` | Iron Forge | `#FF6B35` (Orange) | `#FFB347` (Gold) | Gritty, powerful |
| `neon-glow` | Neon Glow | `#FF00FF` (Magenta) | `#00FFFF` (Cyan) | Futuristic, vibrant |

### Code Location

```
src/ui/themes/
├── themeTokens.ts      # Type definitions
├── ironForge.ts        # Iron Forge theme
├── toxicEnergy.ts      # Toxic Energy theme (default)
├── neonGlow.ts         # Neon Glow theme
├── ThemeProvider.tsx   # React context provider
├── themeAssets.ts      # Asset loading utilities
└── index.ts            # Barrel exports
```

### Usage

```typescript
import { useTheme, ThemeProvider } from '@/src/ui/themes';

// Wrap app root
<ThemeProvider>
  <App />
</ThemeProvider>

// Use in components
const theme = useTheme();
<View style={{ backgroundColor: theme.colors.card }}>
  <Text style={{ color: theme.colors.text }}>Themed!</Text>
</View>
```

---

## Asset Requirements

Each theme requires:
- **7 illustrations** (PR celebrations, rank-up)
- **1 texture overlay** (metal, noise, scanlines)
- **1 badge frame** (SVG)

See [theme-implementation-plan.md](theme-implementation-plan.md) for complete asset specifications.

---

## Related Feature Documentation

- [features/ui-themes/feature-ui-themes.md](../features/ui-themes/feature-ui-themes.md) - Main feature tracking
- [features/design-system/feature-design-system.md](../features/design-system/feature-design-system.md) - Design system primitives

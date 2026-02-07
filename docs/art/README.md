# Art & Visual Assets Documentation

Master navigation for all art-related documentation in GymRats.

---

## Master Tracker

> **START HERE:** [ART-ASSET-MASTER-TRACKER.md](./ART-ASSET-MASTER-TRACKER.md)
>
> The single source of truth for ALL art assets - inventory, status, costs, and action plan.

---

## Quick Links

| Document | Purpose |
|----------|---------|
| **[ART-ASSET-MASTER-TRACKER.md](./ART-ASSET-MASTER-TRACKER.md)** | **THE source of truth - all assets, status, costs** |
| [Style Guide](./style-guide.md) | Visual design specifications (colors, typography, spacing) |
| [UI Asset Inventory](./UI-ASSET-INVENTORY.md) | Complete UI asset breakdown with theming strategies |
| [Theme System](./themes/theme-system.md) | How the theme system works |
| [Avatar System Design](./AVATAR-SYSTEM-DESIGN.md) | Complete avatar customization architecture |
| [AI Image Generation](./generation/AI-IMAGE-GEN-RESEARCH.md) | Research for mass asset creation |

---

## Directory Structure

```
docs/art/
├── README.md                    # This file
├── ART-ASSET-MASTER-TRACKER.md  # THE source of truth for all assets
├── style-guide.md               # Visual design specifications
├── UI-ASSET-INVENTORY.md        # Complete UI asset breakdown
├── AVATAR-SYSTEM-DESIGN.md      # Avatar customization system design
│
├── generation/                  # AI image generation resources
│   ├── AI-IMAGE-GEN-RESEARCH.md # Research & tool comparison
│   ├── asset-tracking.csv       # Progress tracking spreadsheet
│   ├── exercise-prompts.csv     # 637 exercise icon prompts
│   ├── avatar-prompts.csv       # 205 avatar asset prompts
│   ├── avatar-asset-specs.md    # Avatar technical specifications
│   ├── ui-asset-prompts.csv     # UI element generation prompts
│   ├── EXERCISE-ICON-STYLE-GUIDE.md # Icon generation style
│   ├── EXERCISE-IMAGE-PRIORITY.md # Priority order for generation
│   ├── ICON-PIPELINE-GUIDE.md   # Generation pipeline setup
│   └── batch-scripts/           # Generation automation scripts
│
├── themes/                      # Theme system documentation
│   ├── theme-system.md          # How themes work
│   ├── THEME-PACK-MIGRATION.md  # Migration from legacy system
│   ├── theme-pack-development-guide.md # Creating new themes
│   ├── theme-implementation-plan.md # Detailed implementation
│   └── palettes/                # Color palette assets
│       ├── toxic-energy/        # Lime + Magenta (default)
│       ├── iron-forge/          # Orange + Gold
│       ├── neon-glow/           # Magenta + Cyan (premium)
│       └── infernal-cosmos/     # Red + Purple (premium)
│
└── implementation/              # Technical implementation docs
    ├── asset-integration-guide.md # How to integrate assets
    ├── cue-system-implementation.md # Visual cue system
    ├── premium-content-system.md # IAP content gating
    ├── visual-system-architecture.md # System architecture
    ├── implementation-roadmap-v2.md # Development roadmap
    └── theme-database-extensions-implementation.md # DB extensions
```

---

## For Designers

### Getting Started

1. Read the [Style Guide](./style-guide.md) for visual specifications
2. Check existing [palettes](./themes/palettes/) for color reference
3. Review [EXERCISE-ICON-STYLE-GUIDE.md](./generation/EXERCISE-ICON-STYLE-GUIDE.md) for icon style

### Asset Creation Workflow

1. Design assets following style guide specifications
2. Export in required formats (SVG primary, PNG fallback)
3. Place in appropriate `/assets/` folder
4. Update asset registry if needed

---

## For Developers

### Theme Implementation

1. Read [Theme System](./themes/theme-system.md) for API usage
2. Use [THEME-PACK-MIGRATION.md](./themes/THEME-PACK-MIGRATION.md) for migration
3. Reference [theme-implementation-plan.md](./themes/theme-implementation-plan.md) for details

### Key Code Files

| File | Purpose |
|------|---------|
| `src/lib/themes/types.ts` | TypeScript interfaces |
| `src/lib/themes/defaultPacks.ts` | Built-in theme definitions |
| `src/lib/themes/themePackStore.ts` | Theme state management |
| `src/ui/designSystem.ts` | Legacy design tokens |

### Quick Usage

```typescript
// React components
import { useThemePackColors } from '@/src/lib/themes';

function MyComponent() {
  const colors = useThemePackColors();
  return <View style={{ backgroundColor: colors.surface }} />;
}

// Outside React
import { getResolvedTheme } from '@/src/lib/themes';
const theme = getResolvedTheme();
```

---

## For AI Asset Generation

### Exercise Icons

1. Review [AI-IMAGE-GEN-RESEARCH.md](./generation/AI-IMAGE-GEN-RESEARCH.md)
2. Prompts are ready in [exercise-prompts.csv](./generation/exercise-prompts.csv)
3. Follow priority order in [EXERCISE-IMAGE-PRIORITY.md](./generation/EXERCISE-IMAGE-PRIORITY.md)

### Avatar Assets

1. Review [AVATAR-SYSTEM-DESIGN.md](./AVATAR-SYSTEM-DESIGN.md) for system overview
2. Read [avatar-asset-specs.md](./generation/avatar-asset-specs.md) for technical specifications
3. Prompts are ready in [avatar-prompts.csv](./generation/avatar-prompts.csv)
4. Generate in batch order: bodies > faces > hair > outfits > accessories > effects

### Recommended Tools

| Tool | Best For | Cost |
|------|----------|------|
| DiffuGen (Local) | Bulk generation | Free |
| Stability AI | High quality | ~$0.03/image |
| fal.ai Flux | Production | ~$0.03/image |

---

## Theme Tiers

| Tier | Themes | Access |
|------|--------|--------|
| **Free** | Toxic Energy, Iron Forge | All users |
| **Premium** | Neon Glow, Infernal Cosmos | IAP |
| **Legendary** | TBD | IAP (full transformation) |

---

## Related Documentation

- [Project Status](../1-PROJECT-STATUS.md) - Current priorities
- [Codebase Guide](../3-CODEBASE-GUIDE.md) - Code patterns
- [Assets README](../../assets/README.md) - Asset organization

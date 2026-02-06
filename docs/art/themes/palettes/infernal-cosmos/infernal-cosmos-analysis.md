# Forgerank "Infernal Cosmos" Theme

## Core Palette

| Token | Hex | Usage |
|---|---|---|
| `bg-primary` | `#1A0A20` | Deep purple-black base background |
| `bg-secondary` | `#2A1035` | Card/panel backgrounds |
| `bg-elevated` | `#3A1845` | Elevated surfaces, modals |
| `border-default` | `#D4772A` | Primary border color (warm copper/orange) |
| `border-subtle` | `#6B3A5E` | Subtle dividers, inactive borders |
| `border-glow` | `#FF8C32` | Glowing/active borders |

## Accent Colors

| Token | Hex | Usage |
|---|---|---|
| `accent-primary` | `#FF6B1A` | Primary action buttons, CTAs, fire icons |
| `accent-secondary` | `#FFB347` | Secondary highlights, warm gold accents |
| `accent-hot` | `#FF4500` | Streaks, fire emoji color, urgent states |
| `accent-cool` | `#4DA6FF` | Globe icon, web/social stats, info badges |

## Rank Tier Colors

For muscle rankings, badges, and tier indicators.

| Token | Hex | Usage |
|---|---|---|
| `rank-platinum` | `#E8833A` | Platinum tier (copper-orange — fits the infernal theme) |
| `rank-gold` | `#FFD700` | Gold tier |
| `rank-silver` | `#C0C0C0` | Silver tier |
| `rank-bronze` | `#CD7F32` | Bronze tier |
| `rank-unranked` | `#5A3A6A` | Unranked/locked |

## Text Colors

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#FFFFFF` | Headings, primary labels |
| `text-secondary` | `#E8CBA0` | Body text, warm cream tone |
| `text-muted` | `#8A6A7A` | Disabled/hint text |
| `text-accent` | `#FFB347` | Highlighted text, stats numbers |

## Bodygraph Heatmap

Muscle activation and ranking visualization gradient.

| Token | Hex | Usage |
|---|---|---|
| `heat-max` | `#FFD700` | Strongest/highest ranked muscles (bright gold-yellow) |
| `heat-high` | `#FF8C00` | High rank (orange) |
| `heat-mid` | `#E85020` | Mid rank (red-orange) |
| `heat-low` | `#8B2252` | Low rank (deep magenta-red) |
| `heat-none` | `#2A1035` | Unranked/no data (blends with bg) |

## Special Effects

| Token | Value | Usage |
|---|---|---|
| `glow-primary` | `0 0 12px rgba(255,107,26,0.6)` | Box shadow for active/selected elements |
| `glow-border` | `0 0 8px rgba(212,119,42,0.4)` | Subtle border glow on cards |
| `bg-stars` | Radial-gradient particles | Starfield/sparkle overlay on backgrounds |
| `bg-nebula` | `radial-gradient(ellipse, #3A1845 0%, #1A0A20 70%)` | Nebula-like background gradient |

## Tab / Navigation Style

- **Inactive tabs:** `border: 1px solid border-default`, `bg: transparent`, `text: text-secondary`
- **Active tab:** `border: 1px solid border-glow`, `bg: bg-elevated`, `text: text-primary`, `box-shadow: glow-primary`
- Pill/rounded-rect shape with ~8px border-radius

## Card Style

- `background: bg-secondary`
- `border: 1px solid border-default`
- `border-radius: 12px`
- Optional inner `box-shadow: inset 0 0 20px rgba(26,10,32,0.5)` for depth
- Rank badge rows: left icon → label + rank text → chevron right, full-width clickable

## Typography

- **Headings:** Bold, clean sans-serif (Inter Bold or similar), white
- **Rank labels:** ALL CAPS, bold, colored by tier
- **Stats numbers:** `text-accent`, slightly larger weight
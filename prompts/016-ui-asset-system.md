<objective>
Design and document the UI element asset system for GymRats.

This covers all non-exercise visual assets:
- Borders and frames
- Backgrounds and textures
- Buttons and interactive elements
- Visual effects and animations
- Celebration/cue animations

WHY: Consistent UI assets across themes make the app feel polished. These assets must be designed to work with the theme system (color-tintable or theme-specific variants).
</objective>

<context>
Theme system: `./src/lib/themes/` - Packs define colors, not images
Asset folder: `./assets/ui/` - Created in previous prompt
Style reference: `./docs/art/style-guide.md`

Key constraint: UI assets should either be:
1. Colorless/grayscale (tinted by theme at runtime)
2. Generated per-theme (more work but more control)
</context>

<requirements>
<asset_inventory>
Create comprehensive inventory of needed UI assets:

**Borders & Frames**
- Card borders (standard, premium, legendary tiers)
- Achievement frames
- PR celebration frames
- Rank badge borders (per tier: Iron through Mythic)

**Backgrounds**
- Card backgrounds (with subtle texture)
- Modal backgrounds
- Celebration overlays
- Gradient meshes

**Buttons**
- Primary action button
- Secondary button
- Icon buttons
- Toggle states

**Effects**
- Glow effects (can be CSS/code?)
- Particle sprites for confetti
- Sparkle/shine animations
- Progress ring assets

**Celebration Assets**
- PR type badges (Weight/Rep/e1RM)
- Rank-up badges
- Streak badges
- Level-up effects
</asset_inventory>

<theming_strategy>
For each asset category, determine:
1. Can it be a single grayscale asset tinted by code?
2. Does it need theme-specific variants?
3. Can it be pure CSS/SVG (no image needed)?

Document decision rationale.
</theming_strategy>

<generation_plan>
For assets that need AI generation:
- Create prompt templates
- Estimate count needed
- Add to batch pipeline
</generation_plan>
</requirements>

<output>
<documentation>
Create: `./docs/art/UI-ASSET-INVENTORY.md`

Structure:
```markdown
# UI Asset Inventory

## Asset Categories

### Borders & Frames
| Asset | Approach | Theme Variants | Priority | Status |
|-------|----------|----------------|----------|--------|
| card-border | Grayscale + tint | No | P0 | Needed |

### Backgrounds
[Same table format]

### Buttons
[Same table format]

### Effects
[Same table format]

## Generation Queue
[Assets that need AI generation with prompts]

## CSS/Code Solutions
[Assets that don't need images]

## Implementation Notes
[How to integrate with theme system]
```
</documentation>

<prompt_templates>
If AI generation needed, add prompts to:
`./docs/art/generation/ui-asset-prompts.csv`
</prompt_templates>
</output>

<verification>
Before completing:
1. All UI element categories inventoried
2. Theming approach decided for each
3. Generation vs CSS decision documented
4. Priority levels assigned
5. Prompt templates created for AI-generated assets
</verification>

<success_criteria>
- Complete UI asset inventory
- Clear theming strategy per asset type
- Generation queue ready for batch processing
- CSS/code alternatives identified where appropriate
</success_criteria>

<next_prompt>
After completing, the next prompt will: Design avatar system architecture
(base avatars, clothing, accessories, growth stages)
</next_prompt>

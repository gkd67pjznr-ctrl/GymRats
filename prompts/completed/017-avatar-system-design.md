<objective>
Design the complete avatar system architecture for GymRats.

The avatar system is a major engagement feature where users create and grow their fitness character over time. This prompt focuses on DESIGN and DOCUMENTATION, not implementation.

Approach: Layered design for MVP launch with finishing touches post-launch.

WHY: Avatars create emotional investment and provide visual progression feedback. A well-designed system can expand infinitely with new items while keeping initial scope manageable.
</objective>

<context>
Asset folder: `./assets/avatars/` - Structure created in previous prompt
Theme integration: Avatars should work with any equipped theme
Monetization: Some items can be IAP (coordinate with RevenueCat entitlements)

User journey:
1. Create avatar at signup
2. Avatar appears on profile and in social feed
3. Avatar "grows" as user levels up
4. Unlock clothing/accessories through achievements or purchase
5. Avatar hangs out in customizable room (future feature)
</context>

<requirements>
<layer_system>
Design composable avatar layers (bottom to top):

1. **Base Body** - Body shape/type
2. **Skin/Color** - Skin tone options
3. **Face** - Facial features, expressions
4. **Hair** - Hairstyles
5. **Outfit Base** - Tank top, t-shirt, sports bra, etc.
6. **Outfit Bottom** - Shorts, leggings, joggers
7. **Footwear** - Sneakers, lifting shoes, barefoot
8. **Accessories** - Headbands, wristbands, belts
9. **Equipment** - Dumbbells, kettlebells (for poses)
10. **Effects** - Auras, sparkles (for high ranks)

Each layer = separate PNG with transparency
Combine at runtime for final avatar
</layer_system>

<mvp_scope>
Minimum for launch:

**Base Bodies**: 4 options (2 masculine, 2 feminine silhouettes)
**Skin Tones**: 6 options
**Faces**: 8 expressions (neutral, happy, determined, exhausted, etc.)
**Hair**: 12 styles (mix of lengths/types)
**Outfits**: 10 tops, 8 bottoms (basic gym wear)
**Footwear**: 4 options
**Accessories**: 6 basic items

Total MVP assets: ~58 unique items
With variations: ~150-200 PNGs
</mvp_scope>

<growth_stages>
Avatar visual progression tied to user level:

**Stage 1 (Levels 1-10)**: Beginner look
- Slightly nervous expression available
- Basic gym clothes only

**Stage 2 (Levels 11-25)**: Getting fit
- More confident poses
- Slightly more defined silhouette
- Unlock: Better gym wear

**Stage 3 (Levels 26-50)**: Intermediate
- Athletic build visible
- Determined expressions
- Unlock: Premium accessories

**Stage 4 (Levels 51-75)**: Advanced
- Clearly fit appearance
- Power poses available
- Unlock: Competition wear

**Stage 5 (Levels 76-100)**: Elite
- Peak physique silhouette
- Legendary auras/effects
- Unlock: Champion accessories
</growth_stages>

<hangout_room>
Future feature - document architecture only:

- Customizable background room
- Placeable decorations
- Trophies displayed
- Workout equipment visible
- Social visiting (see friends' rooms)
</hangout_room>
</requirements>

<output>
<documentation>
Create: `./docs/art/AVATAR-SYSTEM-DESIGN.md`

Structure:
```markdown
# Avatar System Design

## Overview
[System philosophy and goals]

## Layer Architecture
[Detailed layer system with specs]
- Layer order
- Image dimensions
- Anchor points
- File naming convention

## MVP Asset List
[Comprehensive list with:
- Item name
- Layer
- Unlock condition
- Priority
- Generation prompt]

## Growth Stages
[Visual progression details]

## Color/Theme Integration
[How avatars work with themes]

## Monetization Items
[Items designated as IAP]

## Hangout Room (Future)
[Architecture notes for later]

## Implementation Notes
[For developers]

## Generation Queue
[Prompts for AI generation]
```
</documentation>

<asset_specs>
Create: `./docs/art/generation/avatar-asset-specs.md`

Technical specifications:
- Image dimensions (512x512 recommended)
- Anchor point system
- Layer composition order
- File naming: `{layer}_{item}_{variant}.png`
- Color handling (grayscale base vs colored)
</asset_specs>

<prompt_templates>
Create: `./docs/art/generation/avatar-prompts.csv`

Columns:
- asset_id
- layer
- item_name
- prompt
- variations_needed
- priority
</prompt_templates>
</output>

<verification>
Before completing:
1. Layer system fully specified
2. MVP asset list is complete and reasonable scope
3. Growth stages defined with unlock logic
4. File naming and specs documented
5. Generation prompts created for MVP assets
</verification>

<success_criteria>
- Complete avatar system design document
- Technical specs for implementation
- MVP scoped to ~150-200 assets
- Generation prompts ready for batch processing
- Clear path from MVP to full system
</success_criteria>

<next_prompt>
After completing, the next prompt will: Create master art asset tracker
(Consolidate all asset needs, priorities, and generation status)
</next_prompt>

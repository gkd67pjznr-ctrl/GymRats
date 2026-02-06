<objective>
Create a master tracker consolidating ALL art asset needs across the entire GymRats app.

This is the "source of truth" document that:
- Lists every asset needed
- Tracks generation status
- Prioritizes for launch vs post-launch
- Estimates costs and time
- Provides clear action items

WHY: Without a single tracker, assets will be forgotten, duplicated, or inconsistently styled. This document keeps the massive art generation effort organized.
</objective>

<context>
Consolidate from previous prompts:
- `./docs/art/generation/exercise-prompts.csv` - 1590 exercises
- `./docs/art/UI-ASSET-INVENTORY.md` - UI elements
- `./docs/art/AVATAR-SYSTEM-DESIGN.md` - Avatar assets
- `./docs/art/generation/AI-IMAGE-GEN-RESEARCH.md` - Cost data

Also consider:
- Celebration animations
- Theme-specific assets
- Future expansion (animations, hangout room)
</context>

<requirements>
<master_inventory>
Create comprehensive inventory across ALL categories:

**Category 1: Exercise Icons**
- Count: 1590
- Status: Prompts ready
- Priority: P0 (273), P1 (685), P2 (632)

**Category 2: UI Elements**
- Borders/Frames: X items
- Backgrounds: X items
- Buttons: X items
- Effects: X items

**Category 3: Avatar System**
- Base components: X items
- Clothing: X items
- Accessories: X items
- Growth variants: X items

**Category 4: Celebrations**
- PR animations: X items
- Rank badges: X items
- Achievement badges: X items

**Category 5: Theme Assets**
- Per-theme variants: X items
- Theme previews: X items

**Category 6: Future (Post-Launch)**
- Hangout room: X items
- Exercise animations: X items
- Seasonal items: X items
</master_inventory>

<priority_matrix>
Define clear priorities:

**LAUNCH BLOCKERS (P0)**
- Must have for v1.0 launch
- Exercise icons (top 273)
- Core UI elements
- Basic avatar system

**LAUNCH NICE-TO-HAVE (P1)**
- Improves launch but not blocking
- Full exercise icons
- Additional avatar items
- Polish effects

**POST-LAUNCH (P2)**
- Can ship after launch
- Avatar growth stages
- Hangout room
- Animations
</priority_matrix>

<cost_projection>
Using research data, calculate:

| Category | Asset Count | Cost/Asset | Total Cost | Time Est |
|----------|-------------|------------|------------|----------|
| P0 Icons | 273 | $X | $X | X hrs |
| P0 UI | X | $X | $X | X hrs |
| P0 Avatar | X | $X | $X | X hrs |
| **P0 Total** | **X** | - | **$X** | **X hrs** |
| P1 Total | X | - | $X | X hrs |
| P2 Total | X | - | $X | X hrs |
| **GRAND TOTAL** | **X** | - | **$X** | **X hrs** |
</cost_projection>

<action_plan>
Create week-by-week execution plan:

**Week 1**:
- Complete research & folder setup
- Generate test batch (10 icons)
- Validate pipeline

**Week 2**:
- Generate P0 exercise icons (273)
- Create P0 UI elements

**Week 3**:
- Generate MVP avatar assets
- Integration testing

**Week 4**:
- Quality review and fixes
- P1 exercise icons begin

[Continue as needed]
</action_plan>
</requirements>

<output>
<primary_document>
Create: `./docs/art/ART-ASSET-MASTER-TRACKER.md`

This is THE document for tracking all art assets.

Structure:
```markdown
# GymRats Art Asset Master Tracker

## Quick Stats
- Total Assets Needed: X
- P0 (Launch): X
- Generated: X (X%)
- Remaining: X

## Executive Summary
[Current status and next actions]

## Asset Inventory

### Exercise Icons
[Full breakdown with status]

### UI Elements
[Full breakdown with status]

### Avatar System
[Full breakdown with status]

### Celebrations
[Full breakdown with status]

### Theme Assets
[Full breakdown with status]

### Future (Post-Launch)
[Documented but not prioritized]

## Cost & Time Projections
[Detailed tables]

## Generation Pipeline Status
[Which tools are set up, what's running]

## Action Plan
[Week-by-week or sprint-by-sprint]

## Changelog
[Track major updates to this document]
```
</primary_document>

<tracking_spreadsheet>
Create: `./docs/art/generation/asset-tracking.csv`

Columns:
- asset_id
- category
- name
- priority (P0/P1/P2)
- status (needed/queued/generating/done/failed)
- generated_date
- file_path
- notes
</tracking_spreadsheet>
</output>

<verification>
Before completing:
1. All asset categories from previous prompts included
2. Counts are accurate
3. Cost projections use research data
4. Action plan is realistic
5. Tracking CSV has all P0 assets listed
</verification>

<success_criteria>
- Single source of truth document created
- All assets inventoried with status
- Clear priority assignments
- Realistic cost and time estimates
- Actionable weekly plan
- CSV ready for tracking progress
</success_criteria>

<final_notes>
This document should be updated regularly as assets are generated.
Consider adding a script to auto-update counts from file system.
</final_notes>

<objective>
Restructure and consolidate all art-related folders into a unified asset management system.

Currently, art assets are scattered across:
- `./docs/visual-style/` - Style guides, palettes, implementation docs
- `./docs/Themes/` - Theme system docs (outdated)
- `./docs/assets/` - Exercise prompts, icon guides
- `./src/lib/themes/` - Theme pack code

This needs to become a clean, scalable structure that can handle:
- 1590+ exercise icons
- Multiple theme palettes
- UI element assets
- Avatar system assets
- Future animations

WHY: A messy asset structure will become unmanageable as we generate thousands of images. We need organization BEFORE mass generation begins.
</objective>

<context>
Read the research from: `./docs/visual-style/AI-IMAGE-GEN-MASTER-RESEARCH.md`
This will inform how generated assets should be organized.

Current folder audit needed:
- `./docs/visual-style/` - Multiple .md files, palette subfolders
- `./docs/Themes/` - README.md, THEME-PACK-MIGRATION.md, theme-system.md
- `./docs/assets/` - Exercise prompts CSV, icon style guide
- `./src/lib/themes/` - TypeScript theme pack code
- `./assets/` - App assets (if exists)
</context>

<requirements>
<folder_structure>
Design and implement this unified structure:

```
./docs/art/                          # All art documentation
├── README.md                        # Master navigation
├── style-guide.md                   # Visual style guide (consolidated)
├── generation/                      # AI generation resources
│   ├── AI-IMAGE-GEN-RESEARCH.md    # (moved from visual-style)
│   ├── exercise-prompts.csv        # (moved from assets)
│   ├── EXERCISE-ICON-STYLE-GUIDE.md
│   └── batch-scripts/              # Generation scripts
├── themes/                          # Theme documentation
│   ├── theme-system.md             # How themes work
│   ├── THEME-PACK-MIGRATION.md     # Migration guide
│   └── palettes/                   # Color palettes
│       ├── toxic-energy/
│       ├── iron-forge/
│       ├── neon-glow/
│       └── infernal-cosmos/
└── implementation/                  # Technical implementation
    ├── asset-integration-guide.md
    ├── cue-system-implementation.md
    └── premium-content-system.md

./assets/                            # Actual asset files (for app)
├── exercises/                       # Exercise icons
│   ├── icons/                      # Generated icons
│   │   ├── bench-press.png
│   │   └── ...
│   └── animations/                 # Future: exercise animations
├── ui/                             # UI elements
│   ├── borders/
│   ├── backgrounds/
│   ├── buttons/
│   └── effects/
├── avatars/                        # Avatar system
│   ├── base/                       # Base avatar shapes
│   ├── clothing/                   # Clothing items
│   ├── accessories/                # Accessories
│   ├── expressions/                # Facial expressions
│   └── growth-stages/              # Progression visuals
├── celebrations/                   # PR celebrations, rank-ups
│   └── cue-animations/
└── hangout/                        # Avatar hangout room
    └── decorations/
```
</folder_structure>

<migration_tasks>
1. Create new folder structure
2. Move files to appropriate locations
3. Update any file references in code
4. Create README.md files for navigation
5. Delete empty/deprecated folders
6. Update .gitignore if needed for generated assets
</migration_tasks>

<documentation_consolidation>
Consolidate these into fewer, clearer documents:
- visual-style-guide.md + ui-aesthetic-implementation.md → style-guide.md
- theme-system.md + theme-pack-development-guide.md → themes/theme-system.md
- Keep implementation docs separate but organized
</documentation_consolidation>
</requirements>

<output>
<files_to_create>
- `./docs/art/README.md` - Master navigation hub
- `./docs/art/style-guide.md` - Consolidated style guide
- `./assets/README.md` - Asset organization guide
- Various subdirectory README.md files
</files_to_create>

<files_to_move>
Document all file moves in a migration log.
</files_to_move>

<files_to_delete>
- `./docs/Themes/README.md` (if empty after move)
- `./docs/visual-style/` folder (after moving contents)
- Any duplicate or deprecated files
</files_to_delete>
</output>

<verification>
Before completing:
1. All art-related docs are under `./docs/art/`
2. Asset folder structure is created and documented
3. No broken file references in code
4. README.md files provide clear navigation
5. Old folders are cleaned up
</verification>

<success_criteria>
- Clean, scalable folder structure implemented
- All existing content migrated
- Documentation consolidated and updated
- Ready for mass asset generation
</success_criteria>

<next_prompt>
After completing, the next prompt will: Create exercise icon generation pipeline
Using the new structure and research findings.
</next_prompt>

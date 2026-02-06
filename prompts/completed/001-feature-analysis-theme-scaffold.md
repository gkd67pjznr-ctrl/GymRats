<objective>
Thoroughly analyze a selected feature's implementation in the codebase, then:
1. Recommend improvements and performance optimizations
2. Build a theme pack system scaffold that future-proofs the UI for dynamic theming
3. Produce a concrete implementation plan with prioritized action items

This enables selling theme "packs" as IAP while ensuring features are performant and maintainable.
</objective>

<context>
GymRats is a React Native/Expo fitness app with:
- Zustand state management with AsyncStorage persistence
- Design system in `src/ui/designSystem.ts` with accent themes (toxic, electric, ember, ice, ultra)
- Components in `src/ui/components/`
- Feature-specific logic in `src/lib/`

Theme packs will be sold as IAP in the future - each pack transforms the visual experience beyond just colors (animations, icons, sounds, UI flourishes).

Read first:
- `CLAUDE.md` for project conventions
- `src/ui/designSystem.ts` for current theme implementation
- `src/ui/theme.ts` for theme hooks
- `docs/features/` for feature documentation
</context>

<phase_1_feature_selection>
## Quick Feature Inventory

First, scan the codebase to identify implemented features. Check:
- `src/lib/stores/` - what stores exist and are actively used
- `src/ui/components/` - major component groups
- `app/` - screens and routes
- `docs/features/` - documented features

Then present 3-5 feature recommendations to analyze, grouped by:
- **High Impact**: Core user-facing features (live workout, scoring, PR detection)
- **Theme-Ready**: Features that would benefit most from theme pack integration
- **Technical Debt**: Features needing performance/architecture improvements

Format:
```
RECOMMENDED FEATURES FOR ANALYSIS:

1. [Feature Name] - [One-line description]
   Impact: High/Medium | Theme Potential: High/Medium/Low | Tech Debt: Yes/No
   Why: [Brief rationale]

2. ...
```

**STOP and ask user to select which feature to analyze.**
</phase_1_feature_selection>

<phase_2_deep_analysis>
## Thorough Feature Analysis

After user selects a feature, deeply analyze:

### 2.1 Architecture Review
- File structure and organization
- State management patterns
- Component hierarchy
- Data flow (props, stores, effects)

### 2.2 Performance Assessment
- Re-render patterns (unnecessary renders?)
- Memory usage (subscriptions, listeners, cleanup?)
- Bundle impact (lazy loading opportunities?)
- Animation performance (native driver usage?)

### 2.3 Code Quality
- TypeScript strictness and type safety
- Error handling completeness
- Test coverage
- Accessibility considerations

### 2.4 Theme Integration Readiness
- Current color/style usage (hardcoded vs design system?)
- Animation patterns (themeable?)
- Icon usage (swappable?)
- Sound/haptic usage (themeable?)

Document findings with specific file:line references.
</phase_2_deep_analysis>

<phase_3_theme_system_scaffold>
## Build Theme Pack Infrastructure

Create the foundational system for theme packs:

### 3.1 Theme Pack Type System
```typescript
// Theme pack structure to create
type ThemePack = {
  id: string;
  name: string;
  tier: 'free' | 'premium' | 'legendary';

  // Visual
  colors: ThemeColors;
  gradients?: GradientConfig[];

  // Motion
  animations?: AnimationOverrides;
  transitions?: TransitionConfig;

  // Assets
  icons?: IconPackConfig;
  sounds?: SoundPackConfig;

  // UI Flourishes
  particles?: ParticleConfig;
  celebrations?: CelebrationConfig;
}
```

### 3.2 Files to Create
- `./src/lib/themes/types.ts` - Theme pack type definitions
- `./src/lib/themes/themePackStore.ts` - Zustand store for active theme
- `./src/lib/themes/defaultPacks.ts` - Built-in free theme packs
- `./src/lib/themes/themeContext.tsx` - React context for theme access
- `./src/lib/themes/index.ts` - Public exports

### 3.3 Integration Hooks
- `useThemePack()` - Get current theme pack
- `useThemedColors()` - Get colors from active pack
- `useThemedAnimation()` - Get animation config
- `useThemedSound()` - Get sound for event type

### 3.4 Migration Strategy
- Wrap existing `designSystem.ts` usage
- Gradual component migration path
- Backwards compatibility with current accent system
</phase_3_theme_system_scaffold>

<phase_4_implementation_plan>
## Concrete Implementation Plan

Produce a prioritized action plan:

### Format
```markdown
# [Feature] Analysis & Theme Integration Plan

## Executive Summary
[2-3 sentences on current state and recommended actions]

## Priority 1: Critical Fixes
- [ ] [Specific task] - `file:line` - [Why urgent]

## Priority 2: Performance Improvements
- [ ] [Specific task] - [Expected impact]

## Priority 3: Theme System Foundation
- [ ] [Task] - [Dependency notes]

## Priority 4: Feature Theme Integration
- [ ] [Task] - [Complexity: Low/Med/High]

## Future Considerations
- [Item for later consideration]
```

Save to: `./docs/analyses/[feature-name]-analysis.md`
</phase_4_implementation_plan>

<output>
Create these files:

1. **Analysis Report**: `./docs/analyses/[feature-name]-analysis.md`
   - Full analysis findings
   - Prioritized implementation plan
   - Theme integration roadmap

2. **Theme System Scaffold** (if not already created):
   - `./src/lib/themes/types.ts`
   - `./src/lib/themes/themePackStore.ts`
   - `./src/lib/themes/defaultPacks.ts`
   - `./src/lib/themes/themeContext.tsx`
   - `./src/lib/themes/index.ts`

3. **Migration Guide**: `./docs/themes/THEME-PACK-MIGRATION.md`
   - How to update components to use theme packs
   - Examples of before/after
</output>

<verification>
Before completing:
- [ ] Feature inventory presented and user selected a feature
- [ ] Deep analysis completed with file:line references
- [ ] Theme pack type system is comprehensive and extensible
- [ ] Theme store integrates with existing Zustand patterns
- [ ] Implementation plan has concrete, actionable items
- [ ] All output files created
- [ ] No TypeScript errors in new theme system files
</verification>

<success_criteria>
- User understands current feature state with specific findings
- Theme pack system is ready for future pack development
- Clear path from current state to theme-integrated feature
- Prioritized tasks that can be executed incrementally
- Architecture supports selling theme packs as IAP
</success_criteria>

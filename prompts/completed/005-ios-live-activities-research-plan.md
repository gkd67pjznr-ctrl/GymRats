<research_objective>
Thoroughly research iOS Live Activities and Dynamic Island APIs, then create a detailed implementation plan for adding a workout display feature to GymRats.

This feature will show real-time workout information (exercise, set count, rest timer) in the Dynamic Island and Lock Screen during active workouts, significantly improving the workout experience for iPhone 14 Pro+ users.

Use Context7 MCP to fetch up-to-date documentation, web searches for implementation examples, and analyze the existing GymRats codebase for integration points.
</research_objective>

<context>
**Project:** GymRats - React Native workout tracking app
**Tech Stack:** Expo 54, React Native 0.81, TypeScript, Zustand
**Current State:** Workout drawer with active session tracking, rest timer, PR detection

**Relevant Existing Code:**
- `src/lib/stores/currentSessionStore.ts` - Active workout session state
- `src/lib/stores/workoutDrawerStore.ts` - Rest timer state, drawer visibility
- `app/live-workout.tsx` - Live workout screen
- `src/ui/components/LiveWorkout/` - Workout UI components

**iOS Requirements:**
- Live Activities require iOS 16.1+
- Dynamic Island requires iPhone 14 Pro/Pro Max or newer
- Requires ActivityKit framework (native iOS)
- React Native/Expo requires native module or config plugin
</context>

<research_phase>
## Phase 1: Technical Research

### 1.1 Use Context7 to Research
Use the `mcp__context7__resolve-library-id` and `mcp__context7__query-docs` tools to find documentation for:

1. **Expo Live Activities** - Search for any Expo SDK support or config plugins
2. **React Native Live Activities** - Community libraries/solutions
3. **ActivityKit** - Native iOS framework documentation

### 1.2 Web Search Topics
Use WebSearch to research:

1. "React Native Live Activities 2026" - Current state of RN support
2. "Expo Live Activities config plugin" - Expo-specific solutions
3. "iOS ActivityKit workout app example" - Implementation patterns
4. "Dynamic Island fitness app design" - UX best practices
5. "Live Activities workout timer" - Similar implementations

### 1.3 Key Questions to Answer
- Does Expo SDK 54 support Live Activities natively?
- What community packages exist? (e.g., `react-native-live-activities`)
- What native Swift/Objective-C code is required?
- How do you update Live Activities from React Native?
- What are the UI constraints for Dynamic Island (compact, minimal, expanded)?
- How do background updates work when the app is suspended?
- What data can be displayed (text, images, progress bars)?

### 1.4 Analyze Existing Apps
Research how these apps implement workout Live Activities:
- Strong app
- Hevy app
- Nike Run Club
- Apple Fitness+
</research_phase>

<planning_phase>
## Phase 2: Implementation Plan

Based on research findings, create a detailed plan covering:

### 2.1 Architecture Decision
- Native module vs Expo config plugin vs community package
- Data flow from React Native to native ActivityKit
- State synchronization strategy

### 2.2 Live Activity Content Design
Define what to show in each Dynamic Island state:

**Compact View (pill):**
- Current exercise icon/emoji
- Set count (e.g., "3/5")
- Rest timer countdown

**Minimal View (left/right):**
- Timer only OR exercise only

**Expanded View (tap to expand):**
- Exercise name
- Current set / total sets
- Rest timer with progress ring
- Workout duration
- Quick actions (if supported)

**Lock Screen Widget:**
- Full workout summary card
- Exercise, sets, rest timer, duration

### 2.3 Implementation Steps
Break down into phases:
1. Setup & native configuration
2. Basic Live Activity start/stop
3. Real-time updates during workout
4. Rest timer integration
5. PR celebration display
6. Testing & polish

### 2.4 Integration Points
Map to existing GymRats code:
- When to start: `currentSessionStore` workout start
- When to update: Set logged, rest timer tick, exercise change
- When to end: Workout finish/cancel
- Data source: `workoutDrawerStore` for timer, `currentSessionStore` for sets

### 2.5 Fallback Strategy
- What happens on older iPhones (no Dynamic Island)?
- What happens on iOS < 16.1?
- Android equivalent considerations (foreground notification?)
</planning_phase>

<output_format>
Save the complete research and plan to: `./docs/features/live-activities/feature-live-activities.md`

Structure as:

```markdown
# iOS Live Activities - Dynamic Island Workout Display

## Overview
[Brief description of the feature]

## Research Findings

### Expo/React Native Support
[Current state of support, available packages]

### ActivityKit Capabilities
[What's possible with the native API]

### Competitor Analysis
[How other fitness apps implement this]

## Technical Architecture

### Recommended Approach
[Native module / config plugin / package - with rationale]

### Data Flow Diagram
[How data flows from RN to native to Live Activity]

### State Management
[How workout state syncs with Live Activity]

## UI/UX Design

### Dynamic Island States
[Compact, minimal, expanded views with descriptions]

### Lock Screen Widget
[Design for lock screen presentation]

### Visual Mockups
[ASCII or description of each state]

## Implementation Plan

### Phase 1: Setup (X days)
- [ ] Task 1
- [ ] Task 2

### Phase 2: Basic Implementation (X days)
- [ ] Task 1
- [ ] Task 2

### Phase 3: Integration (X days)
- [ ] Task 1
- [ ] Task 2

### Phase 4: Polish (X days)
- [ ] Task 1
- [ ] Task 2

## Code Examples

### Starting a Live Activity
```swift
// Example Swift code
```

### React Native Bridge
```typescript
// Example TypeScript interface
```

## Dependencies
[List of packages/plugins needed]

## Risks & Mitigations
[Potential issues and solutions]

## Timeline Estimate
[Total estimated effort]

## Sources
[All URLs and documentation consulted]
```
</output_format>

<verification>
Before completing, verify:
- [ ] Context7 was used to fetch current documentation
- [ ] Web searches covered all key topics
- [ ] Technical approach is clearly recommended with rationale
- [ ] All Dynamic Island states are designed
- [ ] Implementation is broken into actionable phases
- [ ] Integration points with existing code are mapped
- [ ] Dependencies and packages are identified
- [ ] Sources are cited
</verification>

<success_criteria>
- Comprehensive understanding of Live Activities API capabilities
- Clear recommendation on implementation approach for Expo/RN
- Detailed UI design for all Dynamic Island states
- Actionable implementation plan with phases and tasks
- Integration strategy with existing GymRats workout flow
- Realistic timeline estimate
</success_criteria>

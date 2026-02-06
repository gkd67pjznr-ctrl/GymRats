# Feature: iOS Live Activities & Dynamic Island for GymRats

**Status:** Planning
**Priority:** High
**iOS Requirement:** iOS 16.2+
**Device Requirement:** iPhone 14 Pro+ for Dynamic Island (Lock Screen works on all iOS 16.2+ devices)
**Last Updated:** 2026-02-05

---

## Overview

This feature adds iOS Live Activities support to GymRats, displaying real-time workout information in the Dynamic Island and Lock Screen during active workout sessions. Users will see their current exercise, set count, rest timer countdown, and workout duration without needing to unlock their phone or switch apps.

### Value Proposition

- **Glanceable workout tracking**: See exercise, sets, and rest timer at a glance
- **Hands-free experience**: Track rest periods while phone is locked or using other apps
- **Competitive feature parity**: Hevy and other top workout apps already offer this
- **Enhanced UX**: Reduces friction of checking phone during sets

### Key Metrics

- User engagement during workouts
- Rest timer completion rates
- App session duration
- Feature adoption rate on supported devices

---

## Research Findings

### 1. Expo/React Native Support

#### Primary Solution: `expo-live-activity` (Software Mansion)

The recommended approach is [expo-live-activity](https://github.com/software-mansion-labs/expo-live-activity) by Software Mansion Labs.

**Key Features:**
- Built-in Expo config plugin (auto-generates native SwiftUI target)
- Start, update, and stop Live Activities directly from JavaScript
- Support for timers (countdown and elapsed)
- Push notification support for remote updates (iOS 17.2+)
- No manual Xcode configuration required

**Installation:**
```bash
npm install expo-live-activity
```

**Configuration (app.config.js):**
```javascript
plugins: [
  ["expo-live-activity", {
    enablePushNotifications: true  // Optional: for remote updates
  }]
]
```

**API Example:**
```typescript
import * as LiveActivity from 'expo-live-activity'

// Start activity
const activityId = LiveActivity.startActivity(state, config)

// Update activity
LiveActivity.updateActivity(activityId, newState)

// End activity
LiveActivity.endActivity(activityId)
```

#### Alternative Solutions

1. **[react-native-widget-extension](https://github.com/bndkt/react-native-widget-extension)**: Requires writing Swift code manually
2. **[Voltra](https://www.callstack.com/blog/live-activities-and-widgets-with-react-say-hello-to-voltra)**: Uses React-like syntax, newer but less documentation
3. **Expo Widgets (SDK 55+)**: Built on Expo UI/SwiftUI, still in beta

**Recommendation:** Use `expo-live-activity` for its maturity, Expo integration, and JavaScript-first approach.

### 2. ActivityKit Capabilities & Constraints

#### Data Size Limits
- **Combined static + dynamic data**: Max 4 KB
- Keep data minimal (exercise name, set count, timer timestamp)

#### Duration Limits
- **Dynamic Island**: Max 8 hours active
- **Lock Screen**: Up to 12 hours (8 active + 4 dismissed state)
- Perfect for workouts (typically 30-120 minutes)

#### Update Frequency (iOS 18+)
- **Default**: Updates every 5-15 seconds (not real-time)
- **Timer mode**: System handles timer updates automatically using `startDate`
- **Frequent updates**: Add `NSSupportsLiveActivitiesFrequentUpdates` to Info.plist
- **Battery impact**: More frequent updates = higher battery drain

#### Sandbox Restrictions
- No network access from Live Activity itself
- No location updates
- Updates must come from app (ActivityKit) or push notifications

### 3. Competitor Analysis

#### Hevy App (Market Leader)
- Live Activity shows: current exercise, set count (e.g., "Set 3/4"), rest timer
- Rest timer shows countdown with prescribed weight/reps
- Can mark sets complete directly from Live Activity widget
- Works on Lock Screen and Dynamic Island

**Hevy Live Activity Features:**
- Current exercise name
- Set progress (X/Y)
- Rest timer countdown
- Prescribed weight and reps for next set
- Quick action to complete set

#### Strong App
- Does not currently support Live Activities/Dynamic Island
- Basic notification for rest timer only

#### Apple Fitness+
- Shows workout type, duration, and pause/stop controls
- Clean, minimal design focused on time

### 4. Dynamic Island Design Constraints

#### Size Specifications
- **Height**: Max 160 points (content truncated beyond)
- **Compact mode**: Two parts - leading (left) and trailing (right)
- **Expanded mode**: Leading, trailing, center, and bottom areas
- **Minimal mode**: Single small area (when other apps use Dynamic Island)

#### Best Practices
- Keep information glanceable (2-3 key data points)
- Use SF Symbols for icons
- Ensure high contrast for readability
- Avoid cluttering with non-essential details

---

## Technical Architecture

### Recommended Approach

**expo-live-activity with JavaScript-driven updates**

This approach provides:
- Fast implementation (no manual Swift coding)
- Full control from React Native code
- Built-in timer support
- Config plugin handles all native setup

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Native App                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐    ┌──────────────────────────────┐    │
│  │ currentSessionStore │───▶│   liveActivityService.ts     │    │
│  │ (Zustand)           │    │   - startLiveActivity()      │    │
│  └─────────────────────┘    │   - updateLiveActivity()     │    │
│           │                  │   - endLiveActivity()        │    │
│           │                  └──────────────────────────────┘    │
│           │                              │                        │
│           ▼                              ▼                        │
│  ┌─────────────────────┐    ┌──────────────────────────────┐    │
│  │ workoutDrawerStore  │    │   expo-live-activity         │    │
│  │ (rest timer state)  │───▶│   Native Bridge              │    │
│  └─────────────────────┘    └──────────────────────────────┘    │
│                                          │                        │
└──────────────────────────────────────────│────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     iOS Native Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐    ┌──────────────────────────────┐    │
│  │    ActivityKit      │◀──▶│   SwiftUI Widget Extension   │    │
│  │    Framework        │    │   (auto-generated)           │    │
│  └─────────────────────┘    └──────────────────────────────┘    │
│                                          │                        │
│                                          ▼                        │
│                              ┌──────────────────────────────┐    │
│                              │   Dynamic Island / Lock      │    │
│                              │   Screen Display             │    │
│                              └──────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### State Management Integration

```typescript
// src/lib/liveActivity/liveActivityService.ts

import * as LiveActivity from 'expo-live-activity';
import { useCurrentSessionStore } from '../stores/currentSessionStore';
import { useWorkoutDrawerStore } from '../stores/workoutDrawerStore';

let currentActivityId: string | null = null;

export interface WorkoutActivityState {
  exerciseName: string;
  currentSet: number;
  totalSets: number;
  restTimerEndMs?: number;  // Epoch timestamp for timer end
  workoutDurationMs: number;
  prCount: number;
}

export async function startWorkoutLiveActivity(
  exerciseName: string,
  totalSets: number
): Promise<string | undefined> {
  const state: LiveActivity.LiveActivityState = {
    title: exerciseName,
    subtitle: `Set 1/${totalSets}`,
    imageName: 'dumbbell_icon',
    dynamicIslandImageName: 'dumbbell_small',
  };

  const config: LiveActivity.LiveActivityConfig = {
    backgroundColor: '#1A1A1A',  // GymRats dark theme
    titleColor: '#FFFFFF',
    subtitleColor: '#A3E635',    // Toxic accent
    progressViewTint: '#A3E635',
    deepLinkUrl: '/live-workout',
    timerType: 'circular',
    padding: 16,
  };

  currentActivityId = LiveActivity.startActivity(state, config);
  return currentActivityId;
}

export function updateWorkoutLiveActivity(
  state: Partial<WorkoutActivityState>
): void {
  if (!currentActivityId) return;

  const updateState: Partial<LiveActivity.LiveActivityState> = {};

  if (state.exerciseName) {
    updateState.title = state.exerciseName;
  }

  if (state.currentSet !== undefined && state.totalSets !== undefined) {
    updateState.subtitle = `Set ${state.currentSet}/${state.totalSets}`;
  }

  if (state.restTimerEndMs) {
    updateState.progressBar = {
      date: state.restTimerEndMs,  // Timer will auto-countdown
    };
  }

  LiveActivity.updateActivity(currentActivityId, updateState);
}

export function endWorkoutLiveActivity(): void {
  if (!currentActivityId) return;
  LiveActivity.endActivity(currentActivityId);
  currentActivityId = null;
}
```

### Integration Points with Existing Code

| Trigger | Location | Action |
|---------|----------|--------|
| Workout start | `currentSessionStore.ensureSession()` | `startWorkoutLiveActivity()` |
| Exercise change | `pickerState.setSelectedExerciseId()` | `updateWorkoutLiveActivity({ exerciseName })` |
| Set logged | `handleToggleDone()` in live-workout.tsx | `updateWorkoutLiveActivity({ currentSet })` |
| Rest timer start | `workoutDrawerStore.startRestTimer()` | `updateWorkoutLiveActivity({ restTimerEndMs })` |
| Rest timer end | `onRestTimerDone()` | `updateWorkoutLiveActivity({ restTimerEndMs: null })` |
| PR detected | `orchestrator.onPRCelebration()` | `updateWorkoutLiveActivity({ prCount })` |
| Workout finish | `orchestrator.finishWorkout()` | `endWorkoutLiveActivity()` |
| App killed/crash | N/A | Activity auto-ends after 8 hours |

---

## UI/UX Design

### Dynamic Island States

#### 1. Compact View (Pill - Default)

The compact view shows in the Dynamic Island "pill" when the app is in the background.

```
┌─────────────────────────────────────────────────┐
│  [Leading]          │           [Trailing]      │
│                     │                           │
│    🏋️ Bench        │           2:15 ⏱️        │
│                     │                           │
└─────────────────────────────────────────────────┘
```

**Leading (left side):**
- Exercise icon (SF Symbol or custom)
- Exercise name (truncated if needed)

**Trailing (right side):**
- Rest timer countdown (if active) OR
- Set count "3/5" (if no timer)

#### 2. Minimal View (When Another App Uses Dynamic Island)

When another app's Live Activity takes priority, GymRats shows minimal info.

```
┌────────┐      ┌────────┐
│  🏋️   │  OR  │  1:30  │
└────────┘      └────────┘
```

**Options:**
- Exercise icon only, OR
- Timer countdown only

#### 3. Expanded View (Tap to Expand)

When user long-presses the Dynamic Island, show full details.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Leading]                              [Trailing]          │
│                                                             │
│    🏋️                                    45:23             │
│                                         Duration            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                      [Center]                               │
│                                                             │
│                   Bench Press                               │
│                   Set 3 of 5                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                      [Bottom]                               │
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │           ◯◯◯◯◯◯◯◯◯◯  1:45                    │     │
│    │           Rest Timer Progress                   │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│           🔥 2 PRs this session                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Content:**
- Leading: Exercise icon
- Trailing: Workout duration
- Center: Exercise name + set progress
- Bottom: Rest timer with progress ring + PR count

#### 4. Lock Screen Widget

Full-width widget on the Lock Screen with all workout info.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌────────┐                                                 │
│  │   🏋️  │   Bench Press                    45:23         │
│  │        │   Set 3 of 5                    Duration        │
│  └────────┘                                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    ════════════════════●══════    1:45 remaining    │   │
│  │              Rest Timer                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Previous: 185 lb × 8                                      │
│   🔥 2 PRs    💪 12 sets                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Content:**
- Exercise icon and name
- Set progress (current/total)
- Workout duration
- Rest timer with countdown
- Previous set reference (weight × reps)
- Session stats (PR count, total sets)

### Visual Design Specifications

| Element | Value | Notes |
|---------|-------|-------|
| Background | `#1A1A1A` | GymRats dark theme |
| Title color | `#FFFFFF` | White for exercise name |
| Accent color | `#A3E635` | "Toxic" lime accent |
| Timer color | `#A3E635` | Matches accent |
| PR indicator | `#FF6B6B` | Fire/red for PRs |
| Font | SF Pro | System font for consistency |
| Icon | SF Symbols | `dumbbell.fill`, `timer`, `flame.fill` |

### Assets Required

Place in `assets/liveActivity/`:
- `dumbbell_icon.png` (44x44 @1x, 88x88 @2x, 132x132 @3x)
- `dumbbell_small.png` (22x22 @1x, 44x44 @2x, 66x66 @3x)
- `timer_icon.png` (22x22 @1x, 44x44 @2x)
- `flame_icon.png` (22x22 @1x, 44x44 @2x)

---

## Implementation Plan

### Phase 1: Setup & Configuration (2-3 hours)

- [ ] Install `expo-live-activity` package
- [ ] Configure plugin in `app.config.js`
- [ ] Add `NSSupportsLiveActivitiesFrequentUpdates` to Info.plist
- [ ] Create `assets/liveActivity/` folder with icon assets
- [ ] Run `npx expo prebuild --clean`
- [ ] Verify build succeeds with new target

**Files to modify:**
- `package.json` (add dependency)
- `app.config.js` (add plugin)
- `assets/liveActivity/` (create folder, add icons)

### Phase 2: Core Service Implementation (3-4 hours)

- [ ] Create `src/lib/liveActivity/liveActivityService.ts`
- [ ] Implement `startWorkoutLiveActivity()`
- [ ] Implement `updateWorkoutLiveActivity()`
- [ ] Implement `endWorkoutLiveActivity()`
- [ ] Create TypeScript types for activity state
- [ ] Add platform check (iOS only)
- [ ] Add iOS version check (16.2+)

**New files:**
- `src/lib/liveActivity/liveActivityService.ts`
- `src/lib/liveActivity/types.ts`
- `src/lib/liveActivity/index.ts`

### Phase 3: Store Integration (2-3 hours)

- [ ] Hook into `currentSessionStore.ensureSession()` for start
- [ ] Hook into `currentSessionStore.clearSession()` for end
- [ ] Subscribe to workout drawer store for rest timer updates
- [ ] Add update calls in set logging flow
- [ ] Add update calls on exercise change

**Files to modify:**
- `src/lib/stores/currentSessionStore.ts`
- `src/lib/stores/workoutDrawerStore.ts`

### Phase 4: Rest Timer Integration (2-3 hours)

- [ ] Pass timer end timestamp to Live Activity on rest start
- [ ] Clear timer display when rest ends
- [ ] Handle timer adjustments (+15s, -15s buttons)
- [ ] Sync timer state between app and Live Activity

**Files to modify:**
- `app/live-workout.tsx`
- `src/ui/components/RestTimerOverlay.tsx`
- `src/lib/liveActivity/liveActivityService.ts`

### Phase 5: PR & Stats Display (1-2 hours)

- [ ] Update PR count in Live Activity on PR detection
- [ ] Show total sets completed
- [ ] Add workout duration display

**Files to modify:**
- `src/lib/hooks/useWorkoutOrchestrator.ts`
- `src/lib/liveActivity/liveActivityService.ts`

### Phase 6: Edge Cases & Error Handling (2-3 hours)

- [ ] Handle app backgrounding/foregrounding
- [ ] Handle app crash/kill (activity auto-ends)
- [ ] Handle workout resume (check for existing activity)
- [ ] Add graceful degradation for unsupported devices
- [ ] Handle permission denied scenario
- [ ] Add error logging for debugging

### Phase 7: Testing & Polish (3-4 hours)

- [ ] Test on iPhone 14 Pro+ (Dynamic Island)
- [ ] Test on older iPhones (Lock Screen only)
- [ ] Test on iOS 16.2, 17.x, 18.x
- [ ] Verify timer accuracy
- [ ] Test rapid set logging
- [ ] Test long workouts (approach 8-hour limit)
- [ ] Performance testing (battery impact)
- [ ] UI polish and spacing adjustments

### Phase 8: Settings & Feature Flag (1-2 hours)

- [ ] Add Live Activity toggle to settings
- [ ] Store preference in `settingsStore`
- [ ] Check preference before starting activity
- [ ] Add onboarding tooltip for the feature

**Files to modify:**
- `src/lib/stores/settingsStore.ts`
- `app/(tabs)/profile.tsx` or settings screen

---

## Code Examples

### Starting a Live Activity

```typescript
// src/lib/liveActivity/liveActivityService.ts
import * as LiveActivity from 'expo-live-activity';
import { Platform } from 'react-native';

const MIN_IOS_VERSION = 16.2;

export function isLiveActivitySupported(): boolean {
  if (Platform.OS !== 'ios') return false;

  const version = parseFloat(Platform.Version as string);
  return version >= MIN_IOS_VERSION;
}

export async function startWorkoutLiveActivity(
  exerciseName: string,
  exerciseId: string,
  totalSets: number = 0
): Promise<string | undefined> {
  if (!isLiveActivitySupported()) {
    console.log('[LiveActivity] Not supported on this device');
    return undefined;
  }

  try {
    const state: LiveActivity.LiveActivityState = {
      title: exerciseName,
      subtitle: totalSets > 0 ? `Set 1/${totalSets}` : 'Set 1',
      progressBar: {
        progress: 0,
      },
      imageName: 'dumbbell_icon',
      dynamicIslandImageName: 'dumbbell_small',
    };

    const config: LiveActivity.LiveActivityConfig = {
      backgroundColor: '#1A1A1A',
      titleColor: '#FFFFFF',
      subtitleColor: '#A3E635',
      progressViewTint: '#A3E635',
      progressViewLabelColor: '#FFFFFF',
      deepLinkUrl: '/live-workout',
      timerType: 'circular',
      padding: { horizontal: 16, top: 12, bottom: 12 },
      imagePosition: 'left',
      imageSize: 44,
    };

    const activityId = LiveActivity.startActivity(state, config);
    console.log('[LiveActivity] Started:', activityId);
    return activityId;
  } catch (error) {
    console.error('[LiveActivity] Failed to start:', error);
    return undefined;
  }
}
```

### Updating with Rest Timer

```typescript
export function updateWithRestTimer(
  activityId: string,
  exerciseName: string,
  currentSet: number,
  totalSets: number,
  restEndTimeMs: number
): void {
  if (!activityId) return;

  try {
    const state: Partial<LiveActivity.LiveActivityState> = {
      title: exerciseName,
      subtitle: `Set ${currentSet}/${totalSets}`,
      progressBar: {
        date: restEndTimeMs,  // System handles countdown automatically
      },
    };

    LiveActivity.updateActivity(activityId, state);
    console.log('[LiveActivity] Updated with rest timer');
  } catch (error) {
    console.error('[LiveActivity] Failed to update:', error);
  }
}
```

### Integration in currentSessionStore

```typescript
// src/lib/stores/currentSessionStore.ts
import {
  startWorkoutLiveActivity,
  endWorkoutLiveActivity,
  isLiveActivitySupported
} from '../liveActivity/liveActivityService';
import { getSettings } from './settingsStore';

// In ensureSession:
ensureSession: (seed) => {
  // ... existing code ...

  // Start Live Activity if enabled
  const settings = getSettings();
  if (settings.liveActivityEnabled && isLiveActivitySupported()) {
    const exerciseId = seed?.selectedExerciseId ?? 'bench';
    const exerciseName = getExerciseName(exerciseId);
    startWorkoutLiveActivity(exerciseName, exerciseId)
      .catch(err => console.error('[LiveActivity] Start failed:', err));
  }

  return newSession;
},

// In clearSession:
clearSession: () => {
  set({ session: null });

  // End Live Activity
  endWorkoutLiveActivity();

  // ... existing code ...
},
```

### Swift Widget Extension (Auto-generated)

The `expo-live-activity` plugin auto-generates the SwiftUI widget, but for reference:

```swift
// GymRatsLiveActivity.swift (auto-generated)
import ActivityKit
import SwiftUI
import WidgetKit

struct GymRatsLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: GymRatsActivityAttributes.self) { context in
            // Lock Screen view
            LockScreenLiveActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded view
                DynamicIslandExpandedRegion(.leading) {
                    Image(context.state.imageName)
                        .resizable()
                        .frame(width: 44, height: 44)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.duration)
                        .font(.caption)
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack {
                        Text(context.state.title)
                            .font(.headline)
                        Text(context.state.subtitle)
                            .font(.subheadline)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(timerInterval: context.state.timerRange, countsDown: true)
                        .tint(Color(hex: "#A3E635"))
                }
            } compactLeading: {
                Image(context.state.dynamicIslandImageName)
            } compactTrailing: {
                Text(context.state.subtitle)
                    .font(.caption2)
            } minimal: {
                Image(context.state.dynamicIslandImageName)
            }
        }
    }
}
```

---

## Dependencies

### New Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-live-activity` | `^1.x.x` | Core Live Activity support |

### Native Requirements

- iOS Deployment Target: 16.2+
- Xcode 15+ (for iOS 17 features)
- Swift 5.9+

### App Configuration Changes

```javascript
// app.config.js additions
plugins: [
  // ... existing plugins
  ["expo-live-activity", {
    enablePushNotifications: false,  // Can enable later for server-driven updates
  }],
],
ios: {
  // ... existing config
  infoPlist: {
    // ... existing entries
    NSSupportsLiveActivities: true,
    NSSupportsLiveActivitiesFrequentUpdates: true,
  },
},
```

---

## Risks & Mitigations

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| expo-live-activity API changes | Medium | Low | Pin version, follow releases |
| iOS 18 update frequency limits | High | Confirmed | Use timer mode (auto-updates), accept 5-15s delay |
| Timer drift in background | Medium | Medium | Use system timer (epoch timestamp), not polling |
| 4KB data limit exceeded | Low | Low | Keep data minimal, only essential fields |
| Build failures with new target | Medium | Medium | Test prebuild early, check Expo docs |

### User Experience Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Confusion on unsupported devices | Medium | Clear feature availability messaging |
| Battery drain concerns | Low | Add settings toggle, document impact |
| Dynamic Island not noticed | Medium | Onboarding tooltip, feature highlight |

### Fallback Strategy

**Older iPhones (no Dynamic Island):**
- Lock Screen widget still works
- Full feature parity except Dynamic Island visuals

**iOS < 16.2:**
- Feature not available
- Graceful degradation (no errors)
- Existing notification-based rest timer continues to work

**Android:**
- Not supported (no ActivityKit equivalent)
- Future consideration: Android Foreground Service notification
- Could use "Live Notification" style on Android 14+

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Setup | 2-3 hours | None |
| Phase 2: Core Service | 3-4 hours | Phase 1 |
| Phase 3: Store Integration | 2-3 hours | Phase 2 |
| Phase 4: Rest Timer | 2-3 hours | Phase 3 |
| Phase 5: PR/Stats | 1-2 hours | Phase 3 |
| Phase 6: Error Handling | 2-3 hours | Phase 4-5 |
| Phase 7: Testing | 3-4 hours | Phase 6 |
| Phase 8: Settings | 1-2 hours | Phase 6 |

**Total Estimated Time:** 16-24 hours (2-3 development days)

### Suggested Sprint Breakdown

**Sprint 1 (Day 1):**
- Phase 1: Setup & Configuration
- Phase 2: Core Service Implementation

**Sprint 2 (Day 2):**
- Phase 3: Store Integration
- Phase 4: Rest Timer Integration
- Phase 5: PR & Stats Display

**Sprint 3 (Day 3):**
- Phase 6: Edge Cases & Error Handling
- Phase 7: Testing & Polish
- Phase 8: Settings & Feature Flag

---

## Sources

### Official Documentation
- [Apple ActivityKit Documentation](https://developer.apple.com/documentation/activitykit)
- [Expo Documentation](https://docs.expo.dev/)

### Libraries & Tools
- [expo-live-activity (GitHub)](https://github.com/software-mansion-labs/expo-live-activity)
- [react-native-widget-extension (GitHub)](https://github.com/bndkt/react-native-widget-extension)
- [Voltra - Live Activities with React](https://www.callstack.com/blog/live-activities-and-widgets-with-react-say-hello-to-voltra)

### Tutorials & Guides
- [Building a Live Activity Timer in Expo React Native](https://levelup.gitconnected.com/building-a-live-activity-timer-in-expo-626b162f3e8d)
- [iOS Live Activities with Expo & React Native](https://medium.com/@kutaui/ios-live-activities-with-expo-react-native-fa84c8e5a9b7)
- [How to build a live activity with Expo, SwiftUI and React Native](https://christopher.engineering/en/blog/live-activity-with-react-native/)
- [Implementing Live Activities in React-Native with Expo](https://fizl.io/blog/posts/live-activities)

### Competitor Analysis
- [Hevy Live Activity Feature](https://www.hevyapp.com/features/live-activity/)
- [Hevy App Features](https://www.hevyapp.com/features/)

### iOS Best Practices
- [iOS Live Activities Explained (Reteno)](https://reteno.com/blog/ios-live-activities-explained-how-apps-use-them)
- [iOS 18 Live Activities Best Practices (Pushwoosh)](https://www.pushwoosh.com/blog/ios-live-activities/)
- [Best Practices for iOS Live Activities (Engagelab)](https://www.engagelab.com/docs/app-push/best-practices/ios-liveactivity)
- [Integrating Live Activity and Dynamic Island - Complete Guide](https://canopas.com/integrating-live-activity-and-dynamic-island-in-i-os-a-complete-guide)

---

## Verification Checklist

- [x] Context7 was used to fetch current documentation
- [x] Web searches covered all key topics (Live Activities, Expo, competitors, constraints)
- [x] Technical approach is clearly recommended with rationale (expo-live-activity)
- [x] All Dynamic Island states are designed (compact, minimal, expanded, Lock Screen)
- [x] Implementation is broken into actionable phases (8 phases with checkboxes)
- [x] Integration points with existing code are mapped (currentSessionStore, workoutDrawerStore)
- [x] Dependencies and packages are identified (expo-live-activity)
- [x] Sources are cited (15+ sources)

---

## Appendix: Exercise Icon Mapping

For the Live Activity display, map exercise IDs to SF Symbols:

```typescript
const exerciseIcons: Record<string, string> = {
  bench: 'dumbbell.fill',
  squat: 'figure.strengthtraining.functional',
  deadlift: 'figure.strengthtraining.traditional',
  ohp: 'arrow.up.circle.fill',
  row: 'arrow.left.arrow.right',
  pullup: 'arrow.up.to.line',
  incline_bench: 'arrow.up.right.circle.fill',
  rdl: 'figure.strengthtraining.traditional',
  leg_press: 'figure.walk',
  lat_pulldown: 'arrow.down.to.line',
  // Default fallback
  default: 'dumbbell.fill',
};
```

---

*Document created: 2026-02-05*
*Author: Claude Code Research Agent*

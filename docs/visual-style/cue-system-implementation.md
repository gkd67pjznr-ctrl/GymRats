# Forgerank Cue System Implementation

## Overview

This document details the implementation of Forgerank's enhanced visual cue system, which coordinates themed visual, audio, and haptic feedback across user interactions.

## Cue System Architecture

### Core Components

#### Cue Types
The system supports various cue types corresponding to key user interactions:

1. **Performance Events**
   - Weight PR (`weight-pr`)
   - Rep PR (`rep-pr`)
   - e1RM PR (`e1rm-pr`)
   - Rank-up (`rank-up`)

2. **Workout Flow**
   - Workout Start (`workout-start`)
   - Workout End (`workout-end`)
   - Set Logged (`set-logged`)
   - Rest Timer (`rest-timer`)

3. **Achievements & Gamification**
   - Achievement Unlocked (`achievement-unlocked`)
   - Streak Continued (`streak-continued`)
   - Milestone Reached (`milestone-reached`)

4. **Social & Community**
   - Friend Interaction (`friend-interaction`)
   - Reaction Received (`reaction-received`)
   - Comment Received (`comment-received`)

#### Intensity Levels
Each cue can have different intensity levels:
- `low`: Subtle feedback for minor events
- `medium`: Noticeable feedback for standard events
- `high`: Prominent celebration for major achievements

### Cue Engine Implementation

#### Core Engine Class

```typescript
// src/lib/cueSystem/CueEngine.ts
class CueEngine {
  private static instance: CueEngine;
  private registry: Map<string, CueConfiguration>;
  private assetLoader: AssetLoader;

  private constructor() {
    this.registry = new Map();
    this.assetLoader = new AssetLoader();
    this.initializeRegistry();
  }

  static getInstance(): CueEngine {
    if (!CueEngine.instance) {
      CueEngine.instance = new CueEngine();
    }
    return CueEngine.instance;
  }

  async triggerCue(cueType: CueType, intensity: Intensity = 'medium', context?: CueContext) {
    const activeTheme = getActiveTheme();
    const cueConfig = this.getCueConfiguration(cueType, activeTheme.id, intensity);

    if (!cueConfig) {
      console.warn(`No cue configuration found for ${cueType}`);
      return;
    }

    // Check premium/legendary gating
    if (cueConfig.isPremium && !userHasPremium()) {
      return;
    }

    if (cueConfig.isLegendary && !userHasLegendary()) {
      return;
    }

    // Coordinate feedback based on active theme
    await this.executeCue(cueConfig, context);
  }

  private async executeCue(cueConfig: CueConfiguration, context?: CueContext) {
    // Execute visual, audio, and haptic feedback in parallel
    await Promise.all([
      this.showVisualFeedback(cueConfig.visual, context),
      this.playAudioFeedback(cueConfig.audio),
      this.triggerHapticFeedback(cueConfig.haptic)
    ]);
  }

  private getCueConfiguration(cueType: CueType, themeId: string, intensity: Intensity): CueConfiguration | undefined {
    const key = `${cueType}-${themeId}-${intensity}`;
    return this.registry.get(key);
  }
}
```

#### Cue Configuration Structure

```typescript
// src/lib/cueSystem/types.ts
interface CueConfiguration {
  id: string;
  type: CueType;
  intensity: Intensity;
  themeId: string;

  // Visual components
  visual?: {
    illustrationId?: string;
    animationId?: string;
    duration?: number;
    overlay?: boolean;
  };

  // Audio components
  audio?: {
    soundId?: string;
    volume?: number;
    loop?: boolean;
  };

  // Haptic components
  haptic?: {
    pattern: HapticPattern;
    intensity: number;
  };

  // Content flags
  isPremium: boolean;
  isLegendary: boolean;

  // Priority for queue management
  priority: number;
}

type CueType =
  | 'weight-pr'
  | 'rep-pr'
  | 'e1rm-pr'
  | 'rank-up'
  | 'workout-start'
  | 'workout-end'
  | 'set-logged'
  | 'rest-timer'
  | 'achievement-unlocked'
  | 'streak-continued'
  | 'milestone-reached'
  | 'friend-interaction'
  | 'reaction-received'
  | 'comment-received';

type Intensity = 'low' | 'medium' | 'high';

type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'custom';
```

## Integration with Existing Systems

### PR Detection Integration

Integrate with the existing PR detection system in `src/lib/perSetCue.ts`:

```typescript
// src/lib/perSetCue.ts (modified)
import { CueEngine } from './cueSystem/CueEngine';

export function detectCueForWorkingSet(
  exerciseId: string,
  weightKg: number,
  reps: number,
  allSets: WorkingSet[]
): CueResponse | null {
  // Existing PR detection logic...
  const prType = detectPR(exerciseId, weightKg, reps, allSets);

  if (prType) {
    // Trigger appropriate visual cue
    const cueEngine = CueEngine.getInstance();
    const intensity = prType.priority === 'high' ? 'high' : 'medium';

    switch (prType.type) {
      case 'weight':
        cueEngine.triggerCue('weight-pr', intensity, { exerciseId, weightKg, reps });
        break;
      case 'rep':
        cueEngine.triggerCue('rep-pr', intensity, { exerciseId, weightKg, reps });
        break;
      case 'e1rm':
        cueEngine.triggerCue('e1rm-pr', intensity, { exerciseId, weightKg, reps });
        break;
    }

    // Return existing response
    return {
      type: prType.type,
      intensity: prType.priority,
      message: prType.message
    };
  }

  return null;
}
```

### Workout Flow Integration

Integrate with workout session events:

```typescript
// src/lib/workoutSession.ts (example integration)
import { CueEngine } from './cueSystem/CueEngine';

class WorkoutSession {
  private cueEngine: CueEngine;

  constructor() {
    this.cueEngine = CueEngine.getInstance();
  }

  startWorkout() {
    // Existing start logic...

    // Trigger workout start cue
    this.cueEngine.triggerCue('workout-start', 'medium');
  }

  finishWorkout() {
    // Existing finish logic...

    // Trigger workout end cue with context
    this.cueEngine.triggerCue('workout-end', 'high', {
      duration: this.getWorkoutDuration(),
      sets: this.getSetCount(),
      prs: this.getPRCount()
    });
  }

  logSet(set: WorkoutSet) {
    // Existing logging logic...

    // Trigger set logged cue
    this.cueEngine.triggerCue('set-logged', 'low');
  }
}
```

## Visual Feedback Implementation

### Themed Toast Components

Create themed toast components for visual feedback:

```typescript
// src/ui/components/ThemedToast.tsx
import React from 'react';
import { View, Text, Animated } from 'react-native';
import { useThemeDesignSystem } from '../../ui/hooks/useThemeDesignSystem';
import { AssetLoader } from '../../lib/assetLoader';

interface ThemedToastProps {
  cueType: CueType;
  message: string;
  illustrationId?: string;
  duration?: number;
  onDismiss?: () => void;
}

export const ThemedToast: React.FC<ThemedToastProps> = ({
  cueType,
  message,
  illustrationId,
  duration = 3000,
  onDismiss
}) => {
  const ds = useThemeDesignSystem();
  const [illustration, setIllustration] = React.useState<any>(null);
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Load themed illustration if provided
    if (illustrationId) {
      AssetLoader.getInstance().loadAsset('illustration', illustrationId)
        .then(setIllustration)
        .catch(console.warn);
    }

    // Animate in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(onDismiss);
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: ds ? ds.space.x7 : 56,
          left: ds ? ds.space.x4 : 16,
          right: ds ? ds.space.x4 : 16,
          backgroundColor: ds?.tone.card || '#18181b',
          borderColor: ds?.tone.border || '#27272a',
          borderWidth: ds?.strokes.hairline || 1,
          borderRadius: ds?.radii.lg || 14,
          padding: ds ? ds.space.x4 : 16,
          opacity
        }
      ]}
    >
      {illustration && (
        <View style={{ marginBottom: ds ? ds.space.x3 : 12 }}>
          {illustration}
        </View>
      )}
      <Text
        style={{
          color: ds?.tone.text || '#fafafa',
          fontSize: ds?.type.body.size || 15,
          fontWeight: ds?.type.body.w || '700',
          textAlign: 'center'
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
};
```

## Audio Feedback Implementation

### Sound Player System

Create a sound player for audio feedback:

```typescript
// src/lib/audio/SoundPlayer.ts
import Sound from 'react-native-sound';

class SoundPlayer {
  private static instance: SoundPlayer;
  private sounds: Map<string, Sound> = new Map();
  private isEnabled: boolean = true;

  private constructor() {
    // Enable playback in silence mode
    Sound.setCategory('Playback');
  }

  static getInstance(): SoundPlayer {
    if (!SoundPlayer.instance) {
      SoundPlayer.instance = new SoundPlayer();
    }
    return SoundPlayer.instance;
  }

  async loadSound(soundId: string): Promise<Sound> {
    if (this.sounds.has(soundId)) {
      return this.sounds.get(soundId)!;
    }

    return new Promise((resolve, reject) => {
      const sound = new Sound(soundId, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          reject(error);
          return;
        }
        this.sounds.set(soundId, sound);
        resolve(sound);
      });
    });
  }

  async playSound(soundId: string, volume: number = 1.0) {
    if (!this.isEnabled) return;

    try {
      const sound = await this.loadSound(soundId);
      sound.setVolume(volume);
      sound.play((success) => {
        if (!success) {
          console.warn(`Failed to play sound: ${soundId}`);
        }
      });
    } catch (error) {
      console.warn(`Error playing sound ${soundId}:`, error);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}
```

## Haptic Feedback Implementation

### Haptic Engine

Create a haptic feedback system:

```typescript
// src/lib/haptics/HapticEngine.ts
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

class HapticEngine {
  private static instance: HapticEngine;
  private isEnabled: boolean = true;

  private constructor() {}

  static getInstance(): HapticEngine {
    if (!HapticEngine.instance) {
      HapticEngine.instance = new HapticEngine();
    }
    return HapticEngine.instance;
  }

  trigger(pattern: HapticPattern, intensity: number = 1) {
    if (!this.isEnabled) return;

    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false
    };

    switch (pattern) {
      case 'light':
        ReactNativeHapticFeedback.trigger('impactLight', options);
        break;
      case 'medium':
        ReactNativeHapticFeedback.trigger('impactMedium', options);
        break;
      case 'heavy':
        ReactNativeHapticFeedback.trigger('impactHeavy', options);
        break;
      case 'success':
        ReactNativeHapticFeedback.trigger('notificationSuccess', options);
        break;
      case 'warning':
        ReactNativeHapticFeedback.trigger('notificationWarning', options);
        break;
      case 'error':
        ReactNativeHapticFeedback.trigger('notificationError', options);
        break;
      default:
        ReactNativeHapticFeedback.trigger('selection', options);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}
```

## Performance Considerations

### Caching Strategy

Implement intelligent caching for frequently used assets:

```typescript
// src/lib/assetLoader.ts
class AssetLoader {
  private cache: Map<string, { asset: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async loadAsset(type: AssetType, id: string): Promise<any> {
    const cacheKey = `${type}:${id}`;
    const cached = this.cache.get(cacheKey);

    // Check if cached asset is still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.asset;
    }

    try {
      // Load asset based on type
      let asset;
      switch (type) {
        case 'illustration':
          asset = await this.loadIllustration(id);
          break;
        case 'audio':
          asset = await this.loadAudio(id);
          break;
        case 'animation':
          asset = await this.loadAnimation(id);
          break;
      }

      // Cache the loaded asset
      this.cache.set(cacheKey, {
        asset,
        timestamp: Date.now()
      });

      return asset;
    } catch (error) {
      console.warn(`Failed to load asset ${cacheKey}:`, error);
      throw error;
    }
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Queue Management

Implement a queue system for managing overlapping cues:

```typescript
// src/lib/cueSystem/CueQueue.ts
class CueQueue {
  private queue: CueRequest[] = [];
  private isProcessing: boolean = false;

  async add(cueRequest: CueRequest) {
    this.queue.push(cueRequest);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    // Sort by priority (high to low)
    this.queue.sort((a, b) => b.priority - a.priority);

    while (this.queue.length > 0) {
      const cueRequest = this.queue.shift();
      if (cueRequest) {
        await this.executeCueRequest(cueRequest);

        // Small delay between cues to prevent overlap
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    this.isProcessing = false;
  }

  private async executeCueRequest(request: CueRequest) {
    const cueEngine = CueEngine.getInstance();
    await cueEngine.triggerCue(
      request.type,
      request.intensity,
      request.context
    );
  }
}
```

## Testing Strategy

### Unit Tests

Create comprehensive unit tests for the cue system:

```typescript
// __tests__/cueSystem/CueEngine.test.ts
import { CueEngine } from '../../src/lib/cueSystem/CueEngine';

describe('CueEngine', () => {
  let cueEngine: CueEngine;

  beforeEach(() => {
    cueEngine = CueEngine.getInstance();
  });

  describe('triggerCue', () => {
    it('should trigger a cue with correct configuration', async () => {
      // Test implementation
    });

    it('should respect premium content gating', async () => {
      // Test implementation
    });

    it('should handle missing cue configurations gracefully', async () => {
      // Test implementation
    });
  });

  describe('getCueConfiguration', () => {
    it('should return correct configuration for theme and intensity', () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

Test integration with existing systems:

```typescript
// __tests__/cueSystem/PRIntegration.test.ts
import { detectCueForWorkingSet } from '../../src/lib/perSetCue';

describe('PR Detection Integration', () => {
  it('should trigger weight PR cue when new weight PR is detected', () => {
    // Test implementation
  });

  it('should trigger rep PR cue when new rep PR is detected', () => {
    // Test implementation
  });

  it('should trigger e1rm PR cue when new e1rm PR is detected', () => {
    // Test implementation
  });
});
```

## Monitoring and Analytics

### Usage Tracking

Implement analytics for cue system usage:

```typescript
// src/lib/analytics/CueAnalytics.ts
class CueAnalytics {
  static trackCueTriggered(cueType: CueType, intensity: Intensity, themeId: string) {
    // Track cue event
    analytics.track('Cue Triggered', {
      cueType,
      intensity,
      themeId,
      timestamp: Date.now()
    });
  }

  static trackCueDisplayed(cueType: CueType, duration: number) {
    // Track cue display
    analytics.track('Cue Displayed', {
      cueType,
      duration,
      timestamp: Date.now()
    });
  }

  static trackCueInteraction(cueType: CueType, interactionType: string) {
    // Track user interaction with cue
    analytics.track('Cue Interaction', {
      cueType,
      interactionType,
      timestamp: Date.now()
    });
  }
}
```

## Future Enhancements

### AI-Personalized Cues

Implement machine learning to personalize cue responses:

```typescript
// Future implementation idea
class PersonalizedCueEngine extends CueEngine {
  private userPreferences: UserPreferenceModel;

  async triggerCue(cueType: CueType, intensity: Intensity, context?: CueContext) {
    // Personalize based on user preferences and history
    const personalizedIntensity = this.personalizeIntensity(cueType, context);
    const personalizedTheme = this.selectPersonalizedTheme(cueType);

    super.triggerCue(cueType, personalizedIntensity, context);
  }
}
```

### Context-Aware Cues

Make cues context-aware based on user state:

```typescript
// Future implementation idea
interface CueContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  workoutType: string;
  userMood?: string;
  socialContext?: 'alone' | 'with_friends' | 'competition';
  performanceTrend: 'improving' | 'declining' | 'stable';
}
```

This comprehensive cue system implementation provides a solid foundation for delivering engaging, themed feedback throughout the Forgerank experience while maintaining performance and scalability.
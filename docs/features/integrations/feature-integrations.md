# Feature: Integrations

## Overview

Third-party app connections for enhanced functionality. Focus on data that complements workout tracking: bodyweight for scoring accuracy, and health/nutrition/recovery data for Gym Lab analytics (premium). No music player integrations -- buddy sounds only.

**Status:** Post-launch feature
**Total sub-features:** 5

---

## Sub-Features

### 1. Apple Health Integration (Free)
- [ ] Import bodyweight
- [ ] Import BMI
- [ ] Export workout data
- [ ] Sync frequency settings
- [ ] iOS only

**Use Case:** Automatic bodyweight updates for e1RM calculation (bodyweight-based exercises like pullups). Weight graph display is free.

**Priority:** P1

---

### 2. Fitbit Integration (Free)
- [ ] Import bodyweight
- [ ] Import activity data
- [ ] OAuth connection flow
- [ ] Sync frequency settings

**Use Case:** Same as Apple Health for Fitbit users. Weight graph display is free; activity data feeds into Gym Lab analytics (premium).

**Priority:** P2

---

### 3. MyFitnessPal Integration (Premium - Gym Lab)
- [ ] OAuth connection flow
- [ ] Import nutrition data
- [ ] Macronutrient breakdown display in Gym Lab
- [ ] Sync frequency settings

**Use Case:** Nutrition data import for Gym Lab analytics. Correlate protein intake, caloric surplus/deficit with strength progression over time.

**Priority:** P2

---

### 4. Whoop Integration (Premium - Gym Lab)
- [ ] OAuth connection flow
- [ ] Import recovery score
- [ ] Import strain data
- [ ] Display recovery/strain trends in Gym Lab
- [ ] Sync frequency settings

**Use Case:** Recovery and strain data for Gym Lab analytics. Help users understand how recovery status correlates with workout performance and PR frequency.

**Priority:** P2

---

### 5. Health Data Display in Gym Lab (Premium)
- [ ] Unified dashboard for imported health data
- [ ] Weight trend graph (free tier)
- [ ] Nutrition correlation charts (premium)
- [ ] Recovery/strain overlay on workout performance (premium)
- [ ] Data source attribution (which integration provided what)

**Use Case:** Central hub in Gym Lab for all imported health and wellness data. Weight graph is available free; all other analytics from integrations require premium.

**Priority:** P2

---

## Technical Notes

**Apple Health:**
```typescript
// Using react-native-health
import AppleHealthKit from 'react-native-health';

const permissions = {
  permissions: {
    read: ['Weight', 'BodyMassIndex'],
    write: ['Workout'],
  },
};

AppleHealthKit.initHealthKit(permissions, (err) => {
  // Handle permission result
});
```

**OAuth Flow:**
- Fitbit requires OAuth 2.0
- MyFitnessPal requires OAuth 2.0
- Whoop requires OAuth 2.0
- Apple Health uses HealthKit (no OAuth, system permission)

**Data Privacy:**
- Only import what's needed (weight, BMI, nutrition, recovery)
- Don't export without explicit user action
- Clear data usage disclosure
- Imported data stored locally, not shared

---

## UI Design

**Integrations Settings Screen:**
- List of available integrations
- Connected status indicator
- Connect/Disconnect buttons
- Sync frequency options
- Last synced timestamp
- Premium badge on Gym Lab integrations (MyFitnessPal, Whoop)

**Gym Lab Health Dashboard:**
- Weight trend graph (free)
- Nutrition breakdown panels (premium)
- Recovery/strain timeline (premium)
- Correlation overlays with workout data (premium)

---

## Dependencies

- Settings store
- OAuth implementation
- Native modules (HealthKit)
- Gym Lab feature (premium gating)

---

## Priority

**Post-Launch:**

- P1: Apple Health (bodyweight import -- free)
- P2: Fitbit (bodyweight + activity -- free weight graph, premium analytics)
- P2: MyFitnessPal (nutrition data -- premium, Gym Lab)
- P2: Whoop (recovery/strain -- premium, Gym Lab)
- P2: Health Data Display in Gym Lab (premium analytics hub)

---

## Notes

**Why These Integrations:**
- Bodyweight: Essential for accurate bodyweight exercise scoring (free)
- Nutrition/Recovery: Feeds Gym Lab analytics to help users understand performance drivers (premium)
- Weight graph is free; all other integration-driven analytics live in Gym Lab (premium)

**Not Planned:**
- Music apps (Spotify, Apple Music) -- buddy sounds only, no music player
- Garmin (can add later if demand)
- Calorie/nutrition tracking apps as standalone features -- import only for Gym Lab analytics
- Other workout apps (we are the primary tracker)

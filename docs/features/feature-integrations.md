# Feature: Integrations

## Overview
Third-party app connections for enhanced functionality. Focus on data that complements workout tracking without duplicating core features.

---

## Sub-Features

### Planned - Apple Health Integration
- [ ] Import bodyweight
- [ ] Import BMI
- [ ] Export workout data
- [ ] Sync frequency settings
- [ ] iOS only

**Use Case:** Automatic bodyweight updates for e1RM calculation (bodyweight-based exercises like pullups).

**Priority:** P1

---

### Planned - Fitbit Integration
- [ ] Import bodyweight
- [ ] Import BMI
- [ ] OAuth connection flow
- [ ] Sync frequency settings

**Use Case:** Same as Apple Health for Fitbit users.

**Priority:** P2

---

### Planned - Spotify Integration
- [ ] Current song display during workout
- [ ] Play/pause controls
- [ ] Skip track
- [ ] Playlist selection
- [ ] No full music player (just controls)

**Use Case:** Quick music control without leaving the app during workout.

**Priority:** P2

---

### Planned - Apple Music Integration
- [ ] Same as Spotify
- [ ] iOS only
- [ ] MusicKit integration

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

**Spotify:**
```typescript
// Using react-native-spotify-remote
// Requires Spotify Premium for full controls
// Free tier: limited functionality
```

**OAuth Flow:**
- Fitbit requires OAuth 2.0
- Spotify requires OAuth 2.0
- Apple Music uses MusicKit

**Data Privacy:**
- Only import what's needed (weight, BMI)
- Don't export without explicit user action
- Clear data usage disclosure

---

## UI Design

**Integrations Settings Screen:**
- List of available integrations
- Connected status indicator
- Connect/Disconnect buttons
- Sync frequency options
- Last synced timestamp

**Music Widget (During Workout):**
- Floating mini-player
- Album art + song name
- Play/pause button
- Skip forward/back
- Tap to expand or hide

---

## Dependencies

- Settings store
- OAuth implementation
- Native modules (HealthKit, MusicKit)
- Spotify SDK

---

## Priority

**P1 (Phase 4+):**
- Apple Health (bodyweight import)

**P2 (Post-Launch):**
- Fitbit
- Spotify
- Apple Music

---

## Notes

**Why These Integrations:**
- Bodyweight: Essential for accurate bodyweight exercise scoring
- Music: Quality of life during workouts
- NOT food tracking, NOT steps, NOT sleep (out of scope)

**Not Planned:**
- Garmin, Whoop, etc. (can add later if demand)
- Calorie/nutrition apps (different audience)
- Other workout apps (we are the primary tracker)

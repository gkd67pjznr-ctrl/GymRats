---

### Backend & Sync Features
**Date:** 2026-01-31
**Features Tested:**
- Sync system initialization
- Store registration with sync orchestrator
- Auth-triggered sync (sign in/out)
- Network monitoring for online/offline sync
- Sync status indicators

### TC-SYNC1: Sync Initialization on App Start
**Steps:**
1. Fresh install or clear app data
2. Launch the app
3. Open debug screen (if available) or check console logs
4. Verify sync system initializes without errors

**Expected:** Sync system initializes on app start, registers stores, and shows no errors
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

### TC-SYNC2: Auth-Triggered Sync
**Steps:**
1. Sign out of the app (if signed in)
2. Sign in with email/password or dev login
3. Check console logs for sync activation
4. Verify sync status indicators show syncing then success

**Expected:** Sync triggers automatically on user sign in, pulls data from server
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

### TC-SYNC3: Network Online/Offline Handling
**Steps:**
1. Ensure app is online and signed in
2. Make a local change (e.g., create a post, log a workout set)
3. Turn on airplane mode or disable network
4. Make another change
5. Re-enable network
6. Verify changes sync to server once online

**Expected:** Changes queue when offline, sync automatically when network restored
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

### TC-SYNC4: Store Registration & Sync Status
**Steps:**
1. Open app debug/sync status screen (if available)
2. Verify all stores show as registered (workout, routines, friends, social, feed, chat, gamification)
3. Check each store's sync status (idle, syncing, success, error)

**Expected:** All sync-enabled stores appear in sync status with correct registration
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

### UI Themes & Visual Style Features
**Date:** 2026-01-30
**Features Tested:**
- Color palette switching
- Typography treatments
- Theme persistence
- Illustration style consistency

---

### TC-UI1: Color Palette Switching
**Steps:**
1. Navigate to Settings
2. Find "Theme" or "Appearance" section
3. Select different accent color themes (Toxic Energy, Iron Forge, Neon Glow, Cosmic Strength)
4. Verify UI elements update to selected theme colors
5. Close and reopen app
6. Verify theme selection persists

**Expected:** Users can switch between multiple color palettes with emotional meaning, and selections persist across app sessions
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

### TC-UI2: Typography System Consistency
**Steps:**
1. Navigate to various screens (Home, Workout, Feed, Profile)
2. Verify typography hierarchy is consistent
3. Check that headlines have bold weights with slight irregularities
4. Verify body text remains readable and clear
5. Check that numbers are emphasized for workout data
6. Look for personality-driven treatments in key elements

**Expected:** Typography system balances functional clarity with personality-driven treatments across all screens
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

### TC-UI3: Theme Persistence Across App States
**Steps:**
1. Select a specific accent theme
2. Navigate through several screens
3. Background the app and resume
4. Verify theme remains consistent
5. Force close the app and reopen
6. Verify theme selection persists after app restart

**Expected:** Theme selections persist across app states including backgrounding and force closing
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

### TC-UI4: Illustration Style Consistency
**Steps:**
1. Navigate to screens with illustrations (Workout start, PR celebration, Rank progression)
2. Verify illustrations follow hand-drawn aesthetic with surreal/psychedelic elements
3. Check that illustrations match the fitness-specific themes
4. Verify consistency in artistic direction across all illustrations
5. Check loading screens and achievement badges for style consistency

**Expected:** All illustrations follow the defined hand-drawn style guide with thematic consistency
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```

---

### TC-WR5: Rank changes display
**Steps:**
1. Complete a workout that results in a rank change (heavy enough set)
2. Navigate to workout replay screen
3. Verify rank change card appears showing before/after rank
4. Verify visual styling matches rank tier colors

**Expected:** Rank changes are displayed with before/after visualization and proper tier styling

**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```

---

### TC-WR6: Buddy sign-off
**Steps:**
1. Complete any workout
2. Navigate to workout replay screen
3. Scroll to the bottom to find buddy sign-off message
4. Verify message matches equipped buddy's personality

**Expected:** Buddy sign-off message appears with personality-appropriate content

**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```

---

### TC-WR7: Share to feed
**Steps:**
1. Complete any workout
2. Navigate to workout replay screen
3. Tap "Share to Feed" button
4. Verify sharing confirmation or navigation to feed

**Expected:** Sharing functionality works and posts workout replay to feed

**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```

---

### TC-A1: Avatar Creation and Customization
**Steps:**
1. Navigate to Profile tab
2. Tap on "Avatar" card
3. Select different art styles (bitmoji, pixel, retro)
4. Verify avatar preview updates correctly
5. Save avatar customization

**Expected:** Users can select and preview different avatar art styles
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```


### TC-A2: Avatar Growth Visualization
**Steps:**
1. Navigate to Avatar screen
2. View avatar growth stage indicator
3. Check avatar height scaling based on growth stage
4. Verify growth stage descriptions are displayed

**Expected:** Avatar visually grows based on workout activity
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```


### TC-A3: Hangout Room Navigation
**Steps:**
1. Navigate to Profile tab
2. Tap on "Hangout Room" card
3. Verify hangout room screen loads
4. Check room display with decorations
5. Verify avatar placement in room

**Expected:** Users can access and view hangout room
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```


### TC-A4: Friend Presence Indicators
**Steps:**
1. Navigate to Hangout Room with friends
2. Observe friend avatars in room
3. Check status indicators (online, working out, etc.)
4. Verify avatar placement updates in real-time

**Expected:** Friend avatars appear with status indicators
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

### TC-UI1: Color Palette Switching
**Steps:**
1. Navigate to Settings
2. Find "Theme" or "Appearance" section
3. Select different accent color themes (Toxic Energy, Iron Forge, Neon Glow, Cosmic Strength)
4. Verify UI elements update to selected theme colors
5. Close and reopen app
6. Verify theme selection persists

**Expected:** Users can switch between multiple color palettes with emotional meaning, and selections persist across app sessions
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```


### TC-UI2: Typography System Consistency
**Steps:**
1. Navigate to various screens (Home, Workout, Feed, Profile)
2. Verify typography hierarchy is consistent
3. Check that headlines have bold weights with slight irregularities
4. Verify body text remains readable and clear
5. Check that numbers are emphasized for workout data
6. Look for personality-driven treatments in key elements

**Expected:** Typography system balances functional clarity with personality-driven treatments across all screens
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```


### TC-UI3: Theme Persistence Across App States
**Steps:**
1. Select a specific accent theme
2. Navigate through several screens
3. Background the app and resume
4. Verify theme remains consistent
5. Force close the app and reopen
6. Verify theme selection persists after app restart

**Expected:** Theme selections persist across app states including backgrounding and force closing
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

**End of Testing Checklist**
*Add new test sessions above as features are completed*

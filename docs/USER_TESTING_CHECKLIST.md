# USER TESTING CHECKLIST
**Admin/User-Side Testing Instructions**

---

## Document Info
- **Created:** 2026-01-27
- **Last Updated:** 2026-01-27
- **Purpose:** Checklist for user to test new features on Expo Go

---

## How to Use This Checklist

1. **Before Testing:**
   - Run `npm start` to start the dev server
   - Open Expo Go on your device
   - Scan QR code or enter URL
   - Wait for bundle to load

2. **During Testing:**
   - Go through each test case systematically
   - Mark ✅ for pass, ❌ for fail, ⚠️ for issues
   - Note any bugs, crashes, or UX problems

3. **After Testing:**
   - Report results back to Claude
   - Provide feedback on UX/feel
   - Suggest any improvements

---

## Latest Testing Session

### AI Gym Buddy System
**Date:** 2026-01-29
**Features Tested:**
- Buddy message display
- Buddy selection
- Tier-based features

---

## Test Cases

---

## Test Cases

### P0: Start Workout from Routine

#### TC-R1: Start workout from routine detail page
**Steps:**
1. Navigate to Routines tab
2. Tap on any routine
3. Tap "Start Workout" button
4. Verify you're taken to live-workout screen
5. Verify routine exercises are shown as blocks

**Expected:** Navigate to live-workout with routine loaded as plan
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

#### TC-R2: Start routine with active session confirmation
**Steps:**
1. Start any workout (log at least 1 set)
2. Go to Routines tab
3. Tap on a routine
4. Tap "Start Workout" button
5. Verify confirmation dialog appears
6. Tap "Cancel"
7. Verify you stay on routine detail
8. Tap "Start Workout" again
9. Tap "Start Routine"
10. Verify old session is cleared, new routine starts

**Expected:** Confirmation dialog shown, choice respected
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

### P1: Routine Progress Indicator

#### TC-R3: Progress summary shown during workout
**Steps:**
1. Start a routine workout (from P0)
2. Verify "Progress" card appears at top of exercise blocks
3. Verify progress percentage is shown
4. Verify progress bar fills correctly
5. Log a set for first exercise
6. Verify progress updates

**Expected:** Progress summary visible and updates in real-time
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

#### TC-R4: Progress stats accuracy
**Steps:**
1. Start a routine with known targets (e.g., 3 sets per exercise)
2. Complete 1 set for exercise 1
3. Verify shows "1/3 sets"
4. Complete 2 more sets for exercise 1
5. Verify shows "3/3 sets"
6. Verify progress bar is ~33% (if 3 exercises)
7. Verify "X exercises left" text is accurate

**Expected:** Progress stats match actual sets logged vs targets
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

#### TC-R5: Progress colors at completion levels
**Steps:**
1. Start a routine workout
2. Complete sets to reach ~25% progress
3. Verify progress bar color (should be warning/yellow)
4. Complete sets to reach ~50% progress
5. Verify progress bar color (should be primary)
6. Complete sets to reach 100% progress
7. Verify progress bar color (should be success/green)
8. Verify "All exercises complete!" message

**Expected:** Colors change based on completion level
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

### P2: Workout Summary Screen

#### TC-R6: Summary screen appears after finish
**Steps:**
1. Complete a workout (log at least 1 set)
2. Tap "Finish Workout"
3. Verify workout summary screen appears
4. Verify workout duration is shown correctly
5. Verify set count matches what you logged
6. Verify exercises list is accurate

**Expected:** Summary screen shows correct workout data
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

#### TC-R7: Summary shows routine completion
**Steps:**
1. Start a routine workout
2. Complete partial workout (don't finish all sets)
3. Tap "Finish Workout"
4. Verify completion percentage is shown
5. Verify progress bar is accurate
6. Verify encouraging message appears

**Expected:** Completion % and message displayed correctly
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

#### TC-R8: Summary "Done" button
**Steps:**
1. Finish any workout to see summary
2. Tap "Done" button
3. Verify you return to home screen

**Expected:** Navigates to home screen
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

#### TC-R9: Summary "Share to Feed" button
**Steps:**
1. Finish any workout to see summary
2. Tap "Share to Feed" button
3. Verify button shows loading state
4. Note: This is scaffolded, may not fully work yet

**Expected:** Button shows loading, may show placeholder behavior
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

### P3: Quick-Start from List

#### TC-R10: Quick-start button on routine list
**Steps:**
1. Navigate to Routines tab
2. Verify each routine card has "Start Workout" button
3. Tap "Start Workout" on any routine
4. Verify workout starts immediately
5. Verify correct routine is loaded

**Expected:** Quick-start works without going to detail view
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

#### TC-R11: Quick-start with active session
**Steps:**
1. Start any workout (log at least 1 set)
2. Go to Routines list
3. Tap "Start Workout" on any routine
4. Verify confirmation dialog appears
5. Test both "Cancel" and "Start Routine" options

**Expected:** Same confirmation flow as detail page
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

#### TC-R12: Tap card body for details
**Steps:**
1. Go to Routines list
2. Tap on the card body (not the button)
3. Verify you navigate to routine detail page
4. Verify "Start Workout" button still works from detail

**Expected:** Card body navigates to detail, button quick-starts
**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[Your notes here]
```

---

## General Checks

### Performance
- ⬜ No lag when tapping buttons
- ⬜ Progress bar updates smoothly
- ⬜ Screen transitions feel fast (<1 second)

### Visual
- ⬜ Text is readable on all cards
- ⬜ Colors look good (progress bar, buttons)
- ⬜ Layout looks correct on your device
- ⬜ No visual glitches

### Data Persistence
- ⬜ Start a routine, close app, reopen - workout still active
- ⬜ Complete workout, close app, reopen - summary still accessible
- ⬜ Progress is saved correctly

---

## Bug Report Template

If you find any issues, use this format:

```markdown
## Bug Report
**Test Case:** TC-XX
**Device:** [iPhone X / Pixel 6 / etc.]
**OS:** [iOS 17 / Android 14 / etc.]

### What Happened
[Description of the bug]

### Expected
[What should have happened]

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Screenshots/Videos
[If applicable]
```

---

## Feedback Questions

After testing, please provide feedback on:

1. **UX Experience:**
   - Is the progress indicator helpful?
   - Is the quick-start button convenient?
   - Is the summary screen satisfying?

2. **Confusion Points:**
   - Anything confusing about the flow?
   - Any unclear labels or buttons?

3. **Suggestions:**
   - What would make this better?
   - Any missing features?

---

### TC-B1: Buddy message display
**Steps:**
1. Open the app and start a workout
2. Log a set that triggers a PR
3. Verify that a buddy message is displayed
4. Check that the message matches the equipped buddy's personality

**Expected:** Buddy message appears with appropriate content based on buddy personality

**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```

---

### TC-B2: Buddy selection
**Steps:**
1. Navigate to Settings > Buddies
2. View the list of available buddies
3. Select a different buddy to equip
4. Return to workout and log a set

**Expected:** New buddy's personality is reflected in messages

**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```

---

### TC-B3: Tier-based features
**Steps:**
1. Check that basic buddies show text only
2. Verify that premium buddies have additional visual elements
3. Confirm that legendary buddies have special styling

**Expected:** Visual treatment matches buddy tier

**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```

---

### Latest Testing Session

### Workout Replay Feature
**Date:** 2026-01-30
**Features Tested:**
- Auto-play workout replay after completion
- Manual replay from workout summary
- Stat cards with workout metrics
- PR highlights with buddy commentary
- Rank changes display
- Buddy sign-off messages
- Share to feed functionality

---

## Test Cases

### TC-WR1: Auto-play workout replay
**Steps:**
1. Navigate to Settings > Workout Replay
2. Ensure "Auto-play" toggle is enabled
3. Start and complete a workout with at least one set
4. Tap "Finish Workout" button
5. Verify workout replay screen appears automatically

**Expected:** Workout replay screen automatically appears after workout completion when auto-play is enabled

**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```

---

### TC-WR2: Manual replay from summary
**Steps:**
1. Navigate to Settings > Workout Replay
2. Disable "Auto-play" toggle
3. Start and complete a workout with at least one set
4. Tap "Finish Workout" button
5. Verify workout summary screen appears
6. Tap "Replay Workout" button
7. Verify workout replay screen appears

**Expected:** Workout replay screen appears when manually triggered from summary screen

**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```

---

### TC-WR3: Stat cards display
**Steps:**
1. Complete a workout with multiple exercises and sets
2. Navigate to workout replay screen
3. Verify duration, sets, and volume stat cards are displayed
4. Verify values match actual workout data

**Expected:** Stat cards show accurate workout metrics with proper formatting

**Result:** ⬜ Pass / ❌ Fail / ⚠️ Issue

**Notes:**
```
[User's feedback here]
```

---

### TC-WR4: PR highlights
**Steps:**
1. Complete a workout with a new personal record (log a heavier weight)
2. Navigate to workout replay screen
3. Verify PR highlight card appears for the achieved PR
4. Verify PR type and value are displayed correctly

**Expected:** PR highlights appear for achieved personal records with accurate information

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


**End of Testing Checklist**
*Add new test sessions above as features are completed*

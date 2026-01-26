# Feature: Notifications

## Overview
Push notifications and reminders to keep users engaged without being annoying. Philosophy: minimal, opt-in, and genuinely useful.

---

## Sub-Features

### Planned - Rest Timer Notification
- [ ] Push notification when rest timer completes
- [ ] Works when app is backgrounded
- [ ] Customizable rest durations
- [ ] "Time to lift!" message
- [ ] Tap to return to workout

**Priority:** P0

---

### Planned - Streak Warnings
- [ ] Notification before streak breaks
- [ ] "Don't lose your X day streak!"
- [ ] Sent on day 4 of inactivity (breaks on day 5)
- [ ] Configurable: on/off
- [ ] Time of day preference

**Priority:** P1

---

### Planned - Rest Day Reminders
- [ ] "Haven't worked out in X days"
- [ ] Fully configurable schedule
- [ ] Respect user's workout days
- [ ] Gentle, not pushy tone
- [ ] Easy to disable

**Priority:** P1

---

### Planned - iOS Live Activities
- [ ] Dynamic Island support
- [ ] Shows rest timer countdown
- [ ] Current workout summary
- [ ] PR celebration momentary display
- [ ] Lock screen widget

**Priority:** P2

---

### Planned - Social Notifications
- [ ] Friend request received
- [ ] Reaction on your post
- [ ] Comment on your post
- [ ] Friend hit a PR
- [ ] All social notifications toggleable

**Priority:** P1

---

## Technical Notes

**Key Technologies:**
- expo-notifications
- iOS Live Activities (Swift/native module)
- Android notification channels

**Notification Types:**
```typescript
type NotificationType =
  | 'rest_timer'
  | 'streak_warning'
  | 'rest_day_reminder'
  | 'friend_request'
  | 'reaction'
  | 'comment'
  | 'friend_pr';

type NotificationPreferences = {
  restTimer: boolean;
  streakWarnings: boolean;
  restDayReminders: boolean;
  reminderTime: string; // "18:00"
  reminderDays: number[]; // [1,2,3,4,5] = Mon-Fri
  socialNotifications: boolean;
};
```

**Permission Handling:**
```typescript
// Request permission on first relevant action
const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};
```

---

## Philosophy

**Minimal by Default:**
- Don't enable everything automatically
- Ask permission only when needed
- Respect user's attention

**Useful, Not Annoying:**
- Rest timer: directly useful during workout
- Streak warning: prevents loss
- Rest day: only if user wants it

**Easy to Disable:**
- Per-notification-type toggles
- One-tap disable from notification
- Clear settings UI

---

## Dependencies

- Settings store (preferences)
- Rest timer functionality
- Streak tracking
- Social features
- Supabase (for social notifications)

---

## Priority

**P0 (Launch Required):**
- Rest timer push notification

**P1 (Phase 2-3):**
- Streak warnings
- Rest day reminders
- Social notifications

**P2 (Post-Launch):**
- iOS Live Activities
- Android widgets

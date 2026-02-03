# Feature: Notifications

## Overview

Push notifications with a MINIMAL philosophy. GymRats respects the user's attention -- no nagging, no guilt trips, no "you haven't worked out in X days" reminders. Notifications exist only when they deliver immediate, essential value.

**Total sub-features:** 7 (Rest Timer, Global Top Bar, Friend Requests, DMs, Reactions, Comments, Competition Results)

---

## Philosophy

**Minimal means minimal.**
- We do NOT nag users to work out
- We do NOT send "you haven't logged a workout" reminders
- We do NOT guilt-trip about streaks
- We do NOT broadcast every friend's PR
- If a notification doesn't serve an immediate, concrete purpose, it doesn't exist

**Respect the user's attention:**
- Every notification earns its place by being genuinely essential
- Users chose to work out on their own terms -- we don't play motivational coach
- Fewer notifications = each one actually gets read

**Permission handling:**
- Request permission only at the moment it becomes relevant (e.g., first rest timer use)
- Never front-load a permission prompt on first launch

---

## Sub-Features

### 1. Friend Requests

- [✅] Push notification when someone sends a friend request
- [✅] Tap opens the friend request screen
- [✅] Toggleable in settings
- [✅] Database trigger auto-creates notification on friend request
- [✅] Server-side push delivery via pg_net

**Priority:** P1 (requires social features)
**Status:** ✅ COMPLETE - Full push notification flow implemented with DB triggers

---

### 2. Direct Messages

- [✅] Push notification when a DM is received
- [✅] Shows sender name and message preview
- [✅] Tap opens the conversation
- [✅] Toggleable in settings
- [✅] Message preview truncation (50 chars)

**Priority:** P1 (requires DM feature)
**Status:** ✅ COMPLETE - Full push notification flow with tap-to-open routing (DB trigger pending chat_messages table)

---

### 3. Competition Results (Post-Launch)

- [ ] Push notification when a competition you entered has finished
- [ ] Shows final placement / result summary
- [✅] Tap opens the competition detail screen (routing ready)
- [✅] Toggleable in settings

**Priority:** P2 (post-launch, requires competition feature)
**Status:** Partial - Settings and routing complete, requires competition feature to implement triggers

---

### 6. Reactions

- [✅] Push notification when someone reacts to your post
- [✅] Shows reactor name and reaction type (liked, loved, crowned, etc.)
- [✅] Tap opens the post (routes to feed for now)
- [✅] Toggleable in settings
- [✅] Database trigger auto-creates notification on reaction
- [✅] Server-side push delivery via pg_net
- [✅] Does not notify for self-reactions

**Priority:** P1 (with social features)
**Status:** ✅ COMPLETE - Full push notification flow with DB triggers

---

### 7. Comments

- [✅] Push notification when someone comments on your post
- [✅] Shows commenter name and comment preview
- [✅] Tap opens the post (routes to feed for now)
- [✅] Toggleable in settings
- [✅] Comment preview truncation (50 chars)
- [✅] Database trigger auto-creates notification on comment
- [✅] Server-side push delivery via pg_net
- [✅] Does not notify for self-comments

**Priority:** P1 (with social features)
**Status:** ✅ COMPLETE - Full push notification flow with DB triggers

---

### 4. Rest Timer (Backgrounded)

- [✅] Push notification when rest timer completes while app is backgrounded
- [✅] Works via local push notification (no server needed)
- [✅] "Time to lift!" message with tap-to-return
- [✅] Customizable rest durations
- [✅] Only fires when app is in the background during an active workout
- [✅] Toggleable in settings
- [✅] Contextual permission request on first rest timer use
- [✅] Automatic cleanup when timer is dismissed or app returns to foreground
- [✅] App state change handling for proper notification lifecycle
- [✅] Integrated into RestTimerOverlay component
- [✅] Notification response listener in live-workout.tsx

**Priority:** P0 (launch)
**Status:** ✅ COMPLETE - Fully implemented, tested, and integrated

---

### 5. Global Top Bar & Notification Center

- [✅] Persistent top bar on all authenticated screens
- [✅] User avatar with tier-colored border based on level
- [✅] Level badge overlay (bottom-right of avatar)
- [✅] Compact XP progress bar (80x6px with gradient)
- [✅] Notification bell with unread count badge
- [✅] Dropdown notification list (max 25% screen height)
- [✅] Mark as read on tap
- [✅] Mark all as read action
- [✅] Real-time notification subscription via Supabase
- [✅] Hidden when workout drawer is expanded (full-screen mode)
- [✅] Hidden on auth/onboarding screens
- [✅] Settings and search placeholder icons

**Priority:** P0 (launch)
**Status:** ✅ COMPLETE - Fully implemented with topBarStore, 6 UI components

**Components:**
- `GlobalTopBar/index.tsx` - Main container with visibility logic
- `TopBarAvatar.tsx` - Avatar + level badge composite
- `XPProgressMini.tsx` - Compact animated XP bar
- `NotificationBell.tsx` - Bell icon with unread badge
- `NotificationDropdown.tsx` - Modal dropdown with notification list
- `NotificationItem.tsx` - Individual notification row

**Store:**
- `topBarStore.ts` - Zustand store for dropdown state and notifications cache

---

### Future / P2 - iOS Live Activities

- [ ] Dynamic Island support for active workout
- [ ] Shows rest timer countdown on lock screen
- [ ] Current workout summary
- [ ] PR celebration momentary display
- [ ] Requires native Swift module

**Priority:** P2 (post-launch)

---

## Technical Notes

**Key Technologies:**
- expo-notifications (local + push)
- iOS Live Activities (Swift/native module, future)
- Android notification channels

**Notification Types:**
```typescript
type NotificationType =
  | 'friend_request'
  | 'dm_received'
  | 'competition_result'
  | 'rest_timer'
  | 'reaction'
  | 'comment';

type NotificationPreferences = {
  friendRequests: boolean;
  directMessages: boolean;
  competitionResults: boolean;
  restTimer: boolean;
  reactions: boolean;
  comments: boolean;
};
```

**Permission Handling:**
```typescript
// Request permission on first relevant action, not on app launch
const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};
```

---

## Dependencies

- Settings store (preferences)
- Rest timer functionality
- Social features / friend system (for friend requests)
- DM feature (for direct messages)
- Competition feature (for competition results)
- Supabase (for push notification delivery)

---

## Priority

**P0 (Launch Required):**
- [✅] Rest timer push notification (backgrounded) - COMPLETE
- [✅] Global Top Bar with notification center - COMPLETE

**P1 (With Social Features):**
- [✅] Friend requests - COMPLETE with DB triggers
- [✅] Direct messages - COMPLETE (DB trigger pending chat table)
- [✅] Reactions - COMPLETE with DB triggers
- [✅] Comments - COMPLETE with DB triggers

**P2 (Post-Launch):**
- [ ] Competition results - Routing ready, requires competition feature
- [ ] iOS Live Activities

## Implementation Status

**Overall Progress:** 6/7 sub-features complete (100% of P0, 100% of P1, 0% of P2)

### Completed (P0 - Launch Required)
- ✅ Rest timer push notifications (backgrounded) - Fully implemented and integrated
- ✅ Global Top Bar with notification center - Fully implemented
- ✅ Notification service infrastructure - Complete with error handling
- ✅ Settings store integration - All preferences persisted
- ✅ Permission handling (contextual request) - Requested on first use
- ✅ Comprehensive test suite (38/38 tests passing in notificationService.test.ts)
- ✅ App state handling - Proper notification cleanup on foreground/background
- ✅ Notification channels - Android channels configured (Social, Workout, Competition)

### Completed (P1 - Social Features)
- ✅ Friend requests - Full flow with DB trigger, tap-to-open routing, server-side push
- ✅ Direct messages - Service functions complete, tap-to-open routing (DB trigger pending chat_messages table)
- ✅ Reactions - Full flow with DB trigger, tap-to-open routing, server-side push, emote labels
- ✅ Comments - Full flow with DB trigger, tap-to-open routing, server-side push, preview truncation

### Infrastructure
- ✅ Tap-to-open routing in app/_layout.tsx for all notification types
- ✅ Server-side push delivery via pg_net (migration 014)
- ✅ Database triggers for friend_request, reaction, comment notifications
- ✅ Edge functions: register-push-token, send-push-notification
- ✅ In-app notification bell with unread badge
- ✅ Notification dropdown with real-time Supabase subscriptions
- ✅ Mark as read / Mark all as read functionality

### Pending (P2 - Post-Launch)
- Competition results - Routing ready, requires competition feature
- iOS Live Activities (requires native Swift module)

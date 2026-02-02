# Live Workout Together - Comprehensive Documentation

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Architecture](#architecture)
3. [Session Modes](#session-modes)
   - [Shared Mode](#shared-mode)
   - [Guided Mode](#guided-mode)
4. [Technical Implementation](#technical-implementation)
   - [Service Layer](#service-layer)
   - [State Management](#state-management)
   - [Real-time Communication](#real-time-communication)
   - [Database Schema](#database-schema)
5. [API Reference](#api-reference)
   - [Session Management](#session-management)
   - [Event Handling](#event-handling)
   - [Query Operations](#query-operations)
   - [Utility Functions](#utility-functions)
6. [Type Definitions](#type-definitions)
   - [Core Types](#core-types)
   - [Event Types](#event-types)
   - [State Types](#state-types)
   - [Error Handling](#error-handling)
7. [UI Components](#ui-components)
8. [Usage Examples](#usage-examples)
   - [Creating a Session](#creating-a-session)
   - [Joining a Session](#joining-a-session)
   - [Handling Events](#handling-events)
   - [Sending Reactions](#sending-reactions)
9. [Integration Points](#integration-points)
10. [Security Considerations](#security-considerations)
11. [Performance Considerations](#performance-considerations)
12. [Future Enhancements](#future-enhancements)

## Feature Overview

The Live Workout Together feature enables real-time collaborative workout experiences in Forgerank. Users can:

- **See friends' workout presence** in real-time
- **Join shared workout sessions** where everyone works out independently but sees each other's progress
- **Participate in guided partner mode** where one leader sets the workout structure and others follow
- **Send quick reactions** to celebrate friends' achievements
- **Chat and communicate** during live sessions

This feature transforms solo workouts into social experiences, increasing motivation and accountability.

## Architecture

The Live Workout Together feature follows a layered architecture:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────────┐   │
│   │             │    │             │    │                                 │   │
│   │  Client A   │◄───►│  Supabase   │◄───►│  Client B                       │   │
│   │             │    │  Realtime   │    │                                 │   │
│   └─────────────┘    └─────────────┘    └─────────────────────────────────┘   │
│                                                                               │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │  Live Workout Together Service Layer                                   │   │
│   │                                                                       │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│   │  │ Session     │  │ Event       │  │ Query       │  │ Utility     │  │   │
│   │  │ Management  │  │ Handling    │  │ Operations  │  │ Functions   │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│   │                                                                       │   │
│   └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │  Zustand Store (Live Workout UI State)                                │   │
│   │                                                                       │   │
│   └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │  React Components (UI Layer)                                         │   │
│   │                                                                       │   │
│   └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Session Modes

### Shared Mode

In Shared Mode, participants work out independently but share the same virtual space:

- **Independent Exercise Selection**: Each participant chooses their own exercises
- **Real-time Progress Sharing**: All participants see each other's set completions
- **Live Feed**: Continuous stream of workout activity
- **Reactions**: Send emotes to celebrate friends' achievements
- **Chat**: Text communication during the session

**Use Case**: Friends working out together but doing different exercises, or following their own routines while staying connected.

### Guided Mode

In Guided Mode, one leader sets the workout structure and others follow:

- **Leader Control**: One participant (the leader) controls exercise progression
- **Synchronized Workouts**: All participants follow the same exercise sequence
- **Ready System**: Participants mark themselves "ready" for the next exercise
- **Leader Dashboard**: Leader sees all followers' progress and status
- **Structured Workout**: Pre-planned exercises with target sets and reps

**Use Cases**:
- Virtual personal training sessions
- Group classes led by a coach
- Partners following the same workout plan
- Online coaching delivery

## Technical Implementation

### Service Layer

The service layer (`src/lib/liveWorkoutTogether/service.ts`) provides the core functionality:

- **Session Management**: Create, join, leave, start, and end sessions
- **Event Handling**: Process real-time events (set completions, reactions, etc.)
- **Query Operations**: Retrieve session data and summaries
- **Utility Functions**: Helper functions for exercise names, e1RM calculations

### State Management

The feature uses Zustand for state management:

- **Live Workout Store** (`src/lib/stores/liveWorkoutStore.ts`): Manages local workout state
- **Live Workout Together Store** (planned): Will manage session-specific state
- **Real-time Synchronization**: Supabase Realtime keeps all clients in sync

### Real-time Communication

Real-time communication is powered by Supabase:

- **Presence Channels**: Track which users are online and working out
- **Broadcast Channels**: Distribute events to all session participants
- **Optimistic UI Updates**: Immediate feedback with server synchronization
- **Error Handling**: Graceful degradation when offline

### Database Schema

#### `live_sessions` Table

```typescript
{
  id: string;                    // Session ID
  host_id: string;               // User ID of session creator
  mode: 'shared' | 'guided';     // Session mode
  status: 'pending' | 'active' | 'ended'; // Session status
  name?: string;                 // Optional session name
  theme?: string;                // Visual theme
  participants: string[];        // Array of user IDs
  created_at: number;            // Creation timestamp
  started_at?: number;           // When session was started
  ended_at?: number;             // When session was ended
  current_exercise_id?: string;  // Current exercise (guided mode)
  planned_exercises?: Array<{    // Workout plan (guided mode)
    exerciseId: string;
    targetSets: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
  }>;
}
```

#### Participant State

```typescript
{
  userId: string;               // User ID
  displayName: string;           // User's display name
  avatarUrl?: string;            // User's avatar
  status: 'idle' | 'resting' | 'working_out' | 'finished'; // Current status
  joinedAt: number;              // When user joined
  lastActiveAt: number;          // Last activity timestamp
  setsCompleted: number;         // Number of sets completed
  currentExerciseId?: string;    // Current exercise (if any)
  isLeader?: boolean;            // Is this user the leader?
  readyForNext?: boolean;        // Ready for next exercise?
}
```

## API Reference

### Session Management

#### `createLiveSession(params)`

Create a new live workout session.

**Parameters:**
```typescript
{
  mode: 'shared' | 'guided';
  name?: string;
  theme?: string;
  participantIds?: string[];
  plannedExercises?: Array<{
    exerciseId: string;
    targetSets: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
  }>;
}
```

**Returns:** `{ success: boolean; data?: LiveSession; error?: string }`

#### `startLiveSession(sessionId)`

Start a pending session (transition to active state).

**Parameters:** `sessionId: string`

**Returns:** `{ success: boolean; error?: string }`

#### `endLiveSession(sessionId)`

End an active session.

**Parameters:** `sessionId: string`

**Returns:** `{ success: boolean; error?: string }`

#### `joinLiveSession(params)`

Join an existing session.

**Parameters:**
```typescript
{
  sessionId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
}
```

**Returns:** `{ success: boolean; data?: LiveSessionParticipant; error?: string }`

#### `leaveLiveSession(sessionId, userId)`

Leave a session.

**Parameters:** `sessionId: string`, `userId: string`

**Returns:** `{ success: boolean; error?: string }`

### Event Handling

#### `completeLiveSet(params)`

Log a completed set in a live session.

**Parameters:**
```typescript
{
  sessionId: string;
  userId: string;
  set: LoggedSet;
  exerciseName: string;
  e1rmKg?: number;
  isPR?: boolean;
}
```

**Returns:** `{ success: boolean; data?: LiveSetCompletedEvent; error?: string }`

#### `changeExercise(params)`

Change current exercise (leader only in guided mode).

**Parameters:**
```typescript
{
  sessionId: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
}
```

**Returns:** `{ success: boolean; data?: LiveExerciseChangedEvent; error?: string }`

#### `sendReaction(params)`

Send an emote reaction.

**Parameters:**
```typescript
{
  sessionId: string;
  userId: string;
  targetUserId: string;
  emote: EmoteId;
  targetSetId?: string;
}
```

**Returns:** `{ success: boolean; data?: LiveReactionEvent; error?: string }`

#### `updateParticipantStatus(params)`

Update participant status.

**Parameters:**
```typescript
{
  sessionId: string;
  userId: string;
  status: ParticipantStatus;
  currentExerciseId?: string;
}
```

**Returns:** `{ success: boolean; data?: LiveStatusUpdateEvent; error?: string }`

#### `updateReadyStatus(params)`

Update ready status (for guided mode).

**Parameters:**
```typescript
{
  sessionId: string;
  userId: string;
  isReady: boolean;
}
```

**Returns:** `{ success: boolean; data?: LiveReadyStatusEvent; error?: string }`

#### `sendLiveMessage(sessionId, userId, message)`

Send a chat message.

**Parameters:** `sessionId: string`, `userId: string`, `message: string`

**Returns:** `{ success: boolean; data?: LiveMessageEvent; error?: string }`

### Query Operations

#### `getActiveLiveSessions()`

Get all active sessions.

**Returns:** `{ success: boolean; data?: LiveSession[]; error?: string }`

#### `getLiveSession(sessionId)`

Get session details.

**Parameters:** `sessionId: string`

**Returns:** `{ success: boolean; data?: LiveSession; error?: string }`

#### `getSessionParticipants(sessionId)`

Get participant list.

**Parameters:** `sessionId: string`

**Returns:** `{ success: boolean; data?: LiveSessionParticipant[]; error?: string }`

#### `getSessionSummary(sessionId)`

Get session summary statistics.

**Parameters:** `sessionId: string`

**Returns:** `{ success: boolean; data?: LiveSessionSummary; error?: string }`

### Utility Functions

#### `getExerciseName(exerciseId)`

Get exercise name from ID.

**Parameters:** `exerciseId: string`

**Returns:** `string`

#### `calculateE1RM(weightKg, reps)`

Calculate estimated 1-rep max using Epley formula.

**Parameters:** `weightKg: number`, `reps: number`

**Returns:** `number`

#### `generateSessionInvitation(sessionId, targetUserId)`

Generate a session invitation.

**Parameters:** `sessionId: string`, `targetUserId: string`

**Returns:** `{ success: boolean; data?: LiveSessionInvitation; error?: string }`

#### `sendQuickReaction(params)`

Send a quick reaction to a friend's workout.

**Parameters:**
```typescript
{
  fromUserId: string;
  toUserId: string;
  emote: string;
  setId?: string;
}
```

**Returns:** `{ success: boolean; error?: string }`

### Real-time Subscriptions

#### `subscribeToLiveSession(sessionId, callback)`

Subscribe to session events.

**Parameters:** `sessionId: string`, `callback: (event: LiveSessionEvent) => void`

**Returns:** `() => void` (unsubscribe function)

#### `subscribeToFriendsPresence(userId, callback)`

Subscribe to friends' workout presence.

**Parameters:** `userId: string`, `callback: (presence: WorkoutPresence[]) => void`

**Returns:** `() => void` (unsubscribe function)

## Type Definitions

### Core Types

#### `LiveSessionMode`
```typescript
type LiveSessionMode = 'shared' | 'guided';
```

#### `LiveSessionStatus`
```typescript
type LiveSessionStatus = 'pending' | 'active' | 'ended';
```

#### `LiveSession`
```typescript
interface LiveSession {
  id: string;
  hostId: string;
  mode: LiveSessionMode;
  status: LiveSessionStatus;
  name?: string;
  theme?: string;
  participants: string[];
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  currentExerciseId?: string;
  plannedExercises?: Array<{
    exerciseId: string;
    targetSets: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
  }>;
}
```

#### `ParticipantStatus`
```typescript
type ParticipantStatus = 'idle' | 'resting' | 'working_out' | 'finished';
```

#### `LiveSessionParticipant`
```typescript
interface LiveSessionParticipant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  status: ParticipantStatus;
  joinedAt: number;
  lastActiveAt: number;
  setsCompleted: number;
  currentExerciseId?: string;
  isLeader?: boolean;
  readyForNext?: boolean;
}
```

### Event Types

#### `LiveSessionEventType`
```typescript
type LiveSessionEventType =
  | 'set_completed'
  | 'exercise_changed'
  | 'reaction'
  | 'status_update'
  | 'ready_status_changed'
  | 'message';
```

#### `LiveSessionEventBase`
```typescript
interface LiveSessionEventBase {
  sessionId: string;
  userId: string;
  type: LiveSessionEventType;
  timestamp: number;
}
```

#### `LiveSetCompletedEvent`
```typescript
interface LiveSetCompletedEvent extends LiveSessionEventBase {
  type: 'set_completed';
  data: {
    set: LoggedSet;
    exerciseName: string;
    e1rmKg?: number;
    isPR?: boolean;
  };
}
```

#### `LiveExerciseChangedEvent`
```typescript
interface LiveExerciseChangedEvent extends LiveSessionEventBase {
  type: 'exercise_changed';
  data: {
    exerciseId: string;
    exerciseName: string;
    targetSets?: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
  };
}
```

#### `LiveReactionEvent`
```typescript
interface LiveReactionEvent extends LiveSessionEventBase {
  type: 'reaction';
  data: {
    targetUserId: string;
    emote: EmoteId;
    targetSetId?: string;
  };
}
```

#### `LiveStatusUpdateEvent`
```typescript
interface LiveStatusUpdateEvent extends LiveSessionEventBase {
  type: 'status_update';
  data: {
    status: ParticipantStatus;
    currentExerciseId?: string;
  };
}
```

#### `LiveReadyStatusEvent`
```typescript
interface LiveReadyStatusEvent extends LiveSessionEventBase {
  type: 'ready_status_changed';
  data: {
    isReady: boolean;
  };
}
```

#### `LiveMessageEvent`
```typescript
interface LiveMessageEvent extends LiveSessionEventBase {
  type: 'message';
  data: {
    message: string;
  };
}
```

### State Types

#### `LiveSessionState`
```typescript
interface LiveSessionState {
  session: LiveSession;
  participants: LiveSessionParticipant[];
  events: LiveSessionEvent[];
  currentExercise?: {
    exerciseId: string;
    exerciseName: string;
    targetSets?: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
  };
}
```

#### `LocalParticipantState`
```typescript
interface LocalParticipantState {
  status: ParticipantStatus;
  currentExerciseId?: string;
  readyForNext: boolean;
  lastActiveAt: number;
}
```

### Error Handling

#### `LiveWorkoutTogetherErrorCode`
```typescript
type LiveWorkoutTogetherErrorCode =
  | 'user_not_authenticated'
  | 'session_not_found'
  | 'session_not_active'
  | 'permission_denied'
  | 'invalid_session_mode'
  | 'invalid_participant'
  | 'database_error'
  | 'network_error'
  | 'invalid_input'
  | 'rate_limited'
  | 'unknown_error';
```

#### `LiveWorkoutTogetherError`
```typescript
interface LiveWorkoutTogetherError {
  code: LiveWorkoutTogetherErrorCode;
  message: string;
  details?: any;
  timestamp: number;
}
```

## UI Components

The feature includes several React components for the user interface:

### `LiveWorkoutTogether.tsx`

Main component that orchestrates the live workout experience:
- Manages session state
- Handles real-time event subscriptions
- Coordinates between different UI elements

### `LiveReactionAnimation.tsx`

Animates emote reactions on the screen:
- Shows reactions with visual effects
- Auto-dismisses after a few seconds
- Supports multiple simultaneous reactions

### `ReactionsBar.tsx`

Provides a palette of emote reactions:
- Quick access to common emotes (fire, flex, clap, etc.)
- Targeted reactions (send to specific users or sets)
- Haptic feedback on send

### `PresenceIndicator.tsx`

Shows friends' workout presence:
- Visual indicator of who's working out
- Exercise and status information
- Quick reaction buttons

## Usage Examples

### Creating a Session

```typescript
import { createLiveSession } from '@/src/lib/liveWorkoutTogether';

const result = await createLiveSession({
  mode: 'shared',
  name: 'Saturday Pump',
  theme: 'toxic',
  participantIds: ['user1', 'user2', 'user3'],
});

if (result.success) {
  console.log('Session created:', result.data);
  // Navigate to session or show invitation options
}
```

### Joining a Session

```typescript
import { joinLiveSession } from '@/src/lib/liveWorkoutTogether';

const user = getUser();
const result = await joinLiveSession({
  sessionId: 'session123',
  userId: user.id,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
});

if (result.success) {
  console.log('Joined session as:', result.data);
  // Initialize real-time subscriptions
}
```

### Handling Events

```typescript
import { subscribeToLiveSession } from '@/src/lib/liveWorkoutTogether';

const unsubscribe = subscribeToLiveSession('session123', (event) => {
  console.log('Received event:', event);

  switch (event.type) {
    case 'set_completed':
      // Show celebration animation
      const setEvent = event as LiveSetCompletedEvent;
      showCelebration(setEvent.userId, setEvent.data.exerciseName);
      break;
    case 'reaction':
      // Show emote reaction
      const reactionEvent = event as LiveReactionEvent;
      showReaction(reactionEvent.userId, reactionEvent.data.emote);
      break;
    case 'message':
      // Add to chat
      const messageEvent = event as LiveMessageEvent;
      addToChat(messageEvent.userId, messageEvent.data.message);
      break;
  }
});

// Later...
unsubscribe();
```

### Sending Reactions

```typescript
import { sendReaction } from '@/src/lib/liveWorkoutTogether';

const result = await sendReaction({
  sessionId: 'session123',
  userId: 'user1',
  targetUserId: 'user2',
  emote: 'fire',
  targetSetId: 'set123',
});

if (result.success) {
  // Show local reaction immediately (optimistic UI)
  showLocalReaction('fire');
}
```

### Completing a Set

```typescript
import { completeLiveSet, calculateE1RM } from '@/src/lib/liveWorkoutTogether';

const set = {
  id: 'set123',
  exerciseId: 'bench',
  setType: 'working',
  weightKg: 100,
  reps: 5,
  timestampMs: Date.now(),
};

const e1rm = calculateE1RM(100, 5);
const isPR = checkIfPR(set); // Your PR detection logic

const result = await completeLiveSet({
  sessionId: 'session123',
  userId: 'user1',
  set,
  exerciseName: 'Bench Press',
  e1rmKg: e1rm,
  isPR,
});

if (result.success) {
  // Update local UI
  updateLocalSet(set);
}
```

## Integration Points

### With Current Session Store

The live workout service integrates with the existing `currentSessionStore`:
- Local sets are logged to both the live session and local store
- PR detection works the same way as solo workouts
- Session history is preserved

### With Social Features

- Reactions use the existing emote system
- Chat messages integrate with the social feed
- Presence updates show in the friends list

### With Gamification

- Live session participation earns XP
- Completing sets in live sessions counts toward challenges
- Special achievements for live workout milestones

## Security Considerations

1. **Authentication**: All operations require authenticated users
2. **Authorization**: Only hosts can start/end sessions and change exercises
3. **Data Validation**: All inputs are validated before processing
4. **Rate Limiting**: Prevent spam through rate limiting
5. **Privacy**: Users control who can see their presence and join their sessions

## Performance Considerations

1. **Real-time Updates**: Use Supabase's presence and broadcast features
2. **Debouncing**: Debounce rapid status updates
3. **Pagination**: Limit history queries with pagination
4. **Caching**: Cache participant lists and session data
5. **Optimistic UI**: Update UI optimistically for better responsiveness

## Future Enhancements

1. **Performance Metrics**: Track and display real-time performance metrics
2. **Leaderboards**: Show live leaderboards during sessions
3. **Voice Chat**: Add voice chat capabilities
4. **Video Feed**: Optional video streaming for form checks
5. **Session Templates**: Pre-defined workout templates
6. **Achievements**: Unlock achievements during live sessions
7. **Session Replay**: Watch replays of past sessions
8. **Spectator Mode**: Allow friends to watch without participating
9. **Session Analytics**: Detailed post-session analytics
10. **Workout Challenges**: Competitive challenges during sessions

## Files Reference

### Core Implementation
- `src/lib/liveWorkoutTogether/service.ts` - Service layer
- `src/lib/liveWorkoutTogether/types.ts` - Type definitions
- `src/lib/stores/liveWorkoutStore.ts` - Zustand store

### UI Components
- `src/ui/components/LiveWorkoutTogether/LiveWorkoutTogether.tsx` - Main component
- `src/ui/components/LiveWorkoutTogether/LiveReactionAnimation.tsx` - Reaction animations
- `src/ui/components/LiveWorkoutTogether/ReactionsBar.tsx` - Reaction palette
- `src/ui/components/LiveWorkoutTogether/PresenceIndicator.tsx` - Presence indicator

### Documentation
- `docs/features/live-workout-together/LIVE_WORKOUT_TOGETHER_COMPREHENSIVE.md` - This file
- `docs/features/feature-live-together.md` - Feature overview
- `LIVE_WORKOUT_TOGETHER_TYPES.md` - Type definitions summary
- `TYPE_DEFINITION_SUMMARY.md` - Type implementation details

## Conclusion

The Live Workout Together feature transforms Forgerank from a solo workout tracker into a social fitness platform. By enabling real-time collaboration, shared experiences, and social motivation, it addresses the key challenge of workout adherence and makes fitness more engaging and enjoyable.

The implementation follows modern React Native patterns with Zustand for state management and Supabase for real-time capabilities, ensuring a responsive and scalable solution that integrates seamlessly with the existing Forgerank ecosystem.
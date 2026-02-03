# Live Workout Together Service

The Live Workout Together service provides real-time session management and presence tracking for collaborative workout experiences in GymRats.

## Overview

This feature enables users to:
- Create and join live workout sessions
- Work out together in real-time with friends
- See each other's progress and celebrate achievements
- Send reactions and chat messages
- Track presence and activity status

## Architecture

The service is built on top of Supabase's real-time capabilities and follows a event-driven architecture:

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
│   Events:                                                                     │
│   - set_completed     (user completes a set)                                │
│   - exercise_changed  (leader changes exercise in guided mode)              │
│   - reaction          (user sends emote reaction)                           │
│   - status_update     (participant status changes)                          │
│   - ready_status_changed (user ready for next exercise)                     │
│   - message           (chat messages)                                       │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Session Modes

### Shared Mode
- Everyone works out independently
- Participants can choose their own exercises
- See each other's progress in real-time
- Send reactions and encouragement

### Guided Mode
- One leader sets the workout structure
- All participants follow the same exercises
- Leader controls exercise progression
- Participants mark themselves "ready" for next exercise

## Key Components

### 1. Session Management (`service.ts`)

Core session operations:
- `createLiveSession()` - Create a new session
- `startLiveSession()` - Start a pending session
- `endLiveSession()` - End an active session
- `joinLiveSession()` - Join an existing session
- `leaveLiveSession()` - Leave a session

### 2. Event Handling

Real-time event operations:
- `completeLiveSet()` - Log a completed set
- `changeExercise()` - Change current exercise (leader only)
- `sendReaction()` - Send an emote reaction
- `updateParticipantStatus()` - Update participant status
- `updateReadyStatus()` - Mark ready/unready for next exercise
- `sendLiveMessage()` - Send a chat message

### 3. Real-time Subscriptions

- `subscribeToLiveSession()` - Subscribe to session events
- `subscribeToFriendsPresence()` - Subscribe to friends' workout presence

### 4. Query Operations

- `getActiveLiveSessions()` - Get all active sessions
- `getLiveSession()` - Get session details
- `getSessionParticipants()` - Get participant list
- `getSessionSummary()` - Get session summary statistics

### 5. Utility Functions

- `getExerciseName()` - Get exercise name from ID
- `calculateE1RM()` - Calculate estimated 1-rep max
- `generateSessionInvitation()` - Create a session invitation
- `sendQuickReaction()` - Send quick reaction to a friend

## Database Schema

### `live_sessions` Table

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

### Participant State

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

## Event Types

### `LiveSetCompletedEvent`
```typescript
{
  type: 'set_completed';
  sessionId: string;
  userId: string;
  timestamp: number;
  data: {
    set: LoggedSet;
    exerciseName: string;
    e1rmKg?: number;
    isPR?: boolean;
  };
}
```

### `LiveExerciseChangedEvent`
```typescript
{
  type: 'exercise_changed';
  sessionId: string;
  userId: string;
  timestamp: number;
  data: {
    exerciseId: string;
    exerciseName: string;
    targetSets?: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
  };
}
```

### `LiveReactionEvent`
```typescript
{
  type: 'reaction';
  sessionId: string;
  userId: string;
  timestamp: number;
  data: {
    targetUserId: string;
    emote: EmoteId;
    targetSetId?: string;
  };
}
```

### `LiveStatusUpdateEvent`
```typescript
{
  type: 'status_update';
  sessionId: string;
  userId: string;
  timestamp: number;
  data: {
    status: ParticipantStatus;
    currentExerciseId?: string;
  };
}
```

### `LiveReadyStatusEvent`
```typescript
{
  type: 'ready_status_changed';
  sessionId: string;
  userId: string;
  timestamp: number;
  data: {
    isReady: boolean;
  };
}
```

### `LiveMessageEvent`
```typescript
{
  type: 'message';
  sessionId: string;
  userId: string;
  timestamp: number;
  data: {
    message: string;
  };
}
```

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
}
```

### Subscribing to Events

```typescript
import { subscribeToLiveSession } from '@/src/lib/liveWorkoutTogether';

const unsubscribe = subscribeToLiveSession('session123', (event) => {
  console.log('Received event:', event);

  switch (event.type) {
    case 'set_completed':
      // Show celebration animation
      break;
    case 'reaction':
      // Show emote reaction
      break;
    case 'message':
      // Add to chat
      break;
  }
});

// Later...
unsubscribe();
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
```

### Sending a Reaction

```typescript
import { sendReaction } from '@/src/lib/liveWorkoutTogether';

const result = await sendReaction({
  sessionId: 'session123',
  userId: 'user1',
  targetUserId: 'user2',
  emote: 'fire',
  targetSetId: 'set123',
});
```

## Error Handling

All functions return a consistent response format:

```typescript
{
  success: boolean;
  data?: T;      // Return data on success
  error?: string; // Error message on failure
}
```

Common error cases:
- `User not authenticated` - User not signed in
- `Session not found` - Session doesn't exist
- `Only the host can start the session` - Permission denied
- `Only the leader can change exercises` - Not in guided mode or not leader

## Testing

Run the service tests:

```bash
npm test -- src/lib/liveWorkoutTogether/__tests__/service.test.ts --no-coverage
```

## Future Enhancements

1. **Performance Metrics**: Track and display real-time performance metrics
2. **Leaderboards**: Show live leaderboards during sessions
3. **Voice Chat**: Add voice chat capabilities
4. **Video Feed**: Optional video streaming for form checks
5. **Session Templates**: Pre-defined workout templates
6. **Achievements**: Unlock achievements during live sessions
7. **Session Replay**: Watch replays of past sessions
8. **Spectator Mode**: Allow friends to watch without participating

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

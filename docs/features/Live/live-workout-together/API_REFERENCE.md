# Live Workout Together - API Reference

## Table of Contents

1. [Overview](#overview)
2. [Session Management API](#session-management-api)
3. [Event Handling API](#event-handling-api)
4. [Query Operations API](#query-operations-api)
5. [Utility Functions API](#utility-functions-api)
6. [Real-time Subscriptions API](#real-time-subscriptions-api)
7. [Type Definitions](#type-definitions)
8. [Error Handling](#error-handling)

## Overview

This document provides comprehensive API reference for the Live Workout Together feature in Forgerank. All functions are available from the service layer:

```typescript
import {
  // Session Management
  createLiveSession,
  startLiveSession,
  endLiveSession,
  joinLiveSession,
  leaveLiveSession,

  // Event Handling
  completeLiveSet,
  changeExercise,
  sendReaction,
  updateParticipantStatus,
  updateReadyStatus,
  sendLiveMessage,

  // Query Operations
  getActiveLiveSessions,
  getLiveSession,
  getSessionParticipants,
  getSessionSummary,

  // Utility Functions
  getExerciseName,
  calculateE1RM,
  generateSessionInvitation,
  sendQuickReaction,

  // Real-time Subscriptions
  subscribeToLiveSession,
  subscribeToFriendsPresence,
} from '@/src/lib/liveWorkoutTogether';
```

## Session Management API

### `createLiveSession(params)`

Create a new live workout session.

**Signature:**
```typescript
function createLiveSession(
  params: CreateLiveSessionParams
): Promise<{ success: boolean; data?: LiveSession; error?: string }>
```

**Parameters:**
```typescript
interface CreateLiveSessionParams {
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

**Returns:**
```typescript
{
  success: boolean;      // Whether the operation succeeded
  data?: LiveSession;    // Created session data (on success)
  error?: string;        // Error message (on failure)
}
```

**Example:**
```typescript
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

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `invalid_input` - Invalid parameters
- `database_error` - Database operation failed

### `startLiveSession(sessionId)`

Start a pending session (transition to active state).

**Signature:**
```typescript
function startLiveSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }>
```

**Parameters:**
- `sessionId` (string): ID of the session to start

**Returns:**
```typescript
{
  success: boolean;  // Whether the operation succeeded
  error?: string;    // Error message (on failure)
}
```

**Example:**
```typescript
const result = await startLiveSession('session123');
if (result.success) {
  console.log('Session started successfully');
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `permission_denied` - Only the host can start the session
- `invalid_session_status` - Session is not in pending state

### `endLiveSession(sessionId)`

End an active session.

**Signature:**
```typescript
function endLiveSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }>
```

**Parameters:**
- `sessionId` (string): ID of the session to end

**Returns:**
```typescript
{
  success: boolean;  // Whether the operation succeeded
  error?: string;    // Error message (on failure)
}
```

**Example:**
```typescript
const result = await endLiveSession('session123');
if (result.success) {
  console.log('Session ended successfully');
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `permission_denied` - Only the host can end the session
- `invalid_session_status` - Session is not active

### `joinLiveSession(params)`

Join an existing session.

**Signature:**
```typescript
function joinLiveSession(
  params: JoinLiveSessionParams
): Promise<{ success: boolean; data?: LiveSessionParticipant; error?: string }>
```

**Parameters:**
```typescript
interface JoinLiveSessionParams {
  sessionId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
}
```

**Returns:**
```typescript
{
  success: boolean;              // Whether the operation succeeded
  data?: LiveSessionParticipant;  // Participant data (on success)
  error?: string;                // Error message (on failure)
}
```

**Example:**
```typescript
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

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `session_not_active` - Session is not active or pending
- `invalid_participant` - Invalid participant data

### `leaveLiveSession(sessionId, userId)`

Leave a session.

**Signature:**
```typescript
function leaveLiveSession(
  sessionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }>
```

**Parameters:**
- `sessionId` (string): ID of the session to leave
- `userId` (string): ID of the user leaving

**Returns:**
```typescript
{
  success: boolean;  // Whether the operation succeeded
  error?: string;    // Error message (on failure)
}
```

**Example:**
```typescript
const result = await leaveLiveSession('session123', 'user1');
if (result.success) {
  console.log('Left session successfully');
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `invalid_participant` - User is not a participant

## Event Handling API

### `completeLiveSet(params)`

Log a completed set in a live session.

**Signature:**
```typescript
function completeLiveSet(
  params: CompleteLiveSetParams
): Promise<{ success: boolean; data?: LiveSetCompletedEvent; error?: string }>
```

**Parameters:**
```typescript
interface CompleteLiveSetParams {
  sessionId: string;
  userId: string;
  set: LoggedSet;
  exerciseName: string;
  e1rmKg?: number;
  isPR?: boolean;
}
```

**Returns:**
```typescript
{
  success: boolean;                  // Whether the operation succeeded
  data?: LiveSetCompletedEvent;      // Event data (on success)
  error?: string;                    // Error message (on failure)
}
```

**Example:**
```typescript
const set = {
  id: 'set123',
  exerciseId: 'bench',
  setType: 'working',
  weightKg: 100,
  reps: 5,
  timestampMs: Date.now(),
};

const e1rm = calculateE1RM(100, 5);
const isPR = checkIfPR(set);

const result = await completeLiveSet({
  sessionId: 'session123',
  userId: 'user1',
  set,
  exerciseName: 'Bench Press',
  e1rmKg: e1rm,
  isPR,
});

if (result.success) {
  console.log('Set completed:', result.data);
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `session_not_active` - Session is not active
- `invalid_input` - Invalid set data

### `changeExercise(params)`

Change current exercise (leader only in guided mode).

**Signature:**
```typescript
function changeExercise(
  params: ChangeExerciseParams
): Promise<{ success: boolean; data?: LiveExerciseChangedEvent; error?: string }>
```

**Parameters:**
```typescript
interface ChangeExerciseParams {
  sessionId: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
}
```

**Returns:**
```typescript
{
  success: boolean;                  // Whether the operation succeeded
  data?: LiveExerciseChangedEvent;   // Event data (on success)
  error?: string;                    // Error message (on failure)
}
```

**Example:**
```typescript
const result = await changeExercise({
  sessionId: 'session123',
  userId: 'user1',
  exerciseId: 'squat',
  exerciseName: 'Squat',
  targetSets: 4,
  targetRepsMin: 6,
  targetRepsMax: 8,
});

if (result.success) {
  console.log('Exercise changed:', result.data);
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `session_not_active` - Session is not active
- `permission_denied` - Only the leader can change exercises
- `invalid_session_mode` - Not in guided mode

### `sendReaction(params)`

Send an emote reaction.

**Signature:**
```typescript
function sendReaction(
  params: SendReactionParams
): Promise<{ success: boolean; data?: LiveReactionEvent; error?: string }>
```

**Parameters:**
```typescript
interface SendReactionParams {
  sessionId: string;
  userId: string;
  targetUserId: string;
  emote: EmoteId;
  targetSetId?: string;
}
```

**Returns:**
```typescript
{
  success: boolean;              // Whether the operation succeeded
  data?: LiveReactionEvent;      // Event data (on success)
  error?: string;                // Error message (on failure)
}
```

**Example:**
```typescript
const result = await sendReaction({
  sessionId: 'session123',
  userId: 'user1',
  targetUserId: 'user2',
  emote: 'fire',
  targetSetId: 'set123',
});

if (result.success) {
  console.log('Reaction sent:', result.data);
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `session_not_active` - Session is not active
- `invalid_input` - Invalid reaction data

### `updateParticipantStatus(params)`

Update participant status.

**Signature:**
```typescript
function updateParticipantStatus(
  params: UpdateParticipantStatusParams
): Promise<{ success: boolean; data?: LiveStatusUpdateEvent; error?: string }>
```

**Parameters:**
```typescript
interface UpdateParticipantStatusParams {
  sessionId: string;
  userId: string;
  status: ParticipantStatus;
  currentExerciseId?: string;
}
```

**Returns:**
```typescript
{
  success: boolean;                  // Whether the operation succeeded
  data?: LiveStatusUpdateEvent;      // Event data (on success)
  error?: string;                    // Error message (on failure)
}
```

**Example:**
```typescript
const result = await updateParticipantStatus({
  sessionId: 'session123',
  userId: 'user1',
  status: 'working_out',
  currentExerciseId: 'bench',
});

if (result.success) {
  console.log('Status updated:', result.data);
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `session_not_active` - Session is not active
- `invalid_input` - Invalid status

### `updateReadyStatus(params)`

Update ready status (for guided mode).

**Signature:**
```typescript
function updateReadyStatus(
  params: UpdateReadyStatusParams
): Promise<{ success: boolean; data?: LiveReadyStatusEvent; error?: string }>
```

**Parameters:**
```typescript
interface UpdateReadyStatusParams {
  sessionId: string;
  userId: string;
  isReady: boolean;
}
```

**Returns:**
```typescript
{
  success: boolean;                  // Whether the operation succeeded
  data?: LiveReadyStatusEvent;       // Event data (on success)
  error?: string;                    // Error message (on failure)
}
```

**Example:**
```typescript
const result = await updateReadyStatus({
  sessionId: 'session123',
  userId: 'user1',
  isReady: true,
});

if (result.success) {
  console.log('Ready status updated:', result.data);
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `session_not_active` - Session is not active
- `invalid_session_mode` - Not in guided mode

### `sendLiveMessage(sessionId, userId, message)`

Send a chat message.

**Signature:**
```typescript
function sendLiveMessage(
  sessionId: string,
  userId: string,
  message: string
): Promise<{ success: boolean; data?: LiveMessageEvent; error?: string }>
```

**Parameters:**
- `sessionId` (string): ID of the session
- `userId` (string): ID of the user sending the message
- `message` (string): Message content

**Returns:**
```typescript
{
  success: boolean;              // Whether the operation succeeded
  data?: LiveMessageEvent;       // Event data (on success)
  error?: string;                // Error message (on failure)
}
```

**Example:**
```typescript
const result = await sendLiveMessage('session123', 'user1', 'Great job everyone!');

if (result.success) {
  console.log('Message sent:', result.data);
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `session_not_active` - Session is not active
- `invalid_input` - Invalid message
- `rate_limited` - Message rate limit exceeded

## Query Operations API

### `getActiveLiveSessions()`

Get all active sessions.

**Signature:**
```typescript
function getActiveLiveSessions(): Promise<{
  success: boolean;
  data?: LiveSession[];
  error?: string;
}>
```

**Returns:**
```typescript
{
  success: boolean;          // Whether the operation succeeded
  data?: LiveSession[];      // Array of active sessions (on success)
  error?: string;            // Error message (on failure)
}
```

**Example:**
```typescript
const result = await getActiveLiveSessions();
if (result.success) {
  console.log('Active sessions:', result.data);
}
```

**Error Codes:**
- `database_error` - Database operation failed

### `getLiveSession(sessionId)`

Get session details.

**Signature:**
```typescript
function getLiveSession(
  sessionId: string
): Promise<{ success: boolean; data?: LiveSession; error?: string }>
```

**Parameters:**
- `sessionId` (string): ID of the session to retrieve

**Returns:**
```typescript
{
  success: boolean;      // Whether the operation succeeded
  data?: LiveSession;    // Session data (on success)
  error?: string;        // Error message (on failure)
}
```

**Example:**
```typescript
const result = await getLiveSession('session123');
if (result.success) {
  console.log('Session details:', result.data);
}
```

**Error Codes:**
- `session_not_found` - Session doesn't exist
- `database_error` - Database operation failed

### `getSessionParticipants(sessionId)`

Get participant list.

**Signature:**
```typescript
function getSessionParticipants(
  sessionId: string
): Promise<{ success: boolean; data?: LiveSessionParticipant[]; error?: string }>
```

**Parameters:**
- `sessionId` (string): ID of the session

**Returns:**
```typescript
{
  success: boolean;                  // Whether the operation succeeded
  data?: LiveSessionParticipant[];   // Array of participants (on success)
  error?: string;                    // Error message (on failure)
}
```

**Example:**
```typescript
const result = await getSessionParticipants('session123');
if (result.success) {
  console.log('Participants:', result.data);
}
```

**Error Codes:**
- `session_not_found` - Session doesn't exist
- `database_error` - Database operation failed

### `getSessionSummary(sessionId)`

Get session summary statistics.

**Signature:**
```typescript
function getSessionSummary(
  sessionId: string
): Promise<{ success: boolean; data?: LiveSessionSummary; error?: string }>
```

**Parameters:**
- `sessionId` (string): ID of the session

**Returns:**
```typescript
{
  success: boolean;              // Whether the operation succeeded
  data?: LiveSessionSummary;     // Session summary (on success)
  error?: string;                // Error message (on failure)
}
```

**Example:**
```typescript
const result = await getSessionSummary('session123');
if (result.success) {
  console.log('Session summary:', result.data);
}
```

**Error Codes:**
- `session_not_found` - Session doesn't exist
- `database_error` - Database operation failed

## Utility Functions API

### `getExerciseName(exerciseId)`

Get exercise name from ID.

**Signature:**
```typescript
function getExerciseName(exerciseId: string): string
```

**Parameters:**
- `exerciseId` (string): Exercise ID (e.g., 'bench', 'squat')

**Returns:**
- `string`: Exercise name

**Example:**
```typescript
const name = getExerciseName('bench');
console.log('Exercise name:', name); // 'Bench Press'
```

### `calculateE1RM(weightKg, reps)`

Calculate estimated 1-rep max using Epley formula.

**Signature:**
```typescript
function calculateE1RM(weightKg: number, reps: number): number
```

**Parameters:**
- `weightKg` (number): Weight in kilograms
- `reps` (number): Number of repetitions

**Returns:**
- `number`: Estimated 1-rep max in kilograms

**Example:**
```typescript
const e1rm = calculateE1RM(100, 5);
console.log('Estimated 1RM:', e1rm); // 116.67 kg
```

### `generateSessionInvitation(sessionId, targetUserId)`

Generate a session invitation.

**Signature:**
```typescript
function generateSessionInvitation(
  sessionId: string,
  targetUserId: string
): Promise<{ success: boolean; data?: LiveSessionInvitation; error?: string }>
```

**Parameters:**
- `sessionId` (string): ID of the session
- `targetUserId` (string): ID of the user to invite

**Returns:**
```typescript
{
  success: boolean;                  // Whether the operation succeeded
  data?: LiveSessionInvitation;      // Invitation data (on success)
  error?: string;                    // Error message (on failure)
}
```

**Example:**
```typescript
const result = await generateSessionInvitation('session123', 'user2');
if (result.success) {
  console.log('Invitation generated:', result.data);
  // Send notification to user
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `session_not_found` - Session doesn't exist
- `invalid_participant` - Invalid target user

### `sendQuickReaction(params)`

Send a quick reaction to a friend's workout.

**Signature:**
```typescript
function sendQuickReaction(
  params: {
    fromUserId: string;
    toUserId: string;
    emote: string;
    setId?: string;
  }
): Promise<{ success: boolean; error?: string }>
```

**Parameters:**
```typescript
{
  fromUserId: string;   // ID of the user sending the reaction
  toUserId: string;     // ID of the user receiving the reaction
  emote: string;        // Emote ID (e.g., 'fire', 'flex', 'clap')
  setId?: string;       // Optional set ID to associate with
}
```

**Returns:**
```typescript
{
  success: boolean;  // Whether the operation succeeded
  error?: string;    // Error message (on failure)
}
```

**Example:**
```typescript
const result = await sendQuickReaction({
  fromUserId: 'user1',
  toUserId: 'user2',
  emote: 'fire',
  setId: 'set123',
});

if (result.success) {
  console.log('Quick reaction sent');
}
```

**Error Codes:**
- `user_not_authenticated` - User not signed in
- `invalid_input` - Invalid reaction data

## Real-time Subscriptions API

### `subscribeToLiveSession(sessionId, callback)`

Subscribe to session events.

**Signature:**
```typescript
function subscribeToLiveSession(
  sessionId: string,
  callback: (event: LiveSessionEvent) => void
): () => void
```

**Parameters:**
- `sessionId` (string): ID of the session to subscribe to
- `callback` (function): Function to call when events are received

**Returns:**
- `() => void`: Function to unsubscribe

**Example:**
```typescript
const unsubscribe = subscribeToLiveSession('session123', (event) => {
  console.log('Received event:', event);

  switch (event.type) {
    case 'set_completed':
      // Handle set completion
      break;
    case 'reaction':
      // Handle reaction
      break;
    // ... other event types
  }
});

// Later, when leaving the session...
unsubscribe();
```

**Event Types:**
- `set_completed` - A participant completed a set
- `exercise_changed` - The exercise changed (guided mode)
- `reaction` - A reaction was sent
- `status_update` - A participant's status changed
- `ready_status_changed` - A participant's ready status changed
- `message` - A chat message was sent

### `subscribeToFriendsPresence(userId, callback)`

Subscribe to friends' workout presence.

**Signature:**
```typescript
function subscribeToFriendsPresence(
  userId: string,
  callback: (presence: WorkoutPresence[]) => void
): () => void
```

**Parameters:**
- `userId` (string): ID of the user
- `callback` (function): Function to call when presence updates are received

**Returns:**
- `() => void`: Function to unsubscribe

**Example:**
```typescript
const unsubscribe = subscribeToFriendsPresence('user1', (presence) => {
  console.log('Friends presence updated:', presence);
  // Update UI to show which friends are working out
});

// Later, when no longer needed...
unsubscribe();
```

## Type Definitions

### Core Types

```typescript
// Session modes
type LiveSessionMode = 'shared' | 'guided';

// Session status
type LiveSessionStatus = 'pending' | 'active' | 'ended';

// Participant status
type ParticipantStatus = 'idle' | 'resting' | 'working_out' | 'finished';

// Event types
type LiveSessionEventType =
  | 'set_completed'
  | 'exercise_changed'
  | 'reaction'
  | 'status_update'
  | 'ready_status_changed'
  | 'message';
```

### Key Interfaces

```typescript
// Live session
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

// Session participant
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

// Base event
interface LiveSessionEventBase {
  sessionId: string;
  userId: string;
  type: LiveSessionEventType;
  timestamp: number;
}

// Set completed event
interface LiveSetCompletedEvent extends LiveSessionEventBase {
  type: 'set_completed';
  data: {
    set: LoggedSet;
    exerciseName: string;
    e1rmKg?: number;
    isPR?: boolean;
  };
}

// Exercise changed event
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

// Reaction event
interface LiveReactionEvent extends LiveSessionEventBase {
  type: 'reaction';
  data: {
    targetUserId: string;
    emote: EmoteId;
    targetSetId?: string;
  };
}
```

## Error Handling

### Error Response Format

All API functions return a consistent error format:

```typescript
{
  success: false,
  error: string,  // Human-readable error message
}
```

### Error Codes

The following error codes are used throughout the API:

| Code | Description |
|------|-------------|
| `user_not_authenticated` | User not signed in |
| `session_not_found` | Session doesn't exist |
| `session_not_active` | Session is not active or pending |
| `permission_denied` | User doesn't have permission for this operation |
| `invalid_session_mode` | Operation not valid for current session mode |
| `invalid_participant` | Invalid participant data or user not in session |
| `database_error` | Database operation failed |
| `network_error` | Network operation failed |
| `invalid_input` | Invalid parameters provided |
| `rate_limited` | Operation rate limit exceeded |
| `unknown_error` | Unexpected error occurred |

### Error Handling Best Practices

1. **Check `success` flag**: Always check if the operation succeeded
2. **Handle specific errors**: Use error codes to provide appropriate feedback
3. **Graceful degradation**: Provide fallback behavior when possible
4. **User feedback**: Show appropriate messages to users
5. **Logging**: Log errors for debugging and monitoring

**Example:**
```typescript
const result = await createLiveSession(params);

if (!result.success) {
  switch (result.error) {
    case 'user_not_authenticated':
      // Redirect to login
      break;
    case 'invalid_input':
      // Show validation errors
      break;
    default:
      // Show generic error message
      break;
  }

  // Log the error
  console.error('Failed to create session:', result.error);

  return;
}

// Continue with successful flow
```

## Conclusion

This API reference provides comprehensive documentation for all functions available in the Live Workout Together service layer. The API follows consistent patterns for parameters, returns, and error handling, making it easy to integrate with React components and other parts of the Forgerank application.

For implementation details and usage examples, refer to the main documentation file: `LIVE_WORKOUT_TOGETHER_COMPREHENSIVE.md`.
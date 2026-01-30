# Live Workout Together - Usage Examples

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Session Management](#session-management)
   - [Creating a Shared Session](#creating-a-shared-session)
   - [Creating a Guided Session](#creating-a-guided-session)
   - [Joining a Session](#joining-a-session)
   - [Leaving a Session](#leaving-a-session)
3. [Event Handling](#event-handling)
   - [Subscribing to Events](#subscribing-to-events)
   - [Handling Different Event Types](#handling-different-event-types)
   - [Completing Sets](#completing-sets)
   - [Changing Exercises](#changing-exercises)
4. [Reactions and Communication](#reactions-and-communication)
   - [Sending Reactions](#sending-reactions)
   - [Sending Messages](#sending-messages)
   - [Quick Reactions](#quick-reactions)
5. [Presence Tracking](#presence-tracking)
   - [Subscribing to Friends' Presence](#subscribing-to-friends-presence)
   - [Sending Quick Reactions to Friends](#sending-quick-reactions-to-friends)
6. [Advanced Usage](#advanced-usage)
   - [Session Invitations](#session-invitations)
   - [Session Summaries](#session-summaries)
   - [Error Handling](#error-handling)
   - [Optimistic UI Updates](#optimistic-ui-updates)
7. [React Component Integration](#react-component-integration)
   - [Using in a React Component](#using-in-a-react-component)
   - [Managing Subscriptions](#managing-subscriptions)
   - [Cleanup on Unmount](#cleanup-on-unmount)

## Basic Usage

First, import the necessary functions from the service layer:

```typescript
import {
  // Session management
  createLiveSession,
  joinLiveSession,
  leaveLiveSession,

  // Event handling
  completeLiveSet,
  sendReaction,

  // Query operations
  getActiveLiveSessions,
  getLiveSession,

  // Utility functions
  calculateE1RM,
  getExerciseName,

  // Real-time subscriptions
  subscribeToLiveSession,
  subscribeToFriendsPresence,
} from '@/src/lib/liveWorkoutTogether';
```

## Session Management

### Creating a Shared Session

Shared sessions allow participants to work out independently while seeing each other's progress.

```typescript
async function createSharedSession() {
  const user = getUser();

  const result = await createLiveSession({
    mode: 'shared',
    name: 'Saturday Pump Session',
    theme: 'toxic',
    participantIds: [user.id], // Start with just the host
  });

  if (!result.success) {
    console.error('Failed to create session:', result.error);
    return null;
  }

  console.log('Session created:', result.data);
  return result.data;
}

// Usage
const session = await createSharedSession();
if (session) {
  // Navigate to session or show invitation options
}
```

### Creating a Guided Session

Guided sessions have a leader who controls the workout structure.

```typescript
async function createGuidedSession() {
  const user = getUser();

  const result = await createLiveSession({
    mode: 'guided',
    name: 'Leg Day with Coach',
    theme: 'electric',
    participantIds: [user.id],
    plannedExercises: [
      {
        exerciseId: 'squat',
        targetSets: 4,
        targetRepsMin: 6,
        targetRepsMax: 8,
      },
      {
        exerciseId: 'rdl',
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 10,
      },
      {
        exerciseId: 'leg_press',
        targetSets: 3,
        targetRepsMin: 10,
        targetRepsMax: 12,
      },
    ],
  });

  if (!result.success) {
    console.error('Failed to create guided session:', result.error);
    return null;
  }

  console.log('Guided session created:', result.data);
  return result.data;
}

// Usage
const guidedSession = await createGuidedSession();
```

### Joining a Session

```typescript
async function joinSession(sessionId: string) {
  const user = getUser();

  const result = await joinLiveSession({
    sessionId: sessionId,
    userId: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  });

  if (!result.success) {
    console.error('Failed to join session:', result.error);
    return null;
  }

  console.log('Joined session as:', result.data);
  return result.data;
}

// Usage
const participant = await joinSession('session123');
if (participant) {
  // Initialize real-time subscriptions
  const unsubscribe = subscribeToLiveSession('session123', handleEvent);

  // Store unsubscribe function for cleanup
  currentUnsubscribe = unsubscribe;
}
```

### Leaving a Session

```typescript
async function leaveSession(sessionId: string) {
  const user = getUser();

  // First, unsubscribe from real-time events
  if (currentUnsubscribe) {
    currentUnsubscribe();
    currentUnsubscribe = null;
  }

  // Then leave the session
  const result = await leaveLiveSession(sessionId, user.id);

  if (!result.success) {
    console.error('Failed to leave session:', result.error);
    return false;
  }

  console.log('Left session successfully');
  return true;
}

// Usage
await leaveSession('session123');
```

## Event Handling

### Subscribing to Events

```typescript
let currentUnsubscribe: (() => void) | null = null;

function handleEvent(event: LiveSessionEvent) {
  console.log('Received event:', event.type, 'from', event.userId);

  switch (event.type) {
    case 'set_completed':
      handleSetCompleted(event as LiveSetCompletedEvent);
      break;
    case 'reaction':
      handleReaction(event as LiveReactionEvent);
      break;
    case 'message':
      handleMessage(event as LiveMessageEvent);
      break;
    // ... other event types
  }
}

// Subscribe to session events
currentUnsubscribe = subscribeToLiveSession('session123', handleEvent);

// Later, when leaving...
if (currentUnsubscribe) {
  currentUnsubscribe();
  currentUnsubscribe = null;
}
```

### Handling Different Event Types

```typescript
function handleSetCompleted(event: LiveSetCompletedEvent) {
  const { userId, data } = event;
  const { set, exerciseName, e1rmKg, isPR } = data;

  console.log(`${userId} completed ${exerciseName}: ${set.weightKg}kg x ${set.reps}`);

  if (isPR) {
    showPRCelebration(userId, exerciseName, e1rmKg);
  } else {
    showSetCompletion(userId, exerciseName);
  }
}

function handleReaction(event: LiveReactionEvent) {
  const { userId, data } = event;
  const { targetUserId, emote, targetSetId } = data;

  console.log(`${userId} sent ${emote} to ${targetUserId}`);

  showReactionAnimation(userId, emote, targetSetId);
}

function handleMessage(event: LiveMessageEvent) {
  const { userId, data } = event;
  const { message } = data;

  console.log(`${userId}: ${message}`);

  addToChat(userId, message);
}
```

### Completing Sets

```typescript
async function completeSet(sessionId: string, exerciseId: string, weightKg: number, reps: number) {
  const user = getUser();

  // Create the set
  const set: LoggedSet = {
    id: uid(),
    exerciseId,
    setType: 'working',
    weightKg,
    reps,
    timestampMs: Date.now(),
  };

  // Calculate e1RM
  const e1rm = calculateE1RM(weightKg, reps);

  // Check if it's a PR (you would implement this based on user's history)
  const isPR = checkIfPR(user.id, exerciseId, weightKg, reps);

  // Get exercise name
  const exerciseName = getExerciseName(exerciseId);

  // Complete the set in the live session
  const result = await completeLiveSet({
    sessionId,
    userId: user.id,
    set,
    exerciseName,
    e1rmKg: e1rm,
    isPR,
  });

  if (!result.success) {
    console.error('Failed to complete set:', result.error);
    return false;
  }

  // Also log to local session (for history)
  logToLocalSession(set);

  console.log('Set completed successfully');
  return true;
}

// Usage
await completeSet('session123', 'bench', 100, 5);
```

### Changing Exercises

```typescript
async function changeExercise(sessionId: string, exerciseId: string) {
  const user = getUser();

  // Get exercise details
  const exerciseName = getExerciseName(exerciseId);

  // Change exercise (only works if user is leader in guided mode)
  const result = await changeExercise({
    sessionId,
    userId: user.id,
    exerciseId,
    exerciseName,
    targetSets: 4,
    targetRepsMin: 6,
    targetRepsMax: 8,
  });

  if (!result.success) {
    console.error('Failed to change exercise:', result.error);

    if (result.error === 'permission_denied') {
      showError('Only the leader can change exercises in guided mode');
    }

    return false;
  }

  console.log('Exercise changed to:', exerciseName);
  return true;
}

// Usage
await changeExercise('session123', 'squat');
```

## Reactions and Communication

### Sending Reactions

```typescript
async function sendReactionToUser(
  sessionId: string,
  targetUserId: string,
  emote: EmoteId,
  targetSetId?: string
) {
  const user = getUser();

  const result = await sendReaction({
    sessionId,
    userId: user.id,
    targetUserId,
    emote,
    targetSetId,
  });

  if (!result.success) {
    console.error('Failed to send reaction:', result.error);
    return false;
  }

  // Show local reaction immediately (optimistic UI)
  showLocalReaction(user.id, emote, targetSetId);

  console.log('Reaction sent successfully');
  return true;
}

// Usage
await sendReactionToUser('session123', 'user2', 'fire', 'set123');
```

### Sending Messages

```typescript
async function sendChatMessage(sessionId: string, message: string) {
  const user = getUser();

  if (!message.trim()) {
    console.error('Message cannot be empty');
    return false;
  }

  const result = await sendLiveMessage(sessionId, user.id, message);

  if (!result.success) {
    console.error('Failed to send message:', result.error);

    if (result.error === 'rate_limited') {
      showError('You are sending messages too quickly. Please wait.');
    }

    return false;
  }

  // Show message locally immediately (optimistic UI)
  addToChat(user.id, message, true); // true = isLocalUser

  console.log('Message sent successfully');
  return true;
}

// Usage
await sendChatMessage('session123', 'Great job everyone! Keep pushing!');
```

### Quick Reactions

```typescript
async function sendQuickReactionToFriend(friendId: string, emote: string) {
  const user = getUser();

  const result = await sendQuickReaction({
    fromUserId: user.id,
    toUserId: friendId,
    emote,
  });

  if (!result.success) {
    console.error('Failed to send quick reaction:', result.error);
    return false;
  }

  console.log('Quick reaction sent successfully');
  return true;
}

// Usage
await sendQuickReactionToFriend('friend123', 'fire');
```

## Presence Tracking

### Subscribing to Friends' Presence

```typescript
let presenceUnsubscribe: (() => void) | null = null;

function handlePresenceUpdate(presence: WorkoutPresence[]) {
  console.log('Friends presence updated:', presence);

  // Update UI to show which friends are working out
  updateFriendsPresenceUI(presence);
}

// Subscribe to presence updates
presenceUnsubscribe = subscribeToFriendsPresence(user.id, handlePresenceUpdate);

// Later, when no longer needed...
if (presenceUnsubscribe) {
  presenceUnsubscribe();
  presenceUnsubscribe = null;
}
```

### Sending Quick Reactions to Friends

```typescript
async function reactToFriendWorkout(friendId: string, emote: string) {
  const user = getUser();

  const result = await sendQuickReaction({
    fromUserId: user.id,
    toUserId: friendId,
    emote,
  });

  if (!result.success) {
    console.error('Failed to send reaction:', result.error);
    return false;
  }

  // Show local feedback
  showReactionSentFeedback(emote);

  return true;
}

// Usage
await reactToFriendWorkout('friend123', 'flex');
```

## Advanced Usage

### Session Invitations

```typescript
async function inviteFriendToSession(sessionId: string, friendId: string) {
  // Generate invitation
  const invitationResult = await generateSessionInvitation(sessionId, friendId);

  if (!invitationResult.success) {
    console.error('Failed to generate invitation:', invitationResult.error);
    return false;
  }

  const invitation = invitationResult.data;

  // Send notification to friend
  const notificationResult = await sendNotification(friendId, {
    type: 'session_invitation',
    title: 'Workout Invitation',
    body: `You're invited to join ${invitation.sessionName}!`,
    data: {
      invitationId: invitation.id,
      sessionId: invitation.sessionId,
      hostId: invitation.hostId,
    },
  });

  if (!notificationResult.success) {
    console.error('Failed to send notification:', notificationResult.error);
    return false;
  }

  console.log('Invitation sent successfully');
  return true;
}

// Usage
await inviteFriendToSession('session123', 'friend123');
```

### Session Summaries

```typescript
async function getSessionSummaryAndShow(sessionId: string) {
  const result = await getSessionSummary(sessionId);

  if (!result.success) {
    console.error('Failed to get session summary:', result.error);
    return null;
  }

  const summary = result.data;

  console.log('Session Summary:');
  console.log('- Duration:', formatDuration(summary.durationMs));
  console.log('- Total Sets:', summary.totalSets);
  console.log('- Total Volume:', summary.totalVolumeKg, 'kg');
  console.log('- Exercises:', summary.exercises.join(', '));
  console.log('- Participants:', summary.participantSummaries.length);

  // Show summary UI
  showSessionSummaryUI(summary);

  return summary;
}

// Usage
await getSessionSummaryAndShow('session123');
```

### Error Handling

```typescript
async function handleSessionOperation(operation: () => Promise<any>) {
  try {
    const result = await operation();

    if (!result.success) {
      handleError(result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    showError('An unexpected error occurred. Please try again.');
    return null;
  }
}

function handleError(error: string) {
  console.error('Operation failed:', error);

  switch (error) {
    case 'user_not_authenticated':
      showError('Please sign in to use this feature.');
      navigateToLogin();
      break;
    case 'session_not_found':
      showError('Session not found. It may have ended.');
      break;
    case 'permission_denied':
      showError('You do not have permission to perform this action.');
      break;
    case 'session_not_active':
      showError('This session is not active.');
      break;
    case 'rate_limited':
      showError('Please wait before trying again.');
      break;
    default:
      showError('An error occurred. Please try again.');
      break;
  }
}

// Usage
const session = await handleSessionOperation(() =>
  createLiveSession({ mode: 'shared', name: 'Test Session' })
);
```

### Optimistic UI Updates

```typescript
async function completeSetWithOptimisticUI(
  sessionId: string,
  exerciseId: string,
  weightKg: number,
  reps: number
) {
  const user = getUser();

  // Create the set
  const set: LoggedSet = {
    id: uid(),
    exerciseId,
    setType: 'working',
    weightKg,
    reps,
    timestampMs: Date.now(),
  };

  // Calculate e1RM
  const e1rm = calculateE1RM(weightKg, reps);
  const exerciseName = getExerciseName(exerciseId);
  const isPR = checkIfPR(user.id, exerciseId, weightKg, reps);

  // Optimistic UI update - show immediately
  showSetCompletionLocally(user.id, exerciseName, weightKg, reps, isPR);

  try {
    // Send to server
    const result = await completeLiveSet({
      sessionId,
      userId: user.id,
      set,
      exerciseName,
      e1rmKg: e1rm,
      isPR,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    // Log to local session
    logToLocalSession(set);

    return true;
  } catch (error) {
    console.error('Failed to complete set:', error);

    // Rollback optimistic update
    hideSetCompletionLocally();
    showError('Failed to log set. Please check your connection.');

    return false;
  }
}
```

## React Component Integration

### Using in a React Component

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import {
  joinLiveSession,
  leaveLiveSession,
  subscribeToLiveSession,
  completeLiveSet,
  sendReaction,
} from '@/src/lib/liveWorkoutTogether';
import { getUser } from '@/src/lib/stores/authStore';

type LiveSessionScreenProps = {
  sessionId: string;
  onLeave: () => void;
};

export function LiveSessionScreen({ sessionId, onLeave }: LiveSessionScreenProps) {
  const [participant, setParticipant] = useState<LiveSessionParticipant | null>(null);
  const [events, setEvents] = useState<LiveSessionEvent[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const user = getUser();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function joinAndSubscribe() {
      if (!user) return;

      try {
        // Join the session
        const joinResult = await joinLiveSession({
          sessionId,
          userId: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        });

        if (!joinResult.success) {
          console.error('Failed to join session:', joinResult.error);
          return;
        }

        setParticipant(joinResult.data);
        setIsJoined(true);

        // Subscribe to events
        unsubscribe = subscribeToLiveSession(sessionId, (event) => {
          setEvents(prev => [...prev, event]);
        });

      } catch (error) {
        console.error('Error joining session:', error);
      }
    }

    joinAndSubscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [sessionId, user]);

  const handleLeave = async () => {
    if (!user || !isJoined) return;

    const result = await leaveLiveSession(sessionId, user.id);
    if (result.success) {
      onLeave();
    }
  };

  const handleCompleteSet = async () => {
    if (!user || !participant) return;

    // This would be connected to your set completion UI
    const result = await completeLiveSet({
      sessionId,
      userId: user.id,
      set: {
        id: 'temp-set-id',
        exerciseId: 'bench',
        setType: 'working',
        weightKg: 100,
        reps: 5,
        timestampMs: Date.now(),
      },
      exerciseName: 'Bench Press',
      e1rmKg: 116.67,
      isPR: true,
    });

    if (!result.success) {
      console.error('Failed to complete set:', result.error);
    }
  };

  const handleSendReaction = async () => {
    if (!user || !participant) return;

    // Find another participant to send reaction to
    const otherParticipant = events.find(e =>
      e.type === 'set_completed' && e.userId !== user.id
    ) as LiveSetCompletedEvent | undefined;

    if (otherParticipant) {
      const result = await sendReaction({
        sessionId,
        userId: user.id,
        targetUserId: otherParticipant.userId,
        emote: 'fire',
        targetSetId: otherParticipant.data.set.id,
      });

      if (!result.success) {
        console.error('Failed to send reaction:', result.error);
      }
    }
  };

  if (!isJoined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Joining session...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>
        Live Session: {sessionId}
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 8 }}>
        You: {participant?.displayName}
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 16 }}>
        Status: {participant?.status}
      </Text>

      <Button title="Complete Set" onPress={handleCompleteSet} />
      <Button title="Send Reaction" onPress={handleSendReaction} />
      <Button title="Leave Session" onPress={handleLeave} color="red" />

      <Text style={{ fontSize: 20, marginTop: 24, marginBottom: 8 }}>
        Recent Events:
      </Text>

      {events.slice().reverse().map((event, index) => (
        <Text key={index} style={{ marginBottom: 4 }}>
          {event.userId}: {event.type}
        </Text>
      ))}
    </View>
  );
}
```

### Managing Subscriptions

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { subscribeToLiveSession } from '@/src/lib/liveWorkoutTogether';

export function useLiveSessionSubscription(sessionId: string) {
  const [events, setEvents] = useState<LiveSessionEvent[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Set up new subscription
    unsubscribeRef.current = subscribeToLiveSession(sessionId, (event) => {
      setEvents(prev => [...prev, event]);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [sessionId]);

  return events;
}

// Usage in component
function SessionEventsDisplay({ sessionId }: { sessionId: string }) {
  const events = useLiveSessionSubscription(sessionId);

  return (
    <View>
      {events.map((event, index) => (
        <Text key={index}>{event.type} from {event.userId}</Text>
      ))}
    </View>
  );
}
```

### Cleanup on Unmount

```typescript
import React, { useEffect } from 'react';
import { subscribeToLiveSession } from '@/src/lib/liveWorkoutTogether';

export function LiveSessionComponent({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    const unsubscribe = subscribeToLiveSession(sessionId, (event) => {
      console.log('Event received:', event);
      // Handle event
    });

    // Cleanup function
    return () => {
      console.log('Unsubscribing from session events');
      unsubscribe();
    };
  }, [sessionId]);

  return (
    <View>
      {/* Component content */}
    </View>
  );
}
```

## Conclusion

These usage examples demonstrate how to integrate the Live Workout Together feature into your React Native application. The examples cover:

- Basic session management (create, join, leave)
- Real-time event handling
- Sending reactions and messages
- Presence tracking
- Advanced patterns like optimistic UI updates
- React component integration

For complete API reference, see `API_REFERENCE.md`. For architectural overview and technical details, see `LIVE_WORKOUT_TOGETHER_COMPREHENSIVE.md`.
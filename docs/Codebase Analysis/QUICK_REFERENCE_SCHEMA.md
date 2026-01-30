# Live Workout Together - Quick Reference Guide

## Tables at a Glance

### 1. live_sessions
**Primary table for sessions**
```sql
SELECT * FROM live_sessions WHERE status = 'active';
```

### 2. live_session_participants
**Who's in each session**
```sql
SELECT * FROM live_session_participants
WHERE session_id = '...' ORDER BY joined_at;
```

### 3. live_session_events
**What's happening in real-time**
```sql
SELECT * FROM live_session_events
WHERE session_id = '...' ORDER BY created_at DESC LIMIT 50;
```

### 4. live_session_sets
**Sets being logged**
```sql
SELECT * FROM live_session_sets
WHERE session_id = '...' ORDER BY created_at DESC;
```

### 5. live_session_reactions
**Emotes and reactions**
```sql
SELECT * FROM live_session_reactions
WHERE session_id = '...' ORDER BY created_at DESC;
```

### 6. live_session_messages
**Chat messages**
```sql
SELECT * FROM live_session_messages
WHERE session_id = '...' ORDER BY created_at ASC;
```

### 7. live_session_invitations
**Pending invitations**
```sql
SELECT * FROM live_session_invitations
WHERE recipient_id = 'user-id' AND status = 'pending';
```

### 8. workout_presence
**Who's working out now**
```sql
SELECT * FROM workout_presence
WHERE is_in_live_session = TRUE;
```

### 9. quick_reactions
**Lightweight emotes**
```sql
SELECT * FROM quick_reactions
WHERE to_user_id = 'user-id' ORDER BY created_at DESC;
```

## Common Queries

### Get Active Sessions
```sql
SELECT * FROM live_sessions
WHERE status = 'active'
ORDER BY created_at DESC;
```

### Get Session Participants
```sql
SELECT p.* FROM live_session_participants p
JOIN live_sessions s ON p.session_id = s.id
WHERE s.id = 'session-id';
```

### Get Recent Sets in Session
```sql
SELECT s.* FROM live_session_sets s
WHERE s.session_id = 'session-id'
ORDER BY s.created_at DESC
LIMIT 20;
```

### Get User's Active Session
```sql
SELECT s.* FROM live_sessions s
JOIN live_session_participants p ON s.id = p.session_id
WHERE p.user_id = 'user-id' AND s.status = 'active';
```

### Get Friends' Workout Presence
```sql
SELECT p.* FROM workout_presence p
JOIN friendships f ON
  (p.user_id = f.friend_id AND f.user_id = 'my-id' AND f.status = 'friends')
WHERE p.is_in_live_session = TRUE;
```

## Common Inserts

### Create Session
```sql
INSERT INTO live_sessions (
  host_id, mode, name, theme, planned_exercises
) VALUES (
  'user-id', 'shared', 'Morning Bench', 'toxic', '[]'
);
```

### Join Session
```sql
INSERT INTO live_session_participants (
  session_id, user_id, display_name, avatar_url, status
) VALUES (
  'session-id', 'user-id', 'John Doe', 'url', 'idle'
);
```

### Log Set
```sql
INSERT INTO live_session_sets (
  session_id, user_id, exercise_id, exercise_name,
  set_type, weight_kg, reps, timestamp_ms, e1rm_kg, is_pr
) VALUES (
  'session-id', 'user-id', 'bench', 'Bench Press',
  'working', 100, 5, 1234567890, 108.33, TRUE
);
```

### Send Reaction
```sql
INSERT INTO live_session_reactions (
  session_id, from_user_id, to_user_id, emote
) VALUES (
  'session-id', 'my-id', 'their-id', 'fire'
);
```

### Send Message
```sql
INSERT INTO live_session_messages (
  session_id, user_id, message
) VALUES (
  'session-id', 'user-id', 'Great set!'
);
```

## Common Updates

### Update Participant Status
```sql
UPDATE live_session_participants SET
  status = 'working_out',
  current_exercise_id = 'bench'
WHERE session_id = '...' AND user_id = '...';
```

### Update Ready Status
```sql
UPDATE live_session_participants SET
  ready_for_next = TRUE
WHERE session_id = '...' AND user_id = '...';
```

### End Session
```sql
UPDATE live_sessions SET
  status = 'ended',
  ended_at = NOW()
WHERE id = 'session-id' AND host_id = 'host-id';
```

### Update Workout Presence
```sql
UPDATE workout_presence SET
  current_exercise_id = 'squat',
  current_exercise_name = 'Squat',
  status = 'working_out',
  last_set_completed_at = NOW()
WHERE user_id = 'user-id';
```

## Helper Functions

### Create Session
```sql
SELECT * FROM create_live_session(
  'user-id', 'shared', 'Morning Session', 'toxic', '[]'
);
```

### End Session
```sql
SELECT end_live_session('session-id');
```

### Get Session Summary
```sql
SELECT * FROM get_live_session_summary('session-id');
```

### Get Participant Summary
```sql
SELECT * FROM get_participant_summary('session-id', 'user-id');
```

## Real-time Subscriptions

### Listen to Session Events
```javascript
supabase
  .channel('live_session_events')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'live_session_events',
    filter: 'session_id=eq.session-id-here'
  }, payload => {
    console.log('Event:', payload.new);
  })
  .subscribe();
```

### Listen to Session Sets
```javascript
supabase
  .channel('live_session_sets')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'live_session_sets',
    filter: 'session_id=eq.session-id-here'
  }, payload => {
    console.log('New set:', payload.new);
  })
  .subscribe();
```

### Listen to Session Messages
```javascript
supabase
  .channel('live_session_messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'live_session_messages',
    filter: 'session_id=eq.session-id-here'
  }, payload => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

### Listen to Workout Presence
```javascript
supabase
  .channel('workout_presence')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'workout_presence'
  }, payload => {
    console.log('Presence update:', payload.new);
  })
  .subscribe();
```

## TypeScript Usage

### Import Types
```typescript
import type {
  DatabaseLiveSession,
  DatabaseLiveSessionParticipant,
  DatabaseLiveSessionEvent,
  DatabaseLiveSessionSet
} from '@/src/lib/supabase/types';
```

### Create Session
```typescript
const newSession: DatabaseLiveSessionInsert = {
  host_id: userId,
  mode: 'shared',
  name: 'Morning Bench',
  theme: 'toxic',
  planned_exercises: []
};

const { data, error } = await supabase
  .from('live_sessions')
  .insert(newSession)
  .select()
  .single();
```

### Join Session
```typescript
const participant: DatabaseLiveSessionParticipantInsert = {
  session_id: sessionId,
  user_id: userId,
  display_name: user.displayName,
  avatar_url: user.avatarUrl,
  status: 'idle',
  current_exercise_id: null,
  is_leader: false,
  ready_for_next: false
};

const { data, error } = await supabase
  .from('live_session_participants')
  .insert(participant)
  .select()
  .single();
```

### Log Set
```typescript
const newSet: DatabaseLiveSessionSetInsert = {
  session_id: sessionId,
  user_id: userId,
  exercise_id: 'bench',
  exercise_name: 'Bench Press',
  set_type: 'working',
  weight_kg: 100,
  reps: 5,
  timestamp_ms: Date.now(),
  e1rm_kg: 108.33,
  is_pr: true,
  intensity_score: 850
};

const { data, error } = await supabase
  .from('live_session_sets')
  .insert(newSet)
  .select()
  .single();
```

## Error Handling

### Common Errors
```typescript
// Session not found
if (error?.code === 'PGRST101') {
  console.error('Session not found');
}

// Not authorized (RLS)
if (error?.code === '42501') {
  console.error('Not authorized');
}

// Invalid data
if (error?.code === '23502') {
  console.error('Missing required field');
}

// Unique constraint violation
if (error?.code === '23505') {
  console.error('Already exists');
}
```

## Best Practices

### 1. Always Use RLS
- All queries go through Supabase client
- Never bypass RLS policies
- Test policies thoroughly

### 2. Use Transactions for Atomic Operations
```typescript
await supabase.rpc('create_session_and_join', {
  host_id: userId,
  mode: 'shared'
});
```

### 3. Batch Updates When Possible
```typescript
await supabase
  .from('live_session_sets')
  .insert(setsArray)
  .select();
```

### 4. Use Indexes Efficiently
```typescript
// Good: Uses index on (session_id, created_at)
await supabase
  .from('live_session_sets')
  .select()
  .eq('session_id', sessionId)
  .order('created_at', { ascending: false })
  .limit(20);
```

### 5. Handle Real-time Updates Gracefully
```typescript
const subscription = supabase
  .channel('sets')
  .on(...)
  .subscribe();

// Clean up
return () => {
  supabase.removeChannel(subscription);
};
```

## Troubleshooting

### Issue: Can't see session data
**Solution**: Check RLS policies
```sql
-- Verify you're a participant
SELECT * FROM live_session_participants
WHERE session_id = '...' AND user_id = 'your-id';
```

### Issue: Participant count incorrect
**Solution**: Check trigger
```sql
-- Manually recount if needed
UPDATE live_sessions SET
  participant_count = (
    SELECT COUNT(*) FROM live_session_participants
    WHERE session_id = live_sessions.id
  )
WHERE id = 'session-id';
```

### Issue: Real-time not working
**Solution**: Check subscription
```javascript
-- Verify channel is active
console.log(supabase.getChannels());
```

### Issue: JSONB query not working
**Solution**: Use proper operators
```sql
-- Correct way to query JSONB
SELECT * FROM live_sessions
WHERE planned_exercises @> '[{"exerciseId": "bench"}]';
```

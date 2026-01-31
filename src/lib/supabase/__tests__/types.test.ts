// src/lib/supabase/__tests__/types.test.ts
// Comprehensive test coverage for Supabase database schema types (SPEC-005)

import {
  // JSONB Types
  type JsonWorkoutSet,
  type JsonRoutineExercise,
  type JsonWorkoutSnapshot,
  type JsonTopLine,
  // Database Row Types
  type DatabaseUser,
  type DatabaseRoutine,
  type DatabaseWorkout,
  type DatabaseFriendship,
  type DatabasePost,
  type DatabaseReaction,
  type DatabaseComment,
  type DatabaseNotification,
  // Database Enum Types
  type DatabaseFriendStatus,
  type DatabasePrivacyLevel,
  type DatabaseEmoteId,
  type DatabaseNotificationType,
  // Insert Types
  type DatabaseUserInsert,
  type DatabaseRoutineInsert,
  type DatabaseWorkoutInsert,
  type DatabaseFriendshipInsert,
  type DatabasePostInsert,
  type DatabaseReactionInsert,
  type DatabaseCommentInsert,
  type DatabaseNotificationInsert,
  // Update Types
  type DatabaseUserUpdate,
  type DatabaseRoutineUpdate,
  type DatabaseWorkoutUpdate,
  type DatabaseFriendshipUpdate,
  type DatabasePostUpdate,
  type DatabaseCommentUpdate,
  type DatabaseNotificationUpdate,
  // Mapper Functions
  snakeToCamel,
  camelToSnake,
  mapDatabaseUser,
  mapDatabaseRoutine,
  mapDatabaseWorkout,
  mapDatabaseFriendship,
  mapDatabasePost,
  mapDatabaseReaction,
  mapDatabaseComment,
  mapDatabaseNotification,
  // Database Type
  type Database,
  // Re-exports
  type WorkoutSet,
  type RoutineExercise,
  type WorkoutSnapshot,
  type TopLine,
} from '../types';

describe('Supabase Types - JSONB Types', () => {
  describe('JsonWorkoutSet', () => {
    it('should validate correct JsonWorkoutSet structure', () => {
      const validSet: JsonWorkoutSet = {
        id: 'abc123',
        exerciseId: 'bench',
        weightKg: 100,
        reps: 5,
        timestampMs: Date.now(),
      };

      expect(validSet.id).toBe('abc123');
      expect(validSet.exerciseId).toBe('bench');
      expect(validSet.weightKg).toBe(100);
      expect(validSet.reps).toBe(5);
      expect(validSet.timestampMs).toBeGreaterThan(0);
    });

    it('should accept valid timestamp values', () => {
      const now = Date.now();
      const workoutSet: JsonWorkoutSet = {
        id: 'xyz',
        exerciseId: 'squat',
        weightKg: 120,
        reps: 3,
        timestampMs: now,
      };

      expect(workoutSet.timestampMs).toBe(now);
    });

    it('should accept zero weight values for bodyweight exercises', () => {
      const bodyweightSet: JsonWorkoutSet = {
        id: 'pullup1',
        exerciseId: 'pullup',
        weightKg: 0,
        reps: 10,
        timestampMs: Date.now(),
      };

      expect(bodyweightSet.weightKg).toBe(0);
      expect(bodyweightSet.reps).toBe(10);
    });
  });

  describe('JsonRoutineExercise', () => {
    it('should validate JsonRoutineExercise with all required fields', () => {
      const exercise: JsonRoutineExercise = {
        id: 'ex1',
        exerciseId: 'bench',
      };

      expect(exercise.id).toBe('ex1');
      expect(exercise.exerciseId).toBe('bench');
    });

    it('should validate JsonRoutineExercise with optional fields', () => {
      const exerciseWithOptional: JsonRoutineExercise = {
        id: 'ex2',
        exerciseId: 'squat',
        note: 'Go deep',
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
      };

      expect(exerciseWithOptional.note).toBe('Go deep');
      expect(exerciseWithOptional.targetSets).toBe(3);
      expect(exerciseWithOptional.targetRepsMin).toBe(8);
      expect(exerciseWithOptional.targetRepsMax).toBe(12);
    });

    it('should accept exercises with partial optional fields', () => {
      const partialExercise: JsonRoutineExercise = {
        id: 'ex3',
        exerciseId: 'deadlift',
        targetSets: 5,
      };

      expect(partialExercise.targetSets).toBe(5);
      expect(partialExercise.targetRepsMin).toBeUndefined();
    });

    it('should accept empty optional fields', () => {
      const minimalExercise: JsonRoutineExercise = {
        id: 'ex4',
        exerciseId: 'row',
        note: '',
        targetSets: 0,
      };

      expect(minimalExercise.note).toBe('');
      expect(minimalExercise.targetSets).toBe(0);
    });
  });

  describe('JsonTopLine', () => {
    it('should validate JsonTopLine with bestSet', () => {
      const topLine: JsonTopLine = {
        exerciseName: 'Bench Press',
        bestSet: {
          weightLabel: '100 kg',
          reps: 5,
          e1rmLabel: '117 kg',
        },
      };

      expect(topLine.exerciseName).toBe('Bench Press');
      expect(topLine.bestSet?.weightLabel).toBe('100 kg');
      expect(topLine.bestSet?.reps).toBe(5);
      expect(topLine.bestSet?.e1rmLabel).toBe('117 kg');
    });

    it('should validate JsonTopLine without bestSet', () => {
      const topLineNoBest: JsonTopLine = {
        exerciseName: 'Warm-up',
      };

      expect(topLineNoBest.exerciseName).toBe('Warm-up');
      expect(topLineNoBest.bestSet).toBeUndefined();
    });

    it('should validate JsonTopLine with bestSet without e1rmLabel', () => {
      const topLineNoE1rm: JsonTopLine = {
        exerciseName: 'Squat',
        bestSet: {
          weightLabel: '140 kg',
          reps: 3,
        },
      };

      expect(topLineNoE1rm.bestSet?.weightLabel).toBe('140 kg');
      expect(topLineNoE1rm.bestSet?.e1rmLabel).toBeUndefined();
    });
  });

  describe('JsonWorkoutSnapshot', () => {
    it('should validate JsonWorkoutSnapshot with all fields', () => {
      const snapshot: JsonWorkoutSnapshot = {
        routineName: 'Push Day',
        topLines: [
          {
            exerciseName: 'Bench Press',
            bestSet: {
              weightLabel: '100 kg',
              reps: 5,
              e1rmLabel: '117 kg',
            },
          },
        ],
      };

      expect(snapshot.routineName).toBe('Push Day');
      expect(snapshot.topLines).toHaveLength(1);
      expect(snapshot.topLines[0].exerciseName).toBe('Bench Press');
    });

    it('should validate JsonWorkoutSnapshot without routineName', () => {
      const snapshotNoRoutine: JsonWorkoutSnapshot = {
        topLines: [
          {
            exerciseName: 'Squat',
            bestSet: {
              weightLabel: '140 kg',
              reps: 3,
            },
          },
        ],
      };

      expect(snapshotNoRoutine.routineName).toBeUndefined();
      expect(snapshotNoRoutine.topLines).toHaveLength(1);
    });

    it('should validate JsonWorkoutSnapshot with empty topLines array', () => {
      const emptySnapshot: JsonWorkoutSnapshot = {
        routineName: 'Empty Workout',
        topLines: [],
      };

      expect(emptySnapshot.topLines).toEqual([]);
      expect(emptySnapshot.topLines).toHaveLength(0);
    });

    it('should validate JsonWorkoutSnapshot with multiple topLines', () => {
      const multiExerciseSnapshot: JsonWorkoutSnapshot = {
        routineName: 'Full Body',
        topLines: [
          {
            exerciseName: 'Bench Press',
            bestSet: { weightLabel: '100 kg', reps: 5 },
          },
          {
            exerciseName: 'Squat',
            bestSet: { weightLabel: '140 kg', reps: 3 },
          },
          {
            exerciseName: 'Deadlift',
            bestSet: { weightLabel: '160 kg', reps: 1 },
          },
        ],
      };

      expect(multiExerciseSnapshot.topLines).toHaveLength(3);
    });
  });
});

describe('Supabase Types - Database Row Types', () => {
  describe('DatabaseUser', () => {
    it('should validate DatabaseUser structure', () => {
      const user: DatabaseUser = {
        id: 'user123',
        email: 'test@example.com',
        display_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      expect(user.id).toBe('user123');
      expect(user.email).toBe('test@example.com');
      expect(user.display_name).toBe('Test User');
    });

    it('should accept null values for optional fields', () => {
      const userWithNulls: DatabaseUser = {
        id: 'user456',
        email: 'nulls@example.com',
        display_name: null,
        avatar_url: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      expect(userWithNulls.display_name).toBeNull();
      expect(userWithNulls.avatar_url).toBeNull();
    });

    it('should validate ISO 8601 datetime strings', () => {
      const user: DatabaseUser = {
        id: 'user789',
        email: 'datetime@example.com',
        display_name: 'DateTime User',
        avatar_url: null,
        created_at: '2024-01-15T12:30:45.123Z',
        updated_at: '2024-01-20T18:45:30.456Z',
      };

      expect(user.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(user.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('DatabaseRoutine', () => {
    it('should validate DatabaseRoutine structure', () => {
      const routine: DatabaseRoutine = {
        id: 'routine1',
        user_id: 'user123',
        name: 'Push Day',
        exercises: [
          {
            id: 'ex1',
            exerciseId: 'bench',
            targetSets: 3,
            targetRepsMin: 8,
            targetRepsMax: 12,
          },
        ],
        source_plan_id: 'plan123',
        source_plan_category: 'strength',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      expect(routine.name).toBe('Push Day');
      expect(routine.exercises).toHaveLength(1);
      expect(routine.source_plan_id).toBe('plan123');
    });

    it('should accept null for optional source fields', () => {
      const routineNoSource: DatabaseRoutine = {
        id: 'routine2',
        user_id: 'user123',
        name: 'Custom Routine',
        exercises: [],
        source_plan_id: null,
        source_plan_category: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      expect(routineNoSource.source_plan_id).toBeNull();
      expect(routineNoSource.source_plan_category).toBeNull();
    });

    it('should accept empty exercises array', () => {
      const emptyRoutine: DatabaseRoutine = {
        id: 'routine3',
        user_id: 'user123',
        name: 'Empty Routine',
        exercises: [],
        source_plan_id: null,
        source_plan_category: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      expect(emptyRoutine.exercises).toEqual([]);
    });
  });

  describe('DatabaseWorkout', () => {
    it('should validate DatabaseWorkout structure', () => {
      const workout: DatabaseWorkout = {
        id: 'workout1',
        user_id: 'user123',
        started_at: 1704067200000, // 2024-01-01 in milliseconds
        ended_at: 1704070800000,
        sets: [
          {
            id: 'set1',
            exerciseId: 'bench',
            weightKg: 100,
            reps: 5,
            timestampMs: 1704067300000,
          },
        ],
        routine_id: 'routine1',
        routine_name: 'Push Day',
        plan_id: 'plan123',
        completion_pct: 100,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(workout.started_at).toBe(1704067200000);
      expect(workout.sets).toHaveLength(1);
      expect(workout.completion_pct).toBe(100);
    });

    it('should accept null for optional workout fields', () => {
      const minimalWorkout: DatabaseWorkout = {
        id: 'workout2',
        user_id: 'user123',
        started_at: 1704067200000,
        ended_at: 1704070800000,
        sets: [],
        routine_id: null,
        routine_name: null,
        plan_id: null,
        completion_pct: null,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(minimalWorkout.routine_id).toBeNull();
      expect(minimalWorkout.completion_pct).toBeNull();
      expect(minimalWorkout.sets).toEqual([]);
    });

    it('should accept completion_pct between 0 and 100', () => {
      const partialWorkout: DatabaseWorkout = {
        id: 'workout3',
        user_id: 'user123',
        started_at: 1704067200000,
        ended_at: 1704070800000,
        sets: [],
        routine_id: null,
        routine_name: null,
        plan_id: null,
        completion_pct: 75,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(partialWorkout.completion_pct).toBe(75);
    });
  });

  describe('DatabaseFriendship', () => {
    it('should validate DatabaseFriendship structure', () => {
      const friendship: DatabaseFriendship = {
        id: 'friendship1',
        user_id: 'user1',
        friend_id: 'user2',
        status: 'friends',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      expect(friendship.status).toBe('friends');
      expect(friendship.user_id).toBe('user1');
      expect(friendship.friend_id).toBe('user2');
    });
  });

  describe('DatabasePost', () => {
    it('should validate DatabasePost structure', () => {
      const post: DatabasePost = {
        id: 'post1',
        author_id: 'user123',
        title: 'Great Workout!',
        caption: 'Hit a PR today',
        privacy: 'public',
        duration_sec: 3600,
        completion_pct: 100,
        exercise_count: 5,
        set_count: 20,
        workout_snapshot: {
          routineName: 'Push Day',
          topLines: [
            {
              exerciseName: 'Bench Press',
              bestSet: { weightLabel: '100 kg', reps: 5 },
            },
          ],
        },
        like_count: 10,
        comment_count: 3,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(post.privacy).toBe('public');
      expect(post.like_count).toBe(10);
      expect(post.workout_snapshot?.topLines).toHaveLength(1);
    });

    it('should accept null for optional post fields', () => {
      const minimalPost: DatabasePost = {
        id: 'post2',
        author_id: 'user123',
        title: null,
        caption: null,
        privacy: 'friends',
        duration_sec: null,
        completion_pct: null,
        exercise_count: null,
        set_count: null,
        workout_snapshot: null,
        like_count: 0,
        comment_count: 0,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(minimalPost.title).toBeNull();
      expect(minimalPost.workout_snapshot).toBeNull();
    });
  });

  describe('DatabaseReaction', () => {
    it('should validate DatabaseReaction structure', () => {
      const reaction: DatabaseReaction = {
        id: 'reaction1',
        post_id: 'post1',
        user_id: 'user123',
        emote: 'fire',
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(reaction.emote).toBe('fire');
      expect(reaction.post_id).toBe('post1');
    });
  });

  describe('DatabaseComment', () => {
    it('should validate DatabaseComment structure', () => {
      const comment: DatabaseComment = {
        id: 'comment1',
        post_id: 'post1',
        user_id: 'user123',
        text: 'Great workout!',
        parent_comment_id: null,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(comment.text).toBe('Great workout!');
      expect(comment.parent_comment_id).toBeNull();
    });

    it('should accept parent_comment_id for replies', () => {
      const reply: DatabaseComment = {
        id: 'comment2',
        post_id: 'post1',
        user_id: 'user456',
        text: 'Thanks!',
        parent_comment_id: 'comment1',
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(reply.parent_comment_id).toBe('comment1');
    });
  });

  describe('DatabaseNotification', () => {
    it('should validate DatabaseNotification structure', () => {
      const notification: DatabaseNotification = {
        id: 'notif1',
        user_id: 'user123',
        type: 'reaction',
        title: 'New reaction',
        body: 'Someone reacted to your post',
        post_id: 'post1',
        comment_id: null,
        read_at: null,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(notification.type).toBe('reaction');
      expect(notification.post_id).toBe('post1');
      expect(notification.read_at).toBeNull();
    });

    it('should accept read_at timestamp for read notifications', () => {
      const readNotification: DatabaseNotification = {
        id: 'notif2',
        user_id: 'user123',
        type: 'comment',
        title: 'New comment',
        body: 'Someone commented on your post',
        post_id: 'post1',
        comment_id: 'comment1',
        read_at: '2024-01-02T00:00:00.000Z',
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(readNotification.read_at).toBe('2024-01-02T00:00:00.000Z');
    });
  });
});

describe('Supabase Types - Enum Types', () => {
  describe('DatabaseFriendStatus', () => {
    const validStatuses: DatabaseFriendStatus[] = [
      'none',
      'requested',
      'pending',
      'friends',
      'blocked',
    ];

    it('should accept all valid friend status values', () => {
      validStatuses.forEach((status) => {
        expect(status).toBeDefined();
      });
    });

    it('should type check friend status correctly', () => {
      const status1: DatabaseFriendStatus = 'friends';
      const status2: DatabaseFriendStatus = 'blocked';
      expect(status1).toBe('friends');
      expect(status2).toBe('blocked');
    });
  });

  describe('DatabasePrivacyLevel', () => {
    const validPrivacyLevels: DatabasePrivacyLevel[] = ['public', 'friends'];

    it('should accept all valid privacy level values', () => {
      validPrivacyLevels.forEach((level) => {
        expect(level).toBeDefined();
      });
    });

    it('should type check privacy level correctly', () => {
      const level1: DatabasePrivacyLevel = 'public';
      const level2: DatabasePrivacyLevel = 'friends';
      expect(level1).toBe('public');
      expect(level2).toBe('friends');
    });
  });

  describe('DatabaseEmoteId', () => {
    const validEmotes: DatabaseEmoteId[] = [
      'like',
      'fire',
      'skull',
      'crown',
      'bolt',
      'clap',
    ];

    it('should accept all valid emote values', () => {
      validEmotes.forEach((emote) => {
        expect(emote).toBeDefined();
      });
    });

    it('should type check emote correctly', () => {
      const emote1: DatabaseEmoteId = 'fire';
      const emote2: DatabaseEmoteId = 'crown';
      expect(emote1).toBe('fire');
      expect(emote2).toBe('crown');
    });
  });

  describe('DatabaseNotificationType', () => {
    const validTypes: DatabaseNotificationType[] = [
      'reaction',
      'comment',
      'friend_request',
      'friend_accept',
      'message',
    ];

    it('should accept all valid notification type values', () => {
      validTypes.forEach((type) => {
        expect(type).toBeDefined();
      });
    });

    it('should type check notification type correctly', () => {
      const type1: DatabaseNotificationType = 'reaction';
      const type2: DatabaseNotificationType = 'friend_request';
      expect(type1).toBe('reaction');
      expect(type2).toBe('friend_request');
    });
  });
});

describe('Supabase Types - Insert Types', () => {
  describe('DatabaseUserInsert', () => {
    it('should exclude id, created_at, and updated_at from DatabaseUser', () => {
      const userInsert: DatabaseUserInsert = {
        email: 'new@example.com',
        display_name: 'New User',
        avatar_url: null,
      };

      expect(userInsert.email).toBe('new@example.com');
      expect((userInsert as any).id).toBeUndefined();
      expect((userInsert as any).created_at).toBeUndefined();
      expect((userInsert as any).updated_at).toBeUndefined();
    });
  });

  describe('DatabaseRoutineInsert', () => {
    it('should include only user_id and specific fields', () => {
      const routineInsert: DatabaseRoutineInsert = {
        user_id: 'user123',
        name: 'New Routine',
        exercises: [],
        source_plan_id: null,
        source_plan_category: null,
      };

      expect(routineInsert.user_id).toBe('user123');
      expect((routineInsert as any).id).toBeUndefined();
      expect((routineInsert as any).created_at).toBeUndefined();
    });
  });

  describe('DatabaseWorkoutInsert', () => {
    it('should include only user_id and specific fields', () => {
      const workoutInsert: DatabaseWorkoutInsert = {
        user_id: 'user123',
        started_at: 1704067200000,
        ended_at: 1704070800000,
        sets: [],
        routine_id: null,
        routine_name: null,
        plan_id: null,
        completion_pct: null,
      };

      expect(workoutInsert.user_id).toBe('user123');
      expect((workoutInsert as any).id).toBeUndefined();
      expect((workoutInsert as any).created_at).toBeUndefined();
    });
  });

  describe('DatabaseFriendshipInsert', () => {
    it('should include only user_id, friend_id, and status', () => {
      const friendshipInsert: DatabaseFriendshipInsert = {
        user_id: 'user1',
        friend_id: 'user2',
        status: 'requested',
      };

      expect(friendshipInsert.user_id).toBe('user1');
      expect(friendshipInsert.friend_id).toBe('user2');
      expect((friendshipInsert as any).id).toBeUndefined();
    });
  });

  describe('DatabasePostInsert', () => {
    it('should include only author_id and specific fields', () => {
      const postInsert: DatabasePostInsert = {
        author_id: 'user123',
        title: 'New Post',
        caption: 'Test caption',
        privacy: 'public',
        duration_sec: 3600,
        completion_pct: 100,
        exercise_count: 5,
        set_count: 20,
        workout_snapshot: null,
      };

      expect(postInsert.author_id).toBe('user123');
      expect((postInsert as any).id).toBeUndefined();
    });
  });

  describe('DatabaseReactionInsert', () => {
    it('should include only post_id, user_id, and emote', () => {
      const reactionInsert: DatabaseReactionInsert = {
        post_id: 'post1',
        user_id: 'user123',
        emote: 'fire',
      };

      expect(reactionInsert.post_id).toBe('post1');
      expect((reactionInsert as any).id).toBeUndefined();
    });
  });

  describe('DatabaseCommentInsert', () => {
    it('should include only post_id, user_id, text, and parent_comment_id', () => {
      const commentInsert: DatabaseCommentInsert = {
        post_id: 'post1',
        user_id: 'user123',
        text: 'Great post!',
        parent_comment_id: null,
      };

      expect(commentInsert.post_id).toBe('post1');
      expect((commentInsert as any).id).toBeUndefined();
    });
  });

  describe('DatabaseNotificationInsert', () => {
    it('should include only user_id and specific fields', () => {
      const notificationInsert: DatabaseNotificationInsert = {
        user_id: 'user123',
        type: 'reaction',
        title: 'New Reaction',
        body: 'Someone reacted to your post',
        post_id: 'post1',
        comment_id: null,
        read_at: null,
      };

      expect(notificationInsert.user_id).toBe('user123');
      expect((notificationInsert as any).id).toBeUndefined();
    });
  });
});

describe('Supabase Types - Update Types', () => {
  describe('DatabaseUserUpdate', () => {
    it('should allow partial updates to user fields', () => {
      const update1: DatabaseUserUpdate = {
        display_name: 'Updated Name',
      };

      const update2: DatabaseUserUpdate = {
        email: 'updated@example.com',
        avatar_url: 'https://example.com/new.jpg',
      };

      const update3: DatabaseUserUpdate = {};

      expect(update1.display_name).toBe('Updated Name');
      expect(update2.email).toBeDefined();
      expect(Object.keys(update3)).toHaveLength(0);
    });
  });

  describe('DatabaseRoutineUpdate', () => {
    it('should allow partial updates to routine fields', () => {
      const update1: DatabaseRoutineUpdate = {
        name: 'Updated Routine',
      };

      const update2: DatabaseRoutineUpdate = {
        exercises: [],
        source_plan_id: 'new_plan',
      };

      expect(update1.name).toBe('Updated Routine');
      expect(update2.source_plan_id).toBe('new_plan');
    });
  });

  describe('DatabaseWorkoutUpdate', () => {
    it('should allow partial updates to workout fields', () => {
      const update1: DatabaseWorkoutUpdate = {
        completion_pct: 75,
      };

      const update2: DatabaseWorkoutUpdate = {
        sets: [],
        ended_at: 1704070800000,
      };

      expect(update1.completion_pct).toBe(75);
      expect(update2.sets).toEqual([]);
    });
  });

  describe('DatabaseFriendshipUpdate', () => {
    it('should allow status updates only', () => {
      const update1: DatabaseFriendshipUpdate = {
        status: 'friends',
      };

      const update2: DatabaseFriendshipUpdate = {};

      expect(update1.status).toBe('friends');
      expect(Object.keys(update2)).toHaveLength(0);
    });
  });

  describe('DatabasePostUpdate', () => {
    it('should allow partial updates to post fields', () => {
      const update1: DatabasePostUpdate = {
        caption: 'Updated caption',
      };

      const update2: DatabasePostUpdate = {
        title: 'New Title',
        like_count: 100,
      };

      expect(update1.caption).toBe('Updated caption');
      expect(update2.like_count).toBe(100);
    });
  });

  describe('DatabaseCommentUpdate', () => {
    it('should allow text updates only', () => {
      const update1: DatabaseCommentUpdate = {
        text: 'Updated comment',
      };

      const update2: DatabaseCommentUpdate = {};

      expect(update1.text).toBe('Updated comment');
      expect(Object.keys(update2)).toHaveLength(0);
    });
  });

  describe('DatabaseNotificationUpdate', () => {
    it('should allow read_at updates only', () => {
      const update1: DatabaseNotificationUpdate = {
        read_at: '2024-01-02T00:00:00.000Z',
      };

      const update2: DatabaseNotificationUpdate = {};

      expect(update1.read_at).toBe('2024-01-02T00:00:00.000Z');
      expect(Object.keys(update2)).toHaveLength(0);
    });
  });
});

describe('Supabase Types - Mapper Functions', () => {
  describe('snakeToCamel', () => {
    it('should convert simple snake_case to camelCase', () => {
      const result = snakeToCamel({
        user_id: '123',
        display_name: 'Test',
      });

      expect(result).toEqual({
        userId: '123',
        displayName: 'Test',
      });
    });

    it('should handle multiple underscores', () => {
      const result = snakeToCamel({
        source_plan_id: 'plan123',
        source_plan_category: 'strength',
      });

      expect(result).toEqual({
        sourcePlanId: 'plan123',
        sourcePlanCategory: 'strength',
      });
    });

    it('should handle keys without underscores', () => {
      const result = snakeToCamel({
        id: '123',
        email: 'test@example.com',
      });

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
      });
    });

    it('should handle empty objects', () => {
      const result = snakeToCamel({});
      expect(result).toEqual({});
    });

    it('should preserve values of all types', () => {
      const input = {
        string_val: 'text',
        number_val: 123,
        bool_val: true,
        null_val: null,
        array_val: [1, 2, 3],
        object_val: { nested: 'value' },
      };

      const result = snakeToCamel(input);

      expect(result).toEqual({
        stringVal: 'text',
        numberVal: 123,
        boolVal: true,
        nullVal: null,
        arrayVal: [1, 2, 3],
        objectVal: { nested: 'value' },
      });
    });
  });

  describe('camelToSnake', () => {
    it('should convert simple camelCase to snake_case', () => {
      const result = camelToSnake({
        userId: '123',
        displayName: 'Test',
      });

      expect(result).toEqual({
        user_id: '123',
        display_name: 'Test',
      });
    });

    it('should handle multiple uppercase letters', () => {
      const result = camelToSnake({
        sourcePlanId: 'plan123',
        sourcePlanCategory: 'strength',
      });

      expect(result).toEqual({
        source_plan_id: 'plan123',
        source_plan_category: 'strength',
      });
    });

    it('should handle keys without uppercase letters', () => {
      const result = camelToSnake({
        id: '123',
        email: 'test@example.com',
      });

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
      });
    });

    it('should handle empty objects', () => {
      const result = camelToSnake({});
      expect(result).toEqual({});
    });

    it('should preserve values of all types', () => {
      const input = {
        stringVal: 'text',
        numberVal: 123,
        boolVal: true,
        nullVal: null,
        arrayVal: [1, 2, 3],
        objectVal: { nested: 'value' },
      };

      const result = camelToSnake(input);

      expect(result).toEqual({
        string_val: 'text',
        number_val: 123,
        bool_val: true,
        null_val: null,
        array_val: [1, 2, 3],
        object_val: { nested: 'value' },
      });
    });
  });

  describe('mapDatabaseUser', () => {
    // Helper to create a valid DatabaseUser fixture with all required fields
    const createDbUser = (overrides: Partial<DatabaseUser> = {}): DatabaseUser => ({
      id: 'user123',
      email: 'test@example.com',
      display_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      total_xp: 0,
      current_level: 1,
      xp_to_next_level: 100,
      level_up_celebration_shown: null,
      current_streak: 0,
      longest_streak: 0,
      last_workout_date: null,
      workout_calendar: [],
      forge_tokens: 0,
      tokens_earned_total: 0,
      tokens_spent_total: 0,
      milestones_completed: [],
      subscription_tier: 'basic',
      avatar_art_style: null,
      avatar_growth_stage: null,
      avatar_height_scale: null,
      avatar_cosmetics: null,
      total_volume_kg: null,
      total_sets: null,
      hangout_room_id: null,
      hangout_room_role: null,
      ...overrides,
    });

    it('should map DatabaseUser to camelCase format', () => {
      const dbUser = createDbUser();

      const mapped = mapDatabaseUser(dbUser);

      expect(mapped).toEqual(
        expect.objectContaining({
          id: 'user123',
          email: 'test@example.com',
          displayName: 'Test User',
          avatarUrl: 'https://example.com/avatar.jpg',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          subscriptionTier: 'basic',
        })
      );
    });

    it('should handle null values', () => {
      const dbUser = createDbUser({
        id: 'user456',
        email: 'nulls@example.com',
        display_name: null,
        avatar_url: null,
      });

      const mapped = mapDatabaseUser(dbUser);

      expect(mapped.displayName).toBeNull();
      expect(mapped.avatarUrl).toBeNull();
    });
  });

  describe('mapDatabaseRoutine', () => {
    it('should map DatabaseRoutine to camelCase format', () => {
      const dbRoutine: DatabaseRoutine = {
        id: 'routine1',
        user_id: 'user123',
        name: 'Push Day',
        exercises: [
          {
            id: 'ex1',
            exerciseId: 'bench',
          },
        ],
        source_plan_id: 'plan123',
        source_plan_category: 'strength',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabaseRoutine(dbRoutine);

      expect(mapped).toEqual({
        id: 'routine1',
        userId: 'user123',
        name: 'Push Day',
        exercises: [
          {
            id: 'ex1',
            exerciseId: 'bench',
          },
        ],
        sourcePlanId: 'plan123',
        sourcePlanCategory: 'strength',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle null source fields', () => {
      const dbRoutine: DatabaseRoutine = {
        id: 'routine2',
        user_id: 'user123',
        name: 'Custom Routine',
        exercises: [],
        source_plan_id: null,
        source_plan_category: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabaseRoutine(dbRoutine);

      expect(mapped.sourcePlanId).toBeNull();
      expect(mapped.sourcePlanCategory).toBeNull();
    });
  });

  describe('mapDatabaseWorkout', () => {
    it('should map DatabaseWorkout to camelCase format', () => {
      const dbWorkout: DatabaseWorkout = {
        id: 'workout1',
        user_id: 'user123',
        started_at: 1704067200000,
        ended_at: 1704070800000,
        sets: [
          {
            id: 'set1',
            exerciseId: 'bench',
            weightKg: 100,
            reps: 5,
            timestampMs: 1704067300000,
          },
        ],
        routine_id: 'routine1',
        routine_name: 'Push Day',
        plan_id: 'plan123',
        completion_pct: 100,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabaseWorkout(dbWorkout);

      expect(mapped).toEqual({
        id: 'workout1',
        userId: 'user123',
        startedAt: 1704067200000,
        endedAt: 1704070800000,
        sets: [
          {
            id: 'set1',
            exerciseId: 'bench',
            weightKg: 100,
            reps: 5,
            timestampMs: 1704067300000,
          },
        ],
        routineId: 'routine1',
        routineName: 'Push Day',
        planId: 'plan123',
        completionPct: 100,
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle null optional fields', () => {
      const dbWorkout: DatabaseWorkout = {
        id: 'workout2',
        user_id: 'user123',
        started_at: 1704067200000,
        ended_at: 1704070800000,
        sets: [],
        routine_id: null,
        routine_name: null,
        plan_id: null,
        completion_pct: null,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabaseWorkout(dbWorkout);

      expect(mapped.routineId).toBeNull();
      expect(mapped.routineName).toBeNull();
      expect(mapped.planId).toBeNull();
      expect(mapped.completionPct).toBeNull();
    });
  });

  describe('mapDatabaseFriendship', () => {
    it('should map DatabaseFriendship to camelCase format', () => {
      const dbFriendship: DatabaseFriendship = {
        id: 'friendship1',
        user_id: 'user1',
        friend_id: 'user2',
        status: 'friends',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabaseFriendship(dbFriendship);

      expect(mapped).toEqual({
        id: 'friendship1',
        userId: 'user1',
        friendId: 'user2',
        status: 'friends',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('mapDatabasePost', () => {
    it('should map DatabasePost to camelCase format', () => {
      const dbPost: DatabasePost = {
        id: 'post1',
        author_id: 'user123',
        title: 'Great Workout',
        caption: 'Hit a PR',
        privacy: 'public',
        duration_sec: 3600,
        completion_pct: 100,
        exercise_count: 5,
        set_count: 20,
        workout_snapshot: {
          routineName: 'Push Day',
          topLines: [
            {
              exerciseName: 'Bench',
              bestSet: { weightLabel: '100 kg', reps: 5 },
            },
          ],
        },
        like_count: 10,
        comment_count: 3,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabasePost(dbPost);

      expect(mapped).toEqual({
        id: 'post1',
        authorId: 'user123',
        title: 'Great Workout',
        caption: 'Hit a PR',
        privacy: 'public',
        durationSec: 3600,
        completionPct: 100,
        exerciseCount: 5,
        setCount: 20,
        workoutSnapshot: {
          routineName: 'Push Day',
          topLines: [
            {
              exerciseName: 'Bench',
              bestSet: { weightLabel: '100 kg', reps: 5 },
            },
          ],
        },
        likeCount: 10,
        commentCount: 3,
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle null optional fields', () => {
      const dbPost: DatabasePost = {
        id: 'post2',
        author_id: 'user123',
        title: null,
        caption: null,
        privacy: 'friends',
        duration_sec: null,
        completion_pct: null,
        exercise_count: null,
        set_count: null,
        workout_snapshot: null,
        like_count: 0,
        comment_count: 0,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabasePost(dbPost);

      expect(mapped.title).toBeNull();
      expect(mapped.workoutSnapshot).toBeNull();
    });
  });

  describe('mapDatabaseReaction', () => {
    it('should map DatabaseReaction to camelCase format', () => {
      const dbReaction: DatabaseReaction = {
        id: 'reaction1',
        post_id: 'post1',
        user_id: 'user123',
        emote: 'fire',
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabaseReaction(dbReaction);

      expect(mapped).toEqual({
        id: 'reaction1',
        postId: 'post1',
        userId: 'user123',
        emote: 'fire',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('mapDatabaseComment', () => {
    it('should map DatabaseComment to camelCase format', () => {
      const dbComment: DatabaseComment = {
        id: 'comment1',
        post_id: 'post1',
        user_id: 'user123',
        text: 'Great workout!',
        parent_comment_id: null,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabaseComment(dbComment);

      expect(mapped).toEqual({
        id: 'comment1',
        postId: 'post1',
        userId: 'user123',
        text: 'Great workout!',
        parentCommentId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle parent_comment_id for replies', () => {
      const dbComment: DatabaseComment = {
        id: 'comment2',
        post_id: 'post1',
        user_id: 'user456',
        text: 'Thanks!',
        parent_comment_id: 'comment1',
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabaseComment(dbComment);

      expect(mapped.parentCommentId).toBe('comment1');
    });
  });

  describe('mapDatabaseNotification', () => {
    it('should map DatabaseNotification to camelCase format', () => {
      const dbNotification: DatabaseNotification = {
        id: 'notif1',
        user_id: 'user123',
        type: 'reaction',
        title: 'New reaction',
        body: 'Someone reacted to your post',
        post_id: 'post1',
        comment_id: null,
        read_at: null,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabaseNotification(dbNotification);

      expect(mapped).toEqual({
        id: 'notif1',
        userId: 'user123',
        type: 'reaction',
        title: 'New reaction',
        body: 'Someone reacted to your post',
        postId: 'post1',
        commentId: null,
        readAt: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle read_at for read notifications', () => {
      const dbNotification: DatabaseNotification = {
        id: 'notif2',
        user_id: 'user123',
        type: 'comment',
        title: 'New comment',
        body: 'Someone commented',
        post_id: 'post1',
        comment_id: 'comment1',
        read_at: '2024-01-02T00:00:00.000Z',
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mapped = mapDatabaseNotification(dbNotification);

      expect(mapped.readAt).toBe('2024-01-02T00:00:00.000Z');
    });
  });
});

describe('Supabase Types - Re-exports', () => {
  it('should re-export JsonWorkoutSet as WorkoutSet', () => {
    const set1: JsonWorkoutSet = { id: '1', exerciseId: 'bench', weightKg: 100, reps: 5, timestampMs: 1 };
    const set2: WorkoutSet = { id: '2', exerciseId: 'squat', weightKg: 120, reps: 3, timestampMs: 2 };
    expect(set1).toBeDefined();
    expect(set2).toBeDefined();
  });

  it('should re-export JsonRoutineExercise as RoutineExercise', () => {
    const exercise1: JsonRoutineExercise = { id: '1', exerciseId: 'bench' };
    const exercise2: RoutineExercise = { id: '2', exerciseId: 'squat' };
    expect(exercise1).toBeDefined();
    expect(exercise2).toBeDefined();
  });

  it('should re-export JsonWorkoutSnapshot as WorkoutSnapshot', () => {
    const snapshot1: JsonWorkoutSnapshot = { routineName: 'Test', topLines: [] };
    const snapshot2: WorkoutSnapshot = { topLines: [] };
    expect(snapshot1).toBeDefined();
    expect(snapshot2).toBeDefined();
  });

  it('should re-export JsonTopLine as TopLine', () => {
    const topLine1: JsonTopLine = { exerciseName: 'Bench' };
    const topLine2: TopLine = { exerciseName: 'Squat' };
    expect(topLine1).toBeDefined();
    expect(topLine2).toBeDefined();
  });
});

describe('Supabase Types - Database Type Structure', () => {
  it('should have Tables type with all database tables', () => {
    type Tables = Database['public']['Tables'];

    // Verify all expected tables exist
    const tables: (keyof Tables)[] = [
      'users',
      'routines',
      'workouts',
      'friendships',
      'posts',
      'reactions',
      'comments',
      'notifications',
    ];

    expect(tables).toHaveLength(8);
  });

  it('should have Row, Insert, Update types for each table', () => {
    type UsersTable = Database['public']['Tables']['users'];

    const usersRow: UsersTable['Row'] = {
      id: 'user1',
      email: 'test@example.com',
      display_name: null,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };

    const usersInsert: UsersTable['Insert'] = {
      email: 'new@example.com',
      display_name: null,
      avatar_url: null,
    };

    const usersUpdate: UsersTable['Update'] = {};

    expect(usersRow.id).toBe('user1');
    expect(usersInsert.email).toBe('new@example.com');
    expect(Object.keys(usersUpdate)).toHaveLength(0);
  });

  it('should have reactions Update type as never (immutable)', () => {
    type ReactionsTable = Database['public']['Tables']['reactions'];

    const reactionsUpdate: ReactionsTable['Update'] = {} as never;

    expect(reactionsUpdate).toEqual({});
  });
});

describe('Supabase Types - Edge Cases and Error Handling', () => {
  describe('Null Handling', () => {
    it('should handle null values in all nullable fields', () => {
      const nullWorkout: DatabaseWorkout = {
        id: 'null-workout',
        user_id: 'user1',
        started_at: 0,
        ended_at: 0,
        sets: [],
        routine_id: null,
        routine_name: null,
        plan_id: null,
        completion_pct: null,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(nullWorkout.routine_id).toBeNull();
      expect(nullWorkout.routine_name).toBeNull();
      expect(nullWorkout.plan_id).toBeNull();
      expect(nullWorkout.completion_pct).toBeNull();
    });
  });

  describe('Empty Arrays', () => {
    it('should handle empty arrays in JSONB fields', () => {
      const emptyRoutine: DatabaseRoutine = {
        id: 'empty-routine',
        user_id: 'user1',
        name: 'Empty',
        exercises: [],
        source_plan_id: null,
        source_plan_category: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const emptySnapshot: JsonWorkoutSnapshot = {
        routineName: 'Empty Workout',
        topLines: [],
      };

      expect(emptyRoutine.exercises).toEqual([]);
      expect(emptySnapshot.topLines).toEqual([]);
    });
  });

  describe('Mapper Function Edge Cases', () => {
    it('should handle objects with only snake_case keys', () => {
      const result = snakeToCamel({
        user_id: '123',
        created_at: '2024-01-01',
      });

      expect(result).toEqual({
        userId: '123',
        createdAt: '2024-01-01',
      });
    });

    it('should handle objects with only camelCase keys', () => {
      const result = camelToSnake({
        userId: '123',
        createdAt: '2024-01-01',
      });

      expect(result).toEqual({
        user_id: '123',
        created_at: '2024-01-01',
      });
    });

    it('should handle leading/trailing underscores correctly', () => {
      const result = snakeToCamel({
        _private_field: 'value',
        trailing_underscore_: 'value2',
      });

      // Leading underscores are removed (regex matches _[a-z] and converts to uppercase)
      // Trailing underscores are preserved (no [a-z] letter after them)
      expect(result).toEqual({
        PrivateField: 'value',
        trailingUnderscore_: 'value2',
      });
    });

    it('should handle consecutive underscores', () => {
      const result = snakeToCamel({
        multiple__underscores: 'value',
      });

      expect(result).toEqual({
        multiple_Underscores: 'value',
      });
    });

    it('should handle numeric suffixes in camelCase', () => {
      const result = camelToSnake({
        value1: 1,
        value2Test: 2,
      });

      expect(result).toEqual({
        value1: 1,
        value2_test: 2,
      });
    });
  });

  describe('Timestamp Handling', () => {
    it('should accept millisecond timestamps for workouts', () => {
      const timestamp = Date.now();
      const workout: DatabaseWorkout = {
        id: 'timestamp-test',
        user_id: 'user1',
        started_at: timestamp,
        ended_at: timestamp + 3600000,
        sets: [],
        routine_id: null,
        routine_name: null,
        plan_id: null,
        completion_pct: null,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      expect(workout.started_at).toBe(timestamp);
      expect(workout.ended_at).toBe(timestamp + 3600000);
    });

    it('should accept ISO 8601 datetime strings', () => {
      const isoDate = '2024-01-15T12:30:45.123Z';
      const user: DatabaseUser = {
        id: 'user1',
        email: 'test@example.com',
        display_name: null,
        avatar_url: null,
        created_at: isoDate,
        updated_at: isoDate,
      };

      expect(user.created_at).toBe(isoDate);
      expect(user.updated_at).toBe(isoDate);
    });
  });

  describe('Type Safety Validation', () => {
    it('should enforce friend status enum values', () => {
      const validStatuses: DatabaseFriendStatus[] = ['none', 'requested', 'pending', 'friends', 'blocked'];

      validStatuses.forEach((status) => {
        const friendship: DatabaseFriendship = {
          id: 'test',
          user_id: 'user1',
          friend_id: 'user2',
          status,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        };

        expect(friendship.status).toBe(status);
      });
    });

    it('should enforce privacy level enum values', () => {
      const validLevels: DatabasePrivacyLevel[] = ['public', 'friends'];

      validLevels.forEach((level) => {
        const post: DatabasePost = {
          id: 'test',
          author_id: 'user1',
          title: null,
          caption: null,
          privacy: level,
          duration_sec: null,
          completion_pct: null,
          exercise_count: null,
          set_count: null,
          workout_snapshot: null,
          like_count: 0,
          comment_count: 0,
          created_at: '2024-01-01T00:00:00.000Z',
        };

        expect(post.privacy).toBe(level);
      });
    });

    it('should enforce emote enum values', () => {
      const validEmotes: DatabaseEmoteId[] = ['like', 'fire', 'skull', 'crown', 'bolt', 'clap'];

      validEmotes.forEach((emote) => {
        const reaction: DatabaseReaction = {
          id: 'test',
          post_id: 'post1',
          user_id: 'user1',
          emote,
          created_at: '2024-01-01T00:00:00.000Z',
        };

        expect(reaction.emote).toBe(emote);
      });
    });

    it('should enforce notification type enum values', () => {
      const validTypes: DatabaseNotificationType[] = [
        'reaction',
        'comment',
        'friend_request',
        'friend_accept',
        'message',
      ];

      validTypes.forEach((type) => {
        const notification: DatabaseNotification = {
          id: 'test',
          user_id: 'user1',
          type,
          title: 'Test',
          body: 'Test body',
          post_id: null,
          comment_id: null,
          read_at: null,
          created_at: '2024-01-01T00:00:00.000Z',
        };

        expect(notification.type).toBe(type);
      });
    });
  });
});

describe('Supabase Types - Complex Scenarios', () => {
  describe('Nested JSONB Structures', () => {
    it('should handle deeply nested workout snapshots', () => {
      const complexSnapshot: JsonWorkoutSnapshot = {
        routineName: 'Full Body Split',
        topLines: [
          {
            exerciseName: 'Bench Press',
            bestSet: {
              weightLabel: '100 kg',
              reps: 5,
              e1rmLabel: '117 kg',
            },
          },
          {
            exerciseName: 'Squat',
            bestSet: {
              weightLabel: '140 kg',
              reps: 3,
              e1rmLabel: '154 kg',
            },
          },
          {
            exerciseName: 'Deadlift',
            bestSet: {
              weightLabel: '160 kg',
              reps: 1,
              e1rmLabel: '165 kg',
            },
          },
          {
            exerciseName: 'OHP',
            bestSet: {
              weightLabel: '60 kg',
              reps: 8,
              e1rmLabel: '76 kg',
            },
          },
        ],
      };

      expect(complexSnapshot.topLines).toHaveLength(4);
      expect(complexSnapshot.topLines[0].bestSet?.e1rmLabel).toBe('117 kg');
    });
  });

  describe('Complete Database Entity Mapping', () => {
    it('should map a complete social post workflow', () => {
      // User creates a workout
      const workout: DatabaseWorkout = {
        id: 'workout1',
        user_id: 'user123',
        started_at: 1704067200000,
        ended_at: 1704070800000,
        sets: [
          {
            id: 'set1',
            exerciseId: 'bench',
            weightKg: 100,
            reps: 5,
            timestampMs: 1704067300000,
          },
        ],
        routine_id: 'routine1',
        routine_name: 'Push Day',
        plan_id: null,
        completion_pct: 100,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      // User posts about the workout
      const post: DatabasePost = {
        id: 'post1',
        author_id: 'user123',
        title: 'New PR!',
        caption: 'Finally hit 100kg on bench',
        privacy: 'public',
        duration_sec: 3600,
        completion_pct: 100,
        exercise_count: 1,
        set_count: 1,
        workout_snapshot: {
          routineName: 'Push Day',
          topLines: [
            {
              exerciseName: 'Bench Press',
              bestSet: {
                weightLabel: '100 kg',
                reps: 5,
                e1rmLabel: '117 kg',
              },
            },
          ],
        },
        like_count: 0,
        comment_count: 0,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      // Friend reacts to the post
      const reaction: DatabaseReaction = {
        id: 'reaction1',
        post_id: 'post1',
        user_id: 'user456',
        emote: 'fire',
        created_at: '2024-01-01T00:00:00.000Z',
      };

      // Another friend comments
      const comment: DatabaseComment = {
        id: 'comment1',
        post_id: 'post1',
        user_id: 'user789',
        text: 'Great job! Keep it up!',
        parent_comment_id: null,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      // Original author gets notified
      const notification: DatabaseNotification = {
        id: 'notif1',
        user_id: 'user123',
        type: 'reaction',
        title: 'New reaction',
        body: 'user456 reacted to your post',
        post_id: 'post1',
        comment_id: null,
        read_at: null,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      // Verify all entities are properly typed
      expect(workout.id).toBe('workout1');
      expect(post.workout_snapshot?.topLines[0].bestSet?.weightLabel).toBe('100 kg');
      expect(reaction.emote).toBe('fire');
      expect(comment.text).toBe('Great job! Keep it up!');
      expect(notification.type).toBe('reaction');
    });
  });

  describe('Friend Relationship States', () => {
    it('should model complete friend request flow', () => {
      const requested: DatabaseFriendship = {
        id: 'f1',
        user_id: 'user1',
        friend_id: 'user2',
        status: 'requested',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const pending: DatabaseFriendship = {
        id: 'f2',
        user_id: 'user2',
        friend_id: 'user1',
        status: 'pending',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const friends: DatabaseFriendship = {
        id: 'f1',
        user_id: 'user1',
        friend_id: 'user2',
        status: 'friends',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T01:00:00.000Z',
      };

      expect(requested.status).toBe('requested');
      expect(pending.status).toBe('pending');
      expect(friends.status).toBe('friends');
    });
  });
});

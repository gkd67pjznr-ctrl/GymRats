// src/lib/liveWorkoutTogether/types.ts
// Type definitions for the Live Workout Together feature

import type { LoggedSet } from '../loggerTypes';
import type { EmoteId } from '../socialModel';

// ============================================================================
// Core Session Types
// ============================================================================

/**
 * Live workout session modes
 * - 'shared': Everyone works out independently but sees each other's progress
 * - 'guided': One leader sets the structure, others follow along
 */
export type LiveSessionMode = 'shared' | 'guided';

/**
 * Live workout session status
 */
export type LiveSessionStatus = 'pending' | 'active' | 'ended';

/**
 * Live workout session
 * Represents a shared workout session that multiple users can join
 */
export interface LiveSession {
  id: string;
  hostId: string; // User ID of the session creator
  mode: LiveSessionMode;
  status: LiveSessionStatus;
  name?: string; // Optional session name
  theme?: string; // Visual theme for the session
  participants: string[]; // Array of user IDs
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  currentExerciseId?: string; // Current exercise in guided mode
  plannedExercises?: {
    exerciseId: string;
    targetSets: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
  }[]; // Optional workout plan for guided mode
}

// ============================================================================
// Participant Types
// ============================================================================

/**
 * Participant status in a live session
 */
export type ParticipantStatus = 'idle' | 'resting' | 'working_out' | 'finished';

/**
 * Participant data in a live session
 * Tracks individual user's state within the shared workout
 */
export interface LiveSessionParticipant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  status: ParticipantStatus;
  joinedAt: number;
  lastActiveAt: number;
  currentExerciseId?: string;
  setsCompleted: number;
  // For guided mode
  isLeader?: boolean;
  readyForNext?: boolean;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Types of events that can occur in a live session
 */
export type LiveSessionEventType =
  | 'session_created'
  | 'session_started'
  | 'session_ended'
  | 'user_joined'
  | 'user_left'
  | 'set_completed'
  | 'exercise_changed'
  | 'reaction'
  | 'status_update'
  | 'ready_status_changed'
  | 'message';

/**
 * Base event structure for all live session events
 */
export interface LiveSessionEventBase {
  sessionId: string;
  userId: string;
  type: LiveSessionEventType;
  timestamp: number;
}

/**
 * Event for when a user completes a set
 */
export interface LiveSetCompletedEvent extends LiveSessionEventBase {
  type: 'set_completed';
  data: {
    set: LoggedSet;
    exerciseName: string;
    e1rmKg?: number; // Estimated 1-rep max
    isPR?: boolean; // Whether this is a personal record
  };
}

/**
 * Event for when the exercise changes (in guided mode)
 */
export interface LiveExerciseChangedEvent extends LiveSessionEventBase {
  type: 'exercise_changed';
  data: {
    exerciseId: string;
    exerciseName: string;
    targetSets?: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
  };
}

/**
 * Event for user reactions/emotes
 */
export interface LiveReactionEvent extends LiveSessionEventBase {
  type: 'reaction';
  data: {
    targetUserId: string; // Who the reaction is for
    emote: EmoteId;
    targetSetId?: string; // Optional: reaction to a specific set
  };
}

/**
 * Event for participant status updates
 */
export interface LiveStatusUpdateEvent extends LiveSessionEventBase {
  type: 'status_update';
  data: {
    status: ParticipantStatus;
    currentExerciseId?: string;
  };
}

/**
 * Event for ready status changes (in guided mode)
 */
export interface LiveReadyStatusEvent extends LiveSessionEventBase {
  type: 'ready_status_changed';
  data: {
    isReady: boolean;
  };
}

/**
 * Event for chat messages
 */
export interface LiveMessageEvent extends LiveSessionEventBase {
  type: 'message';
  data: {
    message: string;
  };
}

/**
 * Union type for all live session events
 */
export type LiveSessionEvent =
  | LiveSessionEventBase
  | LiveSetCompletedEvent
  | LiveExerciseChangedEvent
  | LiveReactionEvent
  | LiveStatusUpdateEvent
  | LiveReadyStatusEvent
  | LiveMessageEvent;

// ============================================================================
// Real-time State Types
// ============================================================================

/**
 * Real-time state of a live session
 * This is the state that gets synchronized across all participants
 */
export interface LiveSessionState {
  session: LiveSession;
  participants: Record<string, LiveSessionParticipant>; // userId -> participant
  recentEvents: LiveSessionEvent[]; // Recent events for late joiners
  // For guided mode
  currentExerciseStartTime?: number;
  currentExerciseIndex?: number;
}

/**
 * Local participant state (client-side only)
 * Tracks UI state and preferences for the current user
 */
export interface LocalParticipantState {
  isReady: boolean;
  showReactionPalette: boolean;
  showParticipantList: boolean;
  mutedParticipants: string[]; // User IDs of muted participants
  collapsedSections: Record<string, boolean>;
}

// ============================================================================
// UI Display Types
// ============================================================================

/**
 * Display-ready set data for the live feed
 */
export interface LiveSetDisplayItem {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  exerciseId: string;
  exerciseName: string;
  setType: 'warmup' | 'working';
  weightKg: number;
  reps: number;
  timestampMs: number;
  e1rmKg?: number;
  isPR?: boolean;
  intensityScore?: number; // 0-1000 gymrank score
}

/**
 * Display-ready reaction data
 */
export interface LiveReactionDisplayItem {
  id: string;
  fromUserId: string;
  fromDisplayName: string;
  fromAvatarUrl?: string;
  toUserId: string;
  emote: EmoteId;
  targetSetId?: string;
  timestampMs: number;
}

/**
 * Summary statistics for a participant in the session
 */
export interface ParticipantSessionSummary {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  setsCompleted: number;
  totalVolumeKg: number; // Sum of weight * reps for all sets
  exercisesCompleted: number;
  prCount: number;
  joinedAt: number;
  leftAt?: number;
}

/**
 * Complete summary of a live session
 */
export interface LiveSessionSummary {
  session: LiveSession;
  participantSummaries: ParticipantSessionSummary[];
  totalSets: number;
  totalVolumeKg: number;
  durationMs: number;
  exercises: string[]; // Array of exercise IDs
}

// ============================================================================
// Invitation Types
// ============================================================================

/**
 * Invitation to join a live session
 */
export interface LiveSessionInvitation {
  id: string;
  sessionId: string;
  sessionName?: string;
  hostId: string;
  hostDisplayName: string;
  hostAvatarUrl?: string;
  mode: LiveSessionMode;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

/**
 * Invitation notification for display
 */
export interface LiveSessionInvitationNotification {
  invitation: LiveSessionInvitation;
  title: string;
  body: string;
  actionLabel: string;
}

// ============================================================================
// Store State Types
// ============================================================================

/**
 * Zustand store state for live workout together feature
 */
export interface LiveWorkoutTogetherStoreState {
  // Active session (if currently in one)
  activeSession: LiveSessionState | null;

  // Local UI state
  localState: LocalParticipantState;

  // Invitations
  pendingInvitations: LiveSessionInvitation[];

  // Connection status
  isConnected: boolean;
  connectionError?: string;

  // Actions would be defined in the store implementation
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Response for creating a live session
 */
export interface CreateLiveSessionResponse {
  success: boolean;
  session: LiveSession;
  error?: string;
}

/**
 * Response for joining a live session
 */
export interface JoinLiveSessionResponse {
  success: boolean;
  session?: LiveSession;
  participant?: LiveSessionParticipant;
  error?: string;
}

/**
 * Response for leaving a live session
 */
export interface LeaveLiveSessionResponse {
  success: boolean;
  error?: string;
}

/**
 * Response for sending a live event
 */
export interface SendLiveEventResponse {
  success: boolean;
  event?: LiveSessionEvent;
  error?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Parameters for creating a new live session
 */
export interface CreateLiveSessionParams {
  mode: LiveSessionMode;
  name?: string;
  theme?: string;
  participantIds?: string[]; // Initial participants to invite
  plannedExercises?: {
    exerciseId: string;
    targetSets: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
  }[];
}

/**
 * Parameters for joining a live session
 */
export interface JoinLiveSessionParams {
  sessionId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

/**
 * Parameters for sending a reaction
 */
export interface SendReactionParams {
  sessionId: string;
  userId: string;
  targetUserId: string;
  emote: EmoteId;
  targetSetId?: string;
}

/**
 * Parameters for changing exercise (leader only in guided mode)
 */
export interface ChangeExerciseParams {
  sessionId: string;
  userId: string; // Must be the leader
  exerciseId: string;
  exerciseName: string;
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
}

/**
 * Parameters for updating participant status
 */
export interface UpdateParticipantStatusParams {
  sessionId: string;
  userId: string;
  status: ParticipantStatus;
  currentExerciseId?: string;
}

/**
 * Parameters for updating ready status (guided mode)
 */
export interface UpdateReadyStatusParams {
  sessionId: string;
  userId: string;
  isReady: boolean;
}

/**
 * Parameters for completing a set in a live session
 */
export interface CompleteLiveSetParams {
  sessionId: string;
  userId: string;
  set: LoggedSet;
  exerciseName: string;
  e1rmKg?: number;
  isPR?: boolean;
}

// ============================================================================
// Presence Types
// ============================================================================

/**
 * Presence data for friends who are working out
 * Used for passive presence feature
 */
export interface WorkoutPresence {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isInLiveSession: boolean;
  liveSessionId?: string;
  currentExerciseId?: string;
  currentExerciseName?: string;
  workoutStartedAt: number;
  lastSetCompletedAt?: number;
  status: ParticipantStatus;
}

/**
 * Quick reaction for passive presence
 * Lightweight emote sent to a friend's workout
 */
export interface QuickReaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  emote: EmoteId;
  timestamp: number;
  setId?: string; // Optional: reaction to a specific set
}

// ============================================================================
// Subscription Types
// ============================================================================

/**
 * Subscription callback for live session events
 */
export type LiveSessionEventCallback = (event: LiveSessionEvent) => void;

/**
 * Subscription callback for session state changes
 */
export type LiveSessionStateCallback = (state: LiveSessionState) => void;

/**
 * Subscription callback for participant changes
 */
export type ParticipantChangeCallback = (participant: LiveSessionParticipant) => void;

/**
 * Unsubscribe function type
 */
export type Unsubscribe = () => void;

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error codes for live workout together feature
 */
export type LiveWorkoutTogetherErrorCode =
  | 'session_not_found'
  | 'session_ended'
  | 'session_full'
  | 'not_participant'
  | 'not_leader'
  | 'invalid_mode'
  | 'already_in_session'
  | 'network_error'
  | 'permission_denied'
  | 'invalid_exercise'
  | 'rate_limited';

/**
 * Error object for live workout together feature
 */
export interface LiveWorkoutTogetherError {
  code: LiveWorkoutTogetherErrorCode;
  message: string;
  details?: any;
}


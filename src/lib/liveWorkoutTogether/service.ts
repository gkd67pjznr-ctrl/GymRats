// src/lib/liveWorkoutTogether/service.ts
// Live workout service for real-time session management and presence tracking

import { supabase } from "../supabase/client";
import type {
  LiveSession,
  LiveSessionParticipant,
  LiveSessionEvent,
  LiveSetCompletedEvent,
  LiveExerciseChangedEvent,
  LiveReactionEvent,
  LiveStatusUpdateEvent,
  LiveReadyStatusEvent,
  LiveMessageEvent,
  LiveSessionSummary,
  ParticipantSessionSummary,
  LiveSessionInvitation,
  WorkoutPresence,
  QuickReaction,
  CreateLiveSessionParams,
  JoinLiveSessionParams,
  CompleteLiveSetParams,
  ChangeExerciseParams,
  SendReactionParams,
  UpdateParticipantStatusParams,
  UpdateReadyStatusParams,
} from "./types";
import { getUser } from "../stores/authStore";
import { logError } from "../errorHandler";
import { uid } from "../uid";
import { EXERCISES_V1 } from "../../data/exercises";

// ============================================================================
// Session Management
// ============================================================================

/**
 * Create a new live workout session
 */
export async function createLiveSession(
  params: CreateLiveSessionParams
): Promise<{ success: boolean; data?: LiveSession; error?: string }> {
  const user = getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();
    const sessionId = uid();

    const { data, error } = await supabase
      .from("live_sessions")
      .insert({
        id: sessionId,
        host_id: user.id,
        mode: params.mode,
        status: "pending" as const,
        name: params.name,
        theme: params.theme,
        participants: params.participantIds || [user.id],
        created_at: now,
        started_at: null,
        ended_at: null,
        current_exercise_id: null,
        planned_exercises: params.plannedExercises,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return { success: false, error: "Failed to create session" };
    }

    const session: LiveSession = {
      id: data.id,
      hostId: data.host_id,
      mode: data.mode as LiveSessionMode,
      status: data.status as LiveSessionStatus,
      name: data.name || undefined,
      theme: data.theme || undefined,
      participants: data.participants || [],
      createdAt: data.created_at,
      startedAt: data.started_at || undefined,
      endedAt: data.ended_at || undefined,
      currentExerciseId: data.current_exercise_id || undefined,
      plannedExercises: data.planned_exercises || undefined,
    };

    return { success: true, data: session };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.createLiveSession",
      error: err,
      userMessage: "Failed to create live workout session",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Start a live workout session (transition from pending to active)
 */
export async function startLiveSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const user = getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();

    // Verify user is the host
    const { data: sessionData, error: fetchError } = await supabase
      .from("live_sessions")
      .select("host_id")
      .eq("id", sessionId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (sessionData?.host_id !== user.id) {
      return { success: false, error: "Only the host can start the session" };
    }

    const { error } = await supabase
      .from("live_sessions")
      .update({
        status: "active" as const,
        started_at: now,
      })
      .eq("id", sessionId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.startLiveSession",
      error: err,
      userMessage: "Failed to start live workout session",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * End a live workout session
 */
export async function endLiveSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const user = getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();

    // Verify user is the host
    const { data: sessionData, error: fetchError } = await supabase
      .from("live_sessions")
      .select("host_id")
      .eq("id", sessionId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (sessionData?.host_id !== user.id) {
      return { success: false, error: "Only the host can end the session" };
    }

    const { error } = await supabase
      .from("live_sessions")
      .update({
        status: "ended" as const,
        ended_at: now,
      })
      .eq("id", sessionId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.endLiveSession",
      error: err,
      userMessage: "Failed to end live workout session",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Join a live workout session
 */
export async function joinLiveSession(
  params: JoinLiveSessionParams
): Promise<{ success: boolean; data?: LiveSessionParticipant; error?: string }> {
  const user = getUser();
  if (!user && params.userId !== user?.id) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();

    // Check if session exists and is active or pending
    const { data: sessionData, error: sessionError } = await supabase
      .from("live_sessions")
      .select("*")
      .eq("id", params.sessionId)
      .in("status", ["pending", "active"])
      .single();

    if (sessionError) {
      throw sessionError;
    }

    if (!sessionData) {
      return { success: false, error: "Session not found or not active" };
    }

    // Add user to participants if not already there
    const participants = sessionData.participants || [];
    if (!participants.includes(params.userId)) {
      const { error: updateError } = await supabase
        .from("live_sessions")
        .update({
          participants: [...participants, params.userId],
        })
        .eq("id", params.sessionId);

      if (updateError) {
        throw updateError;
      }
    }

    // Create or update participant record
    const participant: LiveSessionParticipant = {
      userId: params.userId,
      displayName: params.displayName,
      avatarUrl: params.avatarUrl,
      status: "idle",
      joinedAt: now,
      lastActiveAt: now,
      setsCompleted: 0,
      isLeader: sessionData.host_id === params.userId,
      readyForNext: false,
    };

    // In a real implementation, we would store this in the database
    // For now, we'll just return the participant data

    return { success: true, data: participant };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.joinLiveSession",
      error: err,
      userMessage: "Failed to join live workout session",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Leave a live workout session
 */
export async function leaveLiveSession(
  sessionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const currentUser = getUser();
  if (!currentUser) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();

    // Remove user from session participants
    const { data: sessionData, error: sessionError } = await supabase
      .from("live_sessions")
      .select("host_id, participants")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      throw sessionError;
    }

    if (!sessionData) {
      return { success: false, error: "Session not found" };
    }

    const updatedParticipants = (sessionData.participants || []).filter(
      (id: string) => id !== userId
    );

    const { error: updateError } = await supabase
      .from("live_sessions")
      .update({
        participants: updatedParticipants,
      })
      .eq("id", sessionId);

    if (updateError) {
      throw updateError;
    }

    // If host is leaving and there are no participants left, end the session
    if (sessionData.host_id === userId && updatedParticipants.length === 0) {
      await endLiveSession(sessionId);
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.leaveLiveSession",
      error: err,
      userMessage: "Failed to leave live workout session",
    });
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// Event Handling
// ============================================================================

/**
 * Complete a set in a live session
 */
export async function completeLiveSet(
  params: CompleteLiveSetParams
): Promise<{ success: boolean; data?: LiveSetCompletedEvent; error?: string }> {
  const user = getUser();
  if (!user || params.userId !== user.id) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();

    const event: LiveSetCompletedEvent = {
      sessionId: params.sessionId,
      userId: params.userId,
      type: "set_completed",
      timestamp: now,
      data: {
        set: params.set,
        exerciseName: params.exerciseName,
        e1rmKg: params.e1rmKg,
        isPR: params.isPR,
      },
    };

    // In a real implementation, we would:
    // 1. Store the event in the database
    // 2. Broadcast to all participants via real-time
    // For now, we'll just return the event

    return { success: true, data: event };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.completeLiveSet",
      error: err,
      userMessage: "Failed to complete live set",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Change exercise in a guided session
 */
export async function changeExercise(
  params: ChangeExerciseParams
): Promise<{ success: boolean; data?: LiveExerciseChangedEvent; error?: string }> {
  const user = getUser();
  if (!user || params.userId !== user.id) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    // Verify user is the leader (host)
    const { data: sessionData, error: fetchError } = await supabase
      .from("live_sessions")
      .select("host_id")
      .eq("id", params.sessionId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (sessionData?.host_id !== params.userId) {
      return { success: false, error: "Only the leader can change exercises" };
    }

    const now = Date.now();

    const event: LiveExerciseChangedEvent = {
      sessionId: params.sessionId,
      userId: params.userId,
      type: "exercise_changed",
      timestamp: now,
      data: {
        exerciseId: params.exerciseId,
        exerciseName: params.exerciseName,
        targetSets: params.targetSets,
        targetRepsMin: params.targetRepsMin,
        targetRepsMax: params.targetRepsMax,
      },
    };

    // Update session with current exercise
    const { error: updateError } = await supabase
      .from("live_sessions")
      .update({
        current_exercise_id: params.exerciseId,
      })
      .eq("id", params.sessionId);

    if (updateError) {
      throw updateError;
    }

    return { success: true, data: event };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.changeExercise",
      error: err,
      userMessage: "Failed to change exercise",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send a reaction
 */
export async function sendReaction(
  params: SendReactionParams
): Promise<{ success: boolean; data?: LiveReactionEvent; error?: string }> {
  const user = getUser();
  if (!user || params.userId !== user.id) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();

    const event: LiveReactionEvent = {
      sessionId: params.sessionId,
      userId: params.userId,
      type: "reaction",
      timestamp: now,
      data: {
        targetUserId: params.targetUserId,
        emote: params.emote,
        targetSetId: params.targetSetId,
      },
    };

    // In a real implementation, we would:
    // 1. Store the reaction in the database
    // 2. Broadcast to all participants via real-time

    return { success: true, data: event };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.sendReaction",
      error: err,
      userMessage: "Failed to send reaction",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Update participant status
 */
export async function updateParticipantStatus(
  params: UpdateParticipantStatusParams
): Promise<{ success: boolean; data?: LiveStatusUpdateEvent; error?: string }> {
  const user = getUser();
  if (!user || params.userId !== user.id) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();

    const event: LiveStatusUpdateEvent = {
      sessionId: params.sessionId,
      userId: params.userId,
      type: "status_update",
      timestamp: now,
      data: {
        status: params.status,
        currentExerciseId: params.currentExerciseId,
      },
    };

    // In a real implementation, we would broadcast this event

    return { success: true, data: event };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.updateParticipantStatus",
      error: err,
      userMessage: "Failed to update participant status",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Update ready status (for guided mode)
 */
export async function updateReadyStatus(
  params: UpdateReadyStatusParams
): Promise<{ success: boolean; data?: LiveReadyStatusEvent; error?: string }> {
  const user = getUser();
  if (!user || params.userId !== user.id) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();

    const event: LiveReadyStatusEvent = {
      sessionId: params.sessionId,
      userId: params.userId,
      type: "ready_status_changed",
      timestamp: now,
      data: {
        isReady: params.isReady,
      },
    };

    // In a real implementation, we would broadcast this event

    return { success: true, data: event };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.updateReadyStatus",
      error: err,
      userMessage: "Failed to update ready status",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send a chat message
 */
export async function sendLiveMessage(
  sessionId: string,
  userId: string,
  message: string
): Promise<{ success: boolean; data?: LiveMessageEvent; error?: string }> {
  const user = getUser();
  if (!user || userId !== user.id) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();

    const event: LiveMessageEvent = {
      sessionId,
      userId,
      type: "message",
      timestamp: now,
      data: {
        message,
      },
    };

    // In a real implementation, we would:
    // 1. Store the message in the database
    // 2. Broadcast to all participants via real-time

    return { success: true, data: event };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.sendLiveMessage",
      error: err,
      userMessage: "Failed to send message",
    });
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get active live workout sessions
 */
export async function getActiveLiveSessions(): Promise<{
  success: boolean;
  data?: LiveSession[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("live_sessions")
      .select("*")
      .in("status", ["pending", "active"])
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const sessions: LiveSession[] = (data || []).map((item) => ({
      id: item.id,
      hostId: item.host_id,
      mode: item.mode as LiveSessionMode,
      status: item.status as LiveSessionStatus,
      name: item.name || undefined,
      theme: item.theme || undefined,
      participants: item.participants || [],
      createdAt: item.created_at,
      startedAt: item.started_at || undefined,
      endedAt: item.ended_at || undefined,
      currentExerciseId: item.current_exercise_id || undefined,
      plannedExercises: item.planned_exercises || undefined,
    }));

    return { success: true, data: sessions };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.getActiveLiveSessions",
      error: err,
      userMessage: "Failed to get active sessions",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Get a specific live session
 */
export async function getLiveSession(
  sessionId: string
): Promise<{ success: boolean; data?: LiveSession; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("live_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return { success: false, error: "Session not found" };
    }

    const session: LiveSession = {
      id: data.id,
      hostId: data.host_id,
      mode: data.mode as LiveSessionMode,
      status: data.status as LiveSessionStatus,
      name: data.name || undefined,
      theme: data.theme || undefined,
      participants: data.participants || [],
      createdAt: data.created_at,
      startedAt: data.started_at || undefined,
      endedAt: data.ended_at || undefined,
      currentExerciseId: data.current_exercise_id || undefined,
      plannedExercises: data.planned_exercises || undefined,
    };

    return { success: true, data: session };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.getLiveSession",
      error: err,
      userMessage: "Failed to get session",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Get participants for a session
 */
export async function getSessionParticipants(
  sessionId: string
): Promise<{ success: boolean; data?: LiveSessionParticipant[]; error?: string }> {
  try {
    // In a real implementation, we would fetch participants from the database
    // For now, we'll return an empty array
    // This would be populated by real-time subscriptions in the actual implementation

    return { success: true, data: [] };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.getSessionParticipants",
      error: err,
      userMessage: "Failed to get session participants",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Get session summary
 */
export async function getSessionSummary(
  sessionId: string
): Promise<{ success: boolean; data?: LiveSessionSummary; error?: string }> {
  try {
    const sessionResult = await getLiveSession(sessionId);
    if (!sessionResult.success || !sessionResult.data) {
      return { success: false, error: "Session not found" };
    }

    const session = sessionResult.data;

    // Get participant data (in a real implementation)
    const participants: ParticipantSessionSummary[] = [];

    const summary: LiveSessionSummary = {
      session,
      participantSummaries: participants,
      totalSets: 0,
      totalVolumeKg: 0,
      durationMs: session.endedAt
        ? session.endedAt - (session.startedAt || session.createdAt)
        : Date.now() - (session.startedAt || session.createdAt),
      exercises: session.plannedExercises?.map(e => e.exerciseId) || [],
    };

    return { success: true, data: summary };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.getSessionSummary",
      error: err,
      userMessage: "Failed to get session summary",
    });
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

/**
 * Subscribe to live session events
 */
export function subscribeToLiveSession(
  sessionId: string,
  callback: (event: LiveSessionEvent) => void
): () => void {
  console.log("[LiveWorkoutService] Subscribing to session:", sessionId);

  // In a real implementation, we would use Supabase real-time
  // For now, we'll create a mock subscription

  const subscription = supabase
    .channel(`live_session:${sessionId}`)
    .on("broadcast", { event: "live_event" }, (payload) => {
      console.log("[LiveWorkoutService] Received event:", payload);
      try {
        const event = payload.payload as LiveSessionEvent;
        callback(event);
      } catch (err) {
        console.error("[LiveWorkoutService] Error processing event:", err);
      }
    })
    .subscribe((status) => {
      console.log("[LiveWorkoutService] Subscription status:", status);
    });

  return () => {
    console.log("[LiveWorkoutService] Unsubscribing from session:", sessionId);
    subscription.unsubscribe();
  };
}

/**
 * Subscribe to presence updates for friends
 */
export function subscribeToFriendsPresence(
  userId: string,
  callback: (presence: WorkoutPresence[]) => void
): () => void {
  console.log("[LiveWorkoutService] Subscribing to friends presence for user:", userId);

  // Mock subscription - in real implementation would use Supabase real-time
  const subscription = supabase
    .channel(`presence:${userId}`)
    .on("broadcast", { event: "presence_update" }, (payload) => {
      console.log("[LiveWorkoutService] Received presence update:", payload);
      try {
        const presence = payload.payload as WorkoutPresence[];
        callback(presence);
      } catch (err) {
        console.error("[LiveWorkoutService] Error processing presence:", err);
      }
    })
    .subscribe((status) => {
      console.log("[LiveWorkoutService] Presence subscription status:", status);
    });

  return () => {
    console.log("[LiveWorkoutService] Unsubscribing from friends presence:", userId);
    subscription.unsubscribe();
  };
}

/**
 * Send a quick reaction to a friend's workout
 */
export async function sendQuickReaction(
  params: {
    fromUserId: string;
    toUserId: string;
    emote: string;
    setId?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const user = getUser();
  if (!user || params.fromUserId !== user.id) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const now = Date.now();

    const reaction: QuickReaction = {
      id: uid(),
      fromUserId: params.fromUserId,
      toUserId: params.toUserId,
      emote: params.emote,
      timestamp: now,
      setId: params.setId,
    };

    // In a real implementation, we would:
    // 1. Store the reaction in the database
    // 2. Send a push notification to the recipient
    // 3. Broadcast via real-time if recipient is online

    console.log("[LiveWorkoutService] Quick reaction sent:", reaction);

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.sendQuickReaction",
      error: err,
      userMessage: "Failed to send quick reaction",
    });
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get exercise name from ID
 */
export function getExerciseName(exerciseId: string): string {
  const exercise = EXERCISES_V1.find((e) => e.id === exerciseId);
  return exercise ? exercise.name : exerciseId;
}

/**
 * Calculate e1RM (Epley formula)
 */
export function calculateE1RM(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30);
}

/**
 * Generate a session invitation
 */
export async function generateSessionInvitation(
  sessionId: string,
  targetUserId: string
): Promise<{ success: boolean; data?: LiveSessionInvitation; error?: string }> {
  const user = getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const sessionResult = await getLiveSession(sessionId);
    if (!sessionResult.success || !sessionResult.data) {
      return { success: false, error: "Session not found" };
    }

    const now = Date.now();
    const invitation: LiveSessionInvitation = {
      id: uid(),
      sessionId,
      sessionName: sessionResult.data.name,
      hostId: user.id,
      hostDisplayName: user.displayName || "Unknown",
      hostAvatarUrl: user.avatarUrl || undefined,
      mode: sessionResult.data.mode,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours from now
      status: "pending",
    };

    // In a real implementation, we would:
    // 1. Store the invitation in the database
    // 2. Send a push notification to the target user

    return { success: true, data: invitation };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logError({
      context: "LiveWorkoutService.generateSessionInvitation",
      error: err,
      userMessage: "Failed to generate session invitation",
    });
    return { success: false, error: errorMessage };
  }
}

// src/lib/hangout/index.ts
// Hangout room module exports

// Types
export type {
  HangoutRoom,
  RoomDecoration,
  UserPresence,
  RealtimePresenceState,
  PresenceEvent,
  PresenceEventType,
  DecorationCategory,
  DecorationItem,
  RoomTheme,
} from './hangoutTypes';

// Store
export {
  useHangoutStore,
  useCurrentRoom,
  useRoomDecorations,
  useRoomPresences,
  useHangoutLoading,
  useHangoutError,
  useIsHangoutHydrated,
} from './hangoutStore';

// Real-time presence (Supabase Presence API)
export {
  realtimePresence,
  joinHangoutRoom,
  leaveHangoutRoom,
  updatePresenceStatus,
  getOnlinePresences,
} from './realtimePresence';

// Database presence (postgres_changes)
export {
  subscribeToRoomPresence,
  subscribeToRoomDecorations,
  getCurrentUserPresence,
  getRoomPresences,
  isUserWorkingOut,
  getUserActivity,
} from './presenceTracker';

// Repository
export {
  createHangoutRoom,
  getHangoutRoom,
  getUserHangoutRoom,
  addDecoration,
  getRoomDecorations,
  updateUserPresence,
  getRoomUserPresences,
} from './hangoutRepository';

// React hooks
export {
  useRealtimePresence,
  useWorkoutPresenceUpdater,
} from './useRealtimePresence';
export type { UseRealtimePresenceResult } from './useRealtimePresence';

// src/lib/chatStore.ts
// RE-EXPORT: This file now re-exports from the new Zustand store location
// All functionality has been migrated to src/lib/stores/chatStore.ts

export {
  useChatStore,
  useThreads,
  useThread,
  useThreadMessages,
  useUnreadCount,
  useThreadOtherUserId,
  useOtherUserTyping,
  getThreadsForUser,
  getThread,
  getMessagesForThread,
  getLastReadAt,
  getUnreadCount,
  ensureThread,
  sendMessage,
  markThreadRead,
  setTyping,
  getIsUserTyping,
  getOtherUserId,
  canUserMessageThread,
  hydrateChat,
  subscribeChat,
} from "./stores/chatStore";

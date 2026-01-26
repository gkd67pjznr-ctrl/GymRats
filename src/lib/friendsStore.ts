// src/lib/friendsStore.ts
// RE-EXPORT: This file now re-exports from the new Zustand store location
// All functionality has been migrated to src/lib/stores/friendsStore.ts

export {
  useFriendsStore,
  useFriendEdges,
  useFriendStatus,
  getFriendEdges,
  getFriendStatus,
  areFriends,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  blockUser,
  hydrateFriends,
  subscribeFriends,
} from "./stores/friendsStore";

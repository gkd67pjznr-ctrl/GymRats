// src/lib/socialModel.ts

export type ID = string;

// ---------- Users / Relationships ----------
export type PrivacyLevel = "public" | "friends";

export type FriendStatus = "none" | "requested" | "pending" | "friends" | "blocked";

export type FriendEdge = {
  userId: ID;
  otherUserId: ID;
  status: FriendStatus;
  updatedAtMs: number;
};

// ---------- Workout Posts ----------
export type WorkoutPost = {
  id: ID;

  // author
  authorUserId: ID;
  authorDisplayName: string;
  authorAvatarUrl?: string;

  // visibility
  privacy: PrivacyLevel;

  // timestamps
  createdAtMs: number;

  // content
  title?: string; // e.g. "Push Day" or "Bench PR"
  caption?: string;

  // optional media (future)
  photoUrls?: string[];

  // summary (kept lightweight for feed)
  durationSec?: number;
  completionPct?: number; // 0..1
  exerciseCount?: number;
  setCount?: number;

  // denormalized counts (for feed speed)
  likeCount: number;
  commentCount: number;

  // optional: store a compact snapshot of the workout for rendering without fetching full session
  workoutSnapshot?: WorkoutSnapshot;
};

export type WorkoutSnapshot = {
  routineName?: string;
  topLines: Array<{
    exerciseName: string;
    bestSet?: { weightLabel: string; reps: number; e1rmLabel?: string };
  }>;
};

// ---------- Reactions / Emotes ----------
export type EmoteId = "like" | "fire" | "skull" | "crown" | "bolt" | "clap";

export type Reaction = {
  id: ID;
  postId: ID;
  userId: ID;
  emote: EmoteId;
  createdAtMs: number;
};

// ---------- Comments ----------
export type Comment = {
  id: ID;
  postId: ID;
  userId: ID;
  userDisplayName: string;
  text: string;
  createdAtMs: number;

  // future: threading
  parentCommentId?: ID;
};

// ---------- Chat (DM) ----------
export type ChatThreadType = "dm"; // later: "group"

export type ChatThread = {
  id: ID;
  type: ChatThreadType;
  memberUserIds: ID[];
  createdAtMs: number;
  updatedAtMs: number;

  // spam controls
  canMessage: "friendsOnly" | "mutualFollow" | "open"; // we’ll pick 1 policy for v1
};

export type ChatMessage = {
  id: ID;
  threadId: ID;
  senderUserId: ID;
  text: string;
  createdAtMs: number;
  deliveredAtMs?: number;
  readAtMs?: number;
};

// ---------- Notifications ----------
export type NotificationType =
  | "reaction"
  | "comment"
  | "friend_request"
  | "friend_accept"
  | "message";

export type AppNotification = {
  id: ID;
  userId: ID; // receiver
  type: NotificationType;
  createdAtMs: number;
  readAtMs?: number;

  // reference
  postId?: ID;
  commentId?: ID;
  threadId?: ID;

  // display
  title: string;
  body: string;
};

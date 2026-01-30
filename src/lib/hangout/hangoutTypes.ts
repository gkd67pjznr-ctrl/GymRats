// src/lib/hangout/hangoutTypes.ts
// Types for the hangout room system

/**
 * Hangout room data structure
 */
export interface HangoutRoom {
  id: string;
  ownerId: string;
  name: string;
  theme: string;
  members: string[]; // friend user IDs
  createdAt: number;
  updatedAt: number;
}

/**
 * Room decoration data structure
 */
export interface RoomDecoration {
  id: string;
  roomId: string;
  itemId: string;
  itemType: "furniture" | "poster" | "equipment" | "trophies" | "plants";
  position: {
    x: number;
    y: number;
  };
  contributedBy: string; // user ID who added it
  approved: boolean; // admin approval status
  createdAt: number;
}

/**
 * User presence data structure
 */
export interface UserPresence {
  id: string;
  userId: string;
  roomId: string;
  status: "online" | "working_out" | "resting" | "offline";
  activity?: string; // e.g. "Bench pressing..."
  updatedAt: number;
}

/**
 * Decoration categories
 */
export type DecorationCategory = "furniture" | "poster" | "equipment" | "trophies" | "plants";

/**
 * Decoration item metadata
 */
export interface DecorationItem {
  id: string;
  name: string;
  category: DecorationCategory;
  description: string;
  price: number; // Forge Tokens
  thumbnailUrl?: string;
}

/**
 * Hangout room theme metadata
 */
export interface RoomTheme {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  backgroundImage?: string;
  price?: number; // Forge Tokens or IAP
}
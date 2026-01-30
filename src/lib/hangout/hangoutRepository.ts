// src/lib/hangout/hangoutRepository.ts
// Database operations for hangout room system

import { supabase } from "../supabase/client";
import type { HangoutRoom, RoomDecoration, UserPresence } from "./hangoutTypes";
import { logError } from "../errorHandler";

/**
 * Create a new hangout room
 */
export async function createHangoutRoom(
  ownerId: string,
  name: string,
  theme: string
): Promise<{ success: boolean; data?: HangoutRoom; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("hangout_rooms")
      .insert([
        {
          owner_id: ownerId,
          name,
          theme,
          members: [ownerId], // Owner is first member
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      logError({ context: "HangoutRepository.createHangoutRoom", error, userMessage: "Failed to create hangout room" });
      return { success: false, error: error.message };
    }

    const room: HangoutRoom = {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      theme: data.theme,
      members: data.members,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };

    return { success: true, data: room };
  } catch (err) {
    logError({ context: "HangoutRepository.createHangoutRoom", error: err, userMessage: "Failed to create hangout room" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Get hangout room by ID
 */
export async function getHangoutRoom(
  roomId: string
): Promise<{ success: boolean; data?: HangoutRoom; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("hangout_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error) {
      logError({ context: "HangoutRepository.getHangoutRoom", error, userMessage: "Failed to fetch hangout room" });
      return { success: false, error: error.message };
    }

    const room: HangoutRoom = {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      theme: data.theme,
      members: data.members,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };

    return { success: true, data: room };
  } catch (err) {
    logError({ context: "HangoutRepository.getHangoutRoom", error: err, userMessage: "Failed to fetch hangout room" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Get user's hangout room
 */
export async function getUserHangoutRoom(
  userId: string
): Promise<{ success: boolean; data?: HangoutRoom; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("hangout_rooms")
      .select("*")
      .or(`owner_id.eq.${userId},members.cs.{${userId}}`)
      .limit(1)
      .single();

    if (error) {
      // If no room found, that's not an error - just return empty result
      if (error.code === "PGRST116") {
        return { success: true, data: undefined };
      }
      logError({ context: "HangoutRepository.getUserHangoutRoom", error, userMessage: "Failed to fetch user hangout room" });
      return { success: false, error: error.message };
    }

    const room: HangoutRoom = {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      theme: data.theme,
      members: data.members,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };

    return { success: true, data: room };
  } catch (err) {
    logError({ context: "HangoutRepository.getUserHangoutRoom", error: err, userMessage: "Failed to fetch user hangout room" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Add decoration to room
 */
export async function addDecoration(
  decoration: Omit<RoomDecoration, "id" | "createdAt">
): Promise<{ success: boolean; data?: RoomDecoration; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("room_decorations")
      .insert([
        {
          room_id: decoration.roomId,
          item_id: decoration.itemId,
          item_type: decoration.itemType,
          position_x: decoration.position.x,
          position_y: decoration.position.y,
          contributed_by: decoration.contributedBy,
          approved: decoration.approved,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      logError({ context: "HangoutRepository.addDecoration", error, userMessage: "Failed to add decoration" });
      return { success: false, error: error.message };
    }

    const newDecoration: RoomDecoration = {
      id: data.id,
      roomId: data.room_id,
      itemId: data.item_id,
      itemType: data.item_type as any,
      position: {
        x: data.position_x,
        y: data.position_y,
      },
      contributedBy: data.contributed_by,
      approved: data.approved,
      createdAt: new Date(data.created_at).getTime(),
    };

    return { success: true, data: newDecoration };
  } catch (err) {
    logError({ context: "HangoutRepository.addDecoration", error: err, userMessage: "Failed to add decoration" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Get room decorations
 */
export async function getRoomDecorations(
  roomId: string
): Promise<{ success: boolean; data?: RoomDecoration[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("room_decorations")
      .select("*")
      .eq("room_id", roomId);

    if (error) {
      logError({ context: "HangoutRepository.getRoomDecorations", error, userMessage: "Failed to fetch room decorations" });
      return { success: false, error: error.message };
    }

    const decorations: RoomDecoration[] = data.map(item => ({
      id: item.id,
      roomId: item.room_id,
      itemId: item.item_id,
      itemType: item.item_type as any,
      position: {
        x: item.position_x,
        y: item.position_y,
      },
      contributedBy: item.contributed_by,
      approved: item.approved,
      createdAt: new Date(item.created_at).getTime(),
    }));

    return { success: true, data: decorations };
  } catch (err) {
    logError({ context: "HangoutRepository.getRoomDecorations", error: err, userMessage: "Failed to fetch room decorations" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Update user presence
 */
export async function updateUserPresence(
  presence: Omit<UserPresence, "id" | "createdAt">
): Promise<{ success: boolean; data?: UserPresence; error?: string }> {
  try {
    // First try to update existing presence
    const { data: existing, error: selectError } = await supabase
      .from("user_presence")
      .select("*")
      .eq("user_id", presence.userId)
      .eq("room_id", presence.roomId)
      .limit(1)
      .single();

    let result;
    if (existing && !selectError) {
      // Update existing presence
      result = await supabase
        .from("user_presence")
        .update({
          status: presence.status,
          activity: presence.activity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      // Insert new presence
      result = await supabase
        .from("user_presence")
        .insert([
          {
            user_id: presence.userId,
            room_id: presence.roomId,
            status: presence.status,
            activity: presence.activity,
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      logError({ context: "HangoutRepository.updateUserPresence", error, userMessage: "Failed to update user presence" });
      return { success: false, error: error.message };
    }

    const userPresence: UserPresence = {
      id: data.id,
      userId: data.user_id,
      roomId: data.room_id,
      status: data.status as any,
      activity: data.activity,
      updatedAt: new Date(data.updated_at).getTime(),
      createdAt: new Date(data.updated_at).getTime(), // Use updated_at as created_at for simplicity
    };

    return { success: true, data: userPresence };
  } catch (err) {
    logError({ context: "HangoutRepository.updateUserPresence", error: err, userMessage: "Failed to update user presence" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Get room user presences
 */
export async function getRoomUserPresences(
  roomId: string
): Promise<{ success: boolean; data?: UserPresence[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("user_presence")
      .select("*")
      .eq("room_id", roomId);

    if (error) {
      logError({ context: "HangoutRepository.getRoomUserPresences", error, userMessage: "Failed to fetch user presences" });
      return { success: false, error: error.message };
    }

    const presences: UserPresence[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      roomId: item.room_id,
      status: item.status as any,
      activity: item.activity,
      updatedAt: new Date(item.updated_at).getTime(),
      createdAt: new Date(item.updated_at).getTime(),
    }));

    return { success: true, data: presences };
  } catch (err) {
    logError({ context: "HangoutRepository.getRoomUserPresences", error: err, userMessage: "Failed to fetch user presences" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
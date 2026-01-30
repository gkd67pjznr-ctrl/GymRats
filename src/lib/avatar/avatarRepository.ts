// src/lib/avatar/avatarRepository.ts
// Database operations for avatar system

import { supabase } from "../supabase/client";
import type { DatabaseUserUpdate } from "../supabase/types";
import type { AvatarArtStyle, AvatarCosmetics } from "./avatarTypes";
import { logError } from "../errorHandler";

/**
 * Update user's avatar art style
 */
export async function updateAvatarStyle(userId: string, artStyle: AvatarArtStyle): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        avatar_art_style: artStyle,
        updated_at: new Date().toISOString()
      } as DatabaseUserUpdate)
      .eq("id", userId);

    if (error) {
      logError({ context: "AvatarRepository.updateAvatarStyle", error, userMessage: "Failed to update avatar style" });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logError({ context: "AvatarRepository.updateAvatarStyle", error: err, userMessage: "Failed to update avatar style" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Update user's avatar cosmetics
 */
export async function updateAvatarCosmetics(userId: string, cosmetics: AvatarCosmetics): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        avatar_cosmetics: cosmetics,
        updated_at: new Date().toISOString()
      } as DatabaseUserUpdate)
      .eq("id", userId);

    if (error) {
      logError({ context: "AvatarRepository.updateAvatarCosmetics", error, userMessage: "Failed to update avatar cosmetics" });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logError({ context: "AvatarRepository.updateAvatarCosmetics", error: err, userMessage: "Failed to update avatar cosmetics" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Update user's avatar growth data
 */
export async function updateAvatarGrowth(
  userId: string,
  growthStage: number,
  heightScale: number,
  volumeKg: number,
  sets: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        avatar_growth_stage: growthStage,
        avatar_height_scale: heightScale,
        total_volume_kg: volumeKg,
        total_sets: sets,
        updated_at: new Date().toISOString()
      } as DatabaseUserUpdate)
      .eq("id", userId);

    if (error) {
      logError({ context: "AvatarRepository.updateAvatarGrowth", error, userMessage: "Failed to update avatar growth" });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logError({ context: "AvatarRepository.updateAvatarGrowth", error: err, userMessage: "Failed to update avatar growth" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Get user's avatar data
 */
export async function getUserAvatarData(userId: string): Promise<{
  success: boolean;
  data?: {
    avatarArtStyle: string | null;
    avatarGrowthStage: number | null;
    avatarHeightScale: number | null;
    avatarCosmetics: any | null;
    totalVolumeKg: number | null;
    totalSets: number | null;
  };
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("avatar_art_style, avatar_growth_stage, avatar_height_scale, avatar_cosmetics, total_volume_kg, total_sets")
      .eq("id", userId)
      .single();

    if (error) {
      logError({ context: "AvatarRepository.getUserAvatarData", error, userMessage: "Failed to fetch avatar data" });
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        avatarArtStyle: data.avatar_art_style,
        avatarGrowthStage: data.avatar_growth_stage,
        avatarHeightScale: data.avatar_height_scale,
        avatarCosmetics: data.avatar_cosmetics,
        totalVolumeKg: data.total_volume_kg,
        totalSets: data.total_sets,
      }
    };
  } catch (err) {
    logError({ context: "AvatarRepository.getUserAvatarData", error: err, userMessage: "Failed to fetch avatar data" });
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
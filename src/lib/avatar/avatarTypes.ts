// src/lib/avatar/avatarTypes.ts
// Types for the avatar system

/**
 * Avatar art style options
 */
export type AvatarArtStyle = "bitmoji" | "pixel" | "retro" | "3d";

/**
 * Avatar cosmetics categories
 */
export interface AvatarCosmetics {
  top: string | null;
  bottom: string | null;
  shoes: string | null;
  accessory: string | null;
}

/**
 * Avatar growth data structure
 */
export interface AvatarGrowth {
  stage: number;         // 1-20 growth stages
  heightScale: number;   // 0.3 (baby) to 1.0 (full grown)
  volumeTotal: number;   // Lifetime volume logged
  setsTotal: number;     // Lifetime sets completed
  avgRank: number;       // Average rank across exercises
}

/**
 * Complete avatar data structure
 */
export interface AvatarData {
  userId: string;
  artStyle: AvatarArtStyle;
  growthStage: number;
  heightScale: number;
  cosmetics: AvatarCosmetics;
  createdAt: number;
  updatedAt: number;
}

/**
 * Avatar growth calculation parameters
 */
export interface GrowthCalculationParams {
  volumeKg: number;
  sets: number;
  avgRank: number;
}

/**
 * Avatar art style metadata
 */
export interface ArtStyleMetadata {
  id: AvatarArtStyle;
  name: string;
  description: string;
  previewLines: string[];
}
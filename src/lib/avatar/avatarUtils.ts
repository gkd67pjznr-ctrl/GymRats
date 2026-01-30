// src/lib/avatar/avatarUtils.ts
// Utility functions for avatar system

import type { AvatarArtStyle, ArtStyleMetadata } from "./avatarTypes";

/**
 * Available avatar art styles with metadata
 */
export const AVATAR_ART_STYLES: ArtStyleMetadata[] = [
  {
    id: "bitmoji",
    name: "Bitmoji Style",
    description: "Cute, approachable avatar style with wide appeal",
    previewLines: [
      "Friendly and approachable",
      "Bright colors and expressive",
      "Perfect for social sharing"
    ]
  },
  {
    id: "pixel",
    name: "Pixel Art",
    description: "Old school pixel art style (Mega Man inspired)",
    previewLines: [
      "Nostalgic 8-bit aesthetic",
      "Charming retro vibe",
      "Pixel-perfect details"
    ]
  },
  {
    id: "retro",
    name: "Retro Style",
    description: "Slightly newer retro style (Street Fighter 2 inspired)",
    previewLines: [
      "Iconic arcade aesthetic",
      "Bold outlines and colors",
      "Classic fighting game feel"
    ]
  },
  {
    id: "3d",
    name: "3D Low-Poly",
    description: "Modern low-poly 3D style (Monument Valley/Crossy Road inspired)",
    previewLines: [
      "Clean geometric design",
      "Modern minimalist look",
      "Premium polished appearance"
    ]
  }
];

/**
 * Get art style metadata by ID
 *
 * @param id - Art style ID
 * @returns Art style metadata or undefined
 */
export function getArtStyleMetadata(id: AvatarArtStyle): ArtStyleMetadata | undefined {
  return AVATAR_ART_STYLES.find(style => style.id === id);
}

/**
 * Get default avatar art style
 *
 * @returns Default art style ID
 */
export function getDefaultArtStyle(): AvatarArtStyle {
  return "bitmoji";
}

/**
 * Validate avatar art style
 *
 * @param style - Art style to validate
 * @returns Boolean indicating if style is valid
 */
export function isValidArtStyle(style: string): style is AvatarArtStyle {
  return AVATAR_ART_STYLES.some(s => s.id === style);
}

/**
 * Get avatar image URL based on art style and growth stage
 *
 * @param userId - User ID
 * @param artStyle - Avatar art style
 * @param growthStage - Avatar growth stage (1-20)
 * @param displayName - User's display name (for fallback)
 * @returns Avatar image URL
 */
export function getAvatarImageUrl(
  userId: string,
  artStyle: AvatarArtStyle,
  growthStage: number,
  displayName?: string | null
): string {
  // For now, we'll use the existing DiceBear avatar service
  // In a full implementation, this would point to custom avatar images
  const seed = displayName || userId;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=4ECDC4`;
}

/**
 * Get default avatar cosmetics
 *
 * @returns Default avatar cosmetics object
 */
export function getDefaultAvatarCosmetics() {
  return {
    top: null,
    bottom: null,
    shoes: null,
    accessory: null,
  };
}

/**
 * Validate avatar cosmetics
 *
 * @param cosmetics - Cosmetics to validate
 * @returns Boolean indicating if cosmetics are valid
 */
export function isValidAvatarCosmetics(cosmetics: any): cosmetics is import("./avatarTypes").AvatarCosmetics {
  if (!cosmetics || typeof cosmetics !== 'object') return false;

  const requiredKeys = ['top', 'bottom', 'shoes', 'accessory'];
  return requiredKeys.every(key =>
    key in cosmetics && (typeof cosmetics[key] === 'string' || cosmetics[key] === null)
  );
}
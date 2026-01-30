// src/lib/hangout/decorationManager.ts
// Decoration management for hangout rooms

import type { DecorationItem, DecorationCategory, RoomTheme } from "./hangoutTypes";

/**
 * Available decoration items
 */
export const DECORATION_ITEMS: DecorationItem[] = [
  // Furniture
  {
    id: "chair_001",
    name: "Basic Chair",
    category: "furniture",
    description: "A simple chair for your avatar to sit on",
    price: 50,
  },
  {
    id: "bench_001",
    name: "Weight Bench",
    category: "furniture",
    description: "Classic flat bench for pressing",
    price: 100,
  },
  {
    id: "rack_001",
    name: "Power Rack",
    category: "furniture",
    description: "Full power rack for heavy lifting",
    price: 500,
  },

  // Posters
  {
    id: "poster_001",
    name: "Motivational Quote",
    category: "poster",
    description: "Inspirational fitness quote",
    price: 25,
  },
  {
    id: "poster_002",
    name: "Muscle Anatomy",
    category: "poster",
    description: "Detailed muscle group chart",
    price: 30,
  },

  // Equipment
  {
    id: "barbell_001",
    name: "Olympic Barbell",
    category: "equipment",
    description: "Standard Olympic weightlifting bar",
    price: 200,
  },
  {
    id: "plates_001",
    name: "Weight Plates",
    category: "equipment",
    description: "Set of standard weight plates",
    price: 150,
  },

  // Trophies
  {
    id: "trophy_001",
    name: "First PR Trophy",
    category: "trophies",
    description: "Commemorate your first personal record",
    price: 75,
  },
  {
    id: "trophy_002",
    name: "Streak Champion",
    category: "trophies",
    description: "Award for maintaining workout streak",
    price: 100,
  },

  // Plants
  {
    id: "plant_001",
    name: "Small Potted Plant",
    category: "plants",
    description: "A little greenery for your room",
    price: 20,
  },
  {
    id: "plant_002",
    name: "Large Palm",
    category: "plants",
    description: "Big tropical palm tree",
    price: 80,
  },
];

/**
 * Available room themes
 */
export const ROOM_THEMES: RoomTheme[] = [
  {
    id: "default",
    name: "Gym Standard",
    description: "Classic gym aesthetic",
    backgroundColor: "#1a1a1a",
  },
  {
    id: "dark",
    name: "Dark Room",
    description: "Moody, atmospheric lighting",
    backgroundColor: "#0a0a0a",
    price: 100,
  },
  {
    id: "bright",
    name: "Bright & Cheerful",
    description: "Light, energetic atmosphere",
    backgroundColor: "#f0f0f0",
    price: 100,
  },
  {
    id: "retro",
    name: "Retro 80s",
    description: "Neon colors and vintage style",
    backgroundColor: "#121220",
    price: 250,
  },
];

/**
 * Get decoration items by category
 *
 * @param category - Decoration category
 * @returns Array of decoration items in category
 */
export function getDecorationsByCategory(category: DecorationCategory): DecorationItem[] {
  return DECORATION_ITEMS.filter(item => item.category === category);
}

/**
 * Get decoration item by ID
 *
 * @param id - Decoration item ID
 * @returns Decoration item or undefined
 */
export function getDecorationById(id: string): DecorationItem | undefined {
  return DECORATION_ITEMS.find(item => item.id === id);
}

/**
 * Get room theme by ID
 *
 * @param id - Theme ID
 * @returns Room theme or undefined
 */
export function getThemeById(id: string): RoomTheme | undefined {
  return ROOM_THEMES.find(theme => theme.id === id);
}

/**
 * Get affordable decorations for user's token balance
 *
 * @param forgeTokens - User's Forge Token balance
 * @returns Array of affordable decoration items
 */
export function getAffordableDecorations(forgeTokens: number): DecorationItem[] {
  return DECORATION_ITEMS.filter(item => item.price <= forgeTokens);
}

/**
 * Get affordable themes for user's token balance
 *
 * @param forgeTokens - User's Forge Token balance
 * @returns Array of affordable room themes
 */
export function getAffordableThemes(forgeTokens: number): RoomTheme[] {
  return ROOM_THEMES.filter(theme => !theme.price || theme.price <= forgeTokens);
}

/**
 * Validate decoration position within room bounds
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param roomWidth - Room width in pixels
 * @param roomHeight - Room height in pixels
 * @returns Boolean indicating if position is valid
 */
export function isValidDecorationPosition(
  x: number,
  y: number,
  roomWidth: number = 800,
  roomHeight: number = 600
): boolean {
  // Allow decorations within room bounds with some padding
  const padding = 20;
  return (
    x >= padding &&
    x <= roomWidth - padding &&
    y >= padding &&
    y <= roomHeight - padding
  );
}

/**
 * Get decoration category display name
 *
 * @param category - Decoration category
 * @returns Display name for category
 */
export function getDecorationCategoryName(category: DecorationCategory): string {
  switch (category) {
    case "furniture": return "Furniture";
    case "poster": return "Posters";
    case "equipment": return "Equipment";
    case "trophies": return "Trophies";
    case "plants": return "Plants";
    default: return category;
  }
}
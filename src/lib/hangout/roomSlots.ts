// src/lib/hangout/roomSlots.ts
// Slot-based room decoration system

import type { ShopItem } from "../gamification/shop";

/**
 * Room decoration slots - each slot has a fixed position in the room
 * Users can swap items within each slot from their inventory
 */
export type RoomSlotType =
  | "wall_art_1"      // Left wall picture
  | "wall_art_2"      // Right wall picture
  | "wall_art_3"      // Center wall picture
  | "furniture_1"     // Main furniture (couch/chair)
  | "furniture_2"     // Secondary furniture (bench/rack)
  | "lighting"        // Room lighting element
  | "floor_rug"       // Floor covering
  | "plant_1"         // Plant location 1
  | "plant_2"         // Plant location 2
  | "trophy_shelf";   // Trophy display

export interface RoomSlot {
  id: RoomSlotType;
  name: string;
  description: string;
  icon: string;
  position: { x: number; y: number }; // Visual position for room view
  defaultItemId: string; // Default item equipped in this slot
  allowedCategories: string[]; // Shop categories that can go in this slot
}

/**
 * All room slots with their configurations
 */
export const ROOM_SLOTS: RoomSlot[] = [
  // Wall Art (3 slots)
  {
    id: "wall_art_1",
    name: "Wall Art - Left",
    description: "Decorate the left wall",
    icon: "🖼️",
    position: { x: 100, y: 80 },
    defaultItemId: "deco_poster_001", // Default: Motivational Quote
    allowedCategories: ["room_decorations"],
  },
  {
    id: "wall_art_2",
    name: "Wall Art - Right",
    description: "Decorate the right wall",
    icon: "🖼️",
    position: { x: 700, y: 80 },
    defaultItemId: "deco_poster_002", // Default: Muscle Anatomy
    allowedCategories: ["room_decorations"],
  },
  {
    id: "wall_art_3",
    name: "Centerpiece",
    description: "Main wall centerpiece",
    icon: "🏆",
    position: { x: 400, y: 60 },
    defaultItemId: "deco_trophy_001", // Default: First PR Trophy
    allowedCategories: ["room_decorations"],
  },

  // Furniture (2 slots)
  {
    id: "furniture_1",
    name: "Main Furniture",
    description: "Primary seating area",
    icon: "🛋️",
    position: { x: 200, y: 350 },
    defaultItemId: "deco_chair_001", // Default: Basic Chair
    allowedCategories: ["room_decorations"],
  },
  {
    id: "furniture_2",
    name: "Equipment Area",
    description: "Workout equipment space",
    icon: "🏋️",
    position: { x: 600, y: 350 },
    defaultItemId: "deco_bench_001", // Default: Weight Bench
    allowedCategories: ["room_decorations"],
  },

  // Lighting
  {
    id: "lighting",
    name: "Lighting",
    description: "Room atmosphere lighting",
    icon: "💡",
    position: { x: 400, y: 40 },
    defaultItemId: "theme_dark_room", // Default: Dark Room theme
    allowedCategories: ["room_decorations"],
  },

  // Floor
  {
    id: "floor_rug",
    name: "Floor Covering",
    description: "Floor decoration",
    icon: "🟫",
    position: { x: 400, y: 450 },
    defaultItemId: "deco_plant_001", // Default: Small Potted Plant
    allowedCategories: ["room_decorations"],
  },

  // Plants (2 slots)
  {
    id: "plant_1",
    name: "Plant - Corner 1",
    description: "Add some greenery",
    icon: "🪴",
    position: { x: 80, y: 300 },
    defaultItemId: "deco_plant_001", // Default: Small Potted Plant
    allowedCategories: ["room_decorations"],
  },
  {
    id: "plant_2",
    name: "Plant - Corner 2",
    description: "Add some greenery",
    icon: "🪴",
    position: { x: 720, y: 300 },
    defaultItemId: "deco_plant_002", // Default: Large Palm (but swapped to plant_001 by default)
    allowedCategories: ["room_decorations"],
  },

  // Trophy Display
  {
    id: "trophy_shelf",
    name: "Trophy Shelf",
    description: "Display your achievements",
    icon: "🏆",
    position: { x: 400, y: 120 },
    defaultItemId: "deco_trophy_002", // Default: Streak Champion
    allowedCategories: ["room_decorations"],
  },
];

/**
 * Get slot by ID
 */
export function getSlotById(slotId: RoomSlotType): RoomSlot | undefined {
  return ROOM_SLOTS.find(slot => slot.id === slotId);
}

/**
 * Get items that can go in a specific slot
 */
export function getItemsForSlot(
  slotId: RoomSlotType,
  allShopItems: ShopItem[]
): ShopItem[] {
  const slot = getSlotById(slotId);
  if (!slot) return [];

  return allShopItems.filter(item => {
    // Check if item belongs to allowed categories
    if (!slot.allowedCategories.some(cat => item.id.startsWith(cat))) {
      return false;
    }

    // For decoration slots, filter by item type based on slot
    if (slotId.startsWith("wall_art")) {
      // Wall art slots accept posters and trophy decorations
      return item.id.startsWith("deco_poster") || item.id.startsWith("deco_trophy");
    }

    if (slotId.startsWith("furniture")) {
      // Furniture slots accept furniture and equipment
      return item.id.startsWith("deco_chair") ||
             item.id.startsWith("deco_bench") ||
             item.id.startsWith("deco_rack") ||
             item.id.startsWith("deco_barbell") ||
             item.id.startsWith("deco_plates");
    }

    if (slotId === "lighting") {
      // Lighting slot accepts themes
      return item.id.startsWith("theme_");
    }

    if (slotId === "floor_rug") {
      // Floor accepts plants and rugs
      return item.id.startsWith("deco_plant");
    }

    if (slotId.startsWith("plant")) {
      // Plant slots accept plants
      return item.id.startsWith("deco_plant");
    }

    if (slotId === "trophy_shelf") {
      // Trophy shelf accepts trophies
      return item.id.startsWith("deco_trophy");
    }

    return false;
  });
}

/**
 * User's equipped room decorations state
 * Maps slot IDs to equipped item IDs
 */
export interface RoomDecorationsState {
  [slotId: string]: string; // slotId -> itemId
}

/**
 * Default room decorations (all slots at default)
 */
export function getDefaultRoomDecorations(): RoomDecorationsState {
  const defaults: RoomDecorationsState = {};
  for (const slot of ROOM_SLOTS) {
    defaults[slot.id] = slot.defaultItemId;
  }
  return defaults;
}

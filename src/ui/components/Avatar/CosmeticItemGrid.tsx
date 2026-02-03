// src/ui/components/Avatar/CosmeticItemGrid.tsx
// Grid layout for cosmetic items filtered by category

import { View, StyleSheet } from "react-native";
import { CosmeticItemCard } from "./CosmeticItemCard";
import type { ShopItem } from "../../../lib/gamification/shop";

export type AvatarCosmeticTab = "hair" | "outfit" | "accessories";

interface CosmeticItemGridProps {
  items: (ShopItem & { isOwned: boolean; isEquipped?: boolean })[];
  category: AvatarCosmeticTab;
  userLevel: number;
  tokenBalance: number;
  onItemPress: (item: ShopItem) => void;
}

export function CosmeticItemGrid({
  items,
  category,
  userLevel,
  tokenBalance,
  onItemPress,
}: CosmeticItemGridProps) {
  // Filter items by category prefix
  const filteredItems = items.filter((item) => {
    switch (category) {
      case "hair":
        return item.id.startsWith("hair_");
      case "outfit":
        return item.id.startsWith("outfit_");
      case "accessories":
        return item.id.startsWith("acc_");
      default:
        return false;
    }
  });

  // Sort items: equipped first, then owned, then by cost
  const sortedItems = [...filteredItems].sort((a, b) => {
    // Equipped items first
    if (a.isEquipped && !b.isEquipped) return -1;
    if (!a.isEquipped && b.isEquipped) return 1;

    // Then owned items
    if (a.isOwned && !b.isOwned) return -1;
    if (!a.isOwned && b.isOwned) return 1;

    // Then by cost (free first)
    return a.cost - b.cost;
  });

  return (
    <View style={styles.grid}>
      {sortedItems.map((item) => (
        <CosmeticItemCard
          key={item.id}
          item={item}
          userLevel={userLevel}
          tokenBalance={tokenBalance}
          onPress={() => onItemPress(item)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});

// src/ui/components/Shop/AvatarCustomizer.tsx
// Avatar customization interface for equipping cosmetics

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useShopItems, useInventory, equipShopItem } from "@/src/lib/stores/gamificationStore";
import { getRarityColor, type ShopItem } from "@/src/lib/gamification/shop";
import { useThemeColors } from "@/src/ui/theme";
import { FR } from "@/src/ui/forgerankStyle";

// Cosmetic categories
type CosmeticCategory = "hairstyles" | "outfits" | "accessories";

interface CosmeticCategory {
  id: CosmeticCategory;
  name: string;
  icon: string;
  itemPrefix: string;
  equippedKey: keyof Pick<import("@/src/lib/gamification/shop").UserInventory, "equippedHairstyle" | "equippedOutfit" | "equippedAccessories">;
}

const CATEGORIES: CosmeticCategory[] = [
  {
    id: "hairstyles",
    name: "Hair",
    icon: "💇",
    itemPrefix: "hair_",
    equippedKey: "equippedHairstyle",
  },
  {
    id: "outfits",
    name: "Outfit",
    icon: "👕",
    itemPrefix: "outfit_",
    equippedKey: "equippedOutfit",
  },
  {
    id: "accessories",
    name: "Access.",
    icon: "🎀",
    itemPrefix: "acc_",
    equippedKey: "equippedAccessories",
  },
];

interface AvatarCustomizerProps {
  /** Optional: limit to specific categories */
  limitCategories?: CosmeticCategory[];
  /** Callback when item is equipped */
  onItemEquipped?: (item: ShopItem) => void;
  /** Show preview only (no equipping) */
  previewOnly?: boolean;
}

export function AvatarCustomizer({
  limitCategories,
  onItemEquipped,
  previewOnly = false,
}: AvatarCustomizerProps) {
  const c = useThemeColors();
  const [selectedCategory, setSelectedCategory] = useState<CosmeticCategory>(
    limitCategories ? limitCategories[0] : CATEGORIES[0]
  );
  const inventory = useInventory();

  const categoriesToUse = limitCategories || CATEGORIES;

  // Get items for current category
  const allItems = useShopItems("avatar_cosmetics");
  const categoryItems = allItems.filter((item) =>
    item.id.startsWith(selectedCategory.itemPrefix)
  );

  const getEquippedItemId = (category: CosmeticCategory): string | string[] | undefined => {
    switch (category.id) {
      case "hairstyles":
        return inventory.equippedHairstyle;
      case "outfits":
        return inventory.equippedOutfit;
      case "accessories":
        return inventory.equippedAccessories;
    }
  };

  const isEquipped = (item: ShopItem): boolean => {
    const equipped = getEquippedItemId(selectedCategory);
    if (Array.isArray(equipped)) {
      return equipped.includes(item.id);
    }
    return equipped === item.id;
  };

  const isOwned = (item: ShopItem): boolean => {
    return inventory.ownedItems.includes(item.id) || item.cost === 0;
  };

  const triggerHaptic = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleEquip = (item: ShopItem) => {
    if (previewOnly || !isOwned(item)) return;

    triggerHaptic();
    const result = equipShopItem(item.id, item.category);
    if (result.success) {
      onItemEquipped?.(item);
    }
  };

  // Get currently equipped items for all categories
  const equippedHairstyle = allItems.find(item => item.id === inventory.equippedHairstyle);
  const equippedOutfit = allItems.find(item => item.id === inventory.equippedOutfit);
  const equippedAccessories = allItems.filter(item =>
    inventory.equippedAccessories.includes(item.id)
  );

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Avatar Preview Section */}
      <View style={[styles.previewSection, { borderBottomColor: c.border }]}>
        <View style={[styles.avatarPreview, { backgroundColor: c.card }]}>
          {/* Placeholder avatar visualization */}
          <View style={styles.avatarFigure}>
            <Text style={styles.avatarEmoji}>🏋️</Text>
            {equippedHairstyle && (
              <Text style={styles.hairstyleEmoji}>{equippedHairstyle.emoji}</Text>
            )}
          </View>

          {/* Currently Equipped Badge */}
          <View style={styles.equippedBadge}>
            <Text style={[styles.equippedText, { color: c.text }]}>
              {equippedOutfit?.emoji || "👕"}{" "}
              {equippedAccessories.map(a => a.emoji).join(" ")}
            </Text>
          </View>
        </View>

        {/* Quick Category Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickCategoryScroll}
          contentContainerStyle={styles.quickCategoryContent}
        >
          {categoriesToUse.map((category) => {
            const equippedId = getEquippedItemId(category);
            const equippedItem = Array.isArray(equippedId)
              ? allItems.find(i => i.id === equippedId[0])
              : allItems.find(i => i.id === equippedId);

            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category)}
                style={({ pressed }) => [
                  styles.quickCategoryTab,
                  {
                    backgroundColor: selectedCategory.id === category.id ? c.primary : c.card,
                    borderColor: c.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={styles.quickCategoryIcon}>{category.icon}</Text>
                {equippedItem && (
                  <View style={[styles.equippedDot, { backgroundColor: c.success }]} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Category Items */}
      <View style={styles.categoryHeader}>
        <Text style={[styles.categoryTitle, { color: c.text }]}>
          {selectedCategory.icon} {selectedCategory.name}
        </Text>
        <Text style={[styles.categoryCount, { color: c.muted }]}>
          {categoryItems.length} items
        </Text>
      </View>

      <ScrollView
        style={styles.itemsScroll}
        contentContainerStyle={styles.itemsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.itemsList}>
          {categoryItems.map((item) => {
            const equipped = isEquipped(item);
            const owned = isOwned(item);
            const rarityColor = getRarityColor(item.rarity);

            return (
              <Pressable
                key={item.id}
                onPress={() => handleEquip(item)}
                disabled={previewOnly || !owned}
                style={({ pressed }) => [
                  styles.itemRow,
                  {
                    backgroundColor: equipped ? c.primary + "15" : c.card,
                    borderColor: equipped ? c.primary : c.border,
                    opacity: (previewOnly || !owned) ? 0.5 : pressed ? 0.7 : 1,
                  },
                ]}
              >
                {/* Item Icon */}
                <View style={[styles.itemIcon, { backgroundColor: c.card2 }]}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                </View>

                {/* Item Info */}
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemName, { color }]}>
                      {item.name}
                    </Text>
                    {equipped && (
                      <View style={[styles.equippedBadgeSmall, { backgroundColor: c.primary }]}>
                        <Text style={styles.equippedBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.itemDescription, { color: c.muted }]} numberOfLines={1}>
                    {item.description}
                  </Text>

                  {/* Rarity and Price */}
                  <View style={styles.itemMeta}>
                    <View style={[styles.rarityBadge, { backgroundColor: rarityColor + "20" }]}>
                      <Text style={[styles.rarityText, { color: rarityColor }]}>
                        {item.rarity}
                      </Text>
                    </View>
                    {!owned && (
                      <Text style={[styles.priceText, { color: c.muted }]}>
                        🪙 {item.cost}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Action Indicator */}
                <View style={styles.itemAction}>
                  {equipped ? (
                    <Ionicons name="checkmark-circle" size={24} color={c.primary} />
                  ) : owned ? (
                    <Ionicons name="ellipse-outline" size={24} color={c.border} />
                  ) : (
                    <Ionicons name="lock-closed" size={20} color={c.muted} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Info Footer */}
        <View style={[styles.footer, { borderTopColor: c.border }]}>
          <Ionicons name="information-circle" size={16} color={c.muted} />
          <Text style={[styles.footerText, { color: c.muted }]}>
            {previewOnly
              ? "Preview mode - visit the Shop to purchase cosmetics"
              : "Tap to equip owned items. Visit the Shop to unlock more."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewSection: {
    borderBottomWidth: 1,
  },
  avatarPreview: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: FR.space.x6,
    marginHorizontal: FR.space.x4,
    marginTop: FR.space.x4,
    borderRadius: FR.radius.card,
    gap: FR.space.x3,
  },
  avatarFigure: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 80,
  },
  hairstyleEmoji: {
    position: "absolute",
    top: -10,
    fontSize: 40,
  },
  equippedBadge: {
    alignItems: "center",
    paddingVertical: FR.space.x2,
    paddingHorizontal: FR.space.x3,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: FR.radius.pill,
  },
  equippedText: {
    ...FR.type.body2,
    fontSize: 20,
  },
  quickCategoryScroll: {
    maxHeight: 80,
  },
  quickCategoryContent: {
    paddingHorizontal: FR.space.x3,
    gap: FR.space.x2,
  },
  quickCategoryTab: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    borderRadius: FR.radius.card,
    borderWidth: 1,
    position: "relative",
  },
  quickCategoryIcon: {
    fontSize: 24,
  },
  equippedDot: {
    position: "absolute",
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: FR.space.x4,
    paddingVertical: FR.space.x3,
  },
  categoryTitle: {
    ...FR.type.h3,
  },
  categoryCount: {
    ...FR.type.body2,
  },
  itemsScroll: {
    flex: 1,
  },
  itemsContent: {
    paddingBottom: FR.space.x4,
  },
  itemsList: {
    paddingHorizontal: FR.space.x3,
    gap: FR.space.x2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: FR.space.x3,
    borderRadius: FR.radius.card,
    borderWidth: 1,
    gap: FR.space.x3,
  },
  itemIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FR.radius.soft,
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x2,
  },
  itemName: {
    ...FR.type.body,
    fontWeight: "700",
    flex: 1,
  },
  equippedBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  equippedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
  },
  itemDescription: {
    ...FR.type.caption,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x2,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  priceText: {
    ...FR.type.micro,
    fontWeight: "600",
  },
  itemAction: {
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x2,
    paddingHorizontal: FR.space.x4,
    paddingVertical: FR.space.x3,
    borderTopWidth: 1,
    marginHorizontal: FR.space.x3,
    borderRadius: FR.radius.soft,
  },
  footerText: {
    ...FR.type.caption,
    flex: 1,
  },
});

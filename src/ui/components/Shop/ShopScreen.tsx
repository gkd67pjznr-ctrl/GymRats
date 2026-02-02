// src/ui/components/Shop/ShopScreen.tsx
// Shop screen for purchasing cosmetics and decorations with Forge Tokens

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
import { useShopItems, useForgeTokens, purchaseShopItem, equipShopItem } from "@/src/lib/stores/gamificationStore";
import { getRarityColor, type ShopCategory, type ShopItem } from "@/src/lib/gamification/shop";
import { useThemeColors } from "@/src/ui/theme";
import { FR } from "@/src/ui/forgerankStyle";
import { ThemedButton } from "../ThemedButton";

// Category display names
const CATEGORY_NAMES: Record<ShopCategory, string> = {
  personalities: "Buddies",
  themes: "Themes",
  card_skins: "Cards",
  profile_badges: "Badges",
  profile_frames: "Frames",
  titles: "Titles",
  room_decorations: "Decorations",
  avatar_cosmetics: "Avatar",
};

// Available categories
const CATEGORIES: ShopCategory[] = [
  "personalities",
  "themes",
  "card_skins",
  "profile_badges",
  "profile_frames",
  "titles",
  "room_decorations",
  "avatar_cosmetics",
];

interface ShopScreenProps {
  /** Optional: limit to specific categories */
  limitCategories?: ShopCategory[];
  /** Callback when item is purchased */
  onItemPurchased?: (item: ShopItem) => void;
  /** Callback when item is equipped */
  onItemEquipped?: (item: ShopItem) => void;
}

export function ShopScreen({
  limitCategories,
  onItemPurchased,
  onItemEquipped,
}: ShopScreenProps) {
  const c = useThemeColors();
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | "all">("all");
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [showAffordableOnly, setShowAffordableOnly] = useState(false);

  const tokenBalance = useForgeTokens();
  const categoriesToUse = limitCategories || CATEGORIES;

  // Get items for selected category
  const items = useShopItems(
    selectedCategory === "all" ? undefined : selectedCategory
  );

  // Filter items based on preferences
  const filteredItems = items.filter((item) => {
    if (showOwnedOnly && !item.isOwned) return false;
    if (showAffordableOnly && item.cost > tokenBalance) return false;
    if (limitCategories && !limitCategories.includes(item.category)) return false;
    return true;
  });

  const triggerHaptic = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePurchase = (item: ShopItem) => {
    triggerHaptic();
    const result = purchaseShopItem(item.id);
    if (result.success) {
      onItemPurchased?.(item);
    } else {
      // Could show error toast here
      console.log("Purchase failed:", result.error);
    }
  };

  const handleEquip = (item: ShopItem) => {
    triggerHaptic();
    const result = equipShopItem(item.id, item.category);
    if (result.success) {
      onItemEquipped?.(item);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Header with Token Balance */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceEmoji}>🪙</Text>
          <Text style={[styles.balanceAmount, { color: c.text }]}>
            {tokenBalance.toLocaleString()}
          </Text>
          <Text style={[styles.balanceLabel, { color: c.muted }]}>
            Forge Tokens
          </Text>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <Pressable
          onPress={() => setSelectedCategory("all")}
          style={({ pressed }) => [
            styles.categoryTab,
            {
              backgroundColor: selectedCategory === "all" ? c.primary : c.card,
              borderColor: c.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              {
                color: selectedCategory === "all" ? "#000" : c.text,
              },
            ]}
          >
            All
          </Text>
        </Pressable>
        {categoriesToUse.map((category) => (
          <Pressable
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={({ pressed }) => [
              styles.categoryTab,
              {
                backgroundColor: selectedCategory === category ? c.primary : c.card,
                borderColor: c.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === category ? "#000" : c.text,
                },
              ]}
            >
              {CATEGORY_NAMES[category]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Filter Toggles */}
      <View style={[styles.filters, { borderBottomColor: c.border }]}>
        <Pressable
          onPress={() => setShowAffordableOnly(!showAffordableOnly)}
          style={({ pressed }) => [
            styles.filterButton,
            {
              backgroundColor: showAffordableOnly ? c.primary : c.card,
              borderColor: c.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons
            name="wallet-outline"
            size={16}
            color={showAffordableOnly ? "#000" : c.text}
          />
          <Text
            style={[
              styles.filterText,
              { color: showAffordableOnly ? "#000" : c.text },
            ]}
          >
            Affordable
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setShowOwnedOnly(!showOwnedOnly)}
          style={({ pressed }) => [
            styles.filterButton,
            {
              backgroundColor: showOwnedOnly ? c.primary : c.card,
              borderColor: c.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={showOwnedOnly ? "#000" : c.text}
          />
          <Text
            style={[
              styles.filterText,
              { color: showOwnedOnly ? "#000" : c.text },
            ]}
          >
            Owned
          </Text>
        </Pressable>
      </View>

      {/* Items Grid */}
      <ScrollView
        style={styles.itemsScroll}
        contentContainerStyle={styles.itemsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyEmoji, { fontSize: 48 }]}>🛒</Text>
            <Text style={[styles.emptyText, { color: c.muted }]}>
              {showAffordableOnly
                ? "No affordable items"
                : showOwnedOnly
                ? "No owned items in this category"
                : "No items available"}
            </Text>
          </View>
        ) : (
          <View style={styles.itemsGrid}>
            {filteredItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                tokenBalance={tokenBalance}
                onPurchase={handlePurchase}
                onEquip={handleEquip}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

interface ShopItemCardProps {
  item: ShopItem;
  tokenBalance: number;
  onPurchase: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
}

function ShopItemCard({ item, tokenBalance, onPurchase, onEquip }: ShopItemCardProps) {
  const c = useThemeColors();
  const canAfford = tokenBalance >= item.cost;
  const rarityColor = getRarityColor(item.rarity);

  return (
    <View
      style={[
        styles.itemCard,
        {
          backgroundColor: c.card,
          borderColor: item.isEquipped ? c.primary : c.border,
          borderWidth: item.isEquipped ? 2 : 1,
        },
      ]}
    >
      {/* Item Header */}
      <View style={styles.itemHeader}>
        <Text style={styles.itemEmoji}>{item.emoji}</Text>
        <View style={styles.itemInfo}>
          <Text
            style={[styles.itemName, { color }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View style={styles.itemMeta}>
            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: rarityColor + "20" },
              ]}
            >
              <Text style={[styles.rarityText, { color: rarityColor }]}>
                {item.rarity}
              </Text>
            </View>
            {item.unlockLevel && (
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: c.card2 },
                ]}
              >
                <Text style={[styles.levelText, { color: c.muted }]}>
                  Lv.{item.unlockLevel}
                </Text>
              </View>
            )}
          </View>
        </View>
        {item.isEquipped && (
          <Ionicons name="checkmark-circle" size={20} color={c.primary} />
        )}
      </View>

      {/* Description */}
      <Text style={[styles.itemDescription, { color: c.muted }]} numberOfLines={2}>
        {item.description}
      </Text>

      {/* Action Button */}
      {item.isEquipped ? (
        <View style={[styles.buttonContainer, { backgroundColor: c.primary + "20" }]}>
          <Text style={[styles.buttonText, { color: c.primary }]}>Equipped</Text>
        </View>
      ) : item.isOwned ? (
        <Pressable
          onPress={() => onEquip(item)}
          style={({ pressed }) => [
            styles.buttonContainer,
            {
              backgroundColor: c.card2,
              borderColor: c.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: c.text }]}>Equip</Text>
        </Pressable>
      ) : canAfford ? (
        <Pressable
          onPress={() => onPurchase(item)}
          style={({ pressed }) => [
            styles.buttonContainer,
            {
              backgroundColor: c.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.buttonTextPurchase}>
            🪙 {item.cost}
          </Text>
        </Pressable>
      ) : (
        <View
          style={[
            styles.buttonContainer,
            { backgroundColor: c.card2 },
          ]}
        >
          <Text style={[styles.buttonText, { color: c.muted }]}>
            🪙 {item.cost}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: FR.space.x3,
    paddingHorizontal: FR.space.x4,
    borderBottomWidth: 1,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x2,
  },
  balanceEmoji: {
    fontSize: 24,
  },
  balanceAmount: {
    ...FR.type.h2,
    fontWeight: "800",
  },
  balanceLabel: {
    ...FR.type.body,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContent: {
    paddingHorizontal: FR.space.x3,
    gap: FR.space.x2,
  },
  categoryTab: {
    paddingHorizontal: FR.space.x3,
    paddingVertical: FR.space.x2,
    borderRadius: FR.radius.pill,
    borderWidth: 1,
  },
  categoryText: {
    ...FR.type.body,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  filters: {
    flexDirection: "row",
    gap: FR.space.x2,
    paddingVertical: FR.space.x2,
    paddingHorizontal: FR.space.x3,
    borderBottomWidth: 1,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x1,
    paddingHorizontal: FR.space.x2,
    paddingVertical: FR.space.x1,
    borderRadius: FR.radius.soft,
    borderWidth: 1,
  },
  filterText: {
    ...FR.type.body2,
    fontWeight: "600",
  },
  itemsScroll: {
    flex: 1,
  },
  itemsContent: {
    padding: FR.space.x3,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: FR.space.x3,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: FR.space.x8,
  },
  emptyEmoji: {
    marginBottom: FR.space.x2,
  },
  emptyText: {
    ...FR.type.body,
  },
  itemCard: {
    width: (FR.space.container - FR.space.x6) / 2 - FR.space.x1,
    borderRadius: FR.radius.card,
    padding: FR.space.x3,
    gap: FR.space.x2,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x2,
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...FR.type.body,
    fontWeight: "700",
  },
  itemMeta: {
    flexDirection: "row",
    gap: FR.space.x1,
    marginTop: 2,
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
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: "600",
  },
  itemDescription: {
    ...FR.type.caption,
    lineHeight: 14,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: FR.space.x2,
    borderRadius: FR.radius.soft,
  },
  buttonText: {
    ...FR.type.body,
    fontWeight: "700",
  },
  buttonTextPurchase: {
    ...FR.type.body,
    fontWeight: "800",
    color: "#000",
  },
});

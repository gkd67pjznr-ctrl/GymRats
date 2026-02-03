// src/ui/components/Shop/ShopScreen.tsx
// Shop screen for purchasing cosmetics and decorations with Forge Tokens
// Polished version with new design system and purchase confirmation

import { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// New Design System imports
import {
  Text,
  Card,
  surface,
  text as textColors,
  border,
  corners,
  spacing,
  backgroundGradients,
} from "@/src/design";

import { useShopItems, useForgeTokens, purchaseShopItem, equipShopItem } from "@/src/lib/stores/gamificationStore";
import { getRarityColor, type ShopCategory, type ShopItem, type ShopRarity } from "@/src/lib/gamification/shop";
import { ScreenHeader } from "../ScreenHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;

// Category display config with icons
const CATEGORY_CONFIG: Record<ShopCategory, { name: string; icon: string }> = {
  personalities: { name: "Buddies", icon: "person" },
  themes: { name: "Themes", icon: "color-palette" },
  card_skins: { name: "Cards", icon: "card" },
  profile_badges: { name: "Badges", icon: "ribbon" },
  profile_frames: { name: "Frames", icon: "square-outline" },
  titles: { name: "Titles", icon: "text" },
  room_decorations: { name: "Decor", icon: "home" },
  avatar_cosmetics: { name: "Avatar", icon: "body" },
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

// Rarity order for sorting
const RARITY_ORDER: Record<ShopRarity, number> = {
  legendary: 0,
  epic: 1,
  rare: 2,
  common: 3,
};

interface ShopScreenProps {
  /** Optional: limit to specific categories */
  limitCategories?: ShopCategory[];
  /** Show screen header */
  showHeader?: boolean;
  /** Callback when item is purchased */
  onItemPurchased?: (item: ShopItem) => void;
  /** Callback when item is equipped */
  onItemEquipped?: (item: ShopItem) => void;
}

export function ShopScreen({
  limitCategories,
  showHeader = true,
  onItemPurchased,
  onItemEquipped,
}: ShopScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | "all">("all");
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [showAffordableOnly, setShowAffordableOnly] = useState(false);
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [sortBy, setSortBy] = useState<"rarity" | "cost">("rarity");

  const tokenBalance = useForgeTokens();
  const categoriesToUse = limitCategories || CATEGORIES;

  // Get items for selected category
  const items = useShopItems(
    selectedCategory === "all" ? undefined : selectedCategory
  );

  // Filter and sort items
  const filteredItems = items
    .filter((item) => {
      if (showOwnedOnly && !item.isOwned) return false;
      if (showAffordableOnly && item.cost > tokenBalance) return false;
      if (limitCategories && !limitCategories.includes(item.category)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rarity") {
        return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
      }
      return b.cost - a.cost; // Higher cost first
    });

  const triggerHaptic = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style);
    }
  }, []);

  const handlePurchaseRequest = (item: ShopItem) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setConfirmItem(item);
  };

  const handleConfirmPurchase = () => {
    if (!confirmItem) return;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    const result = purchaseShopItem(confirmItem.id);

    if (result.success) {
      onItemPurchased?.(confirmItem);
      // Auto-equip after purchase
      equipShopItem(confirmItem.id, confirmItem.category);
      onItemEquipped?.(confirmItem);
    } else {
      // Could show error toast here
      console.log("Purchase failed:", result.error);
    }

    setConfirmItem(null);
  };

  const handleEquip = (item: ShopItem) => {
    triggerHaptic();
    const result = equipShopItem(item.id, item.category);
    if (result.success) {
      onItemEquipped?.(item);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={backgroundGradients.screenDepth.colors as unknown as readonly [string, string, ...string[]]}
        start={backgroundGradients.screenDepth.start}
        end={backgroundGradients.screenDepth.end}
        locations={backgroundGradients.screenDepth.locations as unknown as readonly [number, number, ...number[]] | undefined}
        style={StyleSheet.absoluteFill}
      />

      {/* Top glow accent */}
      <LinearGradient
        colors={backgroundGradients.topGlow.colors as unknown as readonly [string, string, ...string[]]}
        start={backgroundGradients.topGlow.start}
        end={backgroundGradients.topGlow.end}
        style={styles.topGlow}
      />

      {/* Header */}
      {showHeader && <ScreenHeader title="Shop" />}

      {/* Token Balance Banner */}
      <View style={styles.balanceBanner}>
        <View style={styles.balanceContent}>
          <Text style={styles.balanceEmoji}>🪙</Text>
          <View>
            <Text variant="h2" style={styles.balanceAmount}>
              {tokenBalance.toLocaleString()}
            </Text>
            <Text variant="caption" color="muted">
              Forge Tokens
            </Text>
          </View>
        </View>
        <View style={styles.balanceActions}>
          <Pressable
            onPress={() => setSortBy(sortBy === "rarity" ? "cost" : "rarity")}
            style={({ pressed }) => [
              styles.sortButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons
              name={sortBy === "rarity" ? "diamond-outline" : "cash-outline"}
              size={16}
              color={textColors.secondary}
            />
            <Text variant="caption" color="secondary">
              {sortBy === "rarity" ? "By Rarity" : "By Cost"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <CategoryTab
          label="All"
          icon="apps"
          isSelected={selectedCategory === "all"}
          onPress={() => setSelectedCategory("all")}
        />
        {categoriesToUse.map((category) => (
          <CategoryTab
            key={category}
            label={CATEGORY_CONFIG[category].name}
            icon={CATEGORY_CONFIG[category].icon}
            isSelected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
          />
        ))}
      </ScrollView>

      {/* Filter Toggles */}
      <View style={styles.filters}>
        <FilterChip
          label="Affordable"
          icon="wallet-outline"
          isActive={showAffordableOnly}
          onPress={() => setShowAffordableOnly(!showAffordableOnly)}
        />
        <FilterChip
          label="Owned"
          icon="checkmark-circle-outline"
          isActive={showOwnedOnly}
          onPress={() => setShowOwnedOnly(!showOwnedOnly)}
        />
        <View style={styles.filterSpacer} />
        <Text variant="caption" color="muted">
          {filteredItems.length} items
        </Text>
      </View>

      {/* Items Grid */}
      <ScrollView
        style={styles.itemsScroll}
        contentContainerStyle={styles.itemsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text variant="body" color="muted" style={styles.emptyText}>
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
                onPurchase={handlePurchaseRequest}
                onEquip={handleEquip}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Purchase Confirmation Modal */}
      <PurchaseConfirmModal
        visible={!!confirmItem}
        item={confirmItem}
        tokenBalance={tokenBalance}
        onConfirm={handleConfirmPurchase}
        onCancel={() => setConfirmItem(null)}
      />
    </View>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface CategoryTabProps {
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}

function CategoryTab({ label, icon, isSelected, onPress }: CategoryTabProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryTab,
        {
          backgroundColor: isSelected ? textColors.accent : surface.raised,
          borderColor: isSelected ? textColors.accent : border.subtle,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons
        name={icon as any}
        size={14}
        color={isSelected ? textColors.inverse : textColors.secondary}
      />
      <Text
        variant="caption"
        style={{
          color: isSelected ? textColors.inverse : textColors.primary,
          fontWeight: isSelected ? "700" : "500",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface FilterChipProps {
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}

function FilterChip({ label, icon, isActive, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor: isActive ? textColors.accent + "20" : surface.raised,
          borderColor: isActive ? textColors.accent : border.subtle,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons
        name={icon as any}
        size={14}
        color={isActive ? textColors.accent : textColors.secondary}
      />
      <Text
        variant="caption"
        style={{
          color: isActive ? textColors.accent : textColors.secondary,
          fontWeight: isActive ? "600" : "400",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface ShopItemCardProps {
  item: ShopItem;
  tokenBalance: number;
  onPurchase: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
}

function ShopItemCard({ item, tokenBalance, onPurchase, onEquip }: ShopItemCardProps) {
  const canAfford = tokenBalance >= item.cost;
  const rarityColor = getRarityColor(item.rarity);

  return (
    <Card
      variant="raised"
      style={[
        styles.itemCard,
        item.isEquipped && {
          borderColor: textColors.accent,
          borderWidth: 2,
        },
      ]}
    >
      {/* Rarity indicator line */}
      <View style={[styles.rarityLine, { backgroundColor: rarityColor }]} />

      {/* Item Header */}
      <View style={styles.itemHeader}>
        <Text style={styles.itemEmoji}>{item.emoji}</Text>
        <View style={styles.itemInfo}>
          <Text variant="body" style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.itemMeta}>
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor + "20" }]}>
              <Text style={[styles.rarityText, { color: rarityColor }]}>
                {item.rarity}
              </Text>
            </View>
            {item.unlockLevel && (
              <View style={[styles.levelBadge, { backgroundColor: surface.floating }]}>
                <Text style={styles.levelText}>Lv.{item.unlockLevel}</Text>
              </View>
            )}
          </View>
        </View>
        {item.isEquipped && (
          <Ionicons name="checkmark-circle" size={18} color={textColors.accent} />
        )}
      </View>

      {/* Description */}
      <Text variant="caption" color="muted" numberOfLines={2} style={styles.itemDescription}>
        {item.description}
      </Text>

      {/* Action Button */}
      {item.isEquipped ? (
        <View style={[styles.actionButton, { backgroundColor: textColors.accent + "15" }]}>
          <Text variant="caption" style={{ color: textColors.accent, fontWeight: "600" }}>
            Equipped
          </Text>
        </View>
      ) : item.isOwned ? (
        <Pressable
          onPress={() => onEquip(item)}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: surface.floating,
              borderColor: border.default,
              borderWidth: 1,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text variant="caption" style={{ color: textColors.primary, fontWeight: "600" }}>
            Equip
          </Text>
        </Pressable>
      ) : canAfford ? (
        <Pressable
          onPress={() => onPurchase(item)}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: textColors.accent,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text variant="caption" style={{ color: textColors.inverse, fontWeight: "700" }}>
            🪙 {item.cost.toLocaleString()}
          </Text>
        </Pressable>
      ) : (
        <View style={[styles.actionButton, { backgroundColor: surface.sunken }]}>
          <Text variant="caption" color="muted">
            🪙 {item.cost.toLocaleString()}
          </Text>
        </View>
      )}
    </Card>
  );
}

interface PurchaseConfirmModalProps {
  visible: boolean;
  item: ShopItem | null;
  tokenBalance: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function PurchaseConfirmModal({
  visible,
  item,
  tokenBalance,
  onConfirm,
  onCancel,
}: PurchaseConfirmModalProps) {
  if (!item) return null;

  const rarityColor = getRarityColor(item.rarity);
  const newBalance = tokenBalance - item.cost;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Card variant="elevated" style={styles.modalContent}>
          {/* Item Preview */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalEmoji}>{item.emoji}</Text>
            <Text variant="h3" style={styles.modalTitle}>
              {item.name}
            </Text>
            <View style={[styles.modalRarityBadge, { backgroundColor: rarityColor + "20" }]}>
              <Text style={[styles.modalRarityText, { color: rarityColor }]}>
                {item.rarity}
              </Text>
            </View>
          </View>

          <Text variant="body" color="secondary" style={styles.modalDescription}>
            {item.description}
          </Text>

          {/* Cost Breakdown */}
          <View style={styles.costBreakdown}>
            <View style={styles.costRow}>
              <Text variant="body" color="muted">Current Balance</Text>
              <Text variant="body">🪙 {tokenBalance.toLocaleString()}</Text>
            </View>
            <View style={styles.costRow}>
              <Text variant="body" color="muted">Item Cost</Text>
              <Text variant="body" style={{ color: textColors.danger }}>
                - 🪙 {item.cost.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.costRow, styles.costTotal]}>
              <Text variant="body" style={{ fontWeight: "700" }}>New Balance</Text>
              <Text variant="body" style={{ fontWeight: "700", color: textColors.accent }}>
                🪙 {newBalance.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalButtonSecondary,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text variant="body" color="secondary" style={{ fontWeight: "600" }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalButtonPrimary,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text variant="body" style={{ color: textColors.inverse, fontWeight: "700" }}>
                Purchase
              </Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surface.base,
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    pointerEvents: "none",
  },

  // Balance Banner
  balanceBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: surface.raised,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: corners.lg,
    borderWidth: 1,
    borderColor: border.subtle,
  },
  balanceContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  balanceEmoji: {
    fontSize: 32,
  },
  balanceAmount: {
    fontWeight: "800",
  },
  balanceActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: corners.sm,
    backgroundColor: surface.floating,
  },

  // Category Tabs
  categoryScroll: {
    maxHeight: 48,
    marginTop: spacing.sm,
  },
  categoryContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: corners.pill,
    borderWidth: 1,
  },

  // Filters
  filters: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: corners.sm,
    borderWidth: 1,
  },
  filterSpacer: {
    flex: 1,
  },

  // Items Grid
  itemsScroll: {
    flex: 1,
  },
  itemsContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },

  // Item Card
  itemCard: {
    width: CARD_WIDTH,
    padding: spacing.sm,
    gap: spacing.xs,
    overflow: "hidden",
  },
  rarityLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: corners.md,
    borderTopRightRadius: corners.md,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: "700",
    fontSize: 13,
  },
  itemMeta: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  rarityBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  levelBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  levelText: {
    fontSize: 9,
    fontWeight: "600",
    color: textColors.muted,
  },
  itemDescription: {
    lineHeight: 14,
    minHeight: 28,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    borderRadius: corners.sm,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: surface.overlay.medium,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHeader: {
    alignItems: "center",
    gap: spacing.xs,
  },
  modalEmoji: {
    fontSize: 56,
  },
  modalTitle: {
    fontWeight: "800",
    textAlign: "center",
  },
  modalRarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: corners.sm,
  },
  modalRarityText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  modalDescription: {
    textAlign: "center",
  },
  costBreakdown: {
    backgroundColor: surface.sunken,
    borderRadius: corners.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costTotal: {
    borderTopWidth: 1,
    borderTopColor: border.subtle,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: corners.md,
  },
  modalButtonSecondary: {
    backgroundColor: surface.floating,
    borderWidth: 1,
    borderColor: border.default,
  },
  modalButtonPrimary: {
    backgroundColor: textColors.accent,
  },
});

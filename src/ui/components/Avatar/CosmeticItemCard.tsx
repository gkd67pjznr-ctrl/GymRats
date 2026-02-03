// src/ui/components/Avatar/CosmeticItemCard.tsx
// Individual cosmetic item card for avatar customization

import { View, Text, Pressable, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme";
import { makeDesignSystem } from "../../designSystem";
import { getRarityColor, type ShopItem, type ShopRarity } from "../../../lib/gamification/shop";

interface CosmeticItemCardProps {
  item: ShopItem & { isOwned: boolean; isEquipped?: boolean };
  userLevel: number;
  onPress: () => void;
  tokenBalance: number;
}

export function CosmeticItemCard({
  item,
  userLevel,
  onPress,
  tokenBalance,
}: CosmeticItemCardProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const isOwned = item.isOwned;
  const isEquipped = item.isEquipped ?? false;
  const isLocked = (item.unlockLevel ?? 0) > userLevel;
  const canAfford = tokenBalance >= item.cost;

  // Determine card state
  const getStatusText = (): string => {
    if (isEquipped) return "EQUIPPED";
    if (isOwned) return "OWNED";
    if (isLocked) return `LVL ${item.unlockLevel}`;
    if (item.cost === 0) return "FREE";
    return `${item.cost}`;
  };

  const getStatusColor = (): string => {
    if (isEquipped) return ds.tone.accent;
    if (isOwned) return ds.tone.success;
    if (isLocked) return ds.tone.muted;
    if (!canAfford) return ds.tone.error;
    return ds.tone.accent;
  };

  const isDisabled = isLocked || (isEquipped && isOwned);
  const rarityColor = getRarityColor(item.rarity);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: isEquipped ? ds.tone.accent : c.border,
          borderWidth: isEquipped ? 2 : 1,
          opacity: pressed ? 0.7 : isDisabled ? 0.5 : 1,
        },
      ]}
    >
      {/* Rarity indicator */}
      <View
        style={[
          styles.rarityBadge,
          { backgroundColor: rarityColor + "20" },
        ]}
      >
        <Text style={[styles.rarityText, { color: rarityColor }]}>
          {getRarityLabel(item.rarity)}
        </Text>
      </View>

      {/* Emoji icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isEquipped ? ds.tone.accent + "20" : c.bg,
          },
        ]}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      {/* Item name */}
      <Text
        style={[styles.name, { color: c.text }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>

      {/* Status badge */}
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: getStatusColor() + "20",
          },
        ]}
      >
        {!isOwned && !isLocked && item.cost > 0 && (
          <Text style={[styles.tokenIcon, { color: getStatusColor() }]}>
            🪙
          </Text>
        )}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {/* Equipped checkmark */}
      {isEquipped && (
        <View
          style={[
            styles.equippedCheck,
            { backgroundColor: ds.tone.accent },
          ]}
        >
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

function getRarityLabel(rarity: ShopRarity): string {
  switch (rarity) {
    case "common":
      return "C";
    case "rare":
      return "R";
    case "epic":
      return "E";
    case "legendary":
      return "L";
    default:
      return "";
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    maxWidth: "48%",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  rarityBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  emoji: {
    fontSize: 28,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tokenIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  equippedCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },
});

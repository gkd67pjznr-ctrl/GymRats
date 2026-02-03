// src/ui/components/Avatar/AvatarCosmeticsModal.tsx
// Full-screen modal for avatar cosmetics customization

import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "../../theme";
import { makeDesignSystem } from "../../designSystem";
import { CosmeticItemGrid, type AvatarCosmeticTab } from "./CosmeticItemGrid";
import { AvatarView } from "./AvatarView";
import {
  useShopItems,
  useInventory,
  useForgeTokens,
  useCurrentLevel,
  useGamificationStore,
} from "../../../lib/stores/gamificationStore";
import type { ShopItem } from "../../../lib/gamification/shop";

interface AvatarCosmeticsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  artStyle: string | null;
  growthStage: number;
}

const TABS: { id: AvatarCosmeticTab; label: string; emoji: string }[] = [
  { id: "hair", label: "Hair", emoji: "💇" },
  { id: "outfit", label: "Outfit", emoji: "👕" },
  { id: "accessories", label: "Accessories", emoji: "🎒" },
];

export function AvatarCosmeticsModal({
  visible,
  onClose,
  userId,
  displayName,
  avatarUrl,
  artStyle,
  growthStage,
}: AvatarCosmeticsModalProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const [activeTab, setActiveTab] = useState<AvatarCosmeticTab>("hair");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get shop data
  const items = useShopItems("avatar_cosmetics");
  const inventory = useInventory();
  const tokenBalance = useForgeTokens();
  const userLevel = useCurrentLevel();
  const { purchaseItem, equipItem } = useGamificationStore();

  // Get equipped items for preview
  const equippedHair = inventory.equippedHairstyle || "hair_default";
  const equippedOutfit = inventory.equippedOutfit || "outfit_default";
  const equippedAccessories = inventory.equippedAccessories || ["acc_none"];

  const handleItemPress = async (item: ShopItem & { isOwned: boolean; isEquipped?: boolean }) => {
    if (isProcessing) return;

    const isOwned = item.isOwned;
    const isLocked = (item.unlockLevel ?? 0) > userLevel;

    if (isLocked) {
      Alert.alert(
        "Level Required",
        `You need to reach level ${item.unlockLevel} to unlock this item.`,
        [{ text: "OK" }]
      );
      return;
    }

    if (isOwned) {
      // Equip the item
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsProcessing(true);

      const result = equipItem(item.id, "avatar_cosmetics");
      setIsProcessing(false);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Error", result.error || "Failed to equip item");
      }
    } else {
      // Show purchase confirmation
      const canAfford = tokenBalance >= item.cost;

      if (!canAfford) {
        Alert.alert(
          "Insufficient Tokens",
          `You need ${item.cost} tokens but only have ${tokenBalance}.`,
          [{ text: "OK" }]
        );
        return;
      }

      Alert.alert(
        "Purchase Item",
        `Buy "${item.name}" for ${item.cost} tokens?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Purchase",
            onPress: async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsProcessing(true);

              const purchaseResult = purchaseItem(item.id);

              if (purchaseResult.success) {
                // Auto-equip after purchase
                equipItem(item.id, "avatar_cosmetics");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } else {
                Alert.alert("Error", purchaseResult.error || "Failed to purchase item");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }

              setIsProcessing(false);
            },
          },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <Text style={[styles.title, { color: c.text }]}>Avatar Cosmetics</Text>

          {/* Token Balance */}
          <View style={styles.tokenDisplay}>
            <Text style={styles.tokenEmoji}>🪙</Text>
            <Text style={[styles.tokenBalance, { color: ds.tone.accent }]}>
              {tokenBalance.toLocaleString()}
            </Text>
          </View>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: c.muted }]}>Done</Text>
          </Pressable>
        </View>

        {/* Avatar Preview */}
        <View style={[styles.previewSection, { backgroundColor: c.card }]}>
          <AvatarView
            userId={userId}
            displayName={displayName}
            avatarUrl={avatarUrl}
            artStyle={artStyle as any}
            growthStage={growthStage}
            size="xl"
          />
          <View style={styles.equippedInfo}>
            <Text style={[styles.equippedLabel, { color: c.muted }]}>
              Currently Equipped:
            </Text>
            <Text style={[styles.equippedItems, { color: c.text }]}>
              {getItemEmoji(equippedHair, items)} {getItemEmoji(equippedOutfit, items)}{" "}
              {equippedAccessories.map((acc) => getItemEmoji(acc, items)).join(" ")}
            </Text>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, { backgroundColor: c.card }]}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab(tab.id);
                }}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive ? ds.tone.accent + "20" : "transparent",
                    borderBottomColor: isActive ? ds.tone.accent : "transparent",
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? ds.tone.accent : c.muted },
                  ]}
                >
                  {tab.label}
                </Text>
                <Text style={[styles.tabCount, { color: c.muted }]}>
                  ({getItemCount(tab.id, items)})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Item Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CosmeticItemGrid
            items={items}
            category={activeTab}
            userLevel={userLevel}
            tokenBalance={tokenBalance}
            onItemPress={handleItemPress}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

function getItemEmoji(
  itemId: string,
  items: (ShopItem & { isOwned: boolean; isEquipped?: boolean })[]
): string {
  const item = items.find((i) => i.id === itemId);
  return item?.emoji || "❓";
}

function getItemCount(
  category: AvatarCosmeticTab,
  items: (ShopItem & { isOwned: boolean; isEquipped?: boolean })[]
): number {
  const prefix = category === "hair" ? "hair_" : category === "outfit" ? "outfit_" : "acc_";
  return items.filter((i) => i.id.startsWith(prefix)).length;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    flex: 1,
  },
  tokenDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tokenEmoji: {
    fontSize: 16,
  },
  tokenBalance: {
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    padding: 8,
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  previewSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  equippedInfo: {
    flex: 1,
    gap: 4,
  },
  equippedLabel: {
    fontSize: 12,
  },
  equippedItems: {
    fontSize: 24,
    letterSpacing: 4,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabCount: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});

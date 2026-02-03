// src/ui/components/Shop/RoomDecoration.tsx
// Slot-based room decoration interface - tap to swap decorations

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  useShopItems,
  useRoomDecorations,
  useInventory,
  equipRoomDecoration,
} from "@/src/lib/stores/gamificationStore";
import { getRarityColor, type ShopItem } from "@/src/lib/gamification/shop";
import { ROOM_SLOTS, getSlotById, getItemsForSlot, getDefaultRoomDecorations } from "@/src/lib/hangout/roomSlots";
import { useThemeColors } from "@/src/ui/theme";
import { FR } from "@/src/ui/GrStyle";

interface RoomDecorationProps {
  /** Optional: limit to specific slots */
  limitSlots?: string[];
  /** Callback when decoration is equipped */
  onDecorationEquipped?: (slotId: string, itemId: string) => void;
  /** Show preview only (no equipping) */
  previewOnly?: boolean;
}

export function RoomDecoration({
  limitSlots,
  onDecorationEquipped,
  previewOnly = false,
}: RoomDecorationProps) {
  const c = useThemeColors();
  const roomDecorations = useRoomDecorations();
  const inventory = useInventory();
  const allShopItems = useShopItems("room_decorations");

  // Slot picker modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const slotsToUse = limitSlots
    ? ROOM_SLOTS.filter(slot => limitSlots.includes(slot.id))
    : ROOM_SLOTS;

  const triggerHaptic = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSlotPress = (slotId: string) => {
    if (previewOnly) return;
    triggerHaptic();
    setSelectedSlotId(slotId);
    setModalVisible(true);
  };

  const handleEquipItem = (itemId: string) => {
    if (!selectedSlotId) return;

    const result = equipRoomDecoration(selectedSlotId, itemId);
    if (result.success) {
      onDecorationEquipped?.(selectedSlotId, itemId);
      setModalVisible(false);
      setSelectedSlotId(null);
    } else {
      console.log("Equip failed:", result.error);
    }
  };

  const getEquippedItem = (slotId: string): ShopItem | undefined => {
    const itemId = roomDecorations[slotId];
    return allShopItems.find(item => item.id === itemId);
  };

  const getAvailableItems = (slotId: string): ShopItem[] => {
    return getItemsForSlot(slotId as any, allShopItems);
  };

  const selectedSlot = selectedSlotId ? getSlotById(selectedSlotId as any) : null;
  const availableItems = selectedSlot ? getItemsForSlot(selectedSlotId as any, allShopItems) : [];

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>
          🏠 Room Decorations
        </Text>
        <Text style={[styles.headerSubtitle, { color: c.muted }]}>
          Tap a slot to swap decorations
        </Text>
      </View>

      {/* Room Slots Grid */}
      <ScrollView
        style={styles.slotsScroll}
        contentContainerStyle={styles.slotsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.slotsGrid}>
          {slotsToUse.map((slot) => {
            const equippedItem = getEquippedItem(slot.id);
            const isDefault = equippedItem?.id === slot.defaultItemId;

            return (
              <Pressable
                key={slot.id}
                onPress={() => handleSlotPress(slot.id)}
                disabled={previewOnly}
                style={({ pressed }) => [
                  styles.slotCard,
                  {
                    backgroundColor: c.card,
                    borderColor: c.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                {/* Slot Position Indicator */}
                <View
                  style={[
                    styles.slotPosition,
                    {
                      backgroundColor: c.card2,
                      left: slot.position.x / 8,
                      top: slot.position.y / 8,
                    },
                  ]}
                >
                  <Text style={styles.slotPositionText}>{slot.icon}</Text>
                </View>

                {/* Slot Info */}
                <View style={styles.slotInfo}>
                  <View style={styles.slotHeader}>
                    <Text style={[styles.slotName, { color: c.text }]}>
                      {slot.name}
                    </Text>
                    {isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: c.card2 }]}>
                        <Text style={[styles.defaultBadgeText, { color: c.muted }]}>
                          Default
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.slotDescription, { color: c.muted }]} numberOfLines={1}>
                    {equippedItem?.name || slot.description}
                  </Text>
                </View>

                {/* Equipped Item */}
                <View style={styles.equippedItem}>
                  <Text style={styles.equippedEmoji}>
                    {equippedItem?.emoji || slot.icon}
                  </Text>
                  {!previewOnly && (
                    <Ionicons name="chevron-forward" size={16} color={c.muted} />
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
              ? "Preview mode - tap to view available items for each slot"
              : "Tap any slot to swap decorations from your inventory"}
          </Text>
        </View>
      </ScrollView>

      {/* Slot Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedSlotId(null);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setModalVisible(false);
            setSelectedSlotId(null);
          }}
        >
          <Pressable style={styles.modalContent}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalSlotIcon}>{selectedSlot?.icon}</Text>
                <View>
                  <Text style={[styles.modalTitle, { color: c.text }]}>
                    {selectedSlot?.name}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: c.muted }]}>
                    {selectedSlot?.description}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  setSelectedSlotId(null);
                }}
                style={({ pressed }) => [
                  styles.closeButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="close" size={24} color={c.text} />
              </Pressable>
            </View>

            {/* Available Items */}
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {availableItems.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🔒</Text>
                  <Text style={[styles.emptyText, { color: c.muted }]}>
                    No items available for this slot
                  </Text>
                </View>
              ) : (
                availableItems.map((item) => {
                  const isEquipped = roomDecorations[selectedSlotId!] === item.id;
                  const isOwned =
                    inventory.ownedItems.includes(item.id) ||
                    inventory.ownedDecorations.includes(item.id) ||
                    item.cost === 0;
                  const rarityColor = getRarityColor(item.rarity);

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleEquipItem(item)}
                      disabled={!isOwned || isEquipped}
                      style={({ pressed }) => [
                        styles.itemRow,
                        {
                          backgroundColor: isEquipped
                            ? c.primary + "15"
                            : c.card,
                          borderColor: isEquipped
                            ? c.primary
                            : c.border,
                          opacity: !isOwned
                            ? 0.5
                            : pressed
                            ? 0.7
                            : 1,
                        },
                      ]}
                    >
                      {/* Item Icon */}
                      <View
                        style={[
                          styles.itemIcon,
                          { backgroundColor: c.card2 },
                        ]}
                      >
                        <Text style={styles.itemEmoji}>{item.emoji}</Text>
                      </View>

                      {/* Item Info */}
                      <View style={styles.itemInfo}>
                        <View style={styles.itemHeader}>
                          <Text style={[styles.itemName, { color }]}>
                            {item.name}
                          </Text>
                          {isEquipped && (
                            <View
                              style={[
                                styles.equippedBadgeSmall,
                                { backgroundColor: c.primary },
                              ]}
                            >
                              <Text style={styles.equippedBadgeText}>
                                ✓
                              </Text>
                            </View>
                          )}
                          {item.cost > 0 && !isOwned && (
                            <View
                              style={[
                                styles.priceBadge,
                                { backgroundColor: c.card2 },
                              ]}
                            >
                              <Text style={[styles.priceText, { color: c.muted }]}>
                                🪙 {item.cost}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[styles.itemDescription, { color: c.muted }]}
                          numberOfLines={1}
                        >
                          {item.description}
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
                        </View>
                      </View>

                      {/* Action */}
                      <View style={styles.itemAction}>
                        {isEquipped ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={c.primary}
                          />
                        ) : !isOwned ? (
                          <Ionicons name="lock-closed" size={20} color={c.muted} />
                        ) : (
                          <Ionicons
                            name="ellipse-outline"
                            size={24}
                            color={c.border}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: FR.space.x4,
    paddingHorizontal: FR.space.x4,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...FR.type.h2,
  },
  headerSubtitle: {
    ...FR.type.body,
    marginTop: FR.space.x1,
  },
  slotsScroll: {
    flex: 1,
  },
  slotsContent: {
    padding: FR.space.x3,
  },
  slotsGrid: {
    gap: FR.space.x3,
  },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: FR.space.x3,
    borderRadius: FR.radius.card,
    borderWidth: 1,
    gap: FR.space.x3,
  },
  slotPosition: {
    position: "absolute",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  slotPositionText: {
    fontSize: 16,
  },
  slotInfo: {
    flex: 1,
    marginLeft: 40,
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x2,
  },
  slotName: {
    ...FR.type.body,
    fontWeight: "700",
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    ...FR.type.micro,
    fontWeight: "600",
  },
  slotDescription: {
    ...FR.type.caption,
  },
  equippedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x2,
  },
  equippedEmoji: {
    fontSize: 32,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: FR.radius.card,
    borderTopRightRadius: FR.radius.card,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: FR.space.x4,
    paddingHorizontal: FR.space.x4,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x3,
  },
  modalSlotIcon: {
    fontSize: 28,
  },
  modalTitle: {
    ...FR.type.h3,
  },
  modalSubtitle: {
    ...FR.type.body,
  },
  closeButton: {
    padding: FR.space.x2,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingVertical: FR.space.x2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: FR.space.x8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: FR.space.x2,
  },
  emptyText: {
    ...FR.type.body,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: FR.space.x3,
    marginHorizontal: FR.space.x3,
    borderRadius: FR.radius.card,
    borderWidth: 1,
    gap: FR.space.x3,
    marginBottom: FR.space.x2,
  },
  itemIcon: {
    width: 48,
    height: 48,
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
  priceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceText: {
    ...FR.type.micro,
    fontWeight: "600",
  },
  itemDescription: {
    ...FR.type.caption,
  },
  itemMeta: {
    flexDirection: "row",
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
  itemAction: {
    alignItems: "center",
  },
});

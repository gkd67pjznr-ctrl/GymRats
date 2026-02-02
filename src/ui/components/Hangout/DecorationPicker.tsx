// src/ui/components/Hangout/DecorationPicker.tsx
// Modal for selecting and placing decorations in the hangout room

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../theme";
import type { DecorationCategory } from "../../../lib/hangout/hangoutTypes";

interface DecorationPickerProps {
  visible: boolean;
  onClose: () => void;
  onAddDecoration: (
    itemId: string,
    itemType: DecorationCategory,
    position: { x: number; y: number }
  ) => Promise<boolean>;
  loading?: boolean;
}

// Available decoration items by category
const DECORATIONS: Record<
  DecorationCategory,
  Array<{ id: string; name: string; description: string; icon: string }>
> = {
  furniture: [
    { id: "bench", name: "Workout Bench", description: "Classic gym bench", icon: "🏋️" },
    { id: "rack", name: "Weight Rack", description: "Organize your plates", icon: "🏆" },
    { id: "couch", name: "Recovery Couch", description: "Rest between sets", icon: "🛋️" },
    { id: "plant", name: "Gym Plant", description: "Add some greenery", icon: "🪴" },
  ],
  poster: [
    { id: "motivation1", name: "No Pain", description: '"No Pain, No Gain"', icon: "💪" },
    { id: "motivation2", name: "Stronger", description: '"Get Stronger Every Day"', icon: "🔥" },
    { id: "motivation3", name: "Focus", description: '"Stay Focused"', icon: "🎯" },
    { id: "brand", name: "Forgerank Logo", description: "Show your pride", icon: "⚡" },
  ],
  equipment: [
    { id: "dumbbells", name: "Dumbbell Rack", description: "Free weights station", icon: "🏋️" },
    { id: "kettlebell", name: "Kettlebell", description: "Functional training", icon: "🔔" },
    { id: "barbell", name: "Barbell Set", description: "Powerlifting essentials", icon: "🏋️" },
    { id: "plates", name: "Weight Plates", description: "Load the bar", icon: "⭕" },
  ],
  trophies: [
    { id: "gold_cup", name: "Gold Trophy", description: "Achievement unlocked", icon: "🏆" },
    { id: "silver_cup", name: "Silver Trophy", description: "Second place", icon: "🥈" },
    { id: "bronze_cup", name: "Bronze Trophy", description: "Third place", icon: "🥉" },
    { id: "plaque", name: "Achievement Plaque", description: "Milestone reached", icon: "🎖️" },
  ],
  plants: [
    { id: "monstera", name: "Monstera", description: "Large tropical plant", icon: "🌿" },
    { id: "succulent", name: "Succulent", description: "Small desert plant", icon: "🌵" },
    { id: "fern", name: "Boston Fern", description: "Hanging plant", icon: "🌿" },
    { id: "bamboo", name: "Lucky Bamboo", description: "Good fortune", icon: "🎋" },
  ],
};

const CATEGORIES: Array<{ id: DecorationCategory; name: string; icon: string }> = [
  { id: "furniture", name: "Furniture", icon: "🪑" },
  { id: "poster", name: "Posters", icon: "🖼️" },
  { id: "equipment", name: "Equipment", icon: "🏋️" },
  { id: "trophies", name: "Trophies", icon: "🏆" },
  { id: "plants", name: "Plants", icon: "🌿" },
];

export function DecorationPicker(props: DecorationPickerProps) {
  const { visible, onClose, onAddDecoration, loading = false } = props;

  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const [selectedCategory, setSelectedCategory] = useState<DecorationCategory>("furniture");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const currentDecorations = DECORATIONS[selectedCategory];

  const handleAddDecoration = async () => {
    if (!selectedItem) return;

    // Default position - will be adjusted by user later
    const position = {
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 200,
    };

    const success = await onAddDecoration(selectedItem, selectedCategory, position);
    if (success) {
      setSelectedItem(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.content,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.text }]}>
              Add Decoration
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: c.muted }]}>
                ✕
              </Text>
            </Pressable>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              const itemCount = DECORATIONS[category.id].length;

              return (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setSelectedItem(null);
                  }}
                  style={[
                    styles.categoryTab,
                    {
                      backgroundColor: isSelected ? ds.tone.accent : c.bg,
                      borderColor: isSelected ? ds.tone.accent : c.border,
                    },
                  ]}
                >
                  <Text style={[styles.categoryIcon, { fontSize: 24 }]}>
                    {category.icon}
                  </Text>
                  <Text
                    style={[
                      styles.categoryName,
                      { color: isSelected ? c.bg : c.text },
                    ]}
                  >
                    {category.name}
                  </Text>
                  <Text
                    style={[
                      styles.categoryCount,
                      { color: isSelected ? c.bg : c.muted },
                    ]}
                  >
                    {itemCount}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Decoration Items */}
          <ScrollView
            style={styles.itemsScroll}
            contentContainerStyle={styles.itemsContent}
          >
            {currentDecorations.map((item) => {
              const isSelected = selectedItem === item.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedItem(isSelected ? null : item.id)}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: isSelected ? ds.tone.accent : c.bg,
                      borderColor: isSelected ? ds.tone.accent : c.border,
                    },
                  ]}
                >
                  <View style={styles.itemIcon}>
                    <Text style={styles.itemEmoji}>{item.icon}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text
                      style={[
                        styles.itemName,
                        { color: isSelected ? c.bg : c.text },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.itemDescription,
                        { color: isSelected ? c.bg : c.muted },
                      ]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: c.border }]}>
            <Pressable
              onPress={onClose}
              style={[
                styles.button,
                styles.buttonSecondary,
                { borderColor: c.border },
              ]}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: c.text }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleAddDecoration}
              style={[
                styles.button,
                styles.buttonPrimary,
                {
                  backgroundColor: ds.tone.accent,
                  opacity: !selectedItem || loading ? 0.5 : 1,
                },
              ]}
              disabled={!selectedItem || loading}
            >
              <Text style={[styles.buttonText, { color: c.bg }]}>
                {loading ? "Adding..." : "Add Decoration"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "700",
  },
  categoriesScroll: {
    borderBottomWidth: 1,
  },
  categoriesContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 70,
    gap: 4,
  },
  categoryIcon: {},
  categoryName: {
    fontSize: 12,
    fontWeight: "700",
  },
  categoryCount: {
    fontSize: 10,
    fontWeight: "600",
  },
  itemsScroll: {
    flex: 1,
  },
  itemsContent: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  itemIcon: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonSecondary: {},
  buttonPrimary: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

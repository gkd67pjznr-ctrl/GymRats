// src/ui/components/Hangout/RoomDecoration.tsx
// Room decoration component

import { View, Text, Pressable, StyleSheet } from "react-native";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../theme";
import type { RoomDecoration } from "../../../lib/hangout/hangoutTypes";
import { getDecorationById } from "../../../lib/hangout/decorationManager";

interface RoomDecorationProps {
  decoration: RoomDecoration;
  style?: any;
  onPress?: () => void;
}

export function RoomDecoration(props: RoomDecorationProps) {
  const { decoration, style, onPress } = props;

  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const decorationItem = getDecorationById(decoration.itemId);

  if (!decorationItem) {
    // Fallback for unknown decorations
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.container,
          {
            backgroundColor: c.card,
            borderColor: c.border,
          },
          style,
        ]}
      >
        <Text style={{ color: c.muted, fontSize: 12 }}>
          ?
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: c.card,
          borderColor: c.border,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: ds.tone.accent },
        ]}
      >
        <Text style={{ color: c.bg, fontSize: 16, fontWeight: "900" }}>
          {getDecorationIcon(decoration.itemType)}
        </Text>
      </View>

      <Text
        style={[
          styles.label,
          { color: c.muted },
        ]}
        numberOfLines={1}
      >
        {decorationItem.name}
      </Text>
    </Pressable>
  );
}

// Helper function to get decoration icon based on type
function getDecorationIcon(itemType: string): string {
  switch (itemType) {
    case "furniture":
      return "🪑";
    case "poster":
      return "🖼️";
    case "equipment":
      return "🏋️";
    case "trophies":
      return "🏆";
    case "plants":
      return "🌱";
    default:
      return " deco";
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    textAlign: "center",
  },
});
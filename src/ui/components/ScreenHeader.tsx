import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
}

export function ScreenHeader({
  title,
  onBack,
  backLabel,
  rightAction,
  leftAction,
}: ScreenHeaderProps) {
  const router = useRouter();
  const c = useThemeColors();

  const handleBack = onBack ?? (() => router.back());

  // Note: Top padding is now handled by the root layout's AuthenticatedLayout
  // which applies marginTop for the GlobalTopBar

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={styles.row}>
        {/* Left: back button or custom */}
        <View style={styles.side}>
          {leftAction ?? (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={22} color={c.text} />
              <Text style={[styles.backText, { color: c.text }]}>
                {backLabel ?? "Back"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Center: title */}
        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>

        {/* Right: optional action */}
        <View style={[styles.side, styles.rightSide]}>
          {rightAction}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150,150,150,0.2)",
  },
  row: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  side: {
    width: 80,
    flexDirection: "row",
    alignItems: "center",
  },
  rightSide: {
    justifyContent: "flex-end",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },
});

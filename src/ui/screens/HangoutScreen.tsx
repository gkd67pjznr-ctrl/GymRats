// src/ui/screens/HangoutScreen.tsx
// Hangout room screen

import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { makeDesignSystem } from "../designSystem";
import { useThemeColors } from "../theme";
import { useUser } from "../../lib/stores/authStore";
import { useHangoutStore } from "../../lib/hangout/hangoutStore";
import { HangoutRoom } from "../components/Hangout/HangoutRoom";
import { useIsHangoutHydrated } from "../../lib/hangout/hangoutStore";

export default function HangoutScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const user = useUser();
  const hydrated = useIsHangoutHydrated();

  // Hydrate hangout data on mount
  useEffect(() => {
    const hydrate = async () => {
      if (user) {
        await useHangoutStore.getState().hydrate();
      }
    };

    hydrate();
  }, [user]);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Text style={[styles.errorText, { color: c.text }]}>
          Please sign in to view the hangout room.
        </Text>
      </View>
    );
  }

  if (!hydrated) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Text style={[styles.loadingText, { color: c.muted }]}>
          Loading hangout room...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <HangoutRoom
        onAddDecoration={() => {
          // TODO: Implement decoration addition
          console.log("Add decoration functionality not yet implemented");
        }}
        onCustomizeAvatar={() => {
          router.push("/avatar");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});
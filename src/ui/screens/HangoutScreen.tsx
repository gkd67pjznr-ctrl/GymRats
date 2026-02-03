// src/ui/screens/HangoutScreen.tsx
// Hangout room screen with new design system

import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// New Design System imports
import {
  Text,
  surface,
  backgroundGradients,
} from "../../design";
import { ScreenHeader } from "../components/ScreenHeader";
import { useUser } from "../../lib/stores/authStore";
import { useHangoutStore, useIsHangoutHydrated } from "../../lib/hangout/hangoutStore";
import { HangoutRoom } from "../components/Hangout/HangoutRoom";

export default function HangoutScreen() {
  const router = useRouter();
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
      <View style={styles.container}>
        <LinearGradient
          colors={backgroundGradients.screenDepth.colors as unknown as readonly [string, string, ...string[]]}
          start={backgroundGradients.screenDepth.start}
          end={backgroundGradients.screenDepth.end}
          locations={backgroundGradients.screenDepth.locations as unknown as readonly [number, number, ...number[]] | undefined}
          style={StyleSheet.absoluteFill}
        />
        <ScreenHeader title="Hangout" />
        <View style={styles.centered}>
          <Text variant="body" color="muted">
            Please sign in to view the hangout room.
          </Text>
        </View>
      </View>
    );
  }

  if (!hydrated) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={backgroundGradients.screenDepth.colors as unknown as readonly [string, string, ...string[]]}
          start={backgroundGradients.screenDepth.start}
          end={backgroundGradients.screenDepth.end}
          locations={backgroundGradients.screenDepth.locations as unknown as readonly [number, number, ...number[]] | undefined}
          style={StyleSheet.absoluteFill}
        />
        <ScreenHeader title="Hangout" />
        <View style={styles.centered}>
          <Text variant="body" color="muted">
            Loading hangout room...
          </Text>
        </View>
      </View>
    );
  }

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

      {/* Header with safe area */}
      <ScreenHeader title="Hangout" />

      {/* Hangout Room Content */}
      <View style={styles.content}>
        <HangoutRoom
          onAddDecoration={() => {
            // TODO: Implement decoration addition
          }}
          onCustomizeAvatar={() => {
            router.push("/avatar");
          }}
        />
      </View>
    </View>
  );
}

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
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

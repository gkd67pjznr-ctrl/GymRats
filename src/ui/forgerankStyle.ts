// src/ui/forgerankStyle.ts
import type { TextStyle, ViewStyle } from "react-native";

/**
 * Single source of truth for the "Forgerank" aesthetic.
 * Use this instead of ad-hoc numbers when possible.
 *
 * NOTE: React Native only supports fontWeight up to "900".
 * Avoid "950"/"750" etc — those will error.
 */
export const FR = {
  // Spacing ladder
  space: {
    x1: 6,
    x2: 8,
    x3: 12,
    x4: 16,
    x5: 20,
    x6: 24,
  },

  // Radii
  radius: {
    card: 16,
    pill: 999,
    soft: 12,
    input: 8,   // [NEW 2026-01-23] Added for text inputs
    button: 12, // [NEW 2026-01-23] Added for buttons
  },

  // Typography (RN-safe weights)
  type: {
    h1: { fontSize: 22, fontWeight: "900" as const, letterSpacing: 0.2 },
    h2: { fontSize: 18, fontWeight: "900" as const, letterSpacing: 0.2 },
    h3: { fontSize: 16, fontWeight: "800" as const, letterSpacing: 0.15 },
    body: { fontSize: 14, fontWeight: "700" as const, letterSpacing: 0.1 },
    sub: { fontSize: 13, fontWeight: "700" as const, letterSpacing: 0.1, opacity: 0.9 },
    mono: { fontSize: 12, fontWeight: "700" as const, letterSpacing: 0.2 },
  } satisfies Record<string, TextStyle>,

  // Minimal “component recipes” (colors come from useThemeColors)
  card(c: { card: string; border: string }): ViewStyle {
    return {
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: FR.radius.card,
      padding: FR.space.x4,
    };
  },

  pillButton(c: { card: string; border: string }): ViewStyle {
    return {
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: FR.radius.pill,
      paddingVertical: FR.space.x3,
      paddingHorizontal: FR.space.x4,
      alignItems: "center",
      justifyContent: "center",
    };
  },
};

/**
 * RecapCues Component
 *
 * Displays workout recap cues generated after finishing a workout.
 * Shows a message if no cues have been generated yet.
 *
 * Extracted from live-workout.tsx to reduce component complexity.
 */

import { Text, View } from "react-native";
import { FR } from "@/src/ui/GrStyle";
import { useThemeColors } from "@/src/ui/theme";
import type { Cue } from "@/src/lib/perSetCue";

export interface RecapCuesProps {
  cues: Cue[];
}

export function RecapCues({ cues }: RecapCuesProps) {
  const c = useThemeColors();
  const CARD_R = FR.radius.card;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: CARD_R,
        padding: FR.space.x4,
        gap: FR.space.x2,
        backgroundColor: c.card,
      }}
    >
      <Text style={{ color: c.text, ...FR.type.h3 }}>Recap Cues</Text>

      {cues.length === 0 ? (
        <Text style={{ color: c.muted, ...FR.type.sub }}>
          Tap Finish Workout to generate recap cues.
        </Text>
      ) : (
        cues.map((cue, idx) => (
          <Text
            key={idx}
            style={{
              color: c.text,
              ...(cue.intensity === "high" ? FR.type.h3 : FR.type.body),
            }}
          >
            • {cue.message}
          </Text>
        ))
      )}
    </View>
  );
}

// app/debug/ranks.tsx
import { Stack } from "expo-router";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useThemeColors } from "../../src/ui/theme";

import {
  buildRankLadderFromTop,
  computeExerciseScore,
  scoreToRank,
  type ExercisePRSummary,
  type RankLadder,
} from "../../src/lib/ranks";

type UnitSystem = "lb" | "kg";

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function pct(n: number) {
  return `${Math.round(clamp01(n) * 100)}%`;
}

export default function DebugRanks() {
  const c = useThemeColors();

  // Build the ladder from the shared lib so this screen reflects real behavior
  const ladder: RankLadder = useMemo(
    () =>
      buildRankLadderFromTop({
        exerciseId: "bench",
        topE1RMKg: 140, // placeholder top standard for debug
        version: 1,
      }),
    []
  );

  const userUnit: UnitSystem = "lb";

  // Fake summaries to visualize scoring + ranking behavior
  const samples: { label: string; summary: ExercisePRSummary }[] = useMemo(
    () => [
      {
        label: "New lifter (e1RM ~60kg)",
        summary: {
          userId: "u_demo",
          exerciseId: "bench",
          bestE1RMKg: 60,
          bestWeightKg: 50,
          bestRepsAtWeight: ({ "110.0": 8, "135.0": 6 } as Record<string, number>),
          lastUpdatedMs: Date.now(),
        },
      },
      {
        label: "Intermediate (e1RM ~95kg)",
        summary: {
          userId: "u_demo",
          exerciseId: "bench",
          bestE1RMKg: 95,
          bestWeightKg: 82.5,
          bestRepsAtWeight: ({ "185.0": 8, "205.0": 5, "225.0": 3 } as Record<string, number>),
          lastUpdatedMs: Date.now(),
        },
      },
      {
        label: "Advanced (e1RM ~120kg)",
        summary: {
          userId: "u_demo",
          exerciseId: "bench",
          bestE1RMKg: 120,
          bestWeightKg: 105,
          bestRepsAtWeight: ({ "225.0": 10, "245.0": 6, "275.0": 2 } as Record<string, number>),
          lastUpdatedMs: Date.now(),
        },
      },
      {
        label: "Near top (e1RM ~138kg)",
        summary: {
          userId: "u_demo",
          exerciseId: "bench",
          bestE1RMKg: 138,
          bestWeightKg: 120,
          bestRepsAtWeight: ({ "275.0": 6, "295.0": 3, "315.0": 1 } as Record<string, number>),
          lastUpdatedMs: Date.now(),
        },
      },
    ],
    []
  );

  const rows = useMemo(() => {
    return samples.map((s) => {
      const score = computeExerciseScore({ summary: s.summary, ladder, userUnit });
      const rr = scoreToRank(score, ladder);
      return {
        label: s.label,
        score,
        rank: rr.rank,
        progressToNext: rr.progressToNext,
      };
    });
  }, [samples, ladder]);

  return (
    <>
      <Stack.Screen options={{ title: "Debug • Ranks" }} />

      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 36 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 14,
              gap: 6,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 18 }}>Bench ladder (debug)</Text>
            <Text style={{ color: c.muted, fontWeight: "700" }}>
              numRanks: {ladder.numRanks} • topStandardE1RMKg: {ladder.topStandardE1RMKg}
            </Text>
            <Text style={{ color: c.muted, fontWeight: "700" }}>
              thresholds: {ladder.scoreThresholds.length} values
            </Text>
          </View>

          {rows.map((r) => (
            <View
              key={r.label}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.card,
                borderRadius: 16,
                padding: 14,
                gap: 10,
              }}
            >
              <View style={{ gap: 4 }}>
                <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{r.label}</Text>
                <Text style={{ color: c.muted, fontWeight: "700" }}>
                  score: {r.score.toFixed(3)} ({pct(r.score)})
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: c.text, fontWeight: "900" }}>Rank {r.rank}</Text>
                <Text style={{ color: c.muted, fontWeight: "800" }}>progress: {pct(r.progressToNext)}</Text>
              </View>

              <View
                style={{
                  height: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.bg,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.round(clamp01(r.progressToNext) * 100)}%`,
                    backgroundColor: c.text,
                    opacity: 0.18,
                  }}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

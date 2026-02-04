// app/profile/prs.tsx
// Personal Records management screen

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";
import { FR } from "../../src/ui/GrStyle";
import {
  KEY_LIFTS,
  usePRStore,
  setBaselinePR,
  removeBaselinePR,
} from "../../src/lib/stores/prStore";
import { useSettings } from "../../src/lib/stores/settingsStore";
import { kgToLb, lbToKg } from "../../src/lib/units";
import { EXERCISES_V1 } from "../../src/data/exercises";

export default function PRsScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const settings = useSettings();
  const unit = settings.unitSystem ?? "lb";

  // Get current baselines from store
  const baselines = usePRStore((state) => state.baselines);
  const exerciseBests = usePRStore((state) => state.exerciseBests);

  // Local state for editing
  const [lifts, setLifts] = useState<
    Record<string, { weight: string; reps: string }>
  >({});

  // Initialize from baselines
  useEffect(() => {
    const initial: Record<string, { weight: string; reps: string }> = {};
    for (const lift of KEY_LIFTS) {
      const baseline = baselines[lift.id];
      if (baseline) {
        const displayWeight =
          unit === "kg" ? baseline.weightKg : kgToLb(baseline.weightKg);
        initial[lift.id] = {
          weight: displayWeight.toFixed(0),
          reps: baseline.reps.toString(),
        };
      } else {
        initial[lift.id] = { weight: "", reps: "" };
      }
    }
    setLifts(initial);
  }, [baselines, unit]);

  const handleLiftChange = (
    liftId: string,
    field: "weight" | "reps",
    value: string
  ) => {
    setLifts((prev) => ({
      ...prev,
      [liftId]: { ...prev[liftId], [field]: value },
    }));
  };

  const handleSave = () => {
    let savedCount = 0;
    let clearedCount = 0;

    for (const lift of KEY_LIFTS) {
      const liftData = lifts[lift.id];
      const weight = parseFloat(liftData.weight);
      const reps = parseInt(liftData.reps, 10);

      if (!isNaN(weight) && weight > 0 && !isNaN(reps) && reps > 0) {
        const weightKg = unit === "kg" ? weight : lbToKg(weight);
        setBaselinePR(lift.id, weightKg, reps);
        savedCount++;
      } else if (baselines[lift.id]) {
        // Clear if was previously set but now empty
        removeBaselinePR(lift.id);
        clearedCount++;
      }
    }

    if (savedCount > 0 || clearedCount > 0) {
      Alert.alert(
        "Saved",
        `Updated ${savedCount} personal record${savedCount !== 1 ? "s" : ""}.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } else {
      router.back();
    }
  };

  // Get additional exercises with history
  const exercisesWithHistory = Object.keys(exerciseBests).filter(
    (id) => !KEY_LIFTS.some((lift) => lift.id === id)
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack.Screen
        options={{
          title: "Personal Records",
          headerStyle: { backgroundColor: c.bg },
          headerTintColor: c.text,
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: FR.space.x4, gap: FR.space.x6 }}
      >
        {/* Explanation */}
        <View style={{ gap: FR.space.x2 }}>
          <Text style={{ color: c.text, ...FR.type.h2 }}>Your Best Lifts</Text>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            Enter your current personal records. PRs will only trigger for
            exercises where you have prior history or have entered a baseline
            here.
          </Text>
        </View>

        {/* Key lifts */}
        <View style={{ gap: FR.space.x4 }}>
          <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
            Main Lifts
          </Text>

          {KEY_LIFTS.map((lift) => {
            const best = exerciseBests[lift.id];
            const hasHistory = !!best;

            return (
              <View key={lift.id} style={{ gap: FR.space.x2 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: FR.space.x2,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{lift.emoji}</Text>
                  <Text
                    style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}
                  >
                    {lift.name}
                  </Text>
                  {hasHistory && (
                    <View
                      style={{
                        backgroundColor: c.primary + "30",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{ color: c.primary, fontSize: 10, fontWeight: "700" }}
                      >
                        HAS HISTORY
                      </Text>
                    </View>
                  )}
                </View>

                {hasHistory && (
                  <View style={{ marginLeft: 36, gap: 4 }}>
                    <Text style={{ color: c.muted, ...FR.type.sub }}>
                      Best from workouts:{" "}
                      {unit === "kg"
                        ? `${best.bestWeightKg.toFixed(0)} kg`
                        : `${kgToLb(best.bestWeightKg).toFixed(0)} lb`}{" "}
                      × {best.bestReps} reps ({best.totalSets} total sets)
                    </Text>
                    {/* Show top rep PRs at different weights */}
                    {best.bestRepsAtWeight && Object.keys(best.bestRepsAtWeight).length > 0 && (
                      <Text style={{ color: c.muted, ...FR.type.sub, fontSize: 11 }}>
                        Rep PRs:{" "}
                        {Object.entries(best.bestRepsAtWeight)
                          .sort(([a], [b]) => parseFloat(b) - parseFloat(a)) // heaviest first
                          .slice(0, 4) // top 4 weights
                          .map(([weight, reps]) => `${weight}${unit}×${reps}`)
                          .join(", ")}
                        {Object.keys(best.bestRepsAtWeight).length > 4 && "..."}
                      </Text>
                    )}
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
                  <View style={{ flex: 2 }}>
                    <TextInput
                      value={lifts[lift.id]?.weight ?? ""}
                      onChangeText={(text) =>
                        handleLiftChange(lift.id, "weight", text)
                      }
                      placeholder={`Weight (${unit})`}
                      placeholderTextColor={c.muted}
                      keyboardType="decimal-pad"
                      style={{
                        ...FR.card({ card: c.card, border: c.border }),
                        color: c.text,
                        ...FR.type.body,
                        paddingVertical: FR.space.x3,
                        paddingHorizontal: FR.space.x3,
                        minHeight: 48,
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      value={lifts[lift.id]?.reps ?? ""}
                      onChangeText={(text) =>
                        handleLiftChange(lift.id, "reps", text)
                      }
                      placeholder="Reps"
                      placeholderTextColor={c.muted}
                      keyboardType="number-pad"
                      style={{
                        ...FR.card({ card: c.card, border: c.border }),
                        color: c.text,
                        ...FR.type.body,
                        paddingVertical: FR.space.x3,
                        paddingHorizontal: FR.space.x3,
                        minHeight: 48,
                      }}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Exercises with history (read-only display) */}
        {exercisesWithHistory.length > 0 && (
          <View style={{ gap: FR.space.x3 }}>
            <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
              Other Exercises (from workout history)
            </Text>
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              PRs for these exercises are automatically tracked from your
              completed workouts.
            </Text>

            {exercisesWithHistory.map((exerciseId) => {
              const best = exerciseBests[exerciseId];
              const exercise = EXERCISES_V1.find((e) => e.id === exerciseId);
              const name = exercise?.name ?? exerciseId;

              return (
                <View
                  key={exerciseId}
                  style={{
                    ...FR.card({ card: c.card, border: c.border }),
                    padding: FR.space.x3,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: c.text, ...FR.type.body }}>{name}</Text>
                  <Text style={{ color: c.muted, ...FR.type.sub }}>
                    {unit === "kg"
                      ? `${best.bestWeightKg.toFixed(0)} kg`
                      : `${kgToLb(best.bestWeightKg).toFixed(0)} lb`}{" "}
                    × {best.bestReps}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Save button */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({
            ...FR.pillButton({ card: c.card, border: c.border }),
            backgroundColor: c.text,
            paddingVertical: FR.space.x4,
            opacity: pressed ? 0.8 : 1,
            marginTop: FR.space.x4,
          })}
        >
          <Text style={{ color: c.bg, ...FR.type.h3, fontWeight: "900" }}>
            Save Changes
          </Text>
        </Pressable>

        {/* Padding at bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

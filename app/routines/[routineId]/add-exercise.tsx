import { useState, useMemo, useCallback } from "react";
import { SectionList, Text, View, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeColors } from "../../../src/ui/theme";
import {
  getAllExercises,
  getPopularExercises,
  searchExercises,
  type ForgerankExercise,
} from "../../../src/data/exerciseDatabase";
import { uid, type RoutineExercise } from "../../../src/lib/routinesModel";
// [MIGRATED 2026-01-23] Using Zustand stores
import { upsertRoutine, useRoutine } from "../../../src/lib/stores";
import { ProtectedRoute } from "../../../src/ui/components/ProtectedRoute";

/** Capitalize first letter of each word */
function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Group exercises by primary muscle group */
function groupByMuscle(
  exercises: ForgerankExercise[]
): { title: string; data: ForgerankExercise[] }[] {
  const groups = new Map<string, ForgerankExercise[]>();

  for (const ex of exercises) {
    const muscle = ex.primaryMuscles[0] ?? "other";
    const key = titleCase(muscle);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ex);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({
      title,
      data: data.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export default function AddExerciseToRoutine() {
  const c = useThemeColors();
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const [query, setQuery] = useState("");

  const routine = useRoutine(String(routineId));

  const popular = useMemo(() => getPopularExercises(), []);
  const allExercises = useMemo(() => getAllExercises(), []);

  const sections = useMemo(() => {
    if (query.trim().length === 0) {
      // Show popular first, then all grouped by muscle
      const popularSection = {
        title: "Popular",
        data: popular.sort((a, b) => a.name.localeCompare(b.name)),
      };
      const allSections = groupByMuscle(allExercises);
      return [popularSection, ...allSections];
    }

    // Search mode
    const results = searchExercises(query.trim());
    if (results.length === 0) return [];
    return groupByMuscle(results);
  }, [query, popular, allExercises]);

  const totalCount = query.trim().length > 0
    ? sections.reduce((n, s) => n + s.data.length, 0)
    : allExercises.length;

  const add = useCallback(
    (exerciseId: string) => {
      if (!routine) return;
      const rx: RoutineExercise = {
        id: uid(),
        exerciseId,
        targetSets: 3,
        targetRepsMin: 6,
        targetRepsMax: 12,
      };

      upsertRoutine({
        ...routine,
        exercises: [...routine.exercises, rx],
        updatedAtMs: Date.now(),
      });

      router.back();
    },
    [routine, router]
  );

  if (!routine) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 16 }}>
        <Text style={{ color: c.text, fontWeight: "900" }}>Routine not found.</Text>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        {/* Header */}
        <View style={{ padding: 16, paddingBottom: 8, gap: 8 }}>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>
            Add Exercise
          </Text>
          <Text style={{ color: c.muted, fontSize: 13 }}>
            Tap to add to: {routine.name}
          </Text>

          {/* Search */}
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${allExercises.length} exercises...`}
            placeholderTextColor={c.muted}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            style={{
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              padding: 12,
              fontSize: 15,
              color: c.text,
              marginTop: 4,
            }}
          />

          {query.trim().length > 0 && (
            <Text style={{ color: c.muted, fontSize: 12 }}>
              {totalCount} result{totalCount !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {/* Exercise list */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section }) => (
            <View
              style={{
                backgroundColor: c.bg,
                paddingVertical: 8,
                paddingTop: 12,
              }}
            >
              <Text
                style={{
                  color: c.primary,
                  fontWeight: "900",
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {section.title} ({section.data.length})
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => add(item.id)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.card,
                marginBottom: 6,
              }}
            >
              <Text style={{ color: c.text, fontWeight: "900", fontSize: 15 }}>
                {item.name}
              </Text>
              <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>
                {titleCase(item.equipment)} &middot;{" "}
                {item.primaryMuscles.map(titleCase).join(", ")}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text style={{ color: c.muted, fontSize: 15 }}>
                No exercises found for "{query}"
              </Text>
            </View>
          }
        />
      </View>
    </ProtectedRoute>
  );
}

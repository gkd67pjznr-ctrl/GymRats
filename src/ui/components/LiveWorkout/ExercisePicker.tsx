import React, { useMemo, useState } from "react";
import {
  Pressable,
  SectionList,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import { useThemeColors } from "../../theme";
import {
  getAllExercises,
  getPopularExercises,
  searchExercises,
  type ForgerankExercise,
} from "../../../data/exerciseDatabase";

type Props = {
  visible: boolean;
  allowedExerciseIds?: string[];
  selectedExerciseId: string;
  onSelect: (exerciseId: string) => void;
  onBack: () => void;
};

type Section = {
  title: string;
  data: ForgerankExercise[];
};

const MUSCLE_GROUP_ORDER = [
  "chest",
  "shoulders",
  "triceps",
  "biceps",
  "forearms",
  "lats",
  "middle back",
  "lower back",
  "traps",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abdominals",
  "abductors",
  "adductors",
  "neck",
] as const;

function groupByMuscle(exercises: ForgerankExercise[]): Section[] {
  const groups = new Map<string, ForgerankExercise[]>();

  for (const ex of exercises) {
    const muscle = ex.primaryMuscles[0] ?? "other";
    if (!groups.has(muscle)) groups.set(muscle, []);
    groups.get(muscle)!.push(ex);
  }

  const sections: Section[] = [];
  for (const muscle of MUSCLE_GROUP_ORDER) {
    const items = groups.get(muscle);
    if (items && items.length > 0) {
      sections.push({
        title: muscle.charAt(0).toUpperCase() + muscle.slice(1),
        data: items.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
  }

  // Catch any muscles not in the order list
  for (const [muscle, items] of groups) {
    if (!MUSCLE_GROUP_ORDER.includes(muscle as any) && items.length > 0) {
      sections.push({
        title: muscle.charAt(0).toUpperCase() + muscle.slice(1),
        data: items.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
  }

  return sections;
}

export function ExercisePicker(props: Props) {
  const c = useThemeColors();
  const [query, setQuery] = useState("");

  const allExercises = useMemo(() => getAllExercises(), []);
  const popularExercises = useMemo(() => getPopularExercises(), []);

  const filteredExercises = useMemo(() => {
    let exercises: ForgerankExercise[];

    if (query.trim().length > 0) {
      exercises = searchExercises(query.trim());
    } else {
      exercises = allExercises;
    }

    if (props.allowedExerciseIds && props.allowedExerciseIds.length > 0) {
      const allowed = new Set(props.allowedExerciseIds);
      exercises = exercises.filter((e) => allowed.has(e.id));
    }

    return exercises;
  }, [query, allExercises, props.allowedExerciseIds]);

  const sections = useMemo(() => {
    if (query.trim().length > 0) {
      // When searching, show flat list grouped by muscle
      return groupByMuscle(filteredExercises);
    }

    // Default: popular first, then all by muscle group
    const popularIds = new Set(popularExercises.map((e) => e.id));
    const allowedSet = props.allowedExerciseIds
      ? new Set(props.allowedExerciseIds)
      : null;

    const popular = allowedSet
      ? popularExercises.filter((e) => allowedSet.has(e.id))
      : popularExercises;

    const rest = allowedSet
      ? filteredExercises.filter((e) => !popularIds.has(e.id))
      : allExercises.filter((e) => !popularIds.has(e.id));

    const result: Section[] = [];
    if (popular.length > 0) {
      result.push({ title: "Popular", data: popular });
    }
    result.push(...groupByMuscle(rest));
    return result;
  }, [query, filteredExercises, popularExercises, allExercises, props.allowedExerciseIds]);

  if (!props.visible) return null;

  const renderItem = ({ item }: { item: ForgerankExercise }) => {
    const isSelected = item.id === props.selectedExerciseId;
    return (
      <Pressable
        onPress={() => props.onSelect(item.id)}
        style={[
          styles.row,
          {
            borderBottomColor: c.border,
            backgroundColor: isSelected ? c.card : c.bg,
          },
        ]}
      >
        <View style={styles.rowContent}>
          <Text
            style={[
              styles.exerciseName,
              {
                color: isSelected ? c.primary : c.text,
                fontWeight: isSelected ? "700" : "500",
              },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.meta, { color: c.muted }]} numberOfLines={1}>
            {item.equipment}
            {item.primaryMuscles.length > 0
              ? ` · ${item.primaryMuscles.join(", ")}`
              : ""}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string };
  }) => (
    <View style={[styles.sectionHeader, { backgroundColor: c.bg }]}>
      <Text style={[styles.sectionTitle, { color: c.muted }]}>
        {section.title}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Text style={[styles.title, { color: c.text }]}>Pick Exercise</Text>

      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: c.card,
            color: c.text,
            borderColor: c.border,
          },
        ]}
        placeholder="Search exercises..."
        placeholderTextColor={c.muted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <Text style={[styles.countLabel, { color: c.muted }]}>
        {filteredExercises.length} exercise
        {filteredExercises.length !== 1 ? "s" : ""}
      </Text>

      <View
        style={[
          styles.listContainer,
          { borderColor: c.border },
        ]}
      >
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled
          keyboardShouldPersistTaps="handled"
          initialNumToRender={30}
          maxToRenderPerBatch={30}
          windowSize={11}
        />
      </View>

      <Pressable
        onPress={props.onBack}
        style={[
          styles.backButton,
          {
            borderColor: c.border,
            backgroundColor: c.card,
          },
        ]}
      >
        <Text style={[styles.backText, { color: c.text }]}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  countLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  listContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowContent: {
    gap: 2,
  },
  exerciseName: {
    fontSize: 15,
  },
  meta: {
    fontSize: 12,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    fontWeight: "800",
  },
});

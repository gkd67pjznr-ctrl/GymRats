import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";
import { FR } from "../../src/ui/forgerankStyle";
import type { PlanCategory, PlanDifficulty, PremadePlan, PlanExercise } from "../../src/lib/premadePlans/types";
import { addPlan } from "../../src/lib/premadePlans/store";
import { EXERCISES_V1 } from "../../src/data/exercises";

/**
 * DEV TOOL: Plan Creator
 * 
 * Easy interface for creating curated plans without writing code.
 * Access via: /dev/plan-creator
 * 
 * USAGE:
 * 1. Fill in plan details
 * 2. Add exercises one by one
 * 3. Tap "Save Plan"
 * 4. Plan is immediately available in the app
 */
export default function PlanCreator() {
  const c = useThemeColors();
  const router = useRouter();

  // Plan metadata
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PlanCategory>("strength");
  const [difficulty, setDifficulty] = useState<PlanDifficulty>("intermediate");
  const [durationWeeks, setDurationWeeks] = useState("8");
  const [daysPerWeek, setDaysPerWeek] = useState("4");
  const [tags, setTags] = useState("");

  // Exercise being added
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES_V1[0].id);
  const [sets, setSets] = useState("4");
  const [repsMin, setRepsMin] = useState("8");
  const [repsMax, setRepsMax] = useState("12");
  const [restSeconds, setRestSeconds] = useState("90");
  const [notes, setNotes] = useState("");

  // Exercises list
  const [exercises, setExercises] = useState<PlanExercise[]>([]);

  const categories: PlanCategory[] = ["bodybuilding", "calisthenics", "cardio", "core", "strength"];
  const difficulties: PlanDifficulty[] = ["beginner", "intermediate", "advanced"];

  const addExercise = () => {
    const exercise: PlanExercise = {
      exerciseId: selectedExercise,
      targetSets: parseInt(sets) || 4,
      targetRepsMin: parseInt(repsMin) || 8,
      targetRepsMax: parseInt(repsMax) || 12,
      restSeconds: parseInt(restSeconds) || 90,
      notes: notes || undefined,
    };

    setExercises([...exercises, exercise]);

    // Reset form
    setSets("4");
    setRepsMin("8");
    setRepsMax("12");
    setRestSeconds("90");
    setNotes("");
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const savePlan = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Plan name is required");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Error", "Add at least one exercise");
      return;
    }

    const plan: PremadePlan = {
      id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name.trim(),
      category,
      description: description.trim() || "Custom curated plan",
      difficulty,
      durationWeeks: parseInt(durationWeeks) || 8,
      daysPerWeek: parseInt(daysPerWeek) || 4,
      exercises,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      source: "curated",
      authorName: "Forgerank Team",
      createdAtMs: Date.now(),
    };

    addPlan(plan);

    Alert.alert(
      "Success",
      `Plan "${plan.name}" created!\n\nCategory: ${category}\nExercises: ${exercises.length}`,
      [
        {
          text: "Create Another",
          onPress: () => {
            // Reset form
            setName("");
            setDescription("");
            setExercises([]);
            setTags("");
          },
        },
        {
          text: "Done",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const getExerciseName = (id: string) => {
    return EXERCISES_V1.find(e => e.id === id)?.name || id;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ padding: FR.space.x4, gap: FR.space.x4 }}>
        {/* Header */}
        <View>
          <Text style={{ color: c.text, ...FR.type.h1 }}>Plan Creator</Text>
          <Text style={{ color: c.muted, ...FR.type.sub, marginTop: FR.space.x2 }}>
            Dev tool for creating curated plans
          </Text>
        </View>

        {/* Plan Details */}
        <View style={{ gap: FR.space.x3 }}>
          <Text style={{ color: c.text, ...FR.type.h3 }}>Plan Details</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Plan name (e.g., 'Push Pull Legs')"
            placeholderTextColor={c.muted}
            style={{
              color: c.text,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.input,
              padding: FR.space.x3,
              ...FR.type.body,
            }}
          />

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description (2-3 sentences)"
            placeholderTextColor={c.muted}
            multiline
            numberOfLines={3}
            style={{
              color: c.text,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.input,
              padding: FR.space.x3,
              ...FR.type.body,
              minHeight: 80,
            }}
          />

          <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.muted, ...FR.type.sub, marginBottom: FR.space.x1 }}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
                  {categories.map(cat => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={{
                        paddingVertical: FR.space.x2,
                        paddingHorizontal: FR.space.x3,
                        borderRadius: FR.radius.pill,
                        borderWidth: 1,
                        borderColor: category === cat ? c.text : c.border,
                        backgroundColor: category === cat ? c.bg : c.card,
                      }}
                    >
                      <Text style={{ color: c.text, ...FR.type.sub }}>{cat}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
            {difficulties.map(diff => (
              <Pressable
                key={diff}
                onPress={() => setDifficulty(diff)}
                style={{
                  flex: 1,
                  paddingVertical: FR.space.x2,
                  borderRadius: FR.radius.pill,
                  borderWidth: 1,
                  borderColor: difficulty === diff ? c.text : c.border,
                  backgroundColor: difficulty === diff ? c.bg : c.card,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: c.text, ...FR.type.sub }}>{diff}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.muted, ...FR.type.sub, marginBottom: FR.space.x1 }}>Weeks</Text>
              <TextInput
                value={durationWeeks}
                onChangeText={setDurationWeeks}
                keyboardType="number-pad"
                style={{
                  color: c.text,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: FR.radius.input,
                  padding: FR.space.x3,
                  ...FR.type.body,
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: c.muted, ...FR.type.sub, marginBottom: FR.space.x1 }}>Days/Week</Text>
              <TextInput
                value={daysPerWeek}
                onChangeText={setDaysPerWeek}
                keyboardType="number-pad"
                style={{
                  color: c.text,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: FR.radius.input,
                  padding: FR.space.x3,
                  ...FR.type.body,
                }}
              />
            </View>
          </View>

          <TextInput
            value={tags}
            onChangeText={setTags}
            placeholder="Tags (comma separated: hypertrophy, split, etc)"
            placeholderTextColor={c.muted}
            style={{
              color: c.text,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.input,
              padding: FR.space.x3,
              ...FR.type.body,
            }}
          />
        </View>

        {/* Add Exercise */}
        <View style={{ gap: FR.space.x3 }}>
          <Text style={{ color: c.text, ...FR.type.h3 }}>Add Exercise</Text>

          <View>
            <Text style={{ color: c.muted, ...FR.type.sub, marginBottom: FR.space.x1 }}>Exercise</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
                {EXERCISES_V1.slice(0, 15).map(ex => (
                  <Pressable
                    key={ex.id}
                    onPress={() => setSelectedExercise(ex.id)}
                    style={{
                      paddingVertical: FR.space.x2,
                      paddingHorizontal: FR.space.x3,
                      borderRadius: FR.radius.pill,
                      borderWidth: 1,
                      borderColor: selectedExercise === ex.id ? c.text : c.border,
                      backgroundColor: selectedExercise === ex.id ? c.bg : c.card,
                    }}
                  >
                    <Text style={{ color: c.text, ...FR.type.sub, fontSize: 12 }}>{ex.name}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.muted, ...FR.type.sub, marginBottom: FR.space.x1 }}>Sets</Text>
              <TextInput
                value={sets}
                onChangeText={setSets}
                keyboardType="number-pad"
                style={{
                  color: c.text,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: FR.radius.input,
                  padding: FR.space.x3,
                  ...FR.type.body,
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: c.muted, ...FR.type.sub, marginBottom: FR.space.x1 }}>Reps Min</Text>
              <TextInput
                value={repsMin}
                onChangeText={setRepsMin}
                keyboardType="number-pad"
                style={{
                  color: c.text,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: FR.radius.input,
                  padding: FR.space.x3,
                  ...FR.type.body,
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: c.muted, ...FR.type.sub, marginBottom: FR.space.x1 }}>Reps Max</Text>
              <TextInput
                value={repsMax}
                onChangeText={setRepsMax}
                keyboardType="number-pad"
                style={{
                  color: c.text,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: FR.radius.input,
                  padding: FR.space.x3,
                  ...FR.type.body,
                }}
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.muted, ...FR.type.sub, marginBottom: FR.space.x1 }}>Rest (sec)</Text>
              <TextInput
                value={restSeconds}
                onChangeText={setRestSeconds}
                keyboardType="number-pad"
                style={{
                  color: c.text,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: FR.radius.input,
                  padding: FR.space.x3,
                  ...FR.type.body,
                }}
              />
            </View>

            <View style={{ flex: 2 }}>
              <Text style={{ color: c.muted, ...FR.type.sub, marginBottom: FR.space.x1 }}>Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g., Focus on tempo"
                placeholderTextColor={c.muted}
                style={{
                  color: c.text,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: FR.radius.input,
                  padding: FR.space.x3,
                  ...FR.type.body,
                }}
              />
            </View>
          </View>

          <Pressable
            onPress={addExercise}
            style={{
              paddingVertical: FR.space.x3,
              borderRadius: FR.radius.button,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              alignItems: "center",
            }}
          >
            <Text style={{ color: c.text, ...FR.type.h3 }}>+ Add Exercise</Text>
          </Pressable>
        </View>

        {/* Exercises List */}
        {exercises.length > 0 && (
          <View style={{ gap: FR.space.x3 }}>
            <Text style={{ color: c.text, ...FR.type.h3 }}>Exercises ({exercises.length})</Text>

            {exercises.map((ex, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: FR.radius.card,
                  padding: FR.space.x3,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
                    {idx + 1}. {getExerciseName(ex.exerciseId)}
                  </Text>
                  <Text style={{ color: c.muted, ...FR.type.sub }}>
                    {ex.targetSets} sets × {ex.targetRepsMin}-{ex.targetRepsMax} reps • {ex.restSeconds}s rest
                  </Text>
                  {ex.notes && (
                    <Text style={{ color: c.muted, ...FR.type.sub, fontStyle: "italic" }}>
                      {ex.notes}
                    </Text>
                  )}
                </View>

                <Pressable onPress={() => removeExercise(idx)}>
                  <Text style={{ color: "#FF6B6B", fontSize: 20 }}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={{ gap: FR.space.x2, paddingBottom: FR.space.x6 }}>
          <Pressable
            onPress={savePlan}
            style={{
              paddingVertical: FR.space.x4,
              borderRadius: FR.radius.button,
              backgroundColor: "#4ECDC4",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#000", ...FR.type.h3, fontWeight: "900" }}>Save Plan</Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={{
              paddingVertical: FR.space.x3,
              borderRadius: FR.radius.button,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              alignItems: "center",
            }}
          >
            <Text style={{ color: c.text, ...FR.type.body }}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

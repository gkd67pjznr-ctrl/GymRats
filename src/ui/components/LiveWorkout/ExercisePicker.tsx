import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useThemeColors } from "../../theme";
import { EXERCISES_V1 } from "../../../data/exercises";

type Props = {
  visible: boolean;
  allowedExerciseIds?: string[]; // if provided, picker is limited to these IDs
  selectedExerciseId: string;
  onSelect: (exerciseId: string) => void;
  onBack: () => void;
};

export function ExercisePicker(props: Props) {
  const c = useThemeColors();

  if (!props.visible) return null;

  const data =
    props.allowedExerciseIds && props.allowedExerciseIds.length > 0
      ? EXERCISES_V1.filter((e) => props.allowedExerciseIds!.includes(e.id))
      : EXERCISES_V1;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: c.text }}>Pick Exercise</Text>

      <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, overflow: "hidden" }}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = item.id === props.selectedExerciseId;
            return (
              <Pressable
                onPress={() => props.onSelect(item.id)}
                style={{
                  padding: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                  backgroundColor: isSelected ? c.card : c.bg,
                }}
              >
                <Text style={{ color: c.text, fontWeight: isSelected ? "700" : "500" }}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      <Pressable
        onPress={props.onBack}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.card,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800", color: c.text }}>Back</Text>
      </Pressable>
    </View>
  );
}

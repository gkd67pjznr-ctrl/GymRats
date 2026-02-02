// src/ui/components/LiveWorkout/WorkoutNotes.tsx
// Workout notes input component

import { View, TextInput, StyleSheet } from "react-native";

import { useThemeColors } from "../../theme";
import { FR } from "../../forgerankStyle";

export interface WorkoutNotesProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function WorkoutNotes({
  value,
  onChangeText,
  placeholder = "Your workout notes...",
}: WorkoutNotesProps) {
  const c = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.card,
          borderColor: c.border,
        },
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        multiline
        numberOfLines={2}
        style={[
          styles.input,
          {
            color: c.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: FR.radius.soft,
    borderWidth: 1,
    paddingHorizontal: FR.space.x3,
    paddingVertical: FR.space.x2,
  },
  input: {
    fontSize: 14,
    fontWeight: "500",
    minHeight: 40,
    textAlignVertical: "top",
  },
});

export default WorkoutNotes;

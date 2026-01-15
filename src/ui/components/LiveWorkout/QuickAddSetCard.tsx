import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useThemeColors } from "../../theme";

type Props = {
  weightLb: number;
  reps: number;
  weightLbText: string;
  repsText: string;

  onWeightText: (t: string) => void;
  onRepsText: (t: string) => void;
  onWeightCommit: () => void; // onBlur normalize
  onRepsCommit: () => void;

  onDecWeight: () => void;
  onIncWeight: () => void;
  onDecReps: () => void;
  onIncReps: () => void;

  onAddSet: () => void;
};

export function QuickAddSetCard(props: Props) {
  const c = useThemeColors();

  const Button = (p: { title: string; onPress: () => void; flex?: boolean }) => (
    <Pressable
      onPress={p.onPress}
      style={{
        flex: p.flex ? 1 : undefined,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: c.text }}>{p.title}</Text>
    </Pressable>
  );

  const displayWeight = `${props.weightLb.toFixed(1)} lb`;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 12,
        padding: 12,
        gap: 10,
        backgroundColor: c.card,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: c.text }}>Quick Add Set</Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button title="- 2.5 lb" onPress={props.onDecWeight} flex />
        <Button title="+ 2.5 lb" onPress={props.onIncWeight} flex />
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: c.muted, fontSize: 12, fontWeight: "800" }}>Weight (lb)</Text>
          <TextInput
            value={props.weightLbText}
            keyboardType="decimal-pad"
            onChangeText={props.onWeightText}
            onBlur={props.onWeightCommit}
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 10,
              color: c.text,
              backgroundColor: c.bg,
              fontWeight: "900",
              fontSize: 16,
            }}
          />
        </View>

        <View style={{ width: 110, gap: 6 }}>
          <Text style={{ color: c.muted, fontSize: 12, fontWeight: "800" }}>Reps</Text>
          <TextInput
            value={props.repsText}
            keyboardType="number-pad"
            onChangeText={props.onRepsText}
            onBlur={props.onRepsCommit}
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 10,
              color: c.text,
              backgroundColor: c.bg,
              fontWeight: "900",
              fontSize: 16,
            }}
          />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button title="- 1 rep" onPress={props.onDecReps} flex />
        <Button title="+ 1 rep" onPress={props.onIncReps} flex />
      </View>

      <Text style={{ color: c.muted, fontWeight: "800" }}>{`Current: ${displayWeight} • ${props.reps} reps`}</Text>

      <Button title="Add Set" onPress={props.onAddSet} />
    </View>
  );
}

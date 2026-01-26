import { ScrollView, Text, View } from "react-native";
import { useThemeColors } from "../../src/ui/theme";
import { EXERCISES_V1 } from "../../src/data/exercises";

export default function ExercisesHome() {
  const c = useThemeColors();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>Exercise Database</Text>
        <Text style={{ color: c.muted }}>Scaffold. Next: search, filters, details, add custom exercises.</Text>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12, gap: 6 }}>
          {EXERCISES_V1.slice(0, 20).map((e) => (
            <Text key={e.id} style={{ color: c.text }}>
              • {e.name}
            </Text>
          ))}
          <Text style={{ color: c.muted, marginTop: 8 }}>
            Showing first 20 exercises (v1).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

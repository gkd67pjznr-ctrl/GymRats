import { View, Text, Pressable, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores
import { useRoutines } from "../../src/lib/stores";

export default function RoutinesHome() {
  const c = useThemeColors();
  const routines = useRoutines();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>Routines</Text>
          <Link href="/routines/create" asChild>
            <Pressable
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.card,
              }}
            >
              <Text style={{ color: c.text, fontWeight: "900" }}>+ New</Text>
            </Pressable>
          </Link>
        </View>

        {routines.length === 0 ? (
          <Text style={{ color: c.muted }}>No routines yet. Tap “+ New”.</Text>
        ) : (
          routines.map((r) => (
            <Link key={r.id} href={`/routines/${r.id}`} asChild>
              <Pressable
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 14,
                  backgroundColor: c.card,
                  padding: 12,
                  gap: 6,
                }}
              >
                <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{r.name}</Text>
                <Text style={{ color: c.muted }}>
                  Exercises: {r.exercises.length} • Updated:{" "}
                  {new Date(r.updatedAtMs).toLocaleDateString()}
                </Text>
              </Pressable>
            </Link>
          ))
        )}
      </ScrollView>
    </View>
  );
}

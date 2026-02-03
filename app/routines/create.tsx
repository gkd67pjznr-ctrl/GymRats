import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";
import { uid, type Routine } from "../../src/lib/routinesModel";
// [MIGRATED 2026-01-23] Using Zustand stores
import { upsertRoutine } from "../../src/lib/stores";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { ScreenHeader } from "../../src/ui/components/ScreenHeader";

const PRESET_NAMES = ["Push Day", "Pull Day", "Leg Day", "Upper", "Lower", "Full Body"];

export default function CreateRoutine() {
  const c = useThemeColors();
  const router = useRouter();

  function create(name: string) {
    const now = Date.now();
    const routine: Routine = {
      id: uid(),
      name,
      createdAtMs: now,
      updatedAtMs: now,
      exercises: [],
    };
    upsertRoutine(routine);
    router.replace(`/routines/${routine.id}`);
  }

  return (
    <ProtectedRoute>
      <ScreenHeader title="Create Routine" />
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 16, gap: 12 }}>
      <Text style={{ color: c.muted }}>
        Quick-create with a preset name (we’ll add full text input next).
      </Text>

      <View style={{ gap: 10 }}>
        {PRESET_NAMES.map((n) => (
          <Pressable
            key={n}
            onPress={() => create(n)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900" }}>{n}</Text>
          </Pressable>
        ))}
      </View>
      </View>
    </ProtectedRoute>
  );
}

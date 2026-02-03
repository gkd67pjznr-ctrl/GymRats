import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Surface, Text, Card, text, space, corners } from "@/src/design";
import { uid, type Routine } from "../../src/lib/routinesModel";
// [MIGRATED 2026-01-23] Using Zustand stores
import { upsertRoutine } from "../../src/lib/stores";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { ScreenHeader } from "../../src/ui/components/ScreenHeader";

const PRESET_NAMES = ["Push Day", "Pull Day", "Leg Day", "Upper", "Lower", "Full Body"];

export default function CreateRoutine() {
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
      <Surface elevation="base" style={{ flex: 1, padding: space.componentLg, gap: space.componentMd }}>
        <Text variant="body" color="muted">
          Quick-create with a preset name (we'll add full text input next).
        </Text>

        <View style={{ gap: 10 }}>
          {PRESET_NAMES.map((n) => (
            <Pressable key={n} onPress={() => create(n)}>
              <Card style={{ paddingVertical: space.componentMd, paddingHorizontal: 14 }}>
                <Text variant="h4">{n}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </Surface>
    </ProtectedRoute>
  );
}

// app/(tabs)/body.tsx
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useThemeColors } from "../../src/ui/theme";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";

type RegionId =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "abs"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves";

const REGION_LABEL: Record<RegionId, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  abs: "Abs",
  glutes: "Glutes",
  quads: "Quads",
  hamstrings: "Hamstrings",
  calves: "Calves",
};

/**
 * v1 NOTE:
 * This is intentionally a scaffold.
 * Next step: compute `intensityByRegion` from workout history + exercise muscle metadata.
 */
function useDemoIntensity(): Record<RegionId, number> {
  // 0.0 = not recently trained, 1.0 = just trained
  return {
    chest: 0.8,
    back: 0.35,
    shoulders: 0.55,
    biceps: 0.25,
    triceps: 0.6,
    abs: 0.15,
    glutes: 0.4,
    quads: 0.7,
    hamstrings: 0.3,
    calves: 0.2,
  };
}

export default function BodyTab() {
  const c = useThemeColors();

  const intensityByRegion = useDemoIntensity();
  const [selectedRegion, setSelectedRegion] = useState<RegionId>("chest");

  const selectedIntensity = intensityByRegion[selectedRegion] ?? 0;

  const regionDetail = useMemo(() => {
    // Placeholder copy (will become “last trained X days ago”)
    const pct = Math.round(selectedIntensity * 100);
    let label = "Untrained recently";
    if (pct >= 80) label = "Just trained";
    else if (pct >= 55) label = "Recently trained";
    else if (pct >= 30) label = "Somewhat trained";
    return { pct, label };
  }, [selectedIntensity]);

  function regionFill(intensity: number) {
    // We’re using opacity instead of color swapping so it stays theme-friendly.
    // Base fill is c.text (so it adapts to light/dark); intensity controls opacity.
    const clamped = Math.max(0, Math.min(1, intensity));
    const opacity = 0.12 + clamped * 0.42; // 0.12 → 0.54
    return { backgroundColor: c.text, opacity };
  }

  const Region = (p: { id: RegionId; w: number; h: number; rounded?: number }) => {
    const isActive = p.id === selectedRegion;
    const intensity = intensityByRegion[p.id] ?? 0;

    return (
      <Pressable
        onPress={() => setSelectedRegion(p.id)}
        style={{
          width: p.w,
          height: p.h,
          borderRadius: p.rounded ?? 10,
          borderWidth: 1,
          borderColor: isActive ? c.text : c.border,
          backgroundColor: c.card,
          overflow: "hidden",
        }}
      >
        {/* Fill overlay */}
        <View style={{ position: "absolute", inset: 0, ...regionFill(intensity) }} />

        {/* Label */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 }}>
          <Text style={{ color: c.bg, fontWeight: "900", fontSize: 12, textAlign: "center" }}>
            {REGION_LABEL[p.id]}
          </Text>
        </View>
      </Pressable>
    );
  };

  const Pill = (p: { text: string }) => (
    <View
      style={{
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
      }}
    >
      <Text style={{ color: c.muted, fontWeight: "900", fontSize: 12 }}>{p.text}</Text>
    </View>
  );

  return (
    <TabErrorBoundary screenName="Body">
      <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ color: c.text, fontSize: 26, fontWeight: "900" }}>Body</Text>
        <Text style={{ color: c.muted, lineHeight: 18 }}>
          Muscle heatmap + recovery shading based on your training history.
        </Text>

        {/* Legend */}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pill text="Dark = trained recently" />
          <Pill text="Light = trained longer ago" />
          <Pill text="Tap muscles for details" />
        </View>

        {/* Body Map Card */}
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 16,
            padding: 12,
            backgroundColor: c.card,
            gap: 12,
          }}
        >
          <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Muscle Map</Text>

          {/* Simple "figure" made of regions (front-view-ish) */}
          <View style={{ alignItems: "center", gap: 10 }}>
            {/* Shoulders */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Region id="shoulders" w={120} h={44} rounded={14} />
            </View>

            {/* Chest + Back row (we'll later toggle front/back view) */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Region id="chest" w={120} h={64} />
              <Region id="back" w={120} h={64} />
            </View>

            {/* Arms + Abs */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ gap: 10 }}>
                <Region id="biceps" w={90} h={54} />
                <Region id="triceps" w={90} h={54} />
              </View>

              <View style={{ gap: 10 }}>
                <Region id="abs" w={120} h={118} />
              </View>

              <View style={{ gap: 10 }}>
                <Region id="triceps" w={90} h={54} />
                <Region id="biceps" w={90} h={54} />
              </View>
            </View>

            {/* Glutes */}
            <Region id="glutes" w={180} h={56} rounded={14} />

            {/* Legs */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ gap: 10 }}>
                <Region id="quads" w={120} h={74} />
                <Region id="calves" w={120} h={54} />
              </View>
              <View style={{ gap: 10 }}>
                <Region id="hamstrings" w={120} h={74} />
                <Region id="calves" w={120} h={54} />
              </View>
            </View>
          </View>

          {/* Selected details */}
          <View
            style={{
              marginTop: 4,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 14,
              padding: 12,
              backgroundColor: c.bg,
              gap: 6,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900" }}>{REGION_LABEL[selectedRegion]}</Text>
            <Text style={{ color: c.muted }}>
              Status: <Text style={{ color: c.text, fontWeight: "900" }}>{regionDetail.label}</Text>{" "}
              ({regionDetail.pct}%)
            </Text>
            <Text style={{ color: c.muted, lineHeight: 18 }}>
              Next: this will show "last trained" time + which exercises contributed, pulled from history + exercise DB
              muscle tags.
            </Text>
          </View>
        </View>

        {/* Metrics card placeholder */}
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 16,
            padding: 12,
            backgroundColor: c.card,
            gap: 8,
          }}
        >
          <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Body Metrics (soon)</Text>
          <Text style={{ color: c.muted, lineHeight: 18 }}>
            Volume by muscle, frequency, recovery balance, weak points, PR velocity, and streaks will live here.
          </Text>
        </View>
      </ScrollView>
    </TabErrorBoundary>
  );
}

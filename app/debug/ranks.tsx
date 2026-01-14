import { useMemo, useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { useThemeColors } from "../../src/ui/theme";
import { VERIFIED_TOPS } from "../../src/data/rankTops";
import { buildRankThresholdsKg, getRankFromE1RMKg } from "../../src/lib/ranks";

function kgToLb(kg: number) {
  return kg * 2.2046226218;
}

export default function DebugRanks() {
  const c = useThemeColors();
  const [liftId, setLiftId] = useState(VERIFIED_TOPS[0].liftId);
  const [e1rmKg, setE1rmKg] = useState(100);

  const top = useMemo(() => VERIFIED_TOPS.find((x) => x.liftId === liftId)!, [liftId]);
  const thresholds = useMemo(() => buildRankThresholdsKg(top.topE1RMKg), [top.topE1RMKg]);
  const rank = useMemo(() => getRankFromE1RMKg(e1rmKg, thresholds), [e1rmKg, thresholds]);

  const rankLabel = `Rank ${rank.rankIndex + 1} / ${thresholds.length}`;

  const Btn = (p: { label: string; onPress: () => void }) => (
    <Pressable
      onPress={p.onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
      }}
    >
      <Text style={{ color: c.text, fontWeight: "900" }}>{p.label}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>Debug: Ranks</Text>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12, gap: 8 }}>
          <Text style={{ color: c.muted }}>Lift</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {VERIFIED_TOPS.map((t) => (
              <Pressable
                key={t.liftId}
                onPress={() => setLiftId(t.liftId)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: t.liftId === liftId ? c.bg : c.card,
                }}
              >
                <Text style={{ color: c.text, fontWeight: "800" }}>{t.displayName}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ color: c.muted, marginTop: 8 }}>
            Top (verified) e1RM: {top.topE1RMKg.toFixed(1)} kg ({kgToLb(top.topE1RMKg).toFixed(0)} lb)
          </Text>
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12, gap: 8 }}>
          <Text style={{ color: c.text, fontWeight: "900" }}>Test an e1RM</Text>

          <Text style={{ color: c.muted }}>
            Current: {e1rmKg.toFixed(1)} kg ({kgToLb(e1rmKg).toFixed(0)} lb)
          </Text>

          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <Btn label="-10kg" onPress={() => setE1rmKg((v) => Math.max(0, v - 10))} />
            <Btn label="-2.5kg" onPress={() => setE1rmKg((v) => Math.max(0, v - 2.5))} />
            <Btn label="+2.5kg" onPress={() => setE1rmKg((v) => v + 2.5)} />
            <Btn label="+10kg" onPress={() => setE1rmKg((v) => v + 10)} />
          </View>

          <Text style={{ color: c.text, fontWeight: "900", marginTop: 6 }}>
            {rankLabel} • {Math.round(rank.progressToNext * 100)}% to next
          </Text>
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12, gap: 6 }}>
          <Text style={{ color: c.text, fontWeight: "900" }}>Thresholds (kg)</Text>
          {thresholds.map((t, i) => (
            <Text key={i} style={{ color: c.muted }}>
              Rank {i + 1}: {t.toFixed(1)} kg ({kgToLb(t).toFixed(0)} lb)
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

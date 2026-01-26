import { View, Text, Pressable, ScrollView } from "react-native";
import { useThemeColors } from "../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores
import { useSettings, updateSettings } from "../src/lib/stores";

function Row(props: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontWeight: "900", fontSize: 16 }}>{props.title}</Text>
      {!!props.subtitle && <Text style={{ opacity: 0.75 }}>{props.subtitle}</Text>}
      {!!props.right && <View style={{ marginTop: 8 }}>{props.right}</View>}
    </View>
  );
}

function Toggle(props: {
  value: boolean;
  onChange: (v: boolean) => void;
  labelOn?: string;
  labelOff?: string;
}) {
  const label = props.value ? (props.labelOn ?? "On") : (props.labelOff ?? "Off");
  return (
    <Pressable
      onPress={() => props.onChange(!props.value)}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
      }}
    >
      <Text style={{ fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function Pill(props: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        opacity: props.active ? 1 : 0.7,
      }}
    >
      <Text style={{ fontWeight: props.active ? "900" : "700" }}>{props.label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const c = useThemeColors();
  const settings = useSettings();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 22, fontWeight: "900", color: c.text }}>Settings</Text>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Haptics"
            subtitle="Vibration feedback for PRs and rest timer done."
            right={
              <Toggle
                value={settings.hapticsEnabled}
                onChange={(v) => updateSettings({ hapticsEnabled: v })}
              />
            }
          />
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Sounds"
            subtitle='Audio cues (currently uses a voice cue like "Rest over").'
            right={
              <Toggle
                value={settings.soundsEnabled}
                onChange={(v) => updateSettings({ soundsEnabled: v })}
              />
            }
          />
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Units"
            subtitle="Display and logging units."
            right={
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pill
                  label="lb"
                  active={settings.unitSystem === "lb"}
                  onPress={() => updateSettings({ unitSystem: "lb" })}
                />
                <Pill
                  label="kg"
                  active={settings.unitSystem === "kg"}
                  onPress={() => updateSettings({ unitSystem: "kg" })}
                />
              </View>
            }
          />
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Default Rest Timer"
            subtitle="Used when the rest timer pops after logging a set."
            right={
              <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                <Pill
                  label="60s"
                  active={settings.defaultRestSeconds === 60}
                  onPress={() => updateSettings({ defaultRestSeconds: 60 })}
                />
                <Pill
                  label="90s"
                  active={settings.defaultRestSeconds === 90}
                  onPress={() => updateSettings({ defaultRestSeconds: 90 })}
                />
                <Pill
                  label="120s"
                  active={settings.defaultRestSeconds === 120}
                  onPress={() => updateSettings({ defaultRestSeconds: 120 })}
                />
              </View>
            }
          />
        </View>

        <Text style={{ color: c.muted }}>
          Next: we’ll wire these settings into LiveWorkout (rest timer default + unit display).
        </Text>
      </ScrollView>
    </View>
  );
}
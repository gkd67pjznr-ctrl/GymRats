import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useThemeColors } from "../theme";

type Props = {
  visible: boolean;
  initialSeconds: number;
  onClose: () => void;

  // optional: future hook (sound/haptics)
  onDone?: () => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function RestTimerOverlay({ visible, initialSeconds, onClose, onDone }: Props) {
  const c = useThemeColors();

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(true);

  // keep the current timer in a ref so we can cleanly stop it
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // when the overlay becomes visible, reset timer & start running
  useEffect(() => {
    if (!visible) {
      // stop timer when hidden
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    setSecondsLeft(initialSeconds);
    setRunning(true);
  }, [visible, initialSeconds]);

  // start/stop ticking
  useEffect(() => {
    if (!visible) return;

    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [visible, running]);

  // auto-close when reaches 0
  useEffect(() => {
    if (!visible) return;
    if (secondsLeft > 0) return;

    // stop ticking
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;

    // optional callback (future: sound/haptic)
    onDone?.();

    // auto-close after a short beat so user can see 0:00
    const t = setTimeout(() => onClose(), 250);
    return () => clearTimeout(t);
  }, [secondsLeft, visible, onClose, onDone]);

  const cardBg = useMemo(() => c.card, [c.card]);

  if (!visible) return null;

  const Btn = (p: { label: string; onPress: () => void; subtle?: boolean }) => (
    <Pressable
      onPress={p.onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: p.subtle ? c.bg : cardBg,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 70,
      }}
    >
      <Text style={{ color: c.text, fontWeight: "900" }}>{p.label}</Text>
    </Pressable>
  );

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 999,
      }}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 16,
          padding: 12,
          backgroundColor: c.card,
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Text style={{ color: c.muted, fontSize: 12, fontWeight: "800" }}>REST</Text>

        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ color: c.text, fontSize: 32, fontWeight: "900" }}>{fmt(secondsLeft)}</Text>
          <Pressable onPress={onClose} style={{ padding: 6 }}>
            <Text style={{ color: c.muted, fontWeight: "900" }}>Close</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <Btn
            label="-15"
            onPress={() => setSecondsLeft((s) => clamp(s - 15, 0, 60 * 60))}
            subtle
          />
          <Btn
            label="+15"
            onPress={() => setSecondsLeft((s) => clamp(s + 15, 0, 60 * 60))}
            subtle
          />

          <Btn
            label={running ? "Pause" : "Start"}
            onPress={() => setRunning((r) => !r)}
          />

          <Btn
            label="90s"
            onPress={() => {
              setSecondsLeft(90);
              setRunning(true);
            }}
            subtle
          />
          <Btn
            label="120s"
            onPress={() => {
              setSecondsLeft(120);
              setRunning(true);
            }}
            subtle
          />
        </View>
      </View>
    </View>
  );
}

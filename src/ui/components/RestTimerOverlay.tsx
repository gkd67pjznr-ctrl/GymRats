import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useThemeColors } from "../theme";

type Props = {
  visible: boolean; // if false, render nothing
  initialSeconds: number;
  onClose: () => void; // hides timer completely
  onDone?: () => void; // called when timer hits 0
};

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

export function RestTimerOverlay(props: Props) {
  const c = useThemeColors();

  // collapsed tab is always shown when visible=true
  const [expanded, setExpanded] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(props.initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  // slide animation (overlay panel only)
  const panelY = useRef(new Animated.Value(260)).current; // start off-screen

  useEffect(() => {
    if (!props.visible) return;
    // when newly shown, reset to initial + start running (and keep collapsed)
    setExpanded(false);
    setSecondsLeft(props.initialSeconds);
    setIsRunning(true);
  }, [props.visible, props.initialSeconds]);

  useEffect(() => {
    if (!props.visible) return;
    if (!isRunning) return;

    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) return 0;
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [props.visible, isRunning]);

  useEffect(() => {
    if (!props.visible) return;
    if (secondsLeft !== 0) return;

    setIsRunning(false);
    props.onDone?.();
  }, [secondsLeft, props]);

  useEffect(() => {
    if (!props.visible) return;

    Animated.spring(panelY, {
      toValue: expanded ? 0 : 260,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
      mass: 0.9,
    }).start();
  }, [expanded, props.visible, panelY]);

  const timeLabel = useMemo(() => formatMMSS(secondsLeft), [secondsLeft]);

  if (!props.visible) return null;

  const SmallBtn = (p: { title: string; onPress: () => void; subtle?: boolean }) => (
    <Pressable
      onPress={p.onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: p.subtle ? c.bg : c.card,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 64,
      }}
    >
      <Text style={{ color: c.text, fontWeight: "900", fontSize: 12 }}>{p.title}</Text>
    </Pressable>
  );

  return (
    <>
      {/* COLLAPSED TAB (always visible, doesn’t push layout) */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 14,
          zIndex: 999,
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          style={{
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.card,
            borderRadius: 999,
            paddingVertical: 10,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            shadowOpacity: 0.18,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          }}
        >
          <Text style={{ color: c.muted, fontWeight: "900", fontSize: 12 }}>Rest</Text>
          <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{timeLabel}</Text>

          <View style={{ width: 1, height: 18, backgroundColor: c.border, opacity: 0.8 }} />

          <Text style={{ color: c.muted, fontWeight: "900", fontSize: 12 }}>
            {expanded ? "Hide" : "Show"}
          </Text>
        </Pressable>
      </View>

      {/* EXPANDED OVERLAY PANEL (slides in, does not shove main UI) */}
      <Animated.View
        pointerEvents={expanded ? "auto" : "none"}
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 70,
          zIndex: 1000,
          transform: [{ translateY: panelY }],
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.card,
            borderRadius: 16,
            padding: 12,
            gap: 10,
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: c.text, fontWeight: "900" }}>Rest Timer</Text>

            <Pressable
              onPress={() => {
                setExpanded(false);
              }}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.bg,
              }}
            >
              <Text style={{ color: c.text, fontWeight: "900", fontSize: 12 }}>Close</Text>
            </Pressable>
          </View>

          <Text style={{ color: c.text, fontWeight: "900", fontSize: 34 }}>{timeLabel}</Text>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <SmallBtn title={isRunning ? "Pause" : "Start"} onPress={() => setIsRunning((v) => !v)} />
            <SmallBtn
              title="+15s"
              onPress={() => setSecondsLeft((s) => clampInt(s + 15, 0, 60 * 60))}
              subtle
            />
            <SmallBtn
              title="-15s"
              onPress={() => setSecondsLeft((s) => clampInt(s - 15, 0, 60 * 60))}
              subtle
            />
            <SmallBtn
              title="Reset"
              onPress={() => {
                setSecondsLeft(props.initialSeconds);
                setIsRunning(true);
              }}
              subtle
            />
            <SmallBtn
              title="Hide"
              onPress={() => {
                setExpanded(false);
              }}
              subtle
            />
            <SmallBtn
              title="Dismiss"
              onPress={() => {
                setExpanded(false);
                props.onClose();
              }}
              subtle
            />
          </View>
        </View>
      </Animated.View>
    </>
  );
}

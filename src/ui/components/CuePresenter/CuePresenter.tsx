// src/ui/components/CuePresenter/CuePresenter.tsx
// Rich cue presentation system - handles animations, theming, audio, illustrations

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { Animated, Easing, Text, View, StyleSheet, Image } from "react-native";
import { useThemeColors } from "@/src/ui/theme";
import { useSettings } from "@/src/lib/stores/settingsStore";
import type {
  RichCue,
  QuickCue,
  AnimationDirection,
  AnimationStyle,
  CueIntensity,
} from "@/src/lib/cues/cueTypes";
import { enrichCue, computeIntensity } from "@/src/lib/cues/cueTypes";

// ============================================================================
// Configuration
// ============================================================================

/** Duration multipliers by intensity */
const DURATION_BY_INTENSITY: Record<CueIntensity, number> = {
  subtle: 1500,
  normal: 2500,
  hype: 3500,
  legendary: 5000,
};

/** Font sizes by intensity */
const FONT_SIZE_BY_INTENSITY: Record<CueIntensity, number> = {
  subtle: 14,
  normal: 18,
  hype: 28,
  legendary: 36,
};

// ============================================================================
// Props
// ============================================================================

interface CuePresenterProps {
  /** The cue to display (rich or quick format) */
  cue: RichCue | QuickCue | null;

  /** Called when cue finishes displaying */
  onDismiss: () => void;

  /** Override position (default: top) */
  position?: "top" | "center" | "bottom";

  /** Enable audio playback */
  audioEnabled?: boolean;

  /** Enable illustration display */
  illustrationsEnabled?: boolean;

  /** Custom duration override (ms) */
  durationOverride?: number;
}

// ============================================================================
// Component
// ============================================================================

export function CuePresenter({
  cue,
  onDismiss,
  position = "top",
  audioEnabled = true,
  illustrationsEnabled = true,
  durationOverride,
}: CuePresenterProps) {
  const c = useThemeColors();
  const settings = useSettings();

  // Normalize to RichCue
  const richCue = useMemo((): RichCue | null => {
    if (!cue) return null;
    if ("prType" in cue && "id" in cue) return cue as RichCue;
    return enrichCue(cue as QuickCue);
  }, [cue]);

  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(getInitialTranslateY(position))).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  // Refs for cleanup
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCueIdRef = useRef<string>("");

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Main effect - handle cue changes
  useEffect(() => {
    if (!richCue) {
      // No cue - reset
      lastCueIdRef.current = "";
      opacity.setValue(0);
      translateY.setValue(getInitialTranslateY(position));
      scale.setValue(0.8);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Same cue - skip
    if (richCue.id === lastCueIdRef.current) return;
    lastCueIdRef.current = richCue.id;

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Reset animation values
    opacity.setValue(0);
    translateY.setValue(getInitialTranslateY(position));
    scale.setValue(richCue.intensity === "legendary" ? 0.5 : 0.8);

    // Play audio if enabled
    if (audioEnabled && settings.soundsEnabled && richCue.audioId) {
      playAudio(richCue.audioId);
    }

    // Animate in
    const entryDuration = richCue.intensity === "legendary" ? 400 : 200;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: entryDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: richCue.intensity === "legendary" ? 30 : 50,
        friction: richCue.intensity === "legendary" ? 5 : 8,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Schedule exit
    const holdDuration =
      durationOverride ?? richCue.durationMs ?? DURATION_BY_INTENSITY[richCue.intensity];

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: getExitTranslateY(position),
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) onDismiss();
      });
    }, holdDuration);

  }, [richCue, position, opacity, translateY, scale, onDismiss, audioEnabled, durationOverride, settings.soundsEnabled]);

  // Don't render if no cue
  if (!richCue) return null;

  const fontSize = FONT_SIZE_BY_INTENSITY[richCue.intensity];
  const isLegendary = richCue.intensity === "legendary";
  const isHype = richCue.intensity === "hype";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        getPositionStyle(position),
        {
          backgroundColor: isLegendary ? c.primary : c.card,
          borderColor: isLegendary ? c.primary : c.border,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {/* Illustration slot (future) */}
      {illustrationsEnabled && richCue.illustrationId && (
        <View style={styles.illustrationSlot}>
          {/* TODO: Load illustration by ID from theme system */}
          {/* <ThemedIllustration id={richCue.illustrationId} /> */}
        </View>
      )}

      {/* Label */}
      <Text
        style={[
          styles.label,
          { color: isLegendary ? `${c.bg}80` : c.muted },
        ]}
      >
        {getLabelText(richCue.prType)}
      </Text>

      {/* Main message */}
      <Text
        style={[
          styles.message,
          {
            color: isLegendary ? c.bg : c.text,
            fontSize,
            fontWeight: isHype || isLegendary ? "900" : "700",
          },
        ]}
      >
        {richCue.message}
      </Text>

      {/* Detail line */}
      {richCue.detail && (
        <Text
          style={[
            styles.detail,
            { color: isLegendary ? `${c.bg}CC` : c.muted },
          ]}
        >
          {richCue.detail}
        </Text>
      )}

      {/* Subtext */}
      {richCue.subtext && (
        <Text
          style={[
            styles.subtext,
            { color: isLegendary ? `${c.bg}99` : c.muted },
          ]}
        >
          {richCue.subtext}
        </Text>
      )}
    </Animated.View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getInitialTranslateY(position: "top" | "center" | "bottom"): number {
  switch (position) {
    case "top": return -30;
    case "bottom": return 30;
    case "center": return 0;
  }
}

function getExitTranslateY(position: "top" | "center" | "bottom"): number {
  switch (position) {
    case "top": return -15;
    case "bottom": return 15;
    case "center": return 0;
  }
}

function getPositionStyle(position: "top" | "center" | "bottom") {
  switch (position) {
    case "top":
      return { top: 16, left: 16, right: 16 };
    case "bottom":
      return { bottom: 100, left: 16, right: 16 };
    case "center":
      return { top: "40%", left: 32, right: 32 };
  }
}

function getLabelText(prType: RichCue["prType"]): string {
  switch (prType) {
    case "weight": return "Weight PR";
    case "rep": return "Rep PR";
    case "e1rm": return "e1RM PR";
    case "rank_up": return "Rank Up";
    case "volume": return "Volume PR";
    case "streak": return "Streak";
    case "cardio": return "Cardio";
    default: return "Cue";
  }
}

function playAudio(audioId: string) {
  // TODO: Integrate with audio system
  // audioSystem.play(audioId);
  console.log("[CuePresenter] Would play audio:", audioId);
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1000,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  illustrationSlot: {
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  message: {
    lineHeight: 1.2 * 28,
  },
  detail: {
    fontSize: 14,
    marginTop: 6,
  },
  subtext: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
});

export default CuePresenter;

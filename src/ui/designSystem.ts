// src/ui/designSystem.ts
/**
 * FORGERANK — Design System (v1)
 * A "Pure"-adjacent aesthetic: dark UI, sharp contrast, neon accents,
 * minimal UI chrome, and punchy micro-feedback.
 *
 * This file is intentionally framework-agnostic.
 * - You can use these tokens in RN StyleSheet or inline styles.
 * - Keep theme.ts free to map these into your existing useThemeColors().
 */

export type DSMode = "dark" | "light";

export type Accent = "toxic" | "electric" | "ember" | "ice" | "ultra";

export type FontWeight = "600" | "700" | "800" | "900";

export type Tone = {
  bg: string;
  card: string;
  card2: string;
  text: string;
  muted: string;
  border: string;
  overlay: string;

  // semantic
  success: string;
  danger: string;
  warn: string;
  info: string;

  // brand / accents
  accent: string;
  accent2: string;
  accentSoft: string;

  // “rank” palette hooks
  iron: string;
  bronze: string;
  silver: string;
  gold: string;
  platinum: string;
  diamond: string;
  mythic: string;
};

export type TypeScale = {
  hero: { size: number; lh: number; w: FontWeight; tracking: number };
  h1: { size: number; lh: number; w: FontWeight; tracking: number };
  h2: { size: number; lh: number; w: FontWeight; tracking: number };
  h3: { size: number; lh: number; w: FontWeight; tracking: number };
  body: { size: number; lh: number; w: FontWeight; tracking: number };
  body2: { size: number; lh: number; w: FontWeight; tracking: number };
  caption: { size: number; lh: number; w: FontWeight; tracking: number };
  micro: { size: number; lh: number; w: FontWeight; tracking: number };
};

export type Radii = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
};

export type Spacing = {
  x0: number;
  x1: number;
  x2: number;
  x3: number;
  x4: number;
  x5: number;
  x6: number;
  x7: number;
  x8: number;
  x9: number;
};

export type Strokes = {
  hairline: number;
  thin: number;
  medium: number;
  thick: number;
};

export type Shadow = {
  // RN iOS-ish shadow values; Android should use elevation analogs
  color: string;
  opacity: number;
  radius: number;
  y: number;
};

export type Motion = {
  fastMs: number;
  medMs: number;
  slowMs: number;
  spring: {
    tension: number;
    friction: number;
  };
  // for "snappy" UI
  easeOut: [number, number, number, number];
};

export type Feedback = {
  // "Rules", not implementation
  haptics: {
    onSetLogged: "light";
    onPR: "heavy";
    onError: "warn";
    onNav: "light";
  };
  sounds: {
    onPR: "spark";
    onComplete: "stamp";
    onError: "thud";
  };
};

export type DesignSystem = {
  mode: DSMode;
  accent: Accent;
  tone: Tone;
  type: TypeScale;
  radii: Radii;
  space: Spacing;
  strokes: Strokes;
  shadow: {
    soft: Shadow;
    lift: Shadow;
    punch: Shadow;
  };
  motion: Motion;
  feedback: Feedback;
  rules: {
    // high-level guardrails that keep screens consistent
    cardStyle: {
      borderWidth: number;
      blur?: boolean;
    };
    maxContentWidth: number; // for tablet/web later
    tapOpacity: number;
    subtleBorderAlpha: number;
  };
};

/**
 * Accent presets (neon leaning)
 * These are intentionally limited. Don't create 30 accents.
 */
const ACCENTS: Record<Accent, { accent: string; accent2: string; soft: string }> = {
  toxic: { accent: "#A6FF00", accent2: "#00FFB3", soft: "#203018" },
  electric: { accent: "#6D5BFF", accent2: "#00D5FF", soft: "#1C1B2C" },
  ember: { accent: "#FF3D7F", accent2: "#FF9F0A", soft: "#2B1520" },
  ice: { accent: "#00F5D4", accent2: "#7DF9FF", soft: "#142528" },
  ultra: { accent: "#B8FF5A", accent2: "#FF4DFF", soft: "#22162B" },
};

export function makeDesignSystem(mode: DSMode = "dark", accent: Accent = "toxic"): DesignSystem {
  const a = ACCENTS[accent];

  const tone: Tone =
    mode === "dark"
      ? {
          // core
          bg: "#0A0A0D",
          card: "#111118",
          card2: "#151522",
          text: "#F2F4FF",
          muted: "#A9AEC7",
          border: "#26263A",
          overlay: "rgba(0,0,0,0.55)",

          // semantic
          success: "#20FF9A",
          danger: "#FF2D55",
          warn: "#FFB020",
          info: "#3A8DFF",

          // accents
          accent: a.accent,
          accent2: a.accent2,
          accentSoft: a.soft,

          // rank hues (use sparingly, mostly for badges)
          iron: "#7B7E8A",
          bronze: "#B07A4A",
          silver: "#BFC7D5",
          gold: "#FFCC4A",
          platinum: "#64E6C2",
          diamond: "#53A8FF",
          mythic: "#FF4DFF",
        }
      : {
          // light mode is optional in v1; keep it clean and consistent
          bg: "#F7F8FF",
          card: "#FFFFFF",
          card2: "#F0F2FF",
          text: "#0C0D14",
          muted: "#4D5266",
          border: "#D7DAEA",
          overlay: "rgba(0,0,0,0.25)",

          success: "#00B86B",
          danger: "#E6002D",
          warn: "#C27500",
          info: "#1C66FF",

          accent: a.accent,
          accent2: a.accent2,
          accentSoft: "#EAF3EA",

          iron: "#6C6F7A",
          bronze: "#9B6B3D",
          silver: "#8C95A6",
          gold: "#C99700",
          platinum: "#00BFA5",
          diamond: "#1C66FF",
          mythic: "#B100B1",
        };

  const type: TypeScale = {
    hero: { size: 34, lh: 38, w: "900", tracking: -0.6 },
    h1: { size: 26, lh: 30, w: "900", tracking: -0.4 },
    h2: { size: 20, lh: 24, w: "900", tracking: -0.2 },
    h3: { size: 16, lh: 20, w: "800", tracking: -0.1 },
    body: { size: 15, lh: 20, w: "700", tracking: 0 },
    body2: { size: 13, lh: 18, w: "700", tracking: 0.1 },
    caption: { size: 12, lh: 16, w: "800", tracking: 0.2 },
    micro: { size: 11, lh: 14, w: "900", tracking: 0.3 },
  };

  const radii: Radii = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 26,
    pill: 999,
  };

  const space: Spacing = {
    x0: 0,
    x1: 4,
    x2: 8,
    x3: 12,
    x4: 16,
    x5: 20,
    x6: 24,
    x7: 32,
    x8: 40,
    x9: 56,
  };

  const strokes: Strokes = {
    hairline: 1,
    thin: 1.25,
    medium: 1.5,
    thick: 2,
  };

  const shadow = {
    soft: { color: "#000000", opacity: 0.25, radius: 18, y: 10 },
    lift: { color: "#000000", opacity: 0.35, radius: 24, y: 14 },
    punch: { color: "#000000", opacity: 0.45, radius: 28, y: 18 },
  };

  const motion: Motion = {
    fastMs: 120,
    medMs: 180,
    slowMs: 260,
    spring: {
      tension: 280,
      friction: 22,
    },
    // cubic-bezier-ish values (for web parity later)
    easeOut: [0.16, 1, 0.3, 1],
  };

  const feedback: Feedback = {
    haptics: {
      onSetLogged: "light",
      onPR: "heavy",
      onError: "warn",
      onNav: "light",
    },
    sounds: {
      onPR: "spark",
      onComplete: "stamp",
      onError: "thud",
    },
  };

  return {
    mode,
    accent,
    tone,
    type,
    radii,
    space,
    strokes,
    shadow,
    motion,
    feedback,
    rules: {
      cardStyle: { borderWidth: strokes.hairline },
      maxContentWidth: 520,
      tapOpacity: 0.7,
      subtleBorderAlpha: 0.6,
    },
  };
}

/**
 * Helpers: small utilities so screens stay consistent.
 * These are intentionally minimal.
 */

export function alpha(hex: string, a: number): string {
  // Accepts #RRGGBB only
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const aa = clamp01(a);
  return `rgba(${r},${g},${b},${aa})`;
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Recommended component styling patterns (copy/paste into RN styles):
 *
 * - Primary Card:
 *   backgroundColor: ds.tone.card
 *   borderColor: ds.tone.border
 *   borderWidth: ds.strokes.hairline
 *   borderRadius: ds.radii.lg
 *
 * - Accent Pill:
 *   borderRadius: ds.radii.pill
 *   borderWidth: ds.strokes.hairline
 *   borderColor: alpha(ds.tone.accent, 0.9)
 *   backgroundColor: alpha(ds.tone.accent, 0.12)
 *
 * - Destructive:
 *   borderColor: alpha(ds.tone.danger, 0.8)
 *   backgroundColor: alpha(ds.tone.danger, 0.12)
 *
 * “Pure” vibe rules:
 * - Default screen bg = ds.tone.bg
 * - Avoid gradients unless it’s a single subtle top glow
 * - One accent per screen max (don’t rainbow)
 * - Typography is heavy; use muted color to reduce aggression
 * - Micro-motion only: quick fades, small lifts, crisp haptics
 */

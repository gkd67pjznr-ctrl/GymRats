import { useColorScheme } from "react-native";

export interface ThemeColors {
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeRadius {
  card: number;
  pill: number;
  soft: number;
  button: number;  // Added
  input: number;   // Added
}

const lightColors: ThemeColors = {
  bg: "#ffffff",
  card: "#f9fafb",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const darkColors: ThemeColors = {
  bg: "#0a0a0a",
  card: "#18181b",
  border: "#27272a",
  text: "#fafafa",
  muted: "#a1a1aa",
  primary: "#60a5fa",
  secondary: "#a78bfa",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
};

const radius: ThemeRadius = {
  card: 14,
  pill: 999,
  soft: 8,
  button: 10,  // Added
  input: 12,   // Added
};

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}

export function useThemeRadius(): ThemeRadius {
  return radius;
}

export const theme = {
  light: lightColors,
  dark: darkColors,
  radius,
};
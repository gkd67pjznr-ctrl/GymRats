// src/ui/components/ThemedButton.tsx
// A button component that uses the active theme colors

import { Pressable, Text, type PressableProps } from "react-native";
import { useThemeColors } from "@/src/ui/theme";
import { useActivePalette } from "@/src/lib/stores/themeStore";

interface ThemedButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "outline";
  size?: "small" | "medium" | "large";
}

export function ThemedButton({
  title,
  variant = "primary",
  size = "medium",
  style,
  ...props
}: ThemedButtonProps) {
  const c = useThemeColors();
  const activePalette = useActivePalette();

  // Get color based on variant
  const getButtonColor = () => {
    if (activePalette) {
      switch (variant) {
        case "primary":
          return activePalette.colors.primary;
        case "secondary":
          return activePalette.colors.secondary;
        case "success":
          return activePalette.colors.success;
        case "danger":
          return activePalette.colors.danger;
        case "outline":
          return "transparent";
        default:
          return activePalette.colors.primary;
      }
    }

    // Fallback to default theme colors
    switch (variant) {
      case "primary":
        return c.primary;
      case "secondary":
        return c.secondary;
      case "success":
        return c.success;
      case "danger":
        return c.danger;
      case "outline":
        return "transparent";
      default:
        return c.primary;
    }
  };

  // Get text color
  const getTextColor = () => {
    if (variant === "outline") {
      return getButtonColor();
    }
    return "#000000"; // Most theme colors are vibrant, so black text works well
  };

  // Get border color for outline variant
  const getBorderColor = () => {
    if (variant === "outline" && activePalette) {
      return activePalette.colors.primary;
    }
    return "transparent";
  };

  // Get padding based on size
  const getPadding = () => {
    switch (size) {
      case "small":
        return { paddingVertical: 8, paddingHorizontal: 12 };
      case "large":
        return { paddingVertical: 16, paddingHorizontal: 24 };
      case "medium":
      default:
        return { paddingVertical: 12, paddingHorizontal: 16 };
    }
  };

  const buttonColor = getButtonColor();
  const textColor = getTextColor();
  const borderColor = getBorderColor();
  const padding = getPadding();

  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: buttonColor,
          borderWidth: variant === "outline" ? 2 : 0,
          borderColor: borderColor,
          borderRadius: 12,
          ...padding,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={{
          color: textColor,
          fontWeight: "900",
          fontSize: size === "small" ? 14 : size === "large" ? 18 : 16,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
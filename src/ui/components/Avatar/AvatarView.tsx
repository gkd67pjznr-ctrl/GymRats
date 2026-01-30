// src/ui/components/Avatar/AvatarView.tsx
// Avatar display component

import { View, Text, Image, StyleSheet } from "react-native";
import { makeDesignSystem } from "../../designSystem";
import type { AvatarArtStyle } from "../../../lib/avatar/avatarTypes";
import { getAvatarImageUrl, getArtStyleMetadata } from "../../../lib/avatar/avatarUtils";
import { useThemeColors } from "../../theme";

interface AvatarViewProps {
  userId: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  artStyle?: AvatarArtStyle | null;
  growthStage?: number | null;
  heightScale?: number | null;
  size?: "small" | "medium" | "large" | "xl";
  showGrowthIndicator?: boolean;
  showStatus?: boolean;
  status?: "online" | "working_out" | "resting" | "offline";
  activity?: string;
}

export function AvatarView(props: AvatarViewProps) {
  const {
    userId,
    displayName,
    avatarUrl,
    artStyle,
    growthStage = 1,
    heightScale = 0.3,
    size = "medium",
    showGrowthIndicator = false,
    showStatus = false,
    status,
    activity,
  } = props;

  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  // Get avatar image URL
  const avatarImageUrl = avatarUrl || getAvatarImageUrl(
    userId,
    artStyle || "bitmoji",
    growthStage,
    displayName
  );

  // Get art style metadata for display
  const artStyleMeta = artStyle ? getArtStyleMetadata(artStyle) : null;

  // Size configuration
  const sizeConfig = {
    small: { width: 32, height: 32, fontSize: 12 },
    medium: { width: 48, height: 48, fontSize: 16 },
    large: { width: 64, height: 64, fontSize: 20 },
    xl: { width: 96, height: 96, fontSize: 24 },
  }[size];

  // Growth indicator size
  const growthIndicatorSize = sizeConfig.width * 0.3;

  // Apply height scale to avatar
  const scaledHeight = sizeConfig.height * (heightScale || 0.3);

  return (
    <View style={[styles.container, { width: sizeConfig.width }]}>
      {/* Avatar image */}
      <View
        style={[
          styles.avatarContainer,
          {
            width: sizeConfig.width,
            height: scaledHeight,
            borderRadius: sizeConfig.width / 2,
            backgroundColor: c.card,
            borderWidth: 2,
            borderColor: getStatusColor(status, ds),
          },
        ]}
      >
        {avatarImageUrl ? (
          <Image
            source={{ uri: avatarImageUrl }}
            style={[
              styles.avatarImage,
              {
                width: sizeConfig.width,
                height: scaledHeight,
                borderRadius: sizeConfig.width / 2,
              },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              {
                width: sizeConfig.width,
                height: scaledHeight,
                borderRadius: sizeConfig.width / 2,
                backgroundColor: c.card,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Text
              style={{
                color: c.text,
                fontSize: sizeConfig.fontSize,
                fontWeight: "bold",
              }}
            >
              {displayName?.charAt(0).toUpperCase() || userId?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}

        {/* Growth indicator */}
        {showGrowthIndicator && growthStage && growthStage > 1 && (
          <View
            style={[
              styles.growthIndicator,
              {
                width: growthIndicatorSize,
                height: growthIndicatorSize,
                borderRadius: growthIndicatorSize / 2,
                backgroundColor: ds.tone.accent,
                bottom: -growthIndicatorSize / 3,
                right: -growthIndicatorSize / 3,
              },
            ]}
          >
            <Text
              style={{
                color: c.bg,
                fontSize: growthIndicatorSize * 0.4,
                fontWeight: "bold",
              }}
            >
              {growthStage}
            </Text>
          </View>
        )}

        {/* Status indicator */}
        {showStatus && status && (
          <View
            style={[
              styles.statusIndicator,
              {
                width: sizeConfig.width * 0.3,
                height: sizeConfig.width * 0.3,
                borderRadius: (sizeConfig.width * 0.3) / 2,
                backgroundColor: getStatusColor(status, ds),
                borderWidth: 2,
                borderColor: c.bg,
                bottom: 2,
                right: 2,
              },
            ]}
          />
        )}
      </View>

      {/* Status text */}
      {showStatus && activity && (
        <Text
          style={{
            color: c.muted,
            fontSize: 12,
            textAlign: "center",
            marginTop: 4,
            fontStyle: "italic",
          }}
          numberOfLines={1}
        >
          {activity}
        </Text>
      )}

      {/* Art style label */}
      {artStyleMeta && size !== "small" && (
        <Text
          style={{
            color: c.muted,
            fontSize: 10,
            textAlign: "center",
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {artStyleMeta.name}
        </Text>
      )}
    </View>
  );
}

// Helper function to get status color
function getStatusColor(
  status: AvatarViewProps["status"],
  ds: ReturnType<typeof makeDesignSystem>
): string {
  switch (status) {
    case "online":
      return ds.tone.success;
    case "working_out":
      return ds.tone.accent;
    case "resting":
      return ds.tone.warning;
    case "offline":
      return ds.tone.muted;
    default:
      return ds.tone.border;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    overflow: "hidden",
  },
  avatarImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  avatarPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  growthIndicator: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statusIndicator: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});
// src/ui/components/Avatar/ArtStylePickerModal.tsx
// Modal for selecting avatar art style

import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "../../theme";
import { makeDesignSystem } from "../../designSystem";
import { AVATAR_ART_STYLES } from "../../../lib/avatar/avatarUtils";
import { useAvatarStore } from "../../../lib/avatar/avatarStore";
import type { AvatarArtStyle, ArtStyleMetadata } from "../../../lib/avatar/avatarTypes";

interface ArtStylePickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentStyle: AvatarArtStyle | null;
}

export function ArtStylePickerModal({
  visible,
  onClose,
  currentStyle,
}: ArtStylePickerModalProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const { setArtStyle, loading } = useAvatarStore();
  const [selectedStyle, setSelectedStyle] = useState<AvatarArtStyle | null>(
    currentStyle
  );

  const handleSelectStyle = async (style: ArtStyleMetadata) => {
    // Haptic feedback on selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStyle(style.id);

    // Apply the style
    const success = await setArtStyle(style.id);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <Text style={[styles.title, { color: c.text }]}>Choose Art Style</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: c.muted }]}>
              Done
            </Text>
          </Pressable>
        </View>

        {/* Style Cards */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.subtitle, { color: c.muted }]}>
            Select how your avatar will be rendered
          </Text>

          {AVATAR_ART_STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;

            return (
              <Pressable
                key={style.id}
                onPress={() => handleSelectStyle(style)}
                disabled={loading}
                style={({ pressed }) => [
                  styles.styleCard,
                  {
                    backgroundColor: c.card,
                    borderColor: isSelected ? ds.tone.accent : c.border,
                    borderWidth: isSelected ? 2 : 1,
                    opacity: pressed || loading ? 0.7 : 1,
                  },
                ]}
              >
                {/* Style Icon Placeholder */}
                <View
                  style={[
                    styles.styleIcon,
                    {
                      backgroundColor: isSelected
                        ? ds.tone.accent + "20"
                        : c.bg,
                    },
                  ]}
                >
                  <Text style={styles.styleIconText}>
                    {getStyleEmoji(style.id)}
                  </Text>
                </View>

                {/* Style Info */}
                <View style={styles.styleInfo}>
                  <View style={styles.styleTitleRow}>
                    <Text style={[styles.styleName, { color: c.text }]}>
                      {style.name}
                    </Text>
                    {isSelected && (
                      <View
                        style={[
                          styles.selectedBadge,
                          { backgroundColor: ds.tone.accent },
                        ]}
                      >
                        <Text style={[styles.selectedText, { color: c.bg }]}>
                          SELECTED
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.styleDescription, { color: c.muted }]}>
                    {style.description}
                  </Text>

                  {/* Preview Lines */}
                  <View style={styles.previewLines}>
                    {style.previewLines.map((line, index) => (
                      <View key={index} style={styles.previewLineRow}>
                        <Text
                          style={[
                            styles.bulletPoint,
                            { color: isSelected ? ds.tone.accent : c.muted },
                          ]}
                        >
                          •
                        </Text>
                        <Text
                          style={[styles.previewLineText, { color: c.muted }]}
                        >
                          {line}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

function getStyleEmoji(styleId: AvatarArtStyle): string {
  switch (styleId) {
    case "bitmoji":
      return "😊";
    case "pixel":
      return "👾";
    case "retro":
      return "🕹️";
    case "3d":
      return "💎";
    default:
      return "🎨";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  styleCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  styleIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  styleIconText: {
    fontSize: 32,
  },
  styleInfo: {
    flex: 1,
    gap: 4,
  },
  styleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  styleName: {
    fontSize: 18,
    fontWeight: "700",
  },
  selectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedText: {
    fontSize: 10,
    fontWeight: "700",
  },
  styleDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  previewLines: {
    marginTop: 8,
    gap: 4,
  },
  previewLineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 18,
  },
  previewLineText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});

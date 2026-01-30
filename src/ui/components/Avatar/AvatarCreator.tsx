// src/ui/components/Avatar/AvatarCreator.tsx
// Avatar creation UI component

import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, StyleSheet } from "react-native";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../theme";
import { AVATAR_ART_STYLES } from "../../../lib/avatar/avatarUtils";
import type { AvatarArtStyle } from "../../../lib/avatar/avatarTypes";
import { useAvatarStore } from "../../../lib/avatar/avatarStore";
import { AvatarView } from "./AvatarView";

interface AvatarCreatorProps {
  userId: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function AvatarCreator(props: AvatarCreatorProps) {
  const { userId, displayName, avatarUrl, onComplete, onCancel } = props;

  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const [selectedStyle, setSelectedStyle] = useState<AvatarArtStyle>("bitmoji");
  const { setArtStyle, loading } = useAvatarStore();

  const handleSave = async () => {
    const success = await setArtStyle(selectedStyle);
    if (success) {
      Alert.alert("Success", "Avatar style saved!");
      onComplete?.();
    } else {
      Alert.alert("Error", "Failed to save avatar style. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text }]}>
        Create Your Avatar
      </Text>

      <Text style={[styles.subtitle, { color: c.muted }]}>
        Choose an art style for your gym companion
      </Text>

      {/* Avatar Preview */}
      <View style={styles.previewContainer}>
        <AvatarView
          userId={userId}
          displayName={displayName}
          avatarUrl={avatarUrl}
          artStyle={selectedStyle}
          size="xl"
          showGrowthIndicator
          growthStage={1}
          heightScale={0.3}
        />
        <Text style={[styles.previewLabel, { color: c.muted }]}>
          Preview
        </Text>
      </View>

      {/* Art Style Selection */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.styleScroll}
      >
        {AVATAR_ART_STYLES.map((style) => (
          <Pressable
            key={style.id}
            onPress={() => setSelectedStyle(style.id)}
            style={[
              styles.styleOption,
              {
                backgroundColor: selectedStyle === style.id ? ds.tone.card : c.card,
                borderColor: selectedStyle === style.id ? ds.tone.accent : c.border,
              },
            ]}
          >
            <Text
              style={[
                styles.styleName,
                {
                  color: selectedStyle === style.id ? ds.tone.accent : c.text,
                  fontWeight: selectedStyle === style.id ? "900" : "600",
                },
              ]}
            >
              {style.name}
            </Text>
            <Text
              style={[
                styles.styleDescription,
                { color: selectedStyle === style.id ? ds.tone.text : c.muted },
              ]}
            >
              {style.description}
            </Text>
            {style.previewLines.map((line, index) => (
              <Text
                key={index}
                style={[
                  styles.stylePreview,
                  { color: selectedStyle === style.id ? ds.tone.muted : c.muted },
                ]}
              >
                • {line}
              </Text>
            ))}
          </Pressable>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={onCancel}
          disabled={loading}
          style={[
            styles.button,
            styles.cancelButton,
            { backgroundColor: c.bg, borderColor: c.border },
          ]}
        >
          <Text style={[styles.buttonText, { color: c.text }]}>
            {loading ? "Saving..." : "Skip for Now"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSave}
          disabled={loading}
          style={[
            styles.button,
            styles.saveButton,
            { backgroundColor: ds.tone.accent },
          ]}
        >
          <Text style={[styles.buttonText, { color: c.bg }]}>
            {loading ? "Saving..." : "Save Avatar"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  styleScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  styleOption: {
    width: 280,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 12,
  },
  styleName: {
    fontSize: 18,
    marginBottom: 8,
  },
  styleDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 18,
  },
  stylePreview: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButton: {
    borderColor: "#ccc",
  },
  saveButton: {
    borderColor: "transparent",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
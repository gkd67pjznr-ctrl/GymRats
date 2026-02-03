// src/ui/screens/AvatarScreen.tsx
// Avatar management screen

import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { makeDesignSystem } from "../designSystem";
import { useThemeColors } from "../theme";
import { useUser } from "../../lib/stores/authStore";
import { useAvatarStore } from "../../lib/avatar/avatarStore";
import { useAvatarGrowth } from "../../lib/stores/userStatsStore";
import { AvatarView } from "../components/Avatar/AvatarView";
import { AvatarCreator } from "../components/Avatar/AvatarCreator";
import { getGrowthStageDescription, getGrowthStagePercentage } from "../../lib/avatar/growthCalculator";
import { AVATAR_ART_STYLES, getArtStyleMetadata } from "../../lib/avatar/avatarUtils";

export default function AvatarScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const user = useUser();
  // Avatar customization from avatarStore
  const { artStyle, cosmetics, hydrated } = useAvatarStore();
  // Growth data from unified userStatsStore
  const avatarGrowth = useAvatarGrowth();
  const { stage: growthStage, heightScale, volumeTotal, setsTotal, avgRank } = avatarGrowth;

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Text style={[styles.errorText, { color: c.text }]}>
          Please sign in to view your avatar.
        </Text>
      </View>
    );
  }

  if (!hydrated) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Text style={[styles.loadingText, { color: c.muted }]}>
          Loading avatar data...
        </Text>
      </View>
    );
  }

  // If no art style is set, show the creator
  if (!artStyle) {
    return (
      <AvatarCreator
        userId={user.id}
        displayName={user.displayName}
        avatarUrl={user.avatarUrl}
        onComplete={() => router.back()}
        onCancel={() => router.back()}
      />
    );
  }

  const artStyleMeta = getArtStyleMetadata(artStyle);
  const growthPercentage = growthStage ? getGrowthStagePercentage(growthStage) : 0;
  const growthDescription = growthStage ? getGrowthStageDescription(growthStage) : "";

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={styles.content}>
        {/* Avatar Preview */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            Your Avatar
          </Text>

          <View style={styles.avatarPreview}>
            <AvatarView
              userId={user.id}
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
              artStyle={artStyle}
              growthStage={growthStage}
              heightScale={heightScale}
              size="xl"
              showGrowthIndicator
            />
          </View>

          <Text style={[styles.avatarName, { color: c.text }]}>
            {user.displayName || "User"}
          </Text>

          {artStyleMeta && (
            <Text style={[styles.avatarStyle, { color: c.muted }]}>
              {artStyleMeta.name}
            </Text>
          )}
        </View>

        {/* Growth Progress */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            Growth Progress
          </Text>

          <View style={styles.growthInfo}>
            <Text style={[styles.growthStage, { color: c.text }]}>
              Stage {growthStage}/20
            </Text>
            <Text style={[styles.growthDescription, { color: c.muted }]}>
              {growthDescription}
            </Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: c.bg }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: ds.tone.accent,
                  width: `${growthPercentage}%`,
                },
              ]}
            />
          </View>

          <View style={styles.growthStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: c.text }]}>
                {volumeTotal?.toLocaleString() || "0"}
              </Text>
              <Text style={[styles.statLabel, { color: c.muted }]}>
                Volume (kg)
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: c.text }]}>
                {setsTotal || "0"}
              </Text>
              <Text style={[styles.statLabel, { color: c.muted }]}>
                Sets
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: c.text }]}>
                {avgRank?.toFixed(1) || "0.0"}
              </Text>
              <Text style={[styles.statLabel, { color: c.muted }]}>
                Avg Rank
              </Text>
            </View>
          </View>
        </View>

        {/* Customize Options */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            Customize
          </Text>

          <Pressable
            onPress={() => {
              // TODO: Implement art style change
              Alert.alert("Feature Coming Soon", "Art style changing will be available in a future update.");
            }}
            style={[styles.customizeOption, { borderColor: c.border }]}
          >
            <Text style={[styles.optionTitle, { color: c.text }]}>
              Change Art Style
            </Text>
            <Text style={[styles.optionSubtitle, { color: c.muted }]}>
              {artStyleMeta?.name || "Not set"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              // TODO: Implement cosmetics
              Alert.alert("Feature Coming Soon", "Avatar cosmetics will be available in a future update.");
            }}
            style={[styles.customizeOption, { borderColor: c.border }]}
          >
            <Text style={[styles.optionTitle, { color: c.text }]}>
              Avatar Cosmetics
            </Text>
            <Text style={[styles.optionSubtitle, { color: c.muted }]}>
              {cosmetics ? "Customized" : "Not set"}
            </Text>
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.button,
              styles.cancelButton,
              { backgroundColor: c.bg, borderColor: c.border },
            ]}
          >
            <Text style={[styles.buttonText, { color: c.text }]}>
              Done
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  avatarPreview: {
    alignItems: "center",
    marginVertical: 16,
  },
  avatarName: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  avatarStyle: {
    fontSize: 16,
    textAlign: "center",
  },
  growthInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  growthStage: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  growthDescription: {
    fontSize: 16,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
  },
  growthStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  customizeOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
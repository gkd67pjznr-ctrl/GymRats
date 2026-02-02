// app/(tabs)/profile.tsx
import { Pressable, ScrollView, Text, View, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import { Link, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { useThemeColors } from "../../src/ui/theme";
import { useDevMode } from "../../src/lib/devMode";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
// Gamification imports
import { useGamificationStore } from "../../src/lib/stores/gamificationStore";
import { useIsGamificationHydrated, usePendingLevelUp } from "../../src/lib/stores/gamificationStore";
import { StatsAndRanksCard , LevelUpModal } from "../../src/ui/components/Gamification";
import type { LevelUpCelebration } from "../../src/lib/gamification/types";
// Milestones imports
import {
  TrophyCard,
  MilestoneEarnedToast,
} from "../../src/ui/components/Milestones";
import {
  useMilestonesStore,
  useIsMilestonesHydrated,
  usePendingMilestoneCelebration,
} from "../../src/lib/stores/milestonesStore";
import { useRouter } from "expo-router";
import { ForgeDNACard, ProfileStatsCard } from "../../src/ui/components/Profile";
import { NavigationCard } from "../../src/ui/components/NavigationCard";

export default function ProfileTab() {
  const c = useThemeColors();
  const devMode = useDevMode();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tapCount, setTapCount] = useState(0);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");

  // Gamification state
  const isHydrated = useIsGamificationHydrated();
  const profile = useGamificationStore((s) => s.profile);
  const pendingLevelUp = usePendingLevelUp();
  const dismissLevelUp = useGamificationStore((s) => s.dismissLevelUp);
  const syncToServer = useGamificationStore((s) => s.sync);

  // Milestones state
  const isMilestonesHydrated = useIsMilestonesHydrated();
  const earnedMilestones = useMilestonesStore((s) => s.earnedMilestones);
  const pendingMilestone = usePendingMilestoneCelebration();
  const dismissMilestone = useMilestonesStore((s) => s.dismissCelebration);

  const DEV_PASSWORD = "62136213";

  // Sync gamification data on mount
  useEffect(() => {
    if (isHydrated) {
      syncToServer().catch((err) => console.error("Failed to sync gamification:", err));
    }
  }, [isHydrated]);

  useEffect(() => {
    // Simulate brief initialization
    // In the future, this will load user stats, settings, etc.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Secret: tap "Profile" title 7 times to show password prompt
  const handleSecretTap = () => {
    setTapCount(prev => prev + 1);
    
    if (tapCount + 1 >= 7) {
      setShowPasswordPrompt(true);
      setTapCount(0);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === DEV_PASSWORD) {
      devMode.enable();
      setShowPasswordPrompt(false);
      setPassword("");
      Alert.alert("Success", "Dev mode enabled! 🔧");
    } else {
      Alert.alert("Error", "Incorrect password");
      setPassword("");
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false);
    setPassword("");
  };

  // Show loading spinner briefly (or waiting for gamification/milestones to hydrate)
  if (isLoading || !isHydrated || !isMilestonesHydrated) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: c.bg, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color={c.text} />
        <Text style={{ color: c.muted, marginTop: 12, fontSize: 14 }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  // Remove the CardLink component since we're using NavigationCard

  return (
    <ProtectedRoute>
      <TabErrorBoundary screenName="Profile">
        <>
        {/* Password Prompt Modal */}
      <Modal
        visible={showPasswordPrompt}
        transparent
        animationType="fade"
        onRequestClose={handlePasswordCancel}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: c.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: c.border,
              padding: 24,
              width: "100%",
              maxWidth: 400,
              gap: 16,
            }}
          >
            <Text style={{ color: c.text, fontSize: 20, fontWeight: "900", textAlign: "center" }}>
              🔧 Dev Mode
            </Text>
            
            <Text style={{ color: c.muted, textAlign: "center" }}>
              Enter developer password
            </Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={c.muted}
              secureTextEntry
              keyboardType="number-pad"
              autoFocus
              style={{
                backgroundColor: c.bg,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 12,
                padding: 16,
                color: c.text,
                fontSize: 16,
                textAlign: "center",
              }}
              onSubmitEditing={handlePasswordSubmit}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={handlePasswordCancel}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.bg,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: c.text, fontWeight: "700" }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handlePasswordSubmit}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: "#4ECDC4",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#000", fontWeight: "900" }}>Enter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        {/* Secret tap area */}
        <Pressable onPress={handleSecretTap}>
          <Text style={{ color: c.text, fontSize: 26, fontWeight: "900" }}>
            Profile {devMode.isEnabled && "🔧"}
          </Text>
        </Pressable>

        <Text style={{ color: c.muted, lineHeight: 18 }}>
          Your training history, calendar, stats, and progress over time.
        </Text>

        {/* Edit Profile Card */}
        <NavigationCard
          href="/profile/edit"
          title="Edit Profile"
          subtitle="Update your display name and profile picture"
          icon="✏️"
        />

        {/* Calendar: real data lives in /calendar */}
        <NavigationCard
          href="/calendar"
          title="Workout Calendar"
          subtitle="Shows a month grid with highlighted workout days (real data)."
          icon="📅"
        />

        {/* History: real data lives in /history */}
        <NavigationCard
          href="/history"
          title="History"
          subtitle="Browse your saved workout sessions by day/time/duration (real data)."
          icon="📊"
        />

        {/* Avatar: virtual gym companion */}
        <NavigationCard
          href="/avatar"
          title="Avatar"
          subtitle="Customize your gym companion and track its growth."
          icon="👤"
        />

        {/* Hangout Room: social space with friends */}
        <NavigationCard
          href="/hangout"
          title="Hangout Room"
          subtitle="Visit your virtual gym hangout space with friends."
          icon="👥"
        />

        {/* Themes: customize app appearance */}
        <NavigationCard
          href="/profile/themes"
          title="App Themes"
          subtitle="Customize the app's appearance with different color themes and visual styles."
          icon="🎨"
        />

        {/* Theme Demo: see themed components in action */}
        <NavigationCard
          href="/profile/theme-demo"
          title="Theme Demo"
          subtitle="See how themed components look with your current theme."
          icon="✨"
        />

        {/* Illustrations Gallery: browse themed illustrations */}
        <NavigationCard
          href="/profile/illustrations"
          title="Illustrations Gallery"
          subtitle="Browse themed illustrations that enhance your app experience with unique visuals."
          icon="🖼️"
        />

        <View style={{ height: 6 }} />

        <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Coming next</Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 14,
            padding: 14,
            backgroundColor: c.card,
            gap: 8,
          }}
        >
          <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Day Details</Text>
          <Text style={{ color: c.muted, lineHeight: 18 }}>
            Each calendar day will eventually show a workout title and/or tiny muscle indicators.
          </Text>
        </View>

        {/* Gamification Stats & Ranks Card */}
        <StatsAndRanksCard profile={profile} />

        {/* Profile Stats Card - Exercise Ranks & PRs */}
        <ProfileStatsCard limit={5} />

        {/* Milestones Trophy Card */}
        <TrophyCard
          earnedCount={Object.keys(earnedMilestones).length}
          totalCount={30} // Total milestones defined
          onShowFull={() => router.push('/milestones')}
        />

        {/* Forge DNA Card */}
        <ForgeDNACard />

        {/* Level Up Modal */}
        <LevelUpModal
          visible={pendingLevelUp !== null}
          celebration={pendingLevelUp}
          onDismiss={dismissLevelUp}
        />

        {/* Milestone Earned Toast */}
        <MilestoneEarnedToast
          celebration={pendingMilestone}
          onDismiss={dismissMilestone}
          onViewTrophyCase={() => router.push('/milestones')}
        />

        {/* Dev tools (only shown when dev mode enabled) */}
        {devMode.isEnabled && (
          <>
            <View style={{ height: 6 }} />
            
            <Text style={{ color: "#FF6B6B", fontWeight: "900", fontSize: 16 }}>
              🔧 Developer Tools
            </Text>

            <Link href="/dev/plan-creator" asChild>
              <Pressable
                style={{
                  borderWidth: 1,
                  borderColor: "#FF6B6B",
                  borderRadius: 14,
                  padding: 14,
                  backgroundColor: c.card,
                }}
              >
                <Text style={{ color: "#FF6B6B", fontSize: 18, fontWeight: "900" }}>
                  Plan Creator
                </Text>
                <Text style={{ color: c.muted, lineHeight: 18 }}>
                  Create curated plans without writing code
                </Text>
              </Pressable>
            </Link>

            <Pressable
              onPress={() => {
                devMode.disable();
                Alert.alert("Success", "Dev mode disabled");
              }}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 14,
                padding: 14,
                backgroundColor: c.card,
              }}
            >
              <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>
                Disable Dev Mode
              </Text>
              <Text style={{ color: c.muted, lineHeight: 18 }}>
                Hide developer tools
              </Text>
            </Pressable>
          </>
        )}
        </ScrollView>
        </>
      </TabErrorBoundary>
    </ProtectedRoute>
  );
}

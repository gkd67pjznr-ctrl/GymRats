import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator, TextInput, Modal, Image } from "react-native";
import { Link , useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useThemeColors } from "../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores
import { useSettings, updateSettings, usePersonality } from "../src/lib/stores";
import { useAuthStore, useIsEmailVerified, useUser } from "../src/lib/stores/authStore";
import { useBlockedUsers, unblockUser } from "../src/lib/stores/friendsStore";
import { useUserProfiles } from "../src/lib/stores/userProfileStore";
import { ProtectedRoute } from "../src/ui/components/ProtectedRoute";
import { ScreenHeader } from "../src/ui/components/ScreenHeader";
import { migrateLocalToCloud, importFromCSV } from "../src/lib/migration/dataMigrator";
import type { MigrationProgress } from "../src/lib/migration/dataMigrator";
import {
  exportAndShareCurrentUserWorkouts,
  exportAndEmailCurrentUserWorkouts,
  isEmailAvailable,
} from "../src/lib/csvExport";
import { WeightEntryModal } from "../src/ui/components/Settings/WeightEntryModal";
import { LocationEntryModal } from "../src/ui/components/Settings/LocationEntryModal";
import { kgToLb } from "../src/lib/units";

function Row(props: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontWeight: "900", fontSize: 16 }}>{props.title}</Text>
      {!!props.subtitle && <Text style={{ opacity: 0.75 }}>{props.subtitle}</Text>}
      {!!props.right && <View style={{ marginTop: 8 }}>{props.right}</View>}
    </View>
  );
}

function Toggle(props: {
  value: boolean;
  onChange: (v: boolean) => void;
  labelOn?: string;
  labelOff?: string;
}) {
  const label = props.value ? (props.labelOn ?? "On") : (props.labelOff ?? "Off");
  return (
    <Pressable
      onPress={() => props.onChange(!props.value)}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
      }}
    >
      <Text style={{ fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function Pill(props: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        opacity: props.active ? 1 : 0.7,
      }}
    >
      <Text style={{ fontWeight: props.active ? "900" : "700" }}>{props.label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const settings = useSettings();
  const user = useUser();
  const { signOut, loading: authLoading, session, resendVerificationEmail, deleteAccount, updateAvatar, removeAvatar, loading: avatarLoading } = useAuthStore();
  const isEmailVerified = useIsEmailVerified();
  const currentPersonality = usePersonality();

  // Blocked users data
  const blockedUsers = useBlockedUsers(user?.id ?? "");
  const blockedUserIds = blockedUsers.map(e => e.otherUserId);
  const blockedProfiles = useUserProfiles(blockedUserIds);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [_showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Weight entry modal state
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightModalMode, setWeightModalMode] = useState<'current' | 'historical'>('current');

  // Location entry modal state
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Migration state
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [migrationResult, setMigrationResult] = useState<{ workouts: number; routines: number } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [exportEmail, setExportEmail] = useState("");

  async function handleSignOut() {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/auth/login");
          },
        },
      ]
    );
  }

  async function handleResendVerification() {
    const result = await resendVerificationEmail();
    if (result.success) {
      Alert.alert("Verification Email Sent", "Check your inbox for the verification link.");
    } else {
      Alert.alert("Error", result.error || "Failed to send verification email");
    }
  }

  function openDeleteModal() {
    setDeletePassword("");
    setDeleteError(null);
    setShowDeleteModal(true);
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setDeleteError("Please enter your password");
      return;
    }

    const result = await deleteAccount(deletePassword);

    if (result.success) {
      setShowDeleteModal(false);
      router.replace("/auth/login");
    } else {
      setDeleteError(result.error || "Failed to delete account");
    }
  }

  async function handlePickAvatar() {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permissions to change your avatar.");
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uploadResult = await updateAvatar(result.assets[0].uri);
        if (uploadResult.success) {
          Alert.alert("Success", "Avatar updated!");
        } else {
          Alert.alert("Error", uploadResult.error || "Failed to update avatar");
        }
      }
    } catch (_err) {
      Alert.alert("Error", "Failed to pick image");
    }
  }

  async function handleRemoveAvatar() {
    Alert.alert(
      "Remove Avatar",
      "Are you sure you want to remove your avatar? A default avatar will be used instead.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const result = await removeAvatar();
            if (result.success) {
              Alert.alert("Success", "Avatar removed!");
            } else {
              Alert.alert("Error", result.error || "Failed to remove avatar");
            }
          },
        },
      ]
    );
  }

  async function handleMigrateLocalData() {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to migrate data");
      return;
    }

    setIsMigrating(true);
    setMigrationProgress(null);
    setMigrationResult(null);
    setShowMigrationModal(true);

    const result = await migrateLocalToCloud(user.id, (progress) => {
      setMigrationProgress(progress);
    });

    setIsMigrating(false);

    if (result.success && result.stats) {
      setMigrationResult(result.stats);
    } else {
      Alert.alert("Migration Failed", result.error || "An unknown error occurred");
      setShowMigrationModal(false);
    }
  }

  async function handleImportCSV() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const csvContent = await fetch(file.uri).then((r) => r.text());

        if (!user?.id) {
          Alert.alert("Error", "You must be logged in to import data");
          return;
        }

        setIsMigrating(true);
        setMigrationProgress(null);
        setMigrationResult(null);
        setShowMigrationModal(true);

        const importResult = await importFromCSV(csvContent, user.id, (progress) => {
          setMigrationProgress(progress);
        });

        setIsMigrating(false);

        if (importResult.success && importResult.stats) {
          setMigrationResult(importResult.stats);
        } else {
          Alert.alert("Import Failed", importResult.error || "An unknown error occurred");
          setShowMigrationModal(false);
        }
      }
    } catch (_err) {
      Alert.alert("Error", "Failed to pick CSV file");
    }
  }

  async function handleExportCSV() {
    setIsExporting(true);
    try {
      const result = await exportAndShareCurrentUserWorkouts();
      if (result.success) {
        Alert.alert(
          "Export Successful",
          `Exported ${result.sessionsExported} workouts (${result.setsExported} sets)`,
        );
      } else {
        Alert.alert("Export Failed", result.error || "An unknown error occurred");
      }
    } catch (_err) {
      Alert.alert("Error", "Failed to export workout data");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleEmailExport() {
    const emailAvailable = await isEmailAvailable();
    if (!emailAvailable) {
      Alert.alert("Email Not Available", "Email is not configured on this device. Please set up an email account in your device settings.");
      return;
    }
    // Pre-fill with user's email if available
    setExportEmail(user?.email || "");
    setShowEmailModal(true);
  }

  async function handleSendEmailExport() {
    setShowEmailModal(false);
    setIsExporting(true);
    try {
      const result = await exportAndEmailCurrentUserWorkouts(exportEmail || undefined);
      if (result.success) {
        Alert.alert(
          "Email Ready",
          `Your workout data (${result.sessionsExported} workouts, ${result.setsExported} sets) is ready to send.`,
        );
      } else {
        Alert.alert("Export Failed", result.error || "An unknown error occurred");
      }
    } catch (_err) {
      Alert.alert("Error", "Failed to prepare email export");
    } finally {
      setIsExporting(false);
    }
  }

  // Weight entry modal handlers
  const handleOpenWeightModal = (mode: 'current' | 'historical') => {
    setWeightModalMode(mode);
    setShowWeightModal(true);
  };

  const handleCloseWeightModal = () => {
    setShowWeightModal(false);
  };

  function closeMigrationModal() {
    setShowMigrationModal(false);
    setMigrationProgress(null);
    setMigrationResult(null);
  }

  return (
    <ProtectedRoute>
      <ScreenHeader title="Settings" />
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}>

        {/* Avatar Section */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {/* Avatar Image */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: c.bg,
                borderWidth: 2,
                borderColor: c.border,
                overflow: "hidden",
              }}
            >
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 32, fontWeight: "900", color: c.muted }}>
                    {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>
              )}
            </View>

            {/* Avatar Info & Actions */}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontWeight: "900", fontSize: 18 }}>
                {user?.displayName || "User"}
              </Text>
              <Text style={{ opacity: 0.75, fontSize: 13 }}>
                {user?.email || "No email"}
              </Text>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                <Pressable
                  onPress={handlePickAvatar}
                  disabled={avatarLoading}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: c.bg,
                    borderWidth: 1,
                    borderColor: c.border,
                    alignItems: "center",
                    opacity: avatarLoading ? 0.5 : 1,
                  }}
                >
                  {avatarLoading ? (
                    <ActivityIndicator size="small" color={c.text} />
                  ) : (
                    <Text style={{ fontWeight: "700", fontSize: 12 }}>Change</Text>
                  )}
                </Pressable>

                {user?.avatarUrl && (
                  <Pressable
                    onPress={handleRemoveAvatar}
                    disabled={avatarLoading}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: "#fee2e2",
                      borderWidth: 1,
                      borderColor: "#fca5a5",
                      alignItems: "center",
                      opacity: avatarLoading ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ fontWeight: "700", fontSize: 12, color: "#991b1b" }}>Remove</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Haptics"
            subtitle="Vibration feedback for PRs and rest timer done."
            right={
              <Toggle
                value={settings.hapticsEnabled}
                onChange={(v) => updateSettings({ hapticsEnabled: v })}
              />
            }
          />
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Sounds"
            subtitle='Audio cues (currently uses a voice cue like "Rest over").'
            right={
              <Toggle
                value={settings.soundsEnabled}
                onChange={(v) => updateSettings({ soundsEnabled: v })}
              />
            }
          />
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Buddy Voice"
            subtitle="Voice lines from your AI Gym Buddy (premium/legendary only)."
            right={
              <Toggle
                value={settings.buddyVoiceEnabled}
                onChange={(v) => updateSettings({ buddyVoiceEnabled: v })}
              />
            }
          />
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Units"
            subtitle="Display and logging units."
            right={
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pill
                  label="lb"
                  active={settings.unitSystem === "lb"}
                  onPress={() => updateSettings({ unitSystem: "lb" })}
                />
                <Pill
                  label="kg"
                  active={settings.unitSystem === "kg"}
                  onPress={() => updateSettings({ unitSystem: "kg" })}
                />
              </View>
            }
          />
        </View>

        {/* Weight Tracking */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Bodyweight"
            subtitle={`Current weight: ${settings.unitSystem === 'lb' ? kgToLb(settings.bodyweight).toFixed(1) : settings.bodyweight.toFixed(1)} ${settings.unitSystem}`}
            right={
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={() => handleOpenWeightModal('current')}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    backgroundColor: c.bg,
                    borderWidth: 1,
                    borderColor: c.border,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontWeight: '700', fontSize: 12 }}>Update</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleOpenWeightModal('historical')}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    backgroundColor: c.bg,
                    borderWidth: 1,
                    borderColor: c.border,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontWeight: '700', fontSize: 12 }}>Add Historical</Text>
                </Pressable>
              </View>
            }
          />
        </View>

        {/* Location for Regional Leaderboards */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Location"
            subtitle={
              settings.location.country
                ? `${settings.location.region ? `${settings.location.region}, ` : ''}${settings.location.country}`
                : 'Not set - Set to compete in regional leaderboards'
            }
            right={
              <Pressable
                onPress={() => setShowLocationModal(true)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  backgroundColor: c.bg,
                  borderWidth: 1,
                  borderColor: c.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: '700', fontSize: 12 }}>
                  {settings.location.country ? 'Change' : 'Set Location'}
                </Text>
              </Pressable>
            }
          />
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Default Rest Timer"
            subtitle="Used when the rest timer pops after logging a set."
            right={
              <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                <Pill
                  label="60s"
                  active={settings.defaultRestSeconds === 60}
                  onPress={() => updateSettings({ defaultRestSeconds: 60 })}
                />
                <Pill
                  label="90s"
                  active={settings.defaultRestSeconds === 90}
                  onPress={() => updateSettings({ defaultRestSeconds: 90 })}
                />
                <Pill
                  label="120s"
                  active={settings.defaultRestSeconds === 120}
                  onPress={() => updateSettings({ defaultRestSeconds: 120 })}
                />
              </View>
            }
          />
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Workout Replay"
            subtitle="Auto-play workout summary after finishing a workout."
            right={
              <Toggle
                value={settings.replayAutoPlay}
                onChange={(v) => updateSettings({ replayAutoPlay: v })}
                labelOn="Auto"
                labelOff="Manual"
              />
            }
          />
        </View>

        {/* Audio Cues */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Audio Cues"
            subtitle="Individual sound effects for different events"
          />
          <View style={{ gap: 8, marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>PR Celebrations</Text>
              <Toggle
                value={settings.audioCues.prCelebration}
                onChange={(v) => updateSettings({ audioCues: { ...settings.audioCues, prCelebration: v } })}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>Rest Timer Start</Text>
              <Toggle
                value={settings.audioCues.restTimerStart}
                onChange={(v) => updateSettings({ audioCues: { ...settings.audioCues, restTimerStart: v } })}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>Rest Timer End</Text>
              <Toggle
                value={settings.audioCues.restTimerEnd}
                onChange={(v) => updateSettings({ audioCues: { ...settings.audioCues, restTimerEnd: v } })}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>Workout Complete</Text>
              <Toggle
                value={settings.audioCues.workoutComplete}
                onChange={(v) => updateSettings({ audioCues: { ...settings.audioCues, workoutComplete: v } })}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>Rank Up</Text>
              <Toggle
                value={settings.audioCues.rankUp}
                onChange={(v) => updateSettings({ audioCues: { ...settings.audioCues, rankUp: v } })}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>Level Up</Text>
              <Toggle
                value={settings.audioCues.levelUp}
                onChange={(v) => updateSettings({ audioCues: { ...settings.audioCues, levelUp: v } })}
              />
            </View>
          </View>
        </View>

        {/* Rest Timer Feedback */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Rest Timer Feedback"
            subtitle="How the rest timer notifies you when it's done"
          />
          <View style={{ gap: 8, marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>Audio</Text>
              <Toggle
                value={settings.restTimerFeedback.audio}
                onChange={(v) => updateSettings({ restTimerFeedback: { ...settings.restTimerFeedback, audio: v } })}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>Haptic</Text>
              <Toggle
                value={settings.restTimerFeedback.haptic}
                onChange={(v) => updateSettings({ restTimerFeedback: { ...settings.restTimerFeedback, haptic: v } })}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>Voice</Text>
              <Toggle
                value={settings.restTimerFeedback.voice}
                onChange={(v) => updateSettings({ restTimerFeedback: { ...settings.restTimerFeedback, voice: v } })}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>Notification</Text>
              <Toggle
                value={settings.restTimerFeedback.notification}
                onChange={(v) => updateSettings({ restTimerFeedback: { ...settings.restTimerFeedback, notification: v } })}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>Visual Progress</Text>
              <Toggle
                value={settings.restTimerFeedback.visualProgress}
                onChange={(v) => updateSettings({ restTimerFeedback: { ...settings.restTimerFeedback, visualProgress: v } })}
              />
            </View>
          </View>
        </View>

        {/* Dev Menu Link */}
        {__DEV__ && (
          <Link href="/dev-menu" asChild>
            <Pressable
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 14,
                backgroundColor: c.card,
                padding: 12,
              }}
            >
              <Text style={{ fontWeight: "900", fontSize: 16, color: c.text }}>Dev Menu</Text>
              <Text style={{ opacity: 0.75, color: c.muted }}>Quick access to all screens for testing.</Text>
            </Pressable>
          </Link>
        )}

        {/* Email Verification Status */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <View>
              <Text style={{ fontWeight: "900", fontSize: 16 }}>Email Verification</Text>
              <Text style={{ opacity: 0.75, fontSize: 12 }}>
                {session?.user?.email || "No email"}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: isEmailVerified ? "#d1fae5" : "#fee2e2",
                borderWidth: 1,
                borderColor: isEmailVerified ? "#6ee7b7" : "#fca5a5",
              }}
            >
              <Text style={{ color: isEmailVerified ? "#065f46" : "#991b1b", fontWeight: "900", fontSize: 12 }}>
                {isEmailVerified ? "Verified" : "Not Verified"}
              </Text>
            </View>
          </View>

          {!isEmailVerified && (
            <>
              <Text style={{ opacity: 0.75, fontSize: 13, marginBottom: 8 }}>
                Verify your email to access all features and ensure account security.
              </Text>
              <Pressable
                onPress={handleResendVerification}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "900" }}>Resend Verification Email</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Account Section */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Sign Out"
            subtitle="Sign out of your account"
          />
          <Pressable
            onPress={handleSignOut}
            disabled={authLoading}
            style={{
              marginTop: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: "#fee2e2",
              borderWidth: 1,
              borderColor: "#fca5a5",
              alignItems: "center",
              opacity: authLoading ? 0.5 : 1,
            }}
          >
            <Text style={{ color: "#991b1b", fontWeight: "900", fontSize: 14 }}>
              {authLoading ? "Signing Out..." : "Sign Out"}
            </Text>
          </Pressable>
        </View>

        {/* Delete Account Section */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Delete Account"
            subtitle="Permanently delete your account and all data"
          />
          <Pressable
            onPress={openDeleteModal}
            style={{
              marginTop: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: "#fee2e2",
              borderWidth: 1,
              borderColor: "#fca5a5",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#991b1b", fontWeight: "900", fontSize: 14 }}>
              Delete Account
            </Text>
          </Pressable>
        </View>

        {/* Data Export & Import Section */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Data Export & Import"
            subtitle="Export your workout data or import from other apps"
          />

          {/* Export Options */}
          <Text style={{ fontWeight: "700", fontSize: 14, marginTop: 12, marginBottom: 8 }}>Export</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={handleExportCSV}
              disabled={isExporting}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: "#4ECDC4",
                alignItems: "center",
                opacity: isExporting ? 0.5 : 1,
              }}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={{ fontWeight: "700", fontSize: 12, color: "#000" }}>Export CSV</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleEmailExport}
              disabled={isExporting}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: c.bg,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: "center",
                opacity: isExporting ? 0.5 : 1,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 12 }}>Email Export</Text>
            </Pressable>
          </View>

          {/* Import Options */}
          <Text style={{ fontWeight: "700", fontSize: 14, marginTop: 16, marginBottom: 8 }}>Import</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={handleImportCSV}
              disabled={isMigrating || isExporting}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: c.bg,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: "center",
                opacity: (isMigrating || isExporting) ? 0.5 : 1,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 12 }}>Import CSV</Text>
            </Pressable>

            <Pressable
              onPress={handleMigrateLocalData}
              disabled={isMigrating || isExporting}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: c.bg,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: "center",
                opacity: (isMigrating || isExporting) ? 0.5 : 1,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 12 }}>Sync to Cloud</Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 11, color: c.muted, marginTop: 8 }}>
            Note: Imported data is for analytics only and won't affect your ranking.
          </Text>
        </View>

        {/* Dev Menu Link */}
        {__DEV__ && (
          <Link href="/dev-menu" asChild>
            <Pressable
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 14,
                backgroundColor: c.card,
                padding: 12,
              }}
            >
              <Text style={{ fontWeight: "900", fontSize: 16, color: c.text }}>Dev Menu</Text>
              <Text style={{ opacity: 0.75, color: c.muted }}>Quick access to all screens for testing.</Text>
            </Pressable>
          </Link>
        )}

        {/* Personality Selection */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Pressable onPress={() => setShowPersonalityModal(true)}>
            <Row
              title="Gym Buddy Personality"
              subtitle="Choose your workout motivation style"
              right={
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 24 }}>{currentPersonality.emoji}</Text>
                  <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: c.bg, borderWidth: 1, borderColor: c.border }}>
                    <Text style={{ fontWeight: "900", fontSize: 12 }}>{currentPersonality.name}</Text>
                  </View>
                </View>
              }
            />
          </Pressable>
        </View>

        {/* Privacy & Safety Section */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Privacy & Safety"
            subtitle="Manage blocked users and privacy settings"
          />

          {/* Private Account Toggle */}
          <View style={{ marginTop: 12, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontWeight: "700", fontSize: 14 }}>Private Account</Text>
                <Text style={{ opacity: 0.75, fontSize: 12 }}>
                  Only friends can see your posts and activity
                </Text>
              </View>
              <Toggle
                value={settings.privacy.privateAccount}
                onChange={(v) => updateSettings({ privacy: { ...settings.privacy, privateAccount: v } })}
              />
            </View>
          </View>

          {/* Blocked Users */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700", fontSize: 14 }}>
              Blocked Users ({blockedUsers.length})
            </Text>

            {blockedUsers.length === 0 ? (
              <Text style={{ opacity: 0.75, fontSize: 13 }}>
                No blocked users
              </Text>
            ) : (
              <View style={{ gap: 8 }}>
                {blockedUsers.map((edge) => {
                  const profile = blockedProfiles[edge.otherUserId];
                  const displayName = profile?.displayName ?? edge.otherUserId;

                  return (
                    <View
                      key={edge.otherUserId}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 10,
                        borderRadius: 10,
                        backgroundColor: c.bg,
                        borderWidth: 1,
                        borderColor: c.border,
                      }}
                    >
                      <Text style={{ fontWeight: "700", fontSize: 14 }}>
                        {displayName}
                      </Text>
                      <Pressable
                        onPress={() => {
                          if (!user?.id) return;
                          Alert.alert(
                            "Unblock User",
                            `Are you sure you want to unblock ${displayName}?`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Unblock",
                                onPress: () => unblockUser(user.id, edge.otherUserId),
                              },
                            ]
                          );
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: c.card,
                          borderWidth: 1,
                          borderColor: c.border,
                        }}
                      >
                        <Text style={{ fontWeight: "700", fontSize: 12 }}>Unblock</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Email Verification Status */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <View>
              <Text style={{ fontWeight: "900", fontSize: 16 }}>Email Verification</Text>
              <Text style={{ opacity: 0.75, fontSize: 12 }}>
                {session?.user?.email || "No email"}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: isEmailVerified ? "#d1fae5" : "#fee2e2",
                borderWidth: 1,
                borderColor: isEmailVerified ? "#6ee7b7" : "#fca5a5",
              }}
            >
              <Text style={{ color: isEmailVerified ? "#065f46" : "#991b1b", fontWeight: "900", fontSize: 12 }}>
                {isEmailVerified ? "Verified" : "Not Verified"}
              </Text>
            </View>
          </View>

          {!isEmailVerified && (
            <>
              <Text style={{ opacity: 0.75, fontSize: 13, marginBottom: 8 }}>
                Verify your email to access all features and ensure account security.
              </Text>
              <Pressable
                onPress={handleResendVerification}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "900" }}>Resend Verification Email</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Account Section */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Sign Out"
            subtitle="Sign out of your account"
          />
          <Pressable
            onPress={handleSignOut}
            disabled={authLoading}
            style={{
              marginTop: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: "#fee2e2",
              borderWidth: 1,
              borderColor: "#fca5a5",
              alignItems: "center",
              opacity: authLoading ? 0.5 : 1,
            }}
          >
            <Text style={{ color: "#991b1b", fontWeight: "900", fontSize: 14 }}>
              {authLoading ? "Signing Out..." : "Sign Out"}
            </Text>
          </Pressable>
        </View>

        {/* Delete Account Section */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Delete Account"
            subtitle="Permanently delete your account and all data"
          />
          <Pressable
            onPress={openDeleteModal}
            style={{
              marginTop: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: "#fee2e2",
              borderWidth: 1,
              borderColor: "#fca5a5",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#991b1b", fontWeight: "900", fontSize: 14 }}>
              Delete Account
            </Text>
          </Pressable>
        </View>

                </ScrollView>
      </View>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
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
              Delete Account?
            </Text>

            <Text style={{ color: c.muted, textAlign: "center", lineHeight: 20 }}>
              This action cannot be undone. All your data including workouts, routines, and settings will be permanently deleted.
            </Text>

            <Text style={{ color: c.text, fontWeight: "700", fontSize: 14 }}>
              Enter your password to confirm:
            </Text>

            <TextInput
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Password"
              placeholderTextColor={c.muted}
              secureTextEntry
              style={{
                backgroundColor: c.bg,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 12,
                padding: 16,
                color: c.text,
                fontSize: 16,
              }}
            />

            {deleteError && (
              <Text style={{ color: "#991b1b", fontSize: 12, textAlign: "center" }}>
                {deleteError}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
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
                onPress={handleDeleteAccount}
                disabled={authLoading || !deletePassword}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: "#991b1b",
                  alignItems: "center",
                  opacity: (authLoading || !deletePassword) ? 0.5 : 1,
                }}
              >
                {authLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "900" }}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Migration Progress Modal */}
      <Modal
        visible={showMigrationModal}
        transparent
        animationType="fade"
        onRequestClose={closeMigrationModal}
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
              {migrationResult ? "Migration Complete!" : "Data Migration"}
            </Text>

            {migrationProgress && !migrationResult ? (
              <>
                <Text style={{ color: c.muted, textAlign: "center" }}>
                  {migrationProgress.message}
                </Text>

                {/* Progress Bar */}
                <View
                  style={{
                    height: 8,
                    backgroundColor: c.bg,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${migrationProgress.current}%`,
                      backgroundColor: "#4ECDC4",
                    }}
                  />
                </View>

                {isMigrating && (
                  <ActivityIndicator size="large" color={c.text} />
                )}
              </>
            ) : migrationResult ? (
              <>
                <Text style={{ color: c.muted, textAlign: "center" }}>
                  Successfully migrated your data!
                </Text>

                <View
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: c.bg,
                    gap: 8,
                  }}
                >
                  <Text style={{ color: c.text, fontWeight: "700", textAlign: "center" }}>
                    {migrationResult.workouts} {migrationResult.workouts === 1 ? "workout" : "workouts"}
                  </Text>
                  <Text style={{ color: c.text, fontWeight: "700", textAlign: "center" }}>
                    {migrationResult.routines} {migrationResult.routines === 1 ? "routine" : "routines"}
                  </Text>
                </View>

                <Pressable
                  onPress={closeMigrationModal}
                  style={{
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: "#4ECDC4",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#000", fontWeight: "900" }}>Done</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Email Export Modal */}
      <Modal
        visible={showEmailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmailModal(false)}
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
              Email Your Workout Data
            </Text>

            <Text style={{ color: c.muted, textAlign: "center", lineHeight: 20 }}>
              Enter your email address to receive your workout data as a CSV file attachment.
            </Text>

            <TextInput
              value={exportEmail}
              onChangeText={setExportEmail}
              placeholder="Email address"
              placeholderTextColor={c.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: c.bg,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 12,
                padding: 16,
                color: c.text,
                fontSize: 16,
              }}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => setShowEmailModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
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
                onPress={handleSendEmailExport}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: "#4ECDC4",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#000", fontWeight: "900" }}>Send Email</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Weight Entry Modal */}
      <WeightEntryModal
        visible={showWeightModal}
        onClose={handleCloseWeightModal}
        mode={weightModalMode}
        initialWeightKg={settings.bodyweight}
      />

      {/* Location Entry Modal */}
      <LocationEntryModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </ProtectedRoute>
  );
}
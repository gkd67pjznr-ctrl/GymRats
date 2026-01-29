import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator, TextInput, Modal, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useThemeColors } from "../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores
import { useSettings, updateSettings } from "../src/lib/stores";
import { useAuthStore, useIsEmailVerified, useUser } from "../src/lib/stores/authStore";
import { ProtectedRoute } from "../src/ui/components/ProtectedRoute";
import { migrateLocalToCloud, importFromCSV } from "../src/lib/migration/dataMigrator";
import type { MigrationProgress } from "../src/lib/migration/dataMigrator";
// Personality system
import { usePersonality, useAllPersonalities, setPersonality } from "../src/lib/stores/personalityStore";
import type { Personality } from "../src/lib/stores/personalityStore";

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

  // Personality state
  const currentPersonality = usePersonality();
  const allPersonalities = useAllPersonalities();
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Migration state
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [migrationResult, setMigrationResult] = useState<{ workouts: number; routines: number } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

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
    } catch (err) {
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
    } catch (err) {
      Alert.alert("Error", "Failed to pick CSV file");
    }
  }

  function closeMigrationModal() {
    setShowMigrationModal(false);
    setMigrationProgress(null);
    setMigrationResult(null);
  }

  return (
    <ProtectedRoute>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 22, fontWeight: "900", color: c.text }}>Settings</Text>

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

        {/* Data Migration Section */}
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12 }}>
          <Row
            title="Data Migration"
            subtitle="Import data from other apps or migrate local data to cloud"
          />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={handleMigrateLocalData}
              disabled={isMigrating}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: c.bg,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: "center",
                opacity: isMigrating ? 0.5 : 1,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 12 }}>Migrate Local Data</Text>
            </Pressable>

            <Pressable
              onPress={handleImportCSV}
              disabled={isMigrating}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: c.bg,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: "center",
                opacity: isMigrating ? 0.5 : 1,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 12 }}>Import CSV</Text>
            </Pressable>
          </View>
        </View>

        <Text style={{ color: c.muted }}>
          Next: we'll wire these settings into LiveWorkout (rest timer default + unit display).
        </Text>
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

      {/* Personality Selection Modal */}
      <Modal
        visible={showPersonalityModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPersonalityModal(false)}
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
              maxWidth: 420,
              gap: 16,
              maxHeight: "80%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: c.text, fontSize: 20, fontWeight: "900" }}>
                Choose Your Gym Buddy
              </Text>
              <Pressable onPress={() => setShowPersonalityModal(false)}>
                <Text style={{ color: c.muted, fontSize: 24, fontWeight: "900" }}>✕</Text>
              </Pressable>
            </View>

            <Text style={{ color: c.muted, lineHeight: 18 }}>
              Your gym buddy provides encouragement and celebrates your PRs. Pick a personality that matches your vibe!
            </Text>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12 }}>
                {allPersonalities.map((personality) => (
                  <Pressable
                    key={personality.id}
                    onPress={() => {
                      setPersonality(personality.id);
                      setShowPersonalityModal(false);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      padding: 14,
                      borderRadius: 12,
                      backgroundColor: currentPersonality.id === personality.id ? `${personality.color}20` : c.bg,
                      borderWidth: 2,
                      borderColor: currentPersonality.id === personality.id ? personality.color : c.border,
                    }}
                  >
                    <Text style={{ fontSize: 32 }}>{personality.emoji}</Text>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
                        {personality.name}
                      </Text>
                      <Text style={{ color: c.muted, fontSize: 13, lineHeight: 16 }}>
                        {personality.description}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                        {personality.tone.map((t) => (
                          <View
                            key={t}
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              backgroundColor: currentPersonality.id === personality.id ? `${personality.color}30` : c.card,
                              borderWidth: 1,
                              borderColor: currentPersonality.id === personality.id ? personality.color : c.border,
                            }}
                          >
                            <Text style={{ color: c.text, fontSize: 11, fontWeight: "700", textTransform: "capitalize" }}>
                              {t}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    {currentPersonality.id === personality.id && (
                      <Text style={{ color: personality.color, fontSize: 20, fontWeight: "900" }}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Pressable
              onPress={() => setShowPersonalityModal(false)}
              style={{
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
          </View>
        </View>
      </Modal>
    </ProtectedRoute>
  );
}
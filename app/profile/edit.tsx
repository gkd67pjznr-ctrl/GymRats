// app/profile/edit.tsx
// Profile editing screen with display name and avatar management
import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, Image, ScrollView } from "react-native";
import { useRouter, Link } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/ui/theme";
import { useUser, useAuth } from "@/src/lib/stores";
import { KeyboardAwareScrollView } from "@/src/ui/components/KeyboardAwareScrollView";
import { ProtectedRoute } from "@/src/ui/components/ProtectedRoute";
import { ScreenHeader } from "@/src/ui/components/ScreenHeader";
import { TAB_BAR_HEIGHT } from "@/src/ui/components/PersistentTabBar";
import { generateAvatarUrl } from "@/src/lib/supabase/storage";

/**
 * Validation error type
 */
interface ValidationError {
  displayName?: string;
}

/**
 * Profile edit screen component
 */
export default function ProfileEditScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const authStore = useAuth();

  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [validationError, setValidationError] = useState<ValidationError>({});
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Initialize display name from user profile
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);

  /**
   * Validate form inputs
   */
  function validateForm(): boolean {
    const errors: ValidationError = {};

    // Display name validation
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      errors.displayName = "Display name is required";
    } else if (trimmedName.length > 50) {
      errors.displayName = "Display name must be 50 characters or less";
    }

    setValidationError(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Handle save button press
   */
  async function handleSave() {
    // Clear previous validation errors
    setValidationError({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Update display name if changed
      const trimmedName = displayName.trim();
      if (trimmedName !== user?.displayName) {
        const result = await authStore.updateDisplayName(trimmedName);
        if (!result.success) {
          setValidationError({ displayName: result.error });
          setIsSaving(false);
          return;
        }
      }

      // Success
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Handle avatar image selection
   */
  async function handlePickAvatar() {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library to change your avatar."
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUploading(true);
        const fileUri = result.assets[0].uri;

        // Upload avatar
        const uploadResult = await authStore.updateAvatar(fileUri);

        if (!uploadResult.success) {
          Alert.alert("Upload Failed", uploadResult.error || "Failed to upload avatar");
        } else {
          Alert.alert("Success", "Avatar updated successfully");
        }
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setAvatarUploading(false);
    }
  }

  /**
   * Handle remove avatar
   */
  async function handleRemoveAvatar() {
    Alert.alert(
      "Remove Avatar",
      "Are you sure you want to remove your custom avatar? A default avatar will be generated based on your name.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setAvatarUploading(true);
            const result = await authStore.removeAvatar();
            setAvatarUploading(false);

            if (!result.success) {
              Alert.alert("Error", result.error || "Failed to remove avatar");
            }
          },
        },
      ]
    );
  }

  /**
   * Get input border color based on validation state
   */
  function getInputBorderColor(field: keyof ValidationError): string {
    if (validationError[field]) {
      return c.danger;
    }
    return c.border;
  }

  // Generate avatar URL for display
  const avatarUrl = user?.avatarUrl ?? generateAvatarUrl(user?.id ?? "", user?.displayName ?? undefined);

  return (
    <ProtectedRoute>
      <ScreenHeader
        title="Edit Profile"
        leftAction={
          <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ color: c.text, fontWeight: "700" }}>Cancel</Text>
          </Pressable>
        }
        rightAction={
          <Pressable onPress={handleSave} disabled={isSaving} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ color: isSaving ? c.muted : "#4ECDC4", fontWeight: "700" }}>
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        }
      />

      <KeyboardAwareScrollView
        contentContainerStyle={{
          padding: 24,
          gap: 24,
          paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20,
        }}
      >
        {/* Avatar Section */}
        <View style={{ gap: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: c.muted, alignSelf: "flex-start" }}>
            Profile Picture
          </Text>

          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: avatarUrl }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: c.card,
                borderWidth: 2,
                borderColor: c.border,
              }}
            />
            {avatarUploading && (
              <View
                style={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={handlePickAvatar}
              disabled={avatarUploading}
              style={({ pressed }) => ({
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.bg,
                opacity: pressed || avatarUploading ? 0.6 : 1,
              })}
            >
              <Text style={{ color: c.text, fontWeight: "700" }}>Change Photo</Text>
            </Pressable>

            {user?.avatarUrl && (
              <Pressable
                onPress={handleRemoveAvatar}
                disabled={avatarUploading}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: c.danger,
                  backgroundColor: c.bg,
                  opacity: pressed || avatarUploading ? 0.6 : 1,
                })}
              >
                <Text style={{ color: c.danger, fontWeight: "700" }}>Remove</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: c.border }} />

        {/* Display Name Section */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: c.text }}>
            Display Name
          </Text>
          <TextInput
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              // Clear error for this field when user starts typing
              if (validationError.displayName) {
                setValidationError((prev) => ({ ...prev, displayName: undefined }));
              }
            }}
            placeholder="Enter your display name"
            placeholderTextColor={c.muted}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
            style={{
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: getInputBorderColor("displayName"),
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: c.text,
            }}
          />
          {validationError.displayName && (
            <Text style={{ fontSize: 12, color: c.danger, marginLeft: 4 }}>
              {validationError.displayName}
            </Text>
          )}
          <Text style={{ fontSize: 12, color: c.muted }}>
            {displayName.length}/50 characters
          </Text>
        </View>

        {/* Email Display (read-only) */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: c.text }}>
            Email
          </Text>
          <View
            style={{
              backgroundColor: c.bg,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 16, color: c.muted }}>{user?.email}</Text>
          </View>
        </View>

        {/* Info Text */}
        <View
          style={{
            backgroundColor: `${c.primary}15`,
            borderWidth: 1,
            borderColor: c.primary,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ fontSize: 13, color: c.primary }}>
            Your display name will be visible to other users on the social feed and friends list.
          </Text>
        </View>

        {/* Theme Selection Link */}
        <Link href="/profile/themes" asChild>
          <Pressable
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 14,
              padding: 14,
              backgroundColor: c.card,
              gap: 6,
            }}
          >
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>App Themes</Text>
            <Text style={{ color: c.muted, lineHeight: 18 }}>
              Customize the app's appearance with different color themes and visual styles
            </Text>
          </Pressable>
        </Link>
      </KeyboardAwareScrollView>
    </ProtectedRoute>
  );
}

// app/auth/reset-password.tsx
// Reset password screen - enter new password after clicking email link

import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View, ActivityIndicator, TextInput } from "react-native";
import { useAuthStore } from "../../src/lib/stores/authStore";
import { useThemeColors } from "../../src/ui/theme";
import { KeyboardAwareScrollView } from "../../src/ui/components/KeyboardAwareScrollView";

type FormState = "idle" | "loading" | "success" | "error";

export default function ResetPasswordScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { updatePassword, loading, error, clearError } = useAuthStore();
  const params = useLocalSearchParams<{ accessToken?: string; refreshToken?: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [formError, setFormError] = useState<string | null>(null);

  // Check if user came from valid reset flow
  // In production, you'd validate the access token from the URL
  const hasValidToken = params.accessToken || params.refreshToken;

  function validatePassword(): string | null {
    if (!password) {
      return "Password is required";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  }

  async function handleSubmit() {
    // Clear previous errors
    clearError();
    setFormError(null);

    // Validate password
    const validationError = validatePassword();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormState("loading");

    const result = await updatePassword(password);

    if (result.success) {
      setFormState("success");
    } else {
      setFormState("error");
      setFormError(result.error || "Failed to update password");
    }
  }

  // Success state
  if (formState === "success") {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <View style={{ maxWidth: 400, width: "100%", gap: 20, alignItems: "center" }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: c.card,
              borderWidth: 2,
              borderColor: c.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 40 }}>✅</Text>
          </View>

          <Text style={{ color: c.text, fontSize: 24, fontWeight: "900", textAlign: "center" }}>
            Password Updated
          </Text>

          <Text style={{ color: c.muted, fontSize: 16, textAlign: "center", lineHeight: 24 }}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Text>

          <Pressable
            onPress={() => router.replace("/auth/login")}
            style={{
              marginTop: 20,
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 12,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 24, justifyContent: "center" }}
    >
      <View style={{ maxWidth: 400, width: "100%", alignSelf: "center", gap: 24 }}>
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.text, fontSize: 32, fontWeight: "900" }}>
            Set New Password
          </Text>
          <Text style={{ color: c.muted, fontSize: 16, lineHeight: 24 }}>
            Enter your new password below. Make sure it's at least 8 characters long.
          </Text>
        </View>

        {/* Error display */}
        {(formError || error) && (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#fee2e2",
              borderWidth: 1,
              borderColor: "#fca5a5",
            }}
          >
            <Text style={{ color: "#991b1b", fontSize: 14, fontWeight: "700" }}>
              {formError || error}
            </Text>
          </View>
        )}

        {/* Password input */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.text, fontSize: 14, fontWeight: "700" }}>New Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            placeholderTextColor={c.muted}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            style={{
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: c.text,
              fontSize: 16,
            }}
          />

          {/* Password strength indicator */}
          {password.length > 0 && (
            <View style={{ gap: 4 }}>
              <View
                style={{
                  height: 4,
                  backgroundColor: c.border,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (password.length / 8) * 100)}%`,
                    backgroundColor: password.length >= 8 ? "#10b981" : password.length >= 5 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </View>
              <Text style={{ color: c.muted, fontSize: 12 }}>
                {password.length >= 8 ? "Strong password" : password.length >= 5 ? "Getting there..." : "Too short"}
              </Text>
            </View>
          )}
        </View>

        {/* Confirm password input */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.text, fontSize: 14, fontWeight: "700" }}>Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={c.muted}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            style={{
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: c.text,
              fontSize: 16,
            }}
          />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <Text style={{ color: "#ef4444", fontSize: 12 }}>Passwords do not match</Text>
          )}
        </View>

        {/* Password requirements */}
        <View style={{ gap: 8, padding: 12, backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border }}>
          <Text style={{ color: c.text, fontSize: 12, fontWeight: "700" }}>Password requirements:</Text>
          <Text style={{ color: password.length >= 8 ? "#10b981" : c.muted, fontSize: 12 }}>
            {password.length >= 8 ? "✓" : "•"} At least 8 characters
          </Text>
          <Text style={{ color: password === confirmPassword && password.length > 0 ? "#10b981" : c.muted, fontSize: 12 }}>
            {password === confirmPassword && password.length > 0 ? "✓" : "•"} Passwords match
          </Text>
        </View>

        {/* Submit button */}
        <Pressable
          onPress={handleSubmit}
          disabled={formState === "loading" || loading}
          style={{
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            opacity: (formState === "loading" || loading) ? 0.5 : 1,
          }}
        >
          {formState === "loading" || loading ? (
            <ActivityIndicator color={c.text} />
          ) : (
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
              Update Password
            </Text>
          )}
        </Pressable>

        {/* Back to login */}
        <Pressable
          onPress={() => router.back()}
          style={{
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: c.muted, fontWeight: "700" }}>Cancel</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

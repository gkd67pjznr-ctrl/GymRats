// app/auth/forgot-password.tsx
// Forgot password screen - send reset email

import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View, ActivityIndicator, TextInput } from "react-native";
import { useAuthStore } from "../../src/lib/stores/authStore";
import { useThemeColors } from "../../src/ui/theme";
import { KeyboardAwareScrollView } from "../../src/ui/components/KeyboardAwareScrollView";

type FormState = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { resetPassword, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit() {
    // Clear previous errors
    clearError();
    setFormError(null);

    // Validate email
    if (!email.trim()) {
      setFormError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    setFormState("loading");

    const result = await resetPassword(email.trim());

    if (result.success) {
      setFormState("success");
    } else {
      setFormState("error");
      setFormError(result.error || "Failed to send reset email");
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
            <Text style={{ fontSize: 40 }}>✉️</Text>
          </View>

          <Text style={{ color: c.text, fontSize: 24, fontWeight: "900", textAlign: "center" }}>
            Check your email
          </Text>

          <Text style={{ color: c.muted, fontSize: 16, textAlign: "center", lineHeight: 24 }}>
            We've sent a password reset link to{"\n"}
            <Text style={{ color: c.text, fontWeight: "700" }}>{email}</Text>
          </Text>

          <Text style={{ color: c.muted, fontSize: 14, textAlign: "center", lineHeight: 20 }}>
            The link will expire in 24 hours. If you don't see it, check your spam folder.
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
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Back to Login</Text>
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
            Forgot Password?
          </Text>
          <Text style={{ color: c.muted, fontSize: 16, lineHeight: 24 }}>
            Enter your email address and we'll send you a link to reset your password.
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

        {/* Email input */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.text, fontSize: 14, fontWeight: "700" }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={c.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
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
          <Text
            style={{
              color: c.muted,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            We'll send a reset link to this address
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
              Send Reset Link
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
          <Text style={{ color: c.muted, fontWeight: "700" }}>Back to Login</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

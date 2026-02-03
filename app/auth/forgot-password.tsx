// app/auth/forgot-password.tsx
// Forgot password screen - send reset email

import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, View, ActivityIndicator, TextInput } from "react-native";
import { useAuthStore } from "../../src/lib/stores/authStore";
import { Surface, Text, Button, Card, surface, text, border, corners, space } from "@/src/design";
import { KeyboardAwareScrollView } from "../../src/ui/components/KeyboardAwareScrollView";

type FormState = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordScreen() {
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
      <Surface elevation="base" style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: space.sectionMd }}>
        <View style={{ maxWidth: 400, width: "100%", gap: 20, alignItems: "center" }}>
          <Card
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 40 }}>✉️</Text>
          </Card>

          <Text variant="h2" align="center">Check your email</Text>

          <Text variant="body" color="muted" align="center" style={{ lineHeight: 24 }}>
            We've sent a password reset link to{"\n"}
            <Text variant="body" bold>{email}</Text>
          </Text>

          <Text variant="bodySmall" color="muted" align="center" style={{ lineHeight: 20 }}>
            The link will expire in 24 hours. If you don't see it, check your spam folder.
          </Text>

          <Button
            label="Back to Login"
            onPress={() => router.replace("/auth/login")}
            variant="secondary"
            style={{ marginTop: 20, width: "100%" }}
          />
        </View>
      </Surface>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: surface.base }}
      contentContainerStyle={{ padding: space.sectionMd, justifyContent: "center" }}
    >
      <View style={{ maxWidth: 400, width: "100%", alignSelf: "center", gap: space.sectionMd }}>
        {/* Header */}
        <View style={{ gap: space.componentSm }}>
          <Text variant="h1">Forgot Password?</Text>
          <Text variant="body" color="secondary" style={{ lineHeight: 24 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        {/* Error display */}
        {(formError || error) && (
          <Surface
            elevation="raised"
            radius="input"
            style={{
              padding: space.componentMd,
              backgroundColor: `${text.danger}15`,
              borderWidth: 1,
              borderColor: text.danger,
            }}
          >
            <Text variant="bodySmall" color="danger" bold>
              {formError || error}
            </Text>
          </Surface>
        )}

        {/* Email input */}
        <View style={{ gap: space.componentSm }}>
          <Text variant="label">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={text.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            style={{
              backgroundColor: surface.raised,
              borderWidth: 1,
              borderColor: border.default,
              borderRadius: corners.input,
              paddingHorizontal: space.componentLg,
              paddingVertical: 14,
              color: text.primary,
              fontSize: 16,
            }}
          />
          <Text variant="caption" color="muted" style={{ marginTop: 4 }}>
            We'll send a reset link to this address
          </Text>
        </View>

        {/* Submit button */}
        <Button
          label={formState === "loading" || loading ? "Sending..." : "Send Reset Link"}
          onPress={handleSubmit}
          disabled={formState === "loading" || loading}
          variant="primary"
        />

        {/* Back to login */}
        <Pressable
          onPress={() => router.back()}
          style={{
            paddingVertical: space.componentMd,
            alignItems: "center",
          }}
        >
          <Text variant="label" color="muted">Back to Login</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

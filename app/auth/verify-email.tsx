// app/auth/verify-email.tsx
// Email verification pending screen - shown after signup

import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../src/lib/stores/authStore";
import { useThemeColors } from "../../src/ui/theme";

export default function VerifyEmailScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { session, resendVerificationEmail, checkEmailVerification } = useAuthStore();
  const params = useLocalSearchParams<{ email?: string }>();

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const email = params.email || session?.user?.email || "";

  // Auto-check verification status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsChecking(true);
      try {
        const isVerified = await checkEmailVerification();
        if (isVerified) {
          clearInterval(interval);
          router.replace("/(tabs)");
        }
      } catch (err) {
        console.error("Error checking email verification:", err);
      } finally {
        setIsChecking(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkEmailVerification, router]);

  async function handleResend() {
    setResendError(null);
    setResendSuccess(false);
    setIsResending(true);

    const result = await resendVerificationEmail();

    setIsResending(false);

    if (result.success) {
      setResendSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } else {
      setResendError(result.error || "Failed to resend verification email");
    }
  }

  async function handleContinueAnyway() {
    router.replace("/(tabs)");
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <View style={{ maxWidth: 400, width: "100%", gap: 24, alignItems: "center" }}>
        {/* Email Icon */}
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: c.card,
            borderWidth: 2,
            borderColor: c.border,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 48 }}>✉️</Text>
        </View>

        {/* Title */}
        <Text style={{ color: c.text, fontSize: 28, fontWeight: "900", textAlign: "center" }}>
          Verify Your Email
        </Text>

        {/* Message */}
        <Text style={{ color: c.muted, fontSize: 16, textAlign: "center", lineHeight: 24 }}>
          We've sent a verification link to{"\n"}
          <Text style={{ color: c.text, fontWeight: "700" }}>{email}</Text>
        </Text>

        <Text style={{ color: c.muted, fontSize: 14, textAlign: "center", lineHeight: 20 }}>
          Check your inbox and click the link to verify your account. If you don't see it, check your spam folder.
        </Text>

        {/* Auto-check indicator */}
        {isChecking && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="small" color={c.text} />
            <Text style={{ color: c.muted, fontSize: 12 }}>Checking verification status...</Text>
          </View>
        )}

        {/* Success message */}
        {resendSuccess && (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#d1fae5",
              borderWidth: 1,
              borderColor: "#6ee7b7",
            }}
          >
            <Text style={{ color: "#065f46", fontSize: 14, fontWeight: "700", textAlign: "center" }}>
              Verification email sent! Check your inbox.
            </Text>
          </View>
        )}

        {/* Error message */}
        {resendError && (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#fee2e2",
              borderWidth: 1,
              borderColor: "#fca5a5",
            }}
          >
            <Text style={{ color: "#991b1b", fontSize: 14, fontWeight: "700", textAlign: "center" }}>
              {resendError}
            </Text>
          </View>
        )}

        {/* Resend button */}
        <Pressable
          onPress={handleResend}
          disabled={isResending}
          style={{
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            width: "100%",
            opacity: isResending ? 0.5 : 1,
          }}
        >
          {isResending ? (
            <ActivityIndicator color={c.text} />
          ) : (
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
              Resend Verification Email
            </Text>
          )}
        </Pressable>

        {/* Continue anyway button */}
        <Pressable
          onPress={handleContinueAnyway}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            alignItems: "center",
          }}
        >
          <Text style={{ color: c.muted, fontWeight: "700", fontSize: 14 }}>
            Continue Anyway
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

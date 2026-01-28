// app/auth/login.tsx
// Login screen with email, password, and OAuth (Google & Apple)
import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/src/ui/theme";
import { useAuth, useAuthLoading, useAuthError, useUser } from "@/src/lib/stores";
import { OAuthButton } from "@/src/ui/components/OAuthButton";
import { KeyboardAwareScrollView } from "@/src/ui/components/KeyboardAwareScrollView";
import { useGoogleAuth } from "@/src/lib/auth/google";
import { useAppleAuth } from "@/src/lib/auth/apple";
import { getOAuthErrorMessage, type OAuthError } from "@/src/lib/auth/oauth";

/**
 * Email validation regex
 * Matches: local-part@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validation error type
 */
interface ValidationError {
  email?: string;
  password?: string;
}

/**
 * Login screen component
 */
export default function LoginScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const authStore = useAuth();
  const user = useUser();
  const loading = useAuthLoading();
  const authError = useAuthError();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<ValidationError>({});
  const [showPassword, setShowPassword] = useState(false);

  // OAuth loading states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // OAuth handlers
  const { signInWithGoogle } = useGoogleAuth({
    onSuccess: () => {
      setIsGoogleLoading(false);
      // Note: Navigation is handled by auth state listener
      // The session will be established when the deep link callback is processed
    },
    onError: (error: OAuthError) => {
      setIsGoogleLoading(false);
      Alert.alert("Google Sign-In Error", getOAuthErrorMessage(error));
    },
  });

  // Watch for auth state changes to navigate after successful OAuth
  useEffect(() => {
    if (user && authStore.session && isGoogleLoading) {
      // OAuth was successful and session is now active
      setIsGoogleLoading(false);
      router.replace("/(tabs)");
    }
  }, [user, authStore.session]);

  const { signInWithApple, isAvailable: isAppleAvailable } = useAppleAuth({
    onSuccess: () => {
      setIsAppleLoading(false);
      router.replace("/(tabs)");
    },
    onError: (error: OAuthError) => {
      setIsAppleLoading(false);
      Alert.alert("Apple Sign-In Error", getOAuthErrorMessage(error));
    },
  });

  /**
   * Validate form inputs
   */
  function validateForm(): boolean {
    const errors: ValidationError = {};

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    }

    setValidationError(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Handle login form submission
   */
  async function handleLogin() {
    // Clear previous validation errors
    setValidationError({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Attempt login
    const result = await authStore.signIn(email.trim().toLowerCase(), password);

    if (result.success) {
      // Navigate to home tabs
      router.replace("/(tabs)");
    }
    // If unsuccessful, the error is already set in the store
  }

  /**
   * Navigate to signup screen
   */
  function navigateToSignup() {
    router.push("/auth/signup");
  }

  /**
   * Handle forgot password
   */
  function handleForgotPassword() {
    router.push("/auth/forgot-password");
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

  /**
   * Handle Google Sign In
   */
  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    await signInWithGoogle();
  }

  /**
   * Handle Apple Sign In
   */
  async function handleAppleSignIn() {
    setIsAppleLoading(true);
    await signInWithApple();
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          padding: 24,
          gap: 24,
          paddingBottom: 40,
          justifyContent: "center",
          minHeight: "100%",
        }}
      >
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 32, fontWeight: "900", color: c.text }}>
            Welcome Back
          </Text>
          <Text style={{ fontSize: 16, color: c.muted }}>
            Sign in to continue your fitness journey
          </Text>
        </View>

        {/* OAuth Buttons */}
        <View style={{ gap: 12 }}>
          <OAuthButton
            provider="google"
            onPress={handleGoogleSignIn}
            isLoading={isGoogleLoading}
          />
          {isAppleAvailable && (
            <OAuthButton
              provider="apple"
              onPress={handleAppleSignIn}
              isLoading={isAppleLoading}
            />
          )}
        </View>

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
          <Text style={{ fontSize: 13, color: c.muted, fontWeight: "700" }}>
            or sign in with email
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
          {/* Email Input */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: c.text }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                // Clear error for this field when user starts typing
                if (validationError.email) {
                  setValidationError((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="your@email.com"
              placeholderTextColor={c.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              style={{
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: getInputBorderColor("email"),
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: c.text,
              }}
            />
            {validationError.email && (
              <Text style={{ fontSize: 12, color: c.danger, marginLeft: 4 }}>
                {validationError.email}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: c.text }}>
                Password
              </Text>
              <Pressable onPress={handleForgotPassword}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#4ECDC4" }}>
                  Forgot Password?
                </Text>
              </Pressable>
            </View>
            <View style={{ position: "relative" }}>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (validationError.password) {
                    setValidationError((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="Enter your password"
                placeholderTextColor={c.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                style={{
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: getInputBorderColor("password"),
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: c.text,
                  paddingRight: 60, // Space for show/hide button
                }}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  padding: 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: c.primary }}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
            {validationError.password && (
              <Text style={{ fontSize: 12, color: c.danger, marginLeft: 4 }}>
                {validationError.password}
              </Text>
            )}
          </View>

          {/* Auth Error Display */}
          {authError && (
            <View
              style={{
                backgroundColor: `${c.danger}15`,
                borderWidth: 1,
                borderColor: c.danger,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 14, color: c.danger }}>{authError}</Text>
            </View>
          )}

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: "#4ECDC4",
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              opacity: loading ? 0.6 : 1,
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#ffffff" }}>
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </Pressable>
        </View>

        {/* Dev Login Button (DEV ONLY) */}
        {__DEV__ && (
          <Pressable
            onPress={async () => {
              setIsGoogleLoading(true);
              const result = await authStore.devLogin();
              setIsGoogleLoading(false);
              if (result.success) {
                router.replace("/(tabs)");
              } else {
                Alert.alert("Dev Login Error", result.error || "Failed to login");
              }
            }}
            style={{
              backgroundColor: "#FF6B6B",
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#ffffff" }}>
              👨‍💻 Dev Login (Quick)
            </Text>
          </Pressable>
        )}

        {/* Signup Link */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
          <Text style={{ fontSize: 14, color: c.muted }}>Don't have an account?</Text>
          <Pressable onPress={navigateToSignup}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#4ECDC4" }}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

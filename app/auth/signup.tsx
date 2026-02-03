// app/auth/signup.tsx
// Signup screen with email, password, display name, and OAuth (Google & Apple)
import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/src/ui/theme";
import { useAuth, useAuthLoading, useAuthError } from "@/src/lib/stores";
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
 * Minimum password length
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validation error type
 */
interface ValidationError {
  email?: string;
  password?: string;
  displayName?: string;
}

/**
 * Signup screen component
 */
export default function SignupScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const authStore = useAuth();
  const loading = useAuthLoading();
  const authError = useAuthError();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [validationError, setValidationError] = useState<ValidationError>({});
  const [showPassword, setShowPassword] = useState(false);

  // OAuth loading states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // OAuth handlers
  const { signInWithGoogle } = useGoogleAuth({
    onSuccess: () => {
      setIsGoogleLoading(false);
      Alert.alert(
        "Welcome to GymRats!",
        "Your account has been created successfully.",
        [{ text: "Continue", onPress: () => router.replace("/(tabs)") }]
      );
    },
    onError: (error: OAuthError) => {
      setIsGoogleLoading(false);
      Alert.alert("Google Sign-In Error", getOAuthErrorMessage(error));
    },
  });

  const { signInWithApple, isAvailable: isAppleAvailable } = useAppleAuth({
    onSuccess: () => {
      setIsAppleLoading(false);
      Alert.alert(
        "Welcome to GymRats!",
        "Your account has been created successfully.",
        [{ text: "Continue", onPress: () => router.replace("/(tabs)") }]
      );
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

    // Display name validation
    if (!displayName.trim()) {
      errors.displayName = "Display name is required";
    } else if (displayName.trim().length < 2) {
      errors.displayName = "Display name must be at least 2 characters";
    } else if (displayName.trim().length > 30) {
      errors.displayName = "Display name must be less than 30 characters";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    setValidationError(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Handle signup form submission
   */
  async function handleSignup() {
    // Clear previous validation errors
    setValidationError({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Attempt signup
    const result = await authStore.signUp(
      email.trim().toLowerCase(),
      password,
      displayName.trim()
    );

    if (result.success) {
      // Show success message and navigate to home
      Alert.alert(
        "Welcome to GymRats!",
        "Your account has been created successfully.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    }
    // If unsuccessful, the error is already set in the store
  }

  /**
   * Navigate to login screen
   */
  function navigateToLogin() {
    router.push("/auth/login");
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
            Create Account
          </Text>
          <Text style={{ fontSize: 16, color: c.muted }}>
            Start your fitness journey today
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
            or sign up with email
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
          {/* Display Name Input */}
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
              placeholder="Enter your name"
              placeholderTextColor={c.muted}
              autoCapitalize="words"
              autoCorrect={false}
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
          </View>

          {/* Email Input */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: c.text }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
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
            <Text style={{ fontSize: 14, fontWeight: "700", color: c.text }}>
              Password
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (validationError.password) {
                    setValidationError((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="Enter a password"
                placeholderTextColor={c.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
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
            <Text style={{ fontSize: 12, color: c.muted, marginLeft: 4 }}>
              Must be at least {MIN_PASSWORD_LENGTH} characters
            </Text>
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

          {/* Signup Button */}
          <Pressable
            onPress={handleSignup}
            disabled={loading}
            style={{
              backgroundColor: "#4ECDC4",
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#ffffff" }}>
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </Pressable>
        </View>

        {/* Login Link */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
          <Text style={{ fontSize: 14, color: c.muted }}>Already have an account?</Text>
          <Pressable onPress={navigateToLogin}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#4ECDC4" }}>
              Sign In
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

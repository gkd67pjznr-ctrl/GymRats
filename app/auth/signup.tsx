// app/auth/signup.tsx
// Signup screen with email, password, display name, and OAuth (Google & Apple)
import { useState } from "react";
import { View, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Surface, Text, Button, surface, text, border, corners, space } from "@/src/design";
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
      return text.danger;
    }
    return border.default;
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
    <Surface elevation="base" style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          padding: space.sectionMd,
          gap: space.sectionMd,
          paddingBottom: 40,
          justifyContent: "center",
          minHeight: "100%",
        }}
      >
        {/* Header */}
        <View style={{ gap: space.componentSm }}>
          <Text variant="h1">Create Account</Text>
          <Text variant="body" color="secondary">
            Start your fitness journey today
          </Text>
        </View>

        {/* OAuth Buttons */}
        <View style={{ gap: space.componentMd }}>
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.componentMd }}>
          <View style={{ flex: 1, height: 1, backgroundColor: border.default }} />
          <Text variant="label" color="muted">or sign up with email</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: border.default }} />
        </View>

        {/* Form */}
        <View style={{ gap: space.componentLg }}>
          {/* Display Name Input */}
          <View style={{ gap: space.componentSm }}>
            <Text variant="label">Display Name</Text>
            <TextInput
              value={displayName}
              onChangeText={(inputText) => {
                setDisplayName(inputText);
                if (validationError.displayName) {
                  setValidationError((prev) => ({ ...prev, displayName: undefined }));
                }
              }}
              placeholder="Enter your name"
              placeholderTextColor={text.muted}
              autoCapitalize="words"
              autoCorrect={false}
              style={{
                backgroundColor: surface.raised,
                borderWidth: 1,
                borderColor: getInputBorderColor("displayName"),
                borderRadius: corners.input,
                padding: space.componentLg,
                fontSize: 16,
                color: text.primary,
              }}
            />
            {validationError.displayName && (
              <Text variant="caption" color="danger" style={{ marginLeft: 4 }}>
                {validationError.displayName}
              </Text>
            )}
          </View>

          {/* Email Input */}
          <View style={{ gap: space.componentSm }}>
            <Text variant="label">Email</Text>
            <TextInput
              value={email}
              onChangeText={(inputText) => {
                setEmail(inputText);
                if (validationError.email) {
                  setValidationError((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="your@email.com"
              placeholderTextColor={text.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              style={{
                backgroundColor: surface.raised,
                borderWidth: 1,
                borderColor: getInputBorderColor("email"),
                borderRadius: corners.input,
                padding: space.componentLg,
                fontSize: 16,
                color: text.primary,
              }}
            />
            {validationError.email && (
              <Text variant="caption" color="danger" style={{ marginLeft: 4 }}>
                {validationError.email}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View style={{ gap: space.componentSm }}>
            <Text variant="label">Password</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={password}
                onChangeText={(inputText) => {
                  setPassword(inputText);
                  if (validationError.password) {
                    setValidationError((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="Enter a password"
                placeholderTextColor={text.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                style={{
                  backgroundColor: surface.raised,
                  borderWidth: 1,
                  borderColor: getInputBorderColor("password"),
                  borderRadius: corners.input,
                  padding: space.componentLg,
                  fontSize: 16,
                  color: text.primary,
                  paddingRight: 60,
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
                <Text variant="label" color="accent">{showPassword ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
            {validationError.password && (
              <Text variant="caption" color="danger" style={{ marginLeft: 4 }}>
                {validationError.password}
              </Text>
            )}
            <Text variant="caption" color="muted" style={{ marginLeft: 4 }}>
              Must be at least {MIN_PASSWORD_LENGTH} characters
            </Text>
          </View>

          {/* Auth Error Display */}
          {authError && (
            <Surface
              elevation="raised"
              radius="input"
              style={{
                backgroundColor: `${text.danger}15`,
                borderWidth: 1,
                borderColor: text.danger,
                padding: space.componentMd,
              }}
            >
              <Text variant="bodySmall" color="danger">{authError}</Text>
            </Surface>
          )}

          {/* Signup Button */}
          <Button
            label={loading ? "Creating Account..." : "Create Account"}
            onPress={handleSignup}
            disabled={loading}
            variant="primary"
          />
        </View>

        {/* Login Link */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
          <Text variant="bodySmall" color="muted">Already have an account?</Text>
          <Pressable onPress={navigateToLogin}>
            <Text variant="bodySmall" color="accent" bold>Sign In</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </Surface>
  );
}

// app/auth/login.tsx
// Login screen with email, password, and OAuth (Google & Apple)
import { useState, useEffect, useRef } from "react";
import { View, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Surface, Text, Button, surface, text, border, corners, space } from "@/src/design";
import { useAuth, useAuthLoading, useAuthError, useUser } from "@/src/lib/stores";
import { useAuthStore } from "@/src/lib/stores/authStore";
import { OAuthButton } from "@/src/ui/components/OAuthButton";
import { KeyboardAwareScrollView } from "@/src/ui/components/KeyboardAwareScrollView";
import { useGoogleAuth } from "@/src/lib/auth/google";
import { useAppleAuth } from "@/src/lib/auth/apple";
import { getOAuthErrorMessage, type OAuthError } from "@/src/lib/auth/oauth";
import { supabase } from "@/src/lib/supabase/client";

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

  // Check for existing Supabase session on mount
  // This handles cases where OAuth completed via deep link but the auth store
  // hasn't synced yet (e.g., after Expo Go hot-reload during OAuth flow)
  const hasNavigatedRef = useRef(false);
  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled || hasNavigatedRef.current) return;

        if (data.session) {
          if (__DEV__) {
            console.log('[Login] Found existing session on mount, waiting for auth store...');
          }
          // Session exists in Supabase - wait for auth store to sync
          const checkAndNavigate = () => {
            if (cancelled || hasNavigatedRef.current) return;
            const { user: storeUser } = useAuthStore.getState();
            if (storeUser) {
              hasNavigatedRef.current = true;
              setIsGoogleLoading(false);
              setIsAppleLoading(false);
              router.replace("/(tabs)");
            }
          };

          // Check immediately, then retry after delays
          checkAndNavigate();
          if (!hasNavigatedRef.current) setTimeout(checkAndNavigate, 500);
          if (!hasNavigatedRef.current) setTimeout(checkAndNavigate, 1500);
          if (!hasNavigatedRef.current) setTimeout(checkAndNavigate, 3000);
        }
      } catch (err) {
        // Ignore - normal login flow will proceed
      }
    }

    checkExistingSession();
    return () => { cancelled = true; };
  }, []);

  // Watch for auth state changes to navigate after successful OAuth
  useEffect(() => {
    if (hasNavigatedRef.current) return;
    if (user && authStore.session) {
      // Session is active - navigate to home
      hasNavigatedRef.current = true;
      setIsGoogleLoading(false);
      setIsAppleLoading(false);
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
      return text.danger;
    }
    return border.default;
  }

  /**
   * Handle Google Sign In
   */
  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    console.log('[Login] Starting Google sign in...');
    try {
      const result = await signInWithGoogle();
      console.log('[Login] Google sign in result:', result);

      if (result.success) {
        console.log('[Login] OAuth reported success, checking session...');
        // OAuth succeeded - check for session and navigate
        const { data, error } = await supabase.auth.getSession();
        console.log('[Login] Session check:', { hasSession: !!data.session, error });

        if (data.session) {
          console.log('[Login] Session found, navigating...');
          hasNavigatedRef.current = true;
          setIsGoogleLoading(false);
          router.replace("/(tabs)");
          return;
        } else {
          console.log('[Login] No session found after OAuth success');
          Alert.alert(
            'Sign In Issue',
            'Authentication completed but session could not be established. Please try again.'
          );
        }
      } else {
        console.log('[Login] OAuth did not report success:', result.error);
        if (result.error?.type !== 'cancelled') {
          Alert.alert(
            'Sign In Failed',
            result.error?.message || 'An unexpected error occurred during sign in.'
          );
        }
      }
    } catch (err) {
      console.error('[Login] Google sign in error:', err);
    } finally {
      console.log('[Login] Google sign in flow complete');
      setIsGoogleLoading(false);
    }
  }

  /**
   * Handle Apple Sign In
   */
  async function handleAppleSignIn() {
    setIsAppleLoading(true);
    try {
      await signInWithApple();
    } finally {
      setIsAppleLoading(false);
    }
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
          <Text variant="h1">Welcome Back</Text>
          <Text variant="body" color="secondary">
            Sign in to continue your fitness journey
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
          <Text variant="label" color="muted">or sign in with email</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: border.default }} />
        </View>

        {/* Form */}
        <View style={{ gap: space.componentLg }}>
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
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="label">Password</Text>
              <Pressable onPress={handleForgotPassword}>
                <Text variant="caption" color="accent" bold>Forgot Password?</Text>
              </Pressable>
            </View>
            <View style={{ position: "relative" }}>
              <TextInput
                value={password}
                onChangeText={(inputText) => {
                  setPassword(inputText);
                  if (validationError.password) {
                    setValidationError((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="Enter your password"
                placeholderTextColor={text.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
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

          {/* Login Button */}
          <Button
            label={loading ? "Signing In..." : "Sign In"}
            onPress={handleLogin}
            disabled={loading}
            variant="primary"
            style={{ marginTop: space.componentSm }}
          />
        </View>

        {/* Dev Login Button (DEV ONLY) */}
        {__DEV__ && (
          <Button
            label="👨‍💻 Dev Login (Quick)"
            onPress={async () => {
              const result = await authStore.devLogin();
              if (result.success) {
                router.replace("/(tabs)");
              } else {
                Alert.alert("Dev Login Error", result.error || "Failed to login");
              }
            }}
            variant="danger"
          />
        )}

        {/* Signup Link */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
          <Text variant="bodySmall" color="muted">Don't have an account?</Text>
          <Pressable onPress={navigateToSignup}>
            <Text variant="bodySmall" color="accent" bold>Sign Up</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </Surface>
  );
}

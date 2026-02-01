import { View, Pressable } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { useColorScheme } from '@/hooks/use-color-scheme';
import ErrorBoundary from '@/src/ui/error-boundary';
import { setupAuthListener, useAuthStore } from '@/src/lib/stores';
import { supabase } from '@/src/lib/supabase/client';
import { useIsOnboarding } from '@/src/lib/stores/onboardingStore';
import { initializeSync, registerSyncStores } from '@/src/lib/sync';

// Initialize WebBrowser for auth sessions
WebBrowser.maybeCompleteAuthSession();

export const unstable_settings = {
  anchor: '(tabs)',
};

function HeaderBackButton({ tintColor }: { tintColor: string }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        marginRight: 16,
      })}
    >
      <Ionicons name="chevron-back" size={28} color={tintColor} />
    </Pressable>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isOnboarding = useIsOnboarding();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (isOnboarding) {
      router.replace('/onboarding');
    }
  }, [isOnboarding, router]);

  // Initialize auth state listener on mount
  useEffect(() => {
    const authCleanup = setupAuthListener();

    // Fallback: Ensure loading is set to false after 3 seconds
    const fallbackTimer = setTimeout(() => {
      const { loading } = useAuthStore.getState();
      if (loading) {
        useAuthStore.getState().setLoading(false);
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      authCleanup?.();
    };
  }, []);

  // Initialize sync system on mount
  useEffect(() => {
    const initSync = async () => {
      try {
        await initializeSync();
        registerSyncStores();
      } catch (err) {
        console.error('[RootLayout] Failed to initialize sync:', err);
      }
    };
    initSync();
  }, []);

  // Handle deep links for OAuth callbacks
  useEffect(() => {
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      if (url.includes('#') && url.includes('access_token')) {
        // Supabase OAuth callback - let Supabase handle it
        await supabase.auth.getSession();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ErrorBoundary name="root">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="live-workout" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="auth/forgot-password" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="auth/reset-password" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="auth/verify-email" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="hangout" options={{ headerShown: false }} />
          <Stack.Screen name="avatar" options={{ headerShown: false }} />
          <Stack.Screen name="live-workout-together" options={{ headerShown: false }} />
          <Stack.Screen name="live-workout-with-friends" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

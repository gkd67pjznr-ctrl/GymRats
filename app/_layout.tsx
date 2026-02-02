import { View, Pressable } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { useColorScheme } from '@/hooks/use-color-scheme';
import ErrorBoundary from '@/src/ui/error-boundary';
import { setupAuthListener, useAuthStore } from '@/src/lib/stores';
import { supabase } from '@/src/lib/supabase/client';
import { useIsOnboarding } from '@/src/lib/stores/onboardingStore';
import { initializeSync, registerSyncStores } from '@/src/lib/sync';
import { initializeVoiceManager } from '@/src/lib/voice/VoiceManager';
import { setupNotificationResponseListener } from '@/src/lib/notifications/notificationService';
import { useBuddyStore } from '@/src/lib/stores/buddyStore';
import { PersistentTabBar } from '@/src/ui/components/PersistentTabBar';

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
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isOnboarding) return;

    // Wait for next tick to ensure navigator is mounted
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        router.replace('/onboarding');
      }
    }, 0);

    return () => clearTimeout(timer);
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

  // Initialize voice manager for buddy voice lines
  useEffect(() => {
    const initVoice = async () => {
      try {
        await initializeVoiceManager();
      } catch (err) {
        console.error('[RootLayout] Failed to initialize voice manager:', err);
      }
    };
    initVoice();
  }, []);

  // Initialize IAP service for premium/legendary buddy purchases
  useEffect(() => {
    const initIAP = async () => {
      try {
        await useBuddyStore.getState().initializeIAP();
      } catch (err) {
        console.error('[RootLayout] Failed to initialize IAP service:', err);
      }
    };
    initIAP();
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

  // Set up global notification response handler
  useEffect(() => {
    const responseListener = setupNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      const screen = data?.screen;
      const type = data?.type;

      // Handle different notification types
      if (screen === 'live-workout') {
        // Already handled by OS bringing app to foreground
        // Optionally navigate to live workout if not already there
        if (router.canGoBack()) {
          router.replace('/live-workout');
        }
      } else if (screen === 'friends') {
        // Navigate to friends screen (friend requests)
        router.replace('/friends');
      } else if (screen === 'dm') {
        // Navigate to direct messages conversation
        const threadId = data?.threadId;
        if (threadId) {
          router.replace(`/dm/${threadId}`);
        } else {
          router.replace('/(tabs)/feed?tab=messages');
        }
      } else if (screen === 'competition') {
        // Navigate to competition detail (placeholder)
        router.replace('/(tabs)/feed');
      }
      // Add more screen handlers as needed
    });

    return () => {
      if (responseListener && typeof responseListener.remove === 'function') {
        responseListener.remove();
      }
    };
  }, [router]);

  return (
    <ErrorBoundary name="root">
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={{ flex: 1, position: 'relative' }}>
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
              <Stack.Screen name="hangout/index" options={{ headerShown: false }} />
              <Stack.Screen name="avatar/index" options={{ headerShown: false }} />
              <Stack.Screen name="live-workout-together" options={{ headerShown: false }} />
              <Stack.Screen name="live-workout-with-friends" options={{ headerShown: false }} />
            </Stack>
            <PersistentTabBar />
          </View>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

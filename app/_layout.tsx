import { View, Pressable, ActivityIndicator } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { WorkoutDrawer } from '@/src/ui/components/WorkoutDrawer';
import { GlobalTopBar } from '@/src/ui/components/GlobalTopBar';
import { useWorkoutDrawerStore } from '@/src/lib/stores/workoutDrawerStore';
import { ensureCurrentSession } from '@/src/lib/stores/currentSessionStore';
import { initializeSentry, setSentryUser, clearSentryUser } from '@/src/lib/monitoring/sentry';
import { useRouteProtection, useShowAuthenticatedUI } from '@/src/lib/hooks/useRouteProtection';

// Initialize Sentry FIRST (before any other code that might crash)
initializeSentry();

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

  // Route protection - handles auth redirects automatically
  const { isLoading, isHydrated } = useRouteProtection();

  // Determine if authenticated UI should be shown
  const showAuthenticatedUI = useShowAuthenticatedUI();

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
    if (!isHydrated) return; // Wait for auth to hydrate first

    // Wait for next tick to ensure navigator is mounted
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        router.replace('/onboarding');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isOnboarding, isHydrated, router]);

  // Initialize auth state listener on mount
  useEffect(() => {
    const authCleanup = setupAuthListener();

    // Set up Sentry user tracking
    const unsubscribeAuth = useAuthStore.subscribe((state) => {
      if (state.user) {
        setSentryUser(state.user.id, state.user.email || undefined);
      } else {
        clearSentryUser();
      }
    });

    // Fallback: Ensure loading is set to false after 3 seconds
    const fallbackTimer = setTimeout(() => {
      const { loading } = useAuthStore.getState();
      if (loading) {
        useAuthStore.getState().setLoading(false);
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribeAuth();
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
      if (__DEV__) {
        console.log('[RootLayout] Deep link received:', url);
      }

      // Handle Supabase OAuth callback with hash fragment tokens
      if (url.includes('#') && url.includes('access_token')) {
        try {
          const hashIndex = url.indexOf('#');
          const hashParams = new URLSearchParams(url.substring(hashIndex + 1));
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');

          if (access_token && refresh_token) {
            if (__DEV__) {
              console.log('[RootLayout] Setting session from deep link tokens');
            }
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        } catch (err) {
          console.error('[RootLayout] Failed to process OAuth callback:', err);
        }
        return;
      }

      // Handle PKCE flow with code query parameter
      if (url.includes('code=')) {
        try {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          if (code) {
            if (__DEV__) {
              console.log('[RootLayout] Exchanging PKCE code from deep link');
            }
            await supabase.auth.exchangeCodeForSession(code);
          }
        } catch (err) {
          console.error('[RootLayout] Failed to exchange code:', err);
        }
        return;
      }

      // Handle live-workout deep links - open drawer instead of navigating
      if (url.includes('/live-workout')) {
        const { hasActiveWorkout, startWorkout, openDrawer } = useWorkoutDrawerStore.getState();
        if (hasActiveWorkout) {
          openDrawer();
        } else {
          ensureCurrentSession({ selectedExerciseId: 'bench', exerciseBlocks: ['bench'] });
          startWorkout();
        }
        return;
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

      if (__DEV__) {
        console.log('[RootLayout] Notification tapped:', { screen, type, data });
      }

      // Handle different notification types
      if (screen === 'live-workout' || type === 'rest_timer') {
        // Open the workout drawer instead of navigating
        const { hasActiveWorkout, startWorkout, openDrawer } = useWorkoutDrawerStore.getState();
        if (hasActiveWorkout) {
          openDrawer();
        } else {
          // Create session and open drawer
          ensureCurrentSession({ selectedExerciseId: 'bench', exerciseBlocks: ['bench'] });
          startWorkout();
        }
      } else if (screen === 'friends' || type === 'friend_request') {
        // Navigate to friends screen (friend requests)
        router.push('/friends');
      } else if (screen === 'dm' || type === 'dm_received') {
        // Navigate to direct messages conversation
        const threadId = data?.threadId;
        if (threadId) {
          router.push(`/dm/${threadId}`);
        } else {
          router.push('/(tabs)/feed?tab=messages');
        }
      } else if (screen === 'post' || type === 'reaction' || type === 'comment') {
        // Navigate to feed (post detail screen would be ideal, but feed for now)
        // TODO: Add post detail route and navigate to specific post
        const postId = data?.postId;
        if (postId) {
          // For now, just go to feed - post detail route can be added later
          router.push('/(tabs)/feed');
        } else {
          router.push('/(tabs)/feed');
        }
      } else if (screen === 'competition' || type === 'competition_result') {
        // Navigate to competition detail (placeholder)
        router.push('/(tabs)/feed');
      }
    });

    return () => {
      if (responseListener && typeof responseListener.remove === 'function') {
        responseListener.remove();
      }
    };
  }, [router]);

  // Show loading screen while auth state is being determined
  if (!isHydrated || isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
              <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </View>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <ErrorBoundary name="root">
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={{ flex: 1, position: 'relative' }}>
            {/* Only show authenticated UI elements when user is logged in and not on auth/onboarding */}
            {showAuthenticatedUI && <GlobalTopBar />}
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="onboarding"
                options={{ presentation: 'card' }}
              />
              <Stack.Screen name="auth/login" options={{ presentation: 'card' }} />
              <Stack.Screen name="auth/signup" options={{ presentation: 'card' }} />
              <Stack.Screen name="auth/forgot-password" options={{ presentation: 'card' }} />
              <Stack.Screen name="auth/reset-password" options={{ presentation: 'card' }} />
              <Stack.Screen name="auth/verify-email" options={{ presentation: 'card' }} />
            </Stack>
            {showAuthenticatedUI && <PersistentTabBar />}
            {showAuthenticatedUI && <WorkoutDrawer />}
          </View>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

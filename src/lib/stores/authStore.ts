// src/lib/stores/authStore.ts
// Zustand store for authentication state with Supabase integration
import { create } from "zustand";
import { supabase } from "../supabase/client";
import type { AuthError, Session } from "@supabase/supabase-js";
import type { DatabaseUser, mapDatabaseUser } from "../supabase/types";

/**
 * User profile matching camelCase convention used in the app
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth state interface
 */
interface AuthState {
  // State
  user: UserProfile | null;
  session: Session | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setHydrated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
}

/**
 * Transform Supabase user data to UserProfile format
 */
function toUserProfile(user: DatabaseUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

/**
 * Auth store with Supabase integration
 *
 * Authentication state is NOT persisted to AsyncStorage.
 * Supabase handles session persistence internally via SecureStore.
 * This store only holds the current runtime state.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  hydrated: false,
  loading: true,
  error: null,

  /**
   * Sign up a new user with email, password, and display name
   */
  signUp: async (email: string, password: string, displayName: string) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      // After successful signup, get the user profile from the public users table
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (!profileError && profileData) {
          set({
            user: toUserProfile(profileData),
            session: data.session,
            loading: false,
          });
        } else {
          // If profile not created yet (trigger function may be pending),
          // set basic user info from auth
          set({
            user: {
              id: data.user.id,
              email: data.user.email ?? "",
              displayName: displayName,
              avatarUrl: data.user.user_metadata?.avatar_url ?? null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            session: data.session,
            loading: false,
          });
        }
      } else {
        set({ loading: false });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      // After successful signin, get the user profile from the public users table
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (!profileError && profileData) {
          set({
            user: toUserProfile(profileData),
            session: data.session,
            loading: false,
          });
        } else {
          // Fallback to auth metadata if profile fetch fails
          set({
            user: {
              id: data.user.id,
              email: data.user.email ?? "",
              displayName: data.user.user_metadata?.display_name ?? null,
              avatarUrl: data.user.user_metadata?.avatar_url ?? null,
              createdAt: data.user.created_at ?? new Date().toISOString(),
              updatedAt: data.user.updated_at ?? new Date().toISOString(),
            },
            session: data.session,
            loading: false,
          });
        }
      } else {
        set({ loading: false });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false, error: null });
  },

  /**
   * Clear any auth error
   */
  clearError: () => set({ error: null }),

  /**
   * Set hydrated state (called after initial auth check)
   */
  setHydrated: (value) => set({ hydrated: value }),

  /**
   * Set loading state
   */
  setLoading: (value) => set({ loading: value }),
}));

// ============================================================================
// Convenience selectors
// ============================================================================

export const selectUser = (state: AuthState) => state.user;
export const selectSession = (state: AuthState) => state.session;
export const selectIsHydrated = (state: AuthState) => state.hydrated;
export const selectLoading = (state: AuthState) => state.loading;
export const selectError = (state: AuthState) => state.error;
export const selectIsAuthenticated = (state: AuthState) => state.user !== null;

// ============================================================================
// Hooks for common access patterns
// ============================================================================

/**
 * Hook to access the current user profile
 */
export function useUser(): UserProfile | null {
  return useAuthStore(selectUser);
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  return useAuthStore(selectIsAuthenticated);
}

/**
 * Hook to access authentication loading state
 */
export function useAuthLoading(): boolean {
  return useAuthStore(selectLoading);
}

/**
 * Hook to access authentication error
 */
export function useAuthError(): string | null {
  return useAuthStore(selectError);
}

/**
 * Hook to access auth store (full access)
 */
export function useAuth() {
  return useAuthStore();
}

// ============================================================================
// Auth state listener setup
// ============================================================================

/**
 * Initialize the Supabase auth state listener
 * Call this once in the root layout to sync auth state with the store
 *
 * @param onAuthStateChange Optional callback for auth state changes
 * @returns Cleanup function to unsubscribe from auth events
 */
export function setupAuthListener(
  onAuthStateChange?: (event: string, session: Session | null) => void
): () => void {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      const store = useAuthStore.getState();

      // Update session in store
      if (session?.user) {
        // Fetch user profile from public users table
        const { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData) {
          store.user = toUserProfile(profileData);
        } else {
          // Fallback to auth metadata
          store.user = {
            id: session.user.id,
            email: session.user.email ?? "",
            displayName: session.user.user_metadata?.display_name ?? null,
            avatarUrl: session.user.user_metadata?.avatar_url ?? null,
            createdAt: session.user.created_at ?? new Date().toISOString(),
            updatedAt: session.user.updated_at ?? new Date().toISOString(),
          };
        }
      } else {
        store.user = null;
      }

      store.session = session;
      store.hydrated = true;
      store.loading = false;

      // Call optional callback
      onAuthStateChange?.(event, session);
    }
  );

  // Return cleanup function
  return () => {
    authListener?.unsubscribe();
  };
}

// ============================================================================
// Imperative getters for non-React code
// ============================================================================

/**
 * Get the current user imperatively
 */
export function getUser(): UserProfile | null {
  return useAuthStore.getState().user;
}

/**
 * Get the current session imperatively
 */
export function getSession(): Session | null {
  return useAuthStore.getState().session;
}

/**
 * Check if user is authenticated imperatively
 */
export function isAuthenticated(): boolean {
  return useAuthStore.getState().user !== null;
}

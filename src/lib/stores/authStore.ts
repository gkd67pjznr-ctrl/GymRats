// src/lib/stores/authStore.ts
// Zustand store for authentication state with Supabase integration
import { create } from "zustand";
import { supabase, isSupabasePlaceholder } from "../supabase/client";
import type { AuthError, Session } from "@supabase/supabase-js";
import type { DatabaseUser, mapDatabaseUser } from "../supabase/types";
import { syncOrchestrator } from "../sync/SyncOrchestrator";
import { uploadAvatar, generateAvatarUrl } from "../supabase/storage";

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
  // Subscription tier
  subscriptionTier: 'basic' | 'premium' | 'legendary';
  // Avatar properties (optional for backward compatibility)
  avatarArtStyle?: string | null;
  avatarGrowthStage?: number | null;
  avatarHeightScale?: number | null;
  avatarCosmetics?: {
    top: string | null;
    bottom: string | null;
    shoes: string | null;
    accessory: string | null;
  } | null;
  // Growth metrics (optional for backward compatibility)
  totalVolumeKg?: number | null;
  totalSets?: number | null;
  // Hangout room properties (optional for backward compatibility)
  hangoutRoomId?: string | null;
  hangoutRoomRole?: "owner" | "member" | null;
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
  isEmailVerified: boolean;

  // Actions
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  checkEmailVerification: () => Promise<boolean>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateDisplayName: (displayName: string) => Promise<{ success: boolean; error?: string }>;
  updateAvatar: (fileUri: string) => Promise<{ success: boolean; avatarUrl?: string; error?: string }>;
  removeAvatar: () => Promise<{ success: boolean; error?: string }>;
  devLogin: () => Promise<{ success: boolean; error?: string }>;
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
    // Subscription tier (default to basic for now, dev user gets legendary)
    subscriptionTier: user.email === "dev@gymrats.app" ? 'legendary' : 'basic',
    // Avatar properties
    avatarArtStyle: user.avatar_art_style,
    avatarGrowthStage: user.avatar_growth_stage,
    avatarHeightScale: user.avatar_height_scale,
    avatarCosmetics: user.avatar_cosmetics,
    // Growth metrics
    totalVolumeKg: user.total_volume_kg,
    totalSets: user.total_sets,
    // Hangout room properties
    hangoutRoomId: user.hangout_room_id,
    hangoutRoomRole: user.hangout_room_role,
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
  loading: false,  // Changed from true to prevent infinite loading
  error: null,
  isEmailVerified: true,  // Default to true to avoid blocking existing users

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
              subscriptionTier: data.user.email === "dev@gymrats.app" ? 'legendary' : 'basic',
              // Optional fields with defaults
              avatarArtStyle: null,
              avatarGrowthStage: null,
              avatarHeightScale: null,
              avatarCosmetics: null,
              totalVolumeKg: null,
              totalSets: null,
              hangoutRoomId: null,
              hangoutRoomRole: null,
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
              subscriptionTier: data.user.email === "dev@gymrats.app" ? 'legendary' : 'basic',
              // Optional fields with defaults
              avatarArtStyle: null,
              avatarGrowthStage: null,
              avatarHeightScale: null,
              avatarCosmetics: null,
              totalVolumeKg: null,
              totalSets: null,
              hangoutRoomId: null,
              hangoutRoomRole: null,
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
   * Clears state even if Supabase call fails
   */
  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Log but don't fail - we still want to clear local state
      if (__DEV__) {
        console.error('[authStore] Sign out error:', err);
      }
    } finally {
      set({ user: null, session: null, loading: false, error: null });
    }
  },

  /**
   * Request a password reset email
   * Sends an email with a reset link to the user's email address
   */
  resetPassword: async (email: string) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: __DEV__
          ? "exp://127.0.0.1:19000/--/auth/reset-password"
          : "https://gymrats.app/auth/reset-password",
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Update the user's password
   * Call this after the user has clicked the reset link in their email
   */
  updatePassword: async (newPassword: string) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Resend verification email to the current user
   */
  resendVerificationEmail: async () => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: get().session?.user?.email ?? "",
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Check if the current user's email is verified
   * Updates the isEmailVerified state
   */
  checkEmailVerification: async () => {
    const session = get().session;
    if (!session?.user) {
      set({ isEmailVerified: false });
      return false;
    }

    // Refresh session to get latest email confirmation status
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error("[authStore] Error checking email verification:", error);
      return false;
    }

    const isVerified = !!data.user?.email_confirmed_at;
    set({ isEmailVerified: isVerified });
    return isVerified;
  },

  /**
   * Delete the current user's account and all associated data
   * This is a permanent action that cannot be undone
   * Requires password confirmation for security
   */
  deleteAccount: async (password: string) => {
    set({ loading: true, error: null });

    try {
      const session = get().session;
      if (!session?.user) {
        set({ error: "No active session", loading: false });
        return { success: false, error: "No active session" };
      }

      // First, verify the password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password,
      });

      if (signInError) {
        set({ error: "Incorrect password", loading: false });
        return { success: false, error: "Incorrect password" };
      }

      // Password is correct, proceed with account deletion
      // Delete user data from public.users table (cascade will handle related data)
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", session.user.id);

      if (dbError) {
        console.error("[authStore] Error deleting user data:", dbError);
        // Continue with auth deletion even if DB deletion fails
        // Supabase admin functions can clean up orphaned data
      }

      // Delete the user from Supabase Auth
      const { error: deleteError } = await supabase.rpc("admin_delete_user", {
        user_id: session.user.id,
      });

      if (deleteError) {
        set({ error: deleteError.message, loading: false });
        return { success: false, error: deleteError.message };
      }

      // Clear local state
      set({ user: null, session: null, loading: false, error: null, isEmailVerified: false });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Update user's display name
   * @param displayName New display name (1-50 characters)
   */
  updateDisplayName: async (displayName: string) => {
    set({ loading: true, error: null });

    try {
      const session = get().session;
      if (!session?.user) {
        set({ error: "No active session", loading: false });
        return { success: false, error: "No active session" };
      }

      const userId = session.user.id;

      // Validate display name
      const trimmedName = displayName.trim();
      if (trimmedName.length === 0) {
        set({ error: "Display name cannot be empty", loading: false });
        return { success: false, error: "Display name cannot be empty" };
      }
      if (trimmedName.length > 50) {
        set({ error: "Display name must be 50 characters or less", loading: false });
        return { success: false, error: "Display name must be 50 characters or less" };
      }

      // Update user profile in database
      const { error: updateError } = await supabase
        .from("users")
        .update({ display_name: trimmedName, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) {
        set({ error: updateError.message, loading: false });
        return { success: false, error: updateError.message };
      }

      // Update local state
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: { ...currentUser, displayName: trimmedName },
          loading: false,
        });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Upload and update user avatar
   * @param fileUri Local URI of the avatar image
   */
  updateAvatar: async (fileUri: string) => {
    set({ loading: true, error: null });

    try {
      const session = get().session;
      if (!session?.user) {
        set({ error: "No active session", loading: false });
        return { success: false, error: "No active session" };
      }

      const userId = session.user.id;

      // Upload the avatar
      const uploadResult = await uploadAvatar(fileUri, userId);

      if (!uploadResult.success || !uploadResult.url) {
        set({ error: uploadResult.error || "Failed to upload avatar", loading: false });
        return { success: false, error: uploadResult.error };
      }

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: uploadResult.url, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) {
        set({ error: updateError.message, loading: false });
        return { success: false, error: updateError.message };
      }

      // Update local state
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: { ...currentUser, avatarUrl: uploadResult.url },
          loading: false,
        });
      }

      return { success: true, avatarUrl: uploadResult.url };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Remove user avatar and revert to default
   */
  removeAvatar: async () => {
    set({ loading: true, error: null });

    try {
      const session = get().session;
      if (!session?.user) {
        set({ error: "No active session", loading: false });
        return { success: false, error: "No active session" };
      }

      const userId = session.user.id;
      const currentUser = get().user;

      // Delete old avatar from storage if it exists
      if (currentUser?.avatarUrl) {
        try {
          // Extract path from URL
          const url = new URL(currentUser.avatarUrl);
          const pathParts = url.pathname.split("/");
          const path = pathParts.slice(pathParts.indexOf("avatars") + 1).join("/");

          const { deleteImage } = await import("../supabase/storage");
          await deleteImage(path, "avatars");
        } catch (err) {
          console.warn("[authStore] Failed to delete old avatar:", err);
          // Continue even if deletion fails
        }
      }

      // Generate default avatar URL
      const defaultAvatar = generateAvatarUrl(userId, currentUser?.displayName ?? undefined);

      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: defaultAvatar, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) {
        set({ error: updateError.message, loading: false });
        return { success: false, error: updateError.message };
      }

      // Update local state
      if (currentUser) {
        set({
          user: { ...currentUser, avatarUrl: defaultAvatar },
          loading: false,
        });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
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

  /**
   * Dev login - quick login for development (DEV ONLY)
   * Creates or signs in a dev user without password
   */
  devLogin: async () => {
    if (!__DEV__) {
      return { success: false, error: "Dev login only available in development" };
    }

    set({ loading: true, error: null });

    // If Supabase is configured with placeholder values, create a mock user directly
    if (isSupabasePlaceholder) {
      const mockUser = {
        id: "dev-user-id-123456",
        email: "dev@gymrats.app",
        displayName: "Dev User",
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subscriptionTier: 'legendary' as const,
        avatarArtStyle: null,
        avatarGrowthStage: null,
        avatarHeightScale: null,
        avatarCosmetics: null,
        totalVolumeKg: null,
        totalSets: null,
        hangoutRoomId: null,
        hangoutRoomRole: null,
      };

      set({
        user: mockUser,
        session: null,
        loading: false,
      });

      // Trigger sync orchestrator sign in (offline mode)
      syncOrchestrator.onSignIn(mockUser.id).catch(err => {
        console.warn('[authStore] Failed to trigger sync on dev login:', err);
      });

      return { success: true };
    }

    try {
      const devEmail = "dev@gymrats.app";
      const devPassword = "dev123456";

      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
      });

      if (!signInError && signInData.user) {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", signInData.user.id)
          .single();

        set({
          user: profileData ? {
            id: profileData.id,
            email: profileData.email,
            displayName: profileData.display_name,
            avatarUrl: profileData.avatar_url,
            createdAt: profileData.created_at,
            updatedAt: profileData.updated_at,
            subscriptionTier: 'legendary', // Dev user gets legendary tier
            // Optional fields with defaults
            avatarArtStyle: profileData.avatar_art_style,
            avatarGrowthStage: profileData.avatar_growth_stage,
            avatarHeightScale: profileData.avatar_height_scale,
            avatarCosmetics: profileData.avatar_cosmetics,
            totalVolumeKg: profileData.total_volume_kg,
            totalSets: profileData.total_sets,
            hangoutRoomId: profileData.hangout_room_id,
            hangoutRoomRole: profileData.hangout_room_role,
          } : {
            id: signInData.user.id,
            email: signInData.user.email ?? devEmail,
            displayName: "Dev User",
            avatarUrl: signInData.user.user_metadata?.avatar_url ?? null,
            createdAt: signInData.user.created_at ?? new Date().toISOString(),
            updatedAt: signInData.user.updated_at ?? new Date().toISOString(),
            subscriptionTier: 'legendary', // Dev user gets legendary tier
            // Optional fields with defaults
            avatarArtStyle: null,
            avatarGrowthStage: null,
            avatarHeightScale: null,
            avatarCosmetics: null,
            totalVolumeKg: null,
            totalSets: null,
            hangoutRoomId: null,
            hangoutRoomRole: null,
          },
          session: signInData.session,
          loading: false,
        });

        // Trigger sync orchestrator sign in
        syncOrchestrator.onSignIn(signInData.user.id, signInData.session).catch(err => {
          console.warn('[authStore] Failed to trigger sync on dev login:', err);
        });

        return { success: true };
      }

      // If sign in failed, try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
        options: {
          data: {
            display_name: "Dev User",
          },
        },
      });

      if (signUpError) {
        set({ error: signUpError.message, loading: false });
        return { success: false, error: signUpError.message };
      }

      if (signUpData.user) {
        set({
          user: {
            id: signUpData.user.id,
            email: signUpData.user.email ?? devEmail,
            displayName: "Dev User",
            avatarUrl: null,
            createdAt: signUpData.user.created_at ?? new Date().toISOString(),
            updatedAt: signUpData.user.updated_at ?? new Date().toISOString(),
            subscriptionTier: 'legendary', // Dev user gets legendary tier
            // Optional fields with defaults
            avatarArtStyle: null,
            avatarGrowthStage: null,
            avatarHeightScale: null,
            avatarCosmetics: null,
            totalVolumeKg: null,
            totalSets: null,
            hangoutRoomId: null,
            hangoutRoomRole: null,
          },
          session: signUpData.session,
          loading: false,
        });

        // Trigger sync orchestrator sign in
        syncOrchestrator.onSignIn(signUpData.user.id, signUpData.session).catch(err => {
          console.warn('[authStore] Failed to trigger sync on dev login:', err);
        });

        return { success: true };
      }

      set({ loading: false });
      return { success: false, error: "Failed to create dev user" };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },
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
export const selectIsEmailVerified = (state: AuthState) => state.isEmailVerified;

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

/**
 * Hook to check if user's email is verified
 */
export function useIsEmailVerified(): boolean {
  return useAuthStore(selectIsEmailVerified);
}

// ============================================================================
// Auth state listener setup
// ============================================================================

/**
 * Type for Supabase auth subscription
 * Supabase returns { subscription: { unsubscribe } } structure
 */
type AuthSubscription = {
  subscription: { unsubscribe: () => void };
};

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
  console.log('[authStore] Setting up auth state listener...');

  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('[authStore] Auth state change:', event, session?.user?.email || 'no user');

      // Prepare updates
      const updates: Partial<AuthState> = {
        session,
        hydrated: true,
        loading: false,
      };

      // Update user in store
      if (session?.user) {
        // Check email verification status
        updates.isEmailVerified = !!session.user.email_confirmed_at;

        // Fetch user profile from public users table
        const { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData) {
          updates.user = toUserProfile(profileData);
        } else {
          // Fallback to auth metadata
          updates.user = {
            id: session.user.id,
            email: session.user.email ?? "",
            displayName: session.user.user_metadata?.display_name ?? null,
            avatarUrl: session.user.user_metadata?.avatar_url ?? null,
            createdAt: session.user.created_at ?? new Date().toISOString(),
            updatedAt: session.user.updated_at ?? new Date().toISOString(),
            subscriptionTier: session.user.email === "dev@gymrats.app" ? 'legendary' : 'basic',
            // Optional fields with defaults
            avatarArtStyle: null,
            avatarGrowthStage: null,
            avatarHeightScale: null,
            avatarCosmetics: null,
            totalVolumeKg: null,
            totalSets: null,
            hangoutRoomId: null,
            hangoutRoomRole: null,
          };
        }
      } else {
        updates.user = null;
      }

      // Use setState with a callback function to properly trigger re-renders
      useAuthStore.setState((state) => {
        const newState = { ...state, ...updates };
        console.log('[authStore] State updated:', { loading: newState.loading, user: newState.user?.email || 'no user' });
        return newState;
      });

      // Trigger sync on sign in
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          syncOrchestrator.onSignIn(session.user.id, session).catch(err => {
            console.error('[authStore] Sync on sign-in error:', err);
          });

          // Sync gamification data from server
          const { useGamificationStore } = require('../stores/gamificationStore');
          useGamificationStore.getState().pullFromServer().catch((err: unknown) => {
            console.error('[authStore] Gamification sync error:', err);
          });
        }
      }

      // Clear sync state on sign out
      if (event === 'SIGNED_OUT') {
        syncOrchestrator.onSignOut();
      }

      // Call optional callback
      onAuthStateChange?.(event, session);
    }
  );

  // Return cleanup function
  return () => {
    // Supabase auth subscription returns { subscription: { unsubscribe } }
    const subscription = (authListener as unknown as AuthSubscription | null)?.subscription;
    if (subscription?.unsubscribe) {
      subscription.unsubscribe();
    }
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

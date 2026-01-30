import { useUser } from "../stores/authStore";

/**
 * Hook to check if the current user has premium access
 * Returns true for 'premium' and 'legendary' subscription tiers
 * Returns false for 'basic' tier or if no user is logged in
 */
export function useIsPremiumUser(): boolean {
  const user = useUser();

  if (!user) {
    return false;
  }

  return user.subscriptionTier === 'premium' || user.subscriptionTier === 'legendary';
}
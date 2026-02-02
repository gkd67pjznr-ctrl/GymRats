/**
 * Forge Lab Hook - Custom hook for Forge Lab analytics
 */
import { useEffect } from 'react';
import { useForgeLabStore, useForgeLabData, useForgeLabActions, useForgeLabDateRange } from './store';
import { ForgeLabData } from './types';

/**
 * Main hook for Forge Lab functionality
 */
export const useForgeLab = () => {
  const { data, loading, error } = useForgeLabData();
  const { loadData, setDateRange, refreshData } = useForgeLabActions();
  const dateRange = useForgeLabDateRange();

  // Load data on mount
  useEffect(() => {
    if (!data) {
      loadData();
    }
  }, [data, loadData]);

  return {
    data,
    loading,
    error,
    dateRange,
    setDateRange,
    refreshData
  };
};

/**
 * Hook for accessing specific exercise data
 */
export const useExerciseStats = (exerciseId: string) => {
  const { data } = useForgeLabData();

  if (!data) {
    return null;
  }

  const exerciseStat = data.exerciseStats.find(stat => stat.exerciseId === exerciseId);
  return exerciseStat || null;
};

/**
 * Hook for accessing weight history data
 */
export const useWeightHistory = () => {
  const { data } = useForgeLabData();
  return data?.weightHistory || [];
};

/**
 * Hook for accessing muscle group volume data
 */
export const useMuscleGroupVolume = () => {
  const { data } = useForgeLabData();
  return data?.muscleGroupVolume || [];
};

/**
 * Hook for checking if user has premium access
 */
export const useIsPremiumUser = () => {
  // Import from authStore to get subscription tier
  // Use dynamic import to avoid circular dependencies
  const useAuthStore = require('@/src/lib/stores/authStore').useAuthStore;
  const subscriptionTier = useAuthStore((state) => state.subscriptionTier);

  // User has premium access if they have premium or legendary tier
  return subscriptionTier === 'premium' || subscriptionTier === 'legendary';
};

/**
 * Hook for filtering data by date range
 *
 * Note: The primary filtering happens in the store's loadData() function
 * which filters sessions by date range before computing analytics.
 * This hook provides additional filtering capabilities for computed data.
 */
export const useFilteredData = (data: ForgeLabData | null, dateRange: string) => {
  if (!data) return null;

  // The data from the store is already filtered by dateRange
  // This hook provides a consistent interface for potential future enhancements
  // such as client-side filtering of historical data for comparison views

  // For now, return the data as-is since the store handles filtering
  // Future enhancements could include:
  // - Comparison period data (e.g., show this week vs last week)
  // - Rolling window calculations
  // - Custom date range filtering for specific chart components

  return data;
};

/**
 * Hook for getting comparison data (previous period)
 * Useful for showing trends like "this week vs last week"
 */
export const useComparisonData = (currentData: ForgeLabData | null) => {
  if (!currentData) return null;

  // This is a placeholder for future comparison functionality
  // Could compare current period with previous period
  // For example, if current dateRange is '1W', compare with previous week

  return null;
};
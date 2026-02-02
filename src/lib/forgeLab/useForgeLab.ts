/**
 * Forge Lab Hook - Custom hook for Forge Lab analytics
 */
import { useEffect } from 'react';
import { useForgeLabStore, useForgeLabData, useForgeLabActions, useForgeLabDateRange } from './store';
import { ForgeLabData } from './types';
import { useIsPremiumUser as useRealIsPremiumUser } from '@/src/lib/hooks/useIsPremiumUser';

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
  return useRealIsPremiumUser();
};

/**
 * Hook for filtering data by date range
 * Note: Date range filtering is already applied at the store level when loading data.
 * This hook is kept for future client-side filtering needs.
 */
export const useFilteredData = (data: ForgeLabData | null, dateRange: string) => {
  if (!data) return null;

  // Date range filtering is already applied at the store level
  // Additional client-side filtering could be implemented here if needed
  return data;
};
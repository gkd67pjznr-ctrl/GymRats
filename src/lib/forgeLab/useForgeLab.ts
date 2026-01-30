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
  // TODO: Implement actual premium check
  // For now, we'll assume premium is enabled for development
  return true;
};

/**
 * Hook for filtering data by date range
 */
export const useFilteredData = (data: ForgeLabData | null, dateRange: string) => {
  if (!data) return null;

  // TODO: Implement actual date range filtering
  // This is a placeholder implementation
  return data;
};
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createQueuedJSONStorage } from './storage/createQueuedAsyncStorage';

const STORAGE_KEY = 'gymrats.bodyStats.v1';

interface BodyStatState {
  muscleVolumes: Record<string, number>;
  lastCalculatedMs: number | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  updateMuscleVolumes: (volumes: Record<string, number>) => void;
}

export const useBodyStatStore = create<BodyStatState>()(
  persist(
    (set) => ({
      muscleVolumes: {},
      lastCalculatedMs: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      updateMuscleVolumes: (volumes) =>
        set({
          muscleVolumes: volumes,
          lastCalculatedMs: Date.now(),
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        muscleVolumes: state.muscleVolumes,
        lastCalculatedMs: state.lastCalculatedMs,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

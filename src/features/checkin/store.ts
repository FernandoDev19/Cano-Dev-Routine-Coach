import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@/shared/lib/storage';

export type Checkin = {
  /** 1 (agotado) – 5 (con toda). */
  energy: number;
  note: string;
  at: number;
};

type CheckinState = {
  checkins: Record<string, Checkin>;
  save: (dateKey: string, energy: number, note: string) => void;
  reset: () => void;
};

export const useCheckinStore = create<CheckinState>()(
  persist(
    (set) => ({
      checkins: {},
      save: (dateKey, energy, note) =>
        set((s) => ({
          checkins: { ...s.checkins, [dateKey]: { energy, note: note.trim(), at: Date.now() } },
        })),
      reset: () => set({ checkins: {} }),
    }),
    {
      name: 'checkin-v1',
      storage: zustandStorage,
      partialize: (s) => ({ checkins: s.checkins }),
    },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@/shared/lib/storage';
import type { DayGoal, DiaryEntry } from './types';

type JournalState = {
  goals: Record<string, DayGoal>;
  diary: Record<string, DiaryEntry>;
  /** Solo en memoria. */
  writing: boolean;

  setGoal: (dateKey: string, text: string) => void;
  setGoalAchieved: (dateKey: string, achieved: boolean) => void;

  setDiaryGenerated: (dateKey: string, text: string, source: 'gemini' | 'local') => void;
  editDiary: (dateKey: string, text: string) => void;

  setWriting: (v: boolean) => void;
  reset: () => void;
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      goals: {},
      diary: {},
      writing: false,

      setGoal: (dateKey, text) =>
        set((s) => {
          const prev = s.goals[dateKey];
          const clean = text.trim();
          if (!clean) return s;
          return {
            goals: {
              ...s.goals,
              [dateKey]: {
                text: clean,
                achieved: prev?.achieved ?? false,
                at: prev?.at ?? Date.now(),
              },
            },
          };
        }),

      setGoalAchieved: (dateKey, achieved) =>
        set((s) => (s.goals[dateKey] ? { goals: { ...s.goals, [dateKey]: { ...s.goals[dateKey], achieved } } } : s)),

      setDiaryGenerated: (dateKey, text, source) =>
        set((s) => {
          const prev = s.diary[dateKey];
          const now = Date.now();
          return {
            diary: {
              ...s.diary,
              [dateKey]: { dateKey, text, source, edited: false, createdAt: prev?.createdAt ?? now, updatedAt: now },
            },
          };
        }),

      editDiary: (dateKey, text) =>
        set((s) => {
          const prev = s.diary[dateKey];
          const now = Date.now();
          return {
            diary: {
              ...s.diary,
              [dateKey]: {
                dateKey,
                text: text.trim(),
                source: prev?.source ?? 'manual',
                edited: true,
                createdAt: prev?.createdAt ?? now,
                updatedAt: now,
              },
            },
          };
        }),

      setWriting: (writing) => set({ writing }),
      reset: () => set({ goals: {}, diary: {}, writing: false }),
    }),
    {
      name: 'journal-v1',
      storage: zustandStorage,
      partialize: (s) => ({ goals: s.goals, diary: s.diary }),
    },
  ),
);

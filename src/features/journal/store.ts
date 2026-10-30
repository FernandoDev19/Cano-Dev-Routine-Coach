import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@/shared/lib/storage';
import type { DayGoal, DiaryEntry, GoalPlan } from './types';

type AdjustmentStatus = 'pending' | 'applied' | 'dismissed';

type JournalState = {
  goals: Record<string, DayGoal>;
  diary: Record<string, DiaryEntry>;
  /** Último día en que se abrió solo la hoja "objetivo de hoy" (una vez por día). */
  lastGoalPromptDate: string | null;
  /** Solo en memoria. */
  planning: boolean;
  writing: boolean;

  setGoal: (dateKey: string, text: string) => void;
  markGoalPrompted: (dateKey: string) => void;
  setGoalAchieved: (dateKey: string, achieved: boolean) => void;
  setGoalPlan: (dateKey: string, plan: GoalPlan) => void;
  resolveGoalAdjustment: (dateKey: string, adjustmentId: string, status: AdjustmentStatus) => void;

  setDiaryGenerated: (dateKey: string, text: string, source: 'gemini' | 'local') => void;
  editDiary: (dateKey: string, text: string) => void;

  setPlanning: (v: boolean) => void;
  setWriting: (v: boolean) => void;
  reset: () => void;
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      goals: {},
      diary: {},
      lastGoalPromptDate: null,
      planning: false,
      writing: false,

      setGoal: (dateKey, text) =>
        set((s) => {
          const prev = s.goals[dateKey];
          const clean = text.trim();
          if (!clean) return s;
          const same = prev?.text === clean;
          return {
            goals: {
              ...s.goals,
              [dateKey]: {
                text: clean,
                achieved: prev?.achieved ?? false,
                at: prev?.at ?? Date.now(),
                // Si el objetivo cambió, el plan anterior ya no aplica.
                plan: same ? prev?.plan : undefined,
              },
            },
          };
        }),

      markGoalPrompted: (dateKey) => set({ lastGoalPromptDate: dateKey }),

      setGoalAchieved: (dateKey, achieved) =>
        set((s) => (s.goals[dateKey] ? { goals: { ...s.goals, [dateKey]: { ...s.goals[dateKey], achieved } } } : s)),

      setGoalPlan: (dateKey, plan) =>
        set((s) => (s.goals[dateKey] ? { goals: { ...s.goals, [dateKey]: { ...s.goals[dateKey], plan } } } : s)),

      resolveGoalAdjustment: (dateKey, adjustmentId, status) =>
        set((s) => {
          const goal = s.goals[dateKey];
          if (!goal?.plan) return s;
          const plan = {
            ...goal.plan,
            adjustments: goal.plan.adjustments.map((a) => (a.id === adjustmentId ? { ...a, status } : a)),
          };
          return { goals: { ...s.goals, [dateKey]: { ...goal, plan } } };
        }),

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

      setPlanning: (planning) => set({ planning }),
      setWriting: (writing) => set({ writing }),
      reset: () => set({ goals: {}, diary: {}, lastGoalPromptDate: null, planning: false, writing: false }),
    }),
    {
      name: 'journal-v1',
      storage: zustandStorage,
      partialize: (s) => ({ goals: s.goals, diary: s.diary, lastGoalPromptDate: s.lastGoalPromptDate }),
    },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uid } from '@/shared/lib/id';
import { zustandStorage } from '@/shared/lib/storage';
import type { AdjustmentStatus, Analysis, QA } from './types';

const MAX_QA = 40;

type CoachState = {
  analysis: Analysis | null;
  qa: QA[];
  setAnalysis: (analysis: Analysis) => void;
  resolveAdjustment: (id: string, status: AdjustmentStatus) => void;
  answerQa: (id: string, answer: string) => void;
  reset: () => void;
};

export const useCoachStore = create<CoachState>()(
  persist(
    (set) => ({
      analysis: null,
      qa: [],

      setAnalysis: (analysis) =>
        set((s) => {
          const known = new Set(s.qa.map((q) => q.question.trim().toLowerCase()));
          const fresh: QA[] = analysis.questions
            .filter((q) => !known.has(q.trim().toLowerCase()))
            .map((question) => ({ id: uid(), question, createdAt: Date.now() }));
          return { analysis, qa: [...s.qa, ...fresh].slice(-MAX_QA) };
        }),

      resolveAdjustment: (id, status) =>
        set((s) =>
          s.analysis
            ? {
                analysis: {
                  ...s.analysis,
                  adjustments: s.analysis.adjustments.map((a) => (a.id === id ? { ...a, status } : a)),
                },
              }
            : s,
        ),

      answerQa: (id, answer) =>
        set((s) => ({
          qa: s.qa.map((q) => (q.id === id ? { ...q, answer: answer.trim(), answeredAt: Date.now() } : q)),
        })),

      reset: () => set({ analysis: null, qa: [] }),
    }),
    {
      name: 'coach-v1',
      storage: zustandStorage,
      partialize: (s) => ({ analysis: s.analysis, qa: s.qa }),
    },
  ),
);

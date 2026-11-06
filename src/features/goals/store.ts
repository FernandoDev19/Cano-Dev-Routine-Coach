import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mondayOf, monthKeyOf, toDateKey } from '@/shared/lib/date';
import { zustandStorage } from '@/shared/lib/storage';
import type { DayToll, GoalKind, MonthGoal, NewDayToll, WeekGoal } from './types';

const MAX_TOLLS = 120;

type GoalsState = {
  months: Record<string, MonthGoal>;
  weeks: Record<string, WeekGoal>;
  tolls: Record<string, DayToll>;
  /** Último mes ("YYYY-MM") y semana (lunes) en que la hoja de metas se abrió sola: una vez por período. */
  lastPromptedMonth: string | null;
  lastPromptedWeek: string | null;
  /** Solo en memoria: hay un peaje armándose (evita envíos dobles). */
  generating: boolean;

  setGenerating: (v: boolean) => void;
  markPrompted: (kind: GoalKind, periodKey: string) => void;
  /** Guarda (o reemplaza) la meta del mes de `dateKey`. */
  setMonthGoal: (text: string, dateKey?: string) => void;
  /** Guarda (o reemplaza) la meta de la semana de `dateKey`. */
  setWeekGoal: (text: string, dateKey?: string) => void;
  /** Crea el peaje del día como pendiente; reemplaza el del mismo día. */
  saveToll: (input: NewDayToll) => void;
  markTollPaid: (dateKey: string) => void;
  clearToll: (dateKey: string) => void;

  reset: () => void;
};

function pruneTolls(tolls: Record<string, DayToll>): Record<string, DayToll> {
  const keys = Object.keys(tolls).sort();
  if (keys.length <= MAX_TOLLS) return tolls;
  const keep = new Set(keys.slice(-MAX_TOLLS));
  return Object.fromEntries(Object.entries(tolls).filter(([k]) => keep.has(k)));
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      months: {},
      weeks: {},
      tolls: {},
      lastPromptedMonth: null,
      lastPromptedWeek: null,
      generating: false,

      setGenerating: (generating) => set({ generating }),
      markPrompted: (kind, periodKey) =>
        set(kind === 'month' ? { lastPromptedMonth: periodKey } : { lastPromptedWeek: periodKey }),

      setMonthGoal: (text, dateKey = toDateKey()) =>
        set((s) => {
          const clean = text.trim();
          if (!clean) return s;
          const monthKey = monthKeyOf(dateKey);
          const now = Date.now();
          const prev = s.months[monthKey];
          return {
            months: { ...s.months, [monthKey]: { monthKey, text: clean, createdAt: prev?.createdAt ?? now, updatedAt: now } },
          };
        }),

      setWeekGoal: (text, dateKey = toDateKey()) =>
        set((s) => {
          const clean = text.trim();
          if (!clean) return s;
          const weekKey = mondayOf(dateKey);
          const now = Date.now();
          const prev = s.weeks[weekKey];
          return {
            weeks: { ...s.weeks, [weekKey]: { weekKey, text: clean, createdAt: prev?.createdAt ?? now, updatedAt: now } },
          };
        }),

      saveToll: (input) =>
        set((s) => {
          const toll = input.toll.trim();
          if (!toll) return s;
          // Un peaje ya pagado no se reabre ni se reemplaza.
          if (s.tolls[input.dateKey]?.status === 'paid') return s;
          const next: DayToll = {
            ...input,
            draft: input.draft.trim(),
            toll,
            status: 'pending',
            createdAt: Date.now(),
          };
          return { tolls: pruneTolls({ ...s.tolls, [input.dateKey]: next }) };
        }),

      markTollPaid: (dateKey) =>
        set((s) => {
          const current = s.tolls[dateKey];
          if (!current || current.status === 'paid') return s;
          return { tolls: { ...s.tolls, [dateKey]: { ...current, status: 'paid', paidAt: Date.now() } } };
        }),

      clearToll: (dateKey) =>
        set((s) => {
          if (!s.tolls[dateKey]) return s;
          const { [dateKey]: _removed, ...rest } = s.tolls;
          return { tolls: rest };
        }),

      reset: () =>
        set({ months: {}, weeks: {}, tolls: {}, lastPromptedMonth: null, lastPromptedWeek: null, generating: false }),
    }),
    {
      name: 'goals-v1',
      storage: zustandStorage,
      partialize: (s) => ({
        months: s.months,
        weeks: s.weeks,
        tolls: s.tolls,
        lastPromptedMonth: s.lastPromptedMonth,
        lastPromptedWeek: s.lastPromptedWeek,
      }),
    },
  ),
);

import type { Adjustment } from '@/features/coach';

/** Cómo encaja el objetivo del día con la rutina, y los ajustes de hoy que propone la IA. */
export type GoalPlan = {
  message: string;
  adjustments: Adjustment[];
  source: 'gemini' | 'local';
  /** Si Gemini falló y se usó el motor local, el motivo. */
  fallbackNote?: string;
};

export type DayGoal = {
  text: string;
  achieved: boolean;
  at: number;
  plan?: GoalPlan;
};

export type DiaryEntry = {
  dateKey: string;
  text: string;
  /** Quién lo redactó la última vez que no fue el usuario ('manual' = lo escribió él desde cero). */
  source: 'gemini' | 'local' | 'manual';
  /** true cuando el usuario lo editó a mano: no se sobrescribe sin confirmar. */
  edited: boolean;
  createdAt: number;
  updatedAt: number;
};

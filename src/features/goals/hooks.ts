import { useCallback, useEffect, useState } from 'react';
import { mondayOf, monthKeyOf } from '@/shared/lib/date';
import { nextAfterSave, promptDue } from './lib/prompt';
import { useGoalsStore } from './store';
import type { GoalKind, SetupStep } from './types';

/**
 * Controla la hoja de metas. Se abre sola una vez por período (mes / semana) cuando falta la meta
 * (`setup` viene de `resolveDayContext`); también se puede abrir a mano con `openFor`.
 * Guardar la del mes encadena la de la semana si también falta y es día hábil.
 */
export function useGoalSetup(today: string, setup: SetupStep) {
  const lastMonth = useGoalsStore((s) => s.lastPromptedMonth);
  const lastWeek = useGoalsStore((s) => s.lastPromptedWeek);
  const [open, setOpen] = useState<GoalKind | null>(null);

  useEffect(() => {
    const due = promptDue(setup, today, lastMonth, lastWeek);
    if (!due) return;
    useGoalsStore.getState().markPrompted(due, due === 'month' ? monthKeyOf(today) : mondayOf(today));
    setOpen(due);
  }, [setup, today, lastMonth, lastWeek]);

  const save = useCallback(
    (kind: GoalKind, text: string) => {
      const { setMonthGoal, setWeekGoal, markPrompted } = useGoalsStore.getState();
      if (kind === 'month') setMonthGoal(text, today);
      else setWeekGoal(text, today);

      const next = nextAfterSave(kind, today, !!useGoalsStore.getState().weeks[mondayOf(today)]);
      if (next) markPrompted(next, mondayOf(today));
      setOpen(next);
    },
    [today],
  );

  const close = useCallback(() => setOpen(null), []);

  return { open, openFor: setOpen, save, close };
}

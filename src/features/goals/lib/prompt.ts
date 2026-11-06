import { isWeekend, mondayOf, monthKeyOf } from '@/shared/lib/date';
import type { GoalKind, SetupStep } from '../types';

/**
 * ¿Hay que abrir sola la hoja de metas? Una vez por período: si falta la meta (`setup`) y esa
 * hoja aún no se abrió este mes / esta semana. El mes va primero; la semana, después.
 */
export function promptDue(
  setup: SetupStep,
  today: string,
  lastPromptedMonth: string | null,
  lastPromptedWeek: string | null,
): GoalKind | null {
  if (setup === 'month' && lastPromptedMonth !== monthKeyOf(today)) return 'month';
  if (setup === 'week' && lastPromptedWeek !== mondayOf(today)) return 'week';
  return null;
}

/** Tras guardar la meta del mes: encadena la de la semana si falta y es día hábil. */
export function nextAfterSave(kind: GoalKind, today: string, weekGoalExists: boolean): GoalKind | null {
  return kind === 'month' && !weekGoalExists && !isWeekend(today) ? 'week' : null;
}

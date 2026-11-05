import { isWeekend } from '@/shared/lib/date';
import type { DayContext, MonthGoal, WeekGoal } from '../types';

/**
 * Decide qué modo corresponde hoy.
 *
 * - Sábado y domingo: descanso, sin pasos previos (son sagrados).
 * - Lunes a viernes: el modo diario es siempre la prioridad; `setup` solo indica
 *   que falta la meta del mes o de la semana, sin bloquear el peaje del día.
 *   Se pide primero la del mes y luego la de la semana (la semana depende del mes).
 */
export function resolveDayContext(
  today: string,
  monthGoal: MonthGoal | undefined,
  weekGoal: WeekGoal | undefined,
): DayContext {
  if (isWeekend(today)) return { mode: 'rest', setup: null };
  if (!monthGoal) return { mode: 'daily', setup: 'month' };
  if (!weekGoal) return { mode: 'daily', setup: 'week' };
  return { mode: 'daily', setup: null };
}

import { addDays, isWeekend } from '@/shared/lib/date';
import type { DayToll } from '../types';

const MAX_LOOKBACK = 400;

/**
 * Racha del peaje: días hábiles seguidos con el peaje pagado, contando hacia atrás desde `today`.
 * Fines de semana no cuentan ni rompen la racha (son sagrados). Si hoy aún no se paga, no rompe:
 * la racha sigue desde ayer hasta que termine el día.
 */
export function tollStreak(tolls: Record<string, DayToll>, today: string): number {
  let streak = 0;
  let day = today;
  for (let i = 0; i < MAX_LOOKBACK; i++, day = addDays(day, -1)) {
    if (isWeekend(day)) continue;
    if (tolls[day]?.status === 'paid') streak++;
    else if (day !== today) break;
  }
  return streak;
}

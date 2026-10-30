import { formatLongDate } from '@/shared/lib/date';
import type { CoachInput } from '@/features/coach';
import type { DayGoal } from '../types';

/** Diario sin internet: redacta en primera persona solo con lo que el usuario registró. */
export function localDiary(input: CoachInput, dateKey: string, goal?: DayGoal): string {
  const entries = input.todayEntries;
  const done = entries.filter((e) => e.status === 'done');
  const skipped = entries.filter((e) => e.status === 'skipped');
  const paragraphs: string[] = [];

  let first = `${formatLongDate(dateKey)}.`;
  if (goal) {
    first += ` Mi objetivo de hoy era «${goal.text}»${goal.achieved ? ' y lo logré.' : '; todavía no lo marco como logrado.'}`;
  }
  paragraphs.push(first);

  if (entries.length > 0) {
    let line = `Cumplí ${done.length} de ${entries.length} tareas de mi mini-rutina`;
    line += done.length > 0 ? `: ${done.map((e) => `«${e.title}»`).join(', ')}.` : '.';
    const moved = done.filter((e) => e.place !== e.plannedPlace);
    if (moved.length > 0) {
      line += ` ${moved.length === 1 ? 'Una la hice' : 'Algunas las hice'} en un lugar distinto al planeado.`;
    }
    paragraphs.push(line);
  }

  if (skipped.length > 0) {
    const detail = skipped
      .map((e) => {
        const why = [e.reason, e.why].filter(Boolean).join(' — ');
        return `«${e.title}»${why ? ` (${why})` : ''}`;
      })
      .join('; ');
    paragraphs.push(`Omití: ${detail}. Es información, no un fracaso: me dice qué ajustar.`);
  }

  if (input.energyToday !== undefined) {
    let line = `Mi energía estuvo en ${input.energyToday}/5.`;
    if (input.noteToday) line += ` Lo que me pesó o distrajo: ${input.noteToday}`;
    paragraphs.push(line);
  }

  paragraphs.push(
    input.stats.streak > 0
      ? `Llevo ${input.stats.streak} día(s) de racha. Mañana quiero retomar con un paso pequeño y concreto.`
      : 'Mañana quiero retomar con un paso pequeño y concreto.',
  );

  return paragraphs.join('\n\n');
}

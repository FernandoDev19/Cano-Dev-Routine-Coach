import { fromDateKey, lastNDays } from '@/shared/lib/date';
import type { EntriesByDay, Task } from '@/features/routine';
import type { DerivedQuestion } from '../types';

const MAX_QUESTIONS = 6;
const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function dayLabel(dateKey: string, today: string): string {
  if (dateKey === today) return 'hoy';
  const days = lastNDays(3, today);
  if (dateKey === days[1]) return 'ayer';
  return `el ${WEEKDAYS[fromDateKey(dateKey).getDay()]}`;
}

/**
 * Preguntas "¿por qué?" que salen directamente de tus datos de los últimos 3 días:
 *  - tareas omitidas sin explicación;
 *  - tareas hechas en un lugar distinto al planeado.
 * Al responder, la respuesta se guarda en la entrada y la pregunta desaparece sola.
 */
export function deriveQuestions(tasks: Task[], entries: EntriesByDay, today: string): DerivedQuestion[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const out: DerivedQuestion[] = [];

  for (const dateKey of lastNDays(3, today).reverse()) {
    const when = dayLabel(dateKey, today);
    for (const [taskId, entry] of Object.entries(entries[dateKey] ?? {})) {
      const task = byId.get(taskId);
      if (!task || entry.why) continue;

      if (entry.status === 'skipped') {
        const reason = entry.reason ? ` (${entry.reason.toLowerCase()})` : '';
        out.push({
          key: `${dateKey}:${taskId}:skip`,
          kind: 'skip',
          taskId,
          dateKey,
          text: `Omitiste «${task.title}» ${when}${reason}. ¿Qué pasó realmente y qué la habría hecho más fácil?`,
        });
      } else if (entry.place !== task.place) {
        out.push({
          key: `${dateKey}:${taskId}:place`,
          kind: 'place',
          taskId,
          dateKey,
          text:
            task.place === 'outside'
              ? `«${task.title}» era para la calle, pero ${when} la hiciste en casa. ¿Qué te frenó de salir?`
              : `«${task.title}» la tenías en casa y ${when} la hiciste afuera. ¿Te funcionó mejor así?`,
        });
      }
    }
  }

  return out.slice(0, MAX_QUESTIONS);
}

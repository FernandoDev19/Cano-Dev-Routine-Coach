import { addDays, endOfDayMs } from '@/shared/lib/date';
import type { EntriesByDay, Entry, Task } from '../types';

export type DaySummary = {
  date: string;
  total: number;
  done: number;
  skipped: number;
  pending: number;
  /** 0–100 */
  pct: number;
  /** Tareas que ese día estaban pensadas para la calle. */
  outsidePlanned: number;
  outsideDone: number;
  homeDone: number;
};

/** Tareas que existían (y no estaban archivadas) al final de `dateKey`. */
export function tasksForDay(tasks: Task[], dateKey: string): Task[] {
  const end = endOfDayMs(dateKey);
  return tasks.filter((t) => t.createdAt <= end && (!t.archivedAt || t.archivedAt > end));
}

export function summarizeDay(
  tasks: Task[],
  dayEntries: Record<string, Entry> | undefined,
  dateKey: string,
): DaySummary {
  const list = tasksForDay(tasks, dateKey);
  let done = 0;
  let skipped = 0;
  let outsidePlanned = 0;
  let outsideDone = 0;
  let homeDone = 0;

  for (const t of list) {
    const e = dayEntries?.[t.id];
    const place = e?.place ?? t.place;
    if (place === 'outside') outsidePlanned += 1;
    if (e?.status === 'done') {
      done += 1;
      if (e.place === 'outside') outsideDone += 1;
      else homeDone += 1;
    } else if (e?.status === 'skipped') {
      skipped += 1;
    }
  }

  const total = list.length;
  return {
    date: dateKey,
    total,
    done,
    skipped,
    pending: total - done - skipped,
    pct: total > 0 ? Math.round((done / total) * 100) : 0,
    outsidePlanned,
    outsideDone,
    homeDone,
  };
}

function hasDone(entries: EntriesByDay, dateKey: string): boolean {
  const day = entries[dateKey];
  return !!day && Object.values(day).some((e) => e.status === 'done');
}

/** Días consecutivos con al menos una tarea hecha. Hoy sin avances no rompe la racha todavía. */
export function computeStreak(entries: EntriesByDay, today: string): number {
  let cursor = hasDone(entries, today) ? today : addDays(today, -1);
  let streak = 0;
  while (hasDone(entries, cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

import { useMemo } from 'react';
import { isScheduledOn } from './lib/progress';
import { useRoutineStore } from './store';
import type { Task } from './types';

/** Tareas vigentes (no archivadas). */
export function useActiveTasks(): Task[] {
  const tasks = useRoutineStore((s) => s.tasks);
  return useMemo(() => tasks.filter((t) => !t.archivedAt), [tasks]);
}

/** Tareas vigentes que tocan hoy (según días de la semana o tareas de un solo día). */
export function useTodayTasks(today: string): Task[] {
  const active = useActiveTasks();
  return useMemo(() => active.filter((t) => isScheduledOn(t, today)), [active, today]);
}

import { useMemo } from 'react';
import { useRoutineStore } from './store';
import type { Task } from './types';

/** Tareas vigentes (no archivadas). */
export function useActiveTasks(): Task[] {
  const tasks = useRoutineStore((s) => s.tasks);
  return useMemo(() => tasks.filter((t) => !t.archivedAt), [tasks]);
}

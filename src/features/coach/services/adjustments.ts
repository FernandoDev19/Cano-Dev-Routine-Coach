import { useRoutineStore } from '@/features/routine';
import { useCoachStore } from '../store';
import type { Adjustment } from '../types';

type ApplyOptions = {
  /** Si viene, una tarea nueva ("add") se crea solo para ese día (adaptación por el objetivo de hoy). */
  oneDayDate?: string;
};

/**
 * Aplica un ajuste a la rutina (sin tocar el estado del coach). Las notificaciones se reprograman
 * solas porque la capa de app observa las tareas.
 */
export function applyToRoutine(adj: Adjustment, opts: ApplyOptions = {}): void {
  const routine = useRoutineStore.getState();
  const task = adj.taskId ? routine.tasks.find((t) => t.id === adj.taskId && !t.archivedAt) : undefined;

  switch (adj.kind) {
    case 'shrink':
      if (task && adj.newTitle) routine.updateTask(task.id, { title: adj.newTitle });
      break;
    case 'move_outside':
      if (task) routine.updateTask(task.id, { place: 'outside' });
      break;
    case 'move_home':
      if (task) routine.updateTask(task.id, { place: 'home' });
      break;
    case 'reschedule':
      if (task && adj.newReminder) routine.updateTask(task.id, { reminder: adj.newReminder });
      break;
    case 'archive':
      if (task) routine.archiveTask(task.id, adj.reason || 'Sugerido por el coach', undefined);
      break;
    case 'add':
      if (adj.newTitle) {
        routine.addTask({
          title: adj.newTitle,
          category: adj.category ?? 'devops',
          place: adj.newPlace ?? 'home',
          reminder: adj.newReminder ?? null,
          date: opts.oneDayDate,
        });
      }
      break;
  }
}

/** Aplica el ajuste a la rutina y lo marca como aplicado en el análisis del coach. */
export function applyAdjustment(adj: Adjustment): void {
  applyToRoutine(adj);
  useCoachStore.getState().resolveAdjustment(adj.id, 'applied');
}

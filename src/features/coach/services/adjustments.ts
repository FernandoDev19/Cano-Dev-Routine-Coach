import { useRoutineStore } from '@/features/routine';
import { useCoachStore } from '../store';
import type { Adjustment } from '../types';

/**
 * Aplica un ajuste a la rutina y lo marca como aplicado. Las notificaciones se reprograman
 * solas porque la capa de app observa las tareas.
 */
export function applyAdjustment(adj: Adjustment): void {
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
      if (task) routine.archiveTask(task.id);
      break;
    case 'add':
      if (adj.newTitle) {
        routine.addTask({
          title: adj.newTitle,
          category: adj.category ?? 'devops',
          place: adj.newPlace ?? 'home',
          reminder: adj.newReminder ?? null,
        });
      }
      break;
  }

  useCoachStore.getState().resolveAdjustment(adj.id, 'applied');
}

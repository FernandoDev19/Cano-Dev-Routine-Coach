import type { Task } from '@/features/routine';
import type { Adjustment } from '../types';

export const ADJUSTMENT_ICON = {
  shrink: 'contract',
  move_outside: 'leaf',
  move_home: 'home',
  reschedule: 'alarm',
  add: 'add-circle',
  archive: 'remove-circle',
} as const;

export function describeAdjustment(adj: Adjustment, tasks: Task[]): string {
  const task = adj.taskId ? tasks.find((t) => t.id === adj.taskId) : undefined;
  const name = task ? `«${task.title}»` : 'la tarea';

  switch (adj.kind) {
    case 'shrink':
      return `Achicar ${name} → «${adj.newTitle}»`;
    case 'move_outside':
      return `Hacer ${name} en la calle`;
    case 'move_home':
      return `Hacer ${name} en casa`;
    case 'reschedule':
      return `Mover el recordatorio de ${name} a las ${adj.newReminder}`;
    case 'add':
      return `Nueva tarea: «${adj.newTitle}»`;
    case 'archive':
      return `Quitar ${name} de tu rutina`;
  }
}

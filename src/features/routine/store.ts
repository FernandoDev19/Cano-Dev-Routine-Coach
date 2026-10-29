import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uid } from '@/shared/lib/id';
import { toDateKey } from '@/shared/lib/date';
import { zustandStorage } from '@/shared/lib/storage';
import { DEFAULT_TASKS } from './constants';
import type { EntriesByDay, Entry, NewTask, Place, Task, TaskPatch } from './types';

type RoutineState = {
  tasks: Task[];
  entries: EntriesByDay;

  addTask: (input: NewTask) => string;
  updateTask: (id: string, patch: TaskPatch) => void;
  archiveTask: (id: string) => void;

  markDone: (taskId: string, place: Place, dateKey?: string) => void;
  markSkipped: (taskId: string, reason: string, why?: string, dateKey?: string) => void;
  clearEntry: (taskId: string, dateKey?: string) => void;
  setEntryPlace: (taskId: string, place: Place, dateKey?: string) => void;
  setEntryWhy: (taskId: string, why: string, dateKey: string) => void;

  reset: () => void;
};

function seedTasks(): Task[] {
  const now = Date.now();
  return DEFAULT_TASKS.map((t, i) => ({ ...t, id: `seed-${i + 1}`, createdAt: now }));
}

function withEntry(entries: EntriesByDay, dateKey: string, taskId: string, entry: Entry | null): EntriesByDay {
  const day = { ...(entries[dateKey] ?? {}) };
  if (entry) day[taskId] = entry;
  else delete day[taskId];
  return { ...entries, [dateKey]: day };
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set) => ({
      tasks: seedTasks(),
      entries: {},

      addTask: (input) => {
        const id = uid();
        set((s) => ({ tasks: [...s.tasks, { ...input, id, createdAt: Date.now() }] }));
        return id;
      },

      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

      archiveTask: (id) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, archivedAt: Date.now() } : t)) })),

      markDone: (taskId, place, dateKey = toDateKey()) =>
        set((s) => ({
          entries: withEntry(s.entries, dateKey, taskId, { status: 'done', place, at: Date.now() }),
        })),

      markSkipped: (taskId, reason, why, dateKey = toDateKey()) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          return {
            entries: withEntry(s.entries, dateKey, taskId, {
              status: 'skipped',
              place: task?.place ?? 'home',
              reason,
              why: why?.trim() ? why.trim() : undefined,
              at: Date.now(),
            }),
          };
        }),

      clearEntry: (taskId, dateKey = toDateKey()) =>
        set((s) => ({ entries: withEntry(s.entries, dateKey, taskId, null) })),

      setEntryPlace: (taskId, place, dateKey = toDateKey()) =>
        set((s) => {
          const current = s.entries[dateKey]?.[taskId];
          if (!current) return s;
          // Si cambia el lugar, la explicación anterior ya no aplica.
          return { entries: withEntry(s.entries, dateKey, taskId, { ...current, place, why: undefined }) };
        }),

      setEntryWhy: (taskId, why, dateKey) =>
        set((s) => {
          const current = s.entries[dateKey]?.[taskId];
          if (!current) return s;
          return { entries: withEntry(s.entries, dateKey, taskId, { ...current, why: why.trim() || undefined }) };
        }),

      reset: () => set({ tasks: seedTasks(), entries: {} }),
    }),
    {
      name: 'routine-v1',
      storage: zustandStorage,
      partialize: (s) => ({ tasks: s.tasks, entries: s.entries }),
    },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@/shared/lib/storage';

export type NotificationPrefs = {
  /** Interruptor general. */
  enabled: boolean;
  /** Recordatorios de cada tarea a su hora. */
  taskReminders: boolean;
  morningNudge: boolean;
  morningTime: string; // HH:mm
  eveningCheckin: boolean;
  eveningTime: string; // HH:mm
};

type State = NotificationPrefs & {
  set: (patch: Partial<NotificationPrefs>) => void;
  reset: () => void;
};

const DEFAULTS: NotificationPrefs = {
  enabled: false,
  taskReminders: true,
  morningNudge: true,
  morningTime: '08:00',
  eveningCheckin: true,
  eveningTime: '21:00',
};

export const useNotificationPrefs = create<State>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (patch) => set(patch),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'notification-prefs-v1',
      storage: zustandStorage,
      partialize: (s) => ({
        enabled: s.enabled,
        taskReminders: s.taskReminders,
        morningNudge: s.morningNudge,
        morningTime: s.morningTime,
        eveningCheckin: s.eveningCheckin,
        eveningTime: s.eveningTime,
      }),
    },
  ),
);

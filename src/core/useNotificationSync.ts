import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useCoachStore } from '@/features/coach';
import { configureNotifications, rescheduleAll, useNotificationPrefs } from '@/features/notifications';
import { useRoutineStore } from '@/features/routine';

configureNotifications();

/**
 * Mantiene las notificaciones locales en sintonía con tareas, preferencias y el
 * "empujón" más reciente del coach; y navega cuando el usuario toca un aviso.
 *
 * `ready` evita actuar con el estado inicial antes de que los stores se hidraten
 * (reprogramar entonces cancelaría los avisos ya guardados).
 */
export function useNotificationSync(ready: boolean): void {
  const router = useRouter();
  const tasks = useRoutineStore((s) => s.tasks);
  const prefs = useNotificationPrefs();
  const nudge = useCoachStore((s) => s.analysis?.nudge);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      rescheduleAll({
        tasks: tasks.filter((t) => !t.archivedAt),
        prefs: {
          enabled: prefs.enabled,
          taskReminders: prefs.taskReminders,
          morningNudge: prefs.morningNudge,
          morningTime: prefs.morningTime,
          eveningCheckin: prefs.eveningCheckin,
          eveningTime: prefs.eveningTime,
        },
        nudge,
      }).catch(() => {
        /* las notificaciones son best-effort */
      });
    }, 400); // debounce: ediciones rápidas = una sola reprogramación
    return () => clearTimeout(timer);
  }, [
    ready,
    tasks,
    nudge,
    prefs.enabled,
    prefs.taskReminders,
    prefs.morningNudge,
    prefs.morningTime,
    prefs.eveningCheckin,
    prefs.eveningTime,
  ]);

  // Cubre tanto el arranque en frío desde una notificación como los toques con la app abierta.
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!ready) return;
    const route = lastResponse?.notification.request.content.data?.route;
    if (typeof route === 'string') router.push(route as never);
  }, [ready, lastResponse, router]);
}

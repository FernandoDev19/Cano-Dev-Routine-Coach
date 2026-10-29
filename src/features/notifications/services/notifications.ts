import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { parseHHmm } from '@/shared/lib/date';
import type { Task } from '@/features/routine';
import type { NotificationPrefs } from '../store';

export const CHANNEL_ID = 'routine';
const supported = Platform.OS !== 'web';

/** Llamar una vez al arrancar la app. */
export function configureNotifications(): void {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Rutina y coach',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** Pide permiso si hace falta. Devuelve true si quedó concedido. */
export async function requestPermission(): Promise<boolean> {
  if (!supported) return false;
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function hasPermission(): Promise<boolean> {
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  return current.granted;
}

export type ScheduleInput = {
  tasks: Task[]; // solo vigentes
  prefs: NotificationPrefs;
  /** Frase corta del coach para el aviso de la mañana (opcional). */
  nudge?: string | null;
};

const MORNING_FALLBACKS = [
  'Arranca con 5 minutos: abre la terminal, un comando y ya ganaste.',
  'Primero 10 min afuera, después al código. Tu cabeza te lo agradece.',
  'Una cosa pequeña hoy vale más que un plan perfecto mañana.',
];

async function scheduleDaily(
  hhmm: string,
  content: { title: string; body: string; route: string },
): Promise<void> {
  const t = parseHHmm(hhmm);
  if (!t) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: content.title, body: content.body, data: { route: content.route } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: t.hour,
      minute: t.minute,
      channelId: CHANNEL_ID,
    },
  });
}

/**
 * Reprograma todo desde cero (cancela lo anterior). Es barato y evita avisos duplicados
 * o huérfanos cuando cambian tareas, horas o el consejo del coach.
 */
export async function rescheduleAll({ tasks, prefs, nudge }: ScheduleInput): Promise<void> {
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!prefs.enabled) return;
  if (!(await hasPermission())) return;
  await ensureChannel();

  if (prefs.taskReminders) {
    for (const task of tasks) {
      if (!task.reminder) continue;
      await scheduleDaily(task.reminder, {
        title: task.place === 'outside' ? '🌳 Toca salir un rato' : '⏰ Tu mini-rutina',
        body: task.title,
        route: '/',
      });
    }
  }

  if (prefs.morningNudge) {
    const body = nudge?.trim() || MORNING_FALLBACKS[new Date().getDate() % MORNING_FALLBACKS.length];
    await scheduleDaily(prefs.morningTime, { title: '☀️ Buenos días, dev', body, route: '/' });
  }

  if (prefs.eveningCheckin) {
    await scheduleDaily(prefs.eveningTime, {
      title: '🌙 ¿Cómo te fue hoy?',
      body: 'Haz tu check-in de 1 minuto y el coach ajusta tu rutina de mañana.',
      route: '/checkin',
    });
  }
}

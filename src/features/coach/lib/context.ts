import type { Checkin } from '@/features/checkin';
import type { EntriesByDay, Place, Task } from '@/features/routine';
import { isScheduledOn, summarizeDay, type DaySummary } from '@/features/routine';
import { computeStats, type Stats } from '@/features/insights';
import type { QA } from '../types';

export type CoachInput = {
  today: string;
  tasks: { id: string; title: string; category: string; place: Place; reminder: string | null }[];
  todayEntries: {
    taskId: string;
    title: string;
    status: 'done' | 'skipped' | 'pending';
    place: Place;
    plannedPlace: Place;
    reason?: string;
    why?: string;
  }[];
  todaySummary: DaySummary;
  energyToday?: number;
  noteToday?: string;
  stats: Pick<Stats, 'windowDays' | 'streak' | 'place' | 'tasks' | 'reasons' | 'energy' | 'totalEntries'>;
  answers: { question: string; answer: string }[];
  /** Tareas que el usuario quitó de su rutina (últimas 8) y por qué: no volver a proponerlas. */
  archived: { title: string; reason?: string; note?: string }[];
};

type Source = {
  tasks: Task[]; // todas (incluye archivadas, para el historial)
  entries: EntriesByDay;
  checkins: Record<string, Checkin>;
  qa: QA[];
  today: string;
};

/** Resume el estado actual en un objeto compacto que consumen el motor local y Gemini. */
export function buildCoachInput({ tasks, entries, checkins, qa, today }: Source): CoachInput {
  const active = tasks.filter((t) => !t.archivedAt && isScheduledOn(t, today));
  const dayEntries = entries[today];
  const stats = computeStats({ tasks, entries, checkins, today, windowDays: 14 });
  const checkin = checkins[today];

  return {
    today,
    tasks: active.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      place: t.place,
      reminder: t.reminder,
    })),
    todayEntries: active.map((t) => {
      const e = dayEntries?.[t.id];
      return {
        taskId: t.id,
        title: t.title,
        status: e?.status ?? 'pending',
        place: e?.place ?? t.place,
        plannedPlace: t.place,
        reason: e?.reason,
        why: e?.why,
      };
    }),
    todaySummary: summarizeDay(active, dayEntries, today),
    energyToday: checkin?.energy,
    noteToday: checkin?.note || undefined,
    stats: {
      windowDays: stats.windowDays,
      streak: stats.streak,
      place: stats.place,
      tasks: stats.tasks,
      reasons: stats.reasons,
      energy: stats.energy,
      totalEntries: stats.totalEntries,
    },
    answers: qa
      .filter((q) => q.answer)
      .slice(-8)
      .map((q) => ({ question: q.question, answer: q.answer as string })),
    archived: tasks
      .filter((t) => t.archivedAt && !t.date)
      .sort((a, b) => (a.archivedAt ?? 0) - (b.archivedAt ?? 0))
      .slice(-8)
      .map((t) => ({ title: t.title, reason: t.archiveReason, note: t.archiveNote })),
  };
}

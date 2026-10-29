import { lastNDays } from '@/shared/lib/date';
import { computeStreak, summarizeDay, type DaySummary, type EntriesByDay, type Place, type Task } from '@/features/routine';
import type { Checkin } from '@/features/checkin';

export type PlaceStat = {
  done: number;
  skipped: number;
  /** 0–1, o null si no hay datos. */
  rate: number | null;
};

export type TaskStat = {
  taskId: string;
  title: string;
  plannedPlace: Place;
  done: number;
  skipped: number;
  /** 0–1 sobre (hechas + omitidas). */
  skipRate: number;
  doneAtHome: number;
  doneOutside: number;
  topReason?: string;
};

export type ReasonCount = { reason: string; count: number };

export type EnergyStats = {
  avg: number | null;
  avgOnGoodDays: number | null;
  avgOnBadDays: number | null;
};

export type Stats = {
  windowDays: number;
  days: DaySummary[];
  streak: number;
  place: Record<Place, PlaceStat>;
  tasks: TaskStat[];
  reasons: ReasonCount[];
  energy: EnergyStats;
  /** Entradas totales registradas en la ventana (hechas + omitidas). */
  totalEntries: number;
};

type Input = {
  tasks: Task[];
  entries: EntriesByDay;
  checkins: Record<string, Checkin>;
  today: string;
  windowDays?: number;
};

function rate(done: number, skipped: number): number | null {
  const n = done + skipped;
  return n > 0 ? done / n : null;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function computeStats({ tasks, entries, checkins, today, windowDays = 14 }: Input): Stats {
  const dates = lastNDays(windowDays, today);
  const days = dates.map((d) => summarizeDay(tasks, entries[d], d));

  const place: Record<Place, { done: number; skipped: number }> = {
    home: { done: 0, skipped: 0 },
    outside: { done: 0, skipped: 0 },
  };
  const byTask = new Map<string, TaskStat & { reasons: Map<string, number> }>();
  const reasonTotals = new Map<string, number>();
  let totalEntries = 0;

  const taskById = new Map(tasks.map((t) => [t.id, t]));

  for (const date of dates) {
    const day = entries[date];
    if (!day) continue;
    for (const [taskId, entry] of Object.entries(day)) {
      const task = taskById.get(taskId);
      if (!task) continue;
      totalEntries += 1;

      const stat =
        byTask.get(taskId) ??
        ({
          taskId,
          title: task.title,
          plannedPlace: task.place,
          done: 0,
          skipped: 0,
          skipRate: 0,
          doneAtHome: 0,
          doneOutside: 0,
          reasons: new Map<string, number>(),
        } satisfies TaskStat & { reasons: Map<string, number> });

      if (entry.status === 'done') {
        stat.done += 1;
        place[entry.place].done += 1;
        if (entry.place === 'home') stat.doneAtHome += 1;
        else stat.doneOutside += 1;
      } else {
        stat.skipped += 1;
        place[entry.place].skipped += 1;
        if (entry.reason) {
          stat.reasons.set(entry.reason, (stat.reasons.get(entry.reason) ?? 0) + 1);
          reasonTotals.set(entry.reason, (reasonTotals.get(entry.reason) ?? 0) + 1);
        }
      }
      byTask.set(taskId, stat);
    }
  }

  const taskStats: TaskStat[] = [...byTask.values()].map(({ reasons, ...s }) => {
    const top = [...reasons.entries()].sort((a, b) => b[1] - a[1])[0];
    return { ...s, skipRate: s.done + s.skipped > 0 ? s.skipped / (s.done + s.skipped) : 0, topReason: top?.[0] };
  });

  const reasonList: ReasonCount[] = [...reasonTotals.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  // Energía vs. días buenos (>= 60 %) y flojos (< 60 %).
  const energies: number[] = [];
  const good: number[] = [];
  const bad: number[] = [];
  for (const d of days) {
    const c = checkins[d.date];
    if (!c) continue;
    energies.push(c.energy);
    if (d.total === 0) continue;
    (d.pct >= 60 ? good : bad).push(c.energy);
  }

  return {
    windowDays,
    days,
    streak: computeStreak(entries, today),
    place: {
      home: { ...place.home, rate: rate(place.home.done, place.home.skipped) },
      outside: { ...place.outside, rate: rate(place.outside.done, place.outside.skipped) },
    },
    tasks: taskStats,
    reasons: reasonList,
    energy: { avg: mean(energies), avgOnGoodDays: mean(good), avgOnBadDays: mean(bad) },
    totalEntries,
  };
}

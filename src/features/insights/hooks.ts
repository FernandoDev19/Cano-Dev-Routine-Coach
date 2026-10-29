import { useMemo } from 'react';
import { useToday } from '@/shared/hooks/useToday';
import { useRoutineStore } from '@/features/routine';
import { useCheckinStore } from '@/features/checkin';
import { computeStats, type Stats } from './lib/stats';

/** Estadísticas de los últimos `windowDays` días, recalculadas cuando cambian los datos. */
export function useStats(windowDays = 14): Stats {
  const today = useToday();
  const allTasks = useRoutineStore((s) => s.tasks);
  const entries = useRoutineStore((s) => s.entries);
  const checkins = useCheckinStore((s) => s.checkins);

  return useMemo(
    () => computeStats({ tasks: allTasks, entries, checkins, today, windowDays }),
    [allTasks, entries, checkins, today, windowDays],
  );
}

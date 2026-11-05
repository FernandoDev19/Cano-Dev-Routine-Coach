import { useCheckinStore } from '@/features/checkin';
import { useCoachStore } from '@/features/coach';
import { useGoalsStore } from '@/features/goals';
import { useJournalStore } from '@/features/journal';
import { useRoutineStore } from '@/features/routine';

/** Composición de la capa de app: borra los datos de cada feature. */
export function resetAllData(): void {
  useRoutineStore.getState().reset();
  useCheckinStore.getState().reset();
  useCoachStore.getState().reset();
  useJournalStore.getState().reset();
  useGoalsStore.getState().reset();
}

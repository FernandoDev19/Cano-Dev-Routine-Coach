import { toDateKey } from '@/shared/lib/date';
import { useCheckinStore } from '@/features/checkin';
import { useRoutineStore } from '@/features/routine';
import { remoteKey, useSettingsStore } from '@/features/settings';
import { buildCoachInput } from '../lib/context';
import { useCoachStore } from '../store';
import { runAnalysis } from './analyze';

/**
 * Corre el análisis del coach con el estado actual y lo guarda. Sirve tanto para el botón
 * "Analizar" como para dispararlo solo (p. ej. al cerrar el día). Nunca lanza.
 */
export async function runCoachNow(): Promise<void> {
  // Se lee el estado en el momento de llamar, no el de un render anterior.
  const routine = useRoutineStore.getState();
  const { apiKey, model, aiConsent } = useSettingsStore.getState();
  const input = buildCoachInput({
    tasks: routine.tasks,
    entries: routine.entries,
    checkins: useCheckinStore.getState().checkins,
    qa: useCoachStore.getState().qa,
    today: toDateKey(),
  });
  const result = await runAnalysis(input, routine.tasks, { apiKey: remoteKey(apiKey, aiConsent), model });
  useCoachStore.getState().setAnalysis(result);
}

import { isWeekend, mondayOf, toDateKey } from '@/shared/lib/date';
import { runToll, useGoalsStore } from '@/features/goals';
import { useJournalStore } from '@/features/journal';
import { useSettingsStore } from '@/features/settings';

/**
 * Composición de la capa de app: junta el peaje, los ajustes de IA y el diario.
 *
 * El diario sigue leyendo "el objetivo de hoy" de su propio store. Para no tener dos fuentes
 * que se contradigan, el peaje es la única fuente de verdad y aquí se refleja en una sola
 * dirección (peaje → diario). Se refleja el peaje ya procesado, nunca el borrador crudo.
 */

/** Convierte el borrador en el peaje de hoy y lo guarda. No hace nada en fin de semana. Nunca lanza. */
export async function submitToll(draft: string): Promise<void> {
  const clean = draft.trim();
  const dateKey = toDateKey();
  if (!clean || isWeekend(dateKey)) return;
  if (useGoalsStore.getState().generating) return;

  useGoalsStore.getState().setGenerating(true);
  try {
    const { apiKey, model, aiConsent } = useSettingsStore.getState();
    // La meta semanal solo viaja como contexto interno para el análisis; nunca se muestra.
    const weekGoal = useGoalsStore.getState().weeks[mondayOf(dateKey)]?.text;
    const result = await runToll({ draft: clean, weekGoal }, { apiKey, model, consent: aiConsent });

    useGoalsStore.getState().saveToll({
      dateKey,
      draft: clean,
      toll: result.toll,
      level: result.level,
      aligned: result.aligned,
      source: result.source,
      fallbackNote: result.fallbackNote,
    });
    if (useGoalsStore.getState().tolls[dateKey]?.status === 'pending') {
      useJournalStore.getState().setGoal(dateKey, result.toll);
    }
  } finally {
    useGoalsStore.getState().setGenerating(false);
  }
}

/** Marca el peaje de hoy como pagado y lo refleja en el diario. */
export function payToll(): void {
  const dateKey = toDateKey();
  useGoalsStore.getState().markTollPaid(dateKey);
  if (useGoalsStore.getState().tolls[dateKey]?.status === 'paid') {
    useJournalStore.getState().setGoalAchieved(dateKey, true);
  }
}

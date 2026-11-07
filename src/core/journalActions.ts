import { toDateKey } from '@/shared/lib/date';
import { useCheckinStore } from '@/features/checkin';
import { buildCoachInput, runCoachNow, useCoachStore } from '@/features/coach';
import { generateDiary, useJournalStore } from '@/features/journal';
import { useRoutineStore } from '@/features/routine';
import { remoteKey, useSettingsStore } from '@/features/settings';

/** Composición de la capa de app: junta rutina, check-in, coach y diario. */

function coachInputNow() {
  return buildCoachInput({
    tasks: useRoutineStore.getState().tasks,
    entries: useRoutineStore.getState().entries,
    checkins: useCheckinStore.getState().checkins,
    qa: useCoachStore.getState().qa,
    today: toDateKey(),
  });
}

/** Redacta el diario de hoy. Con `keepEdited` no pisa lo que el usuario ya editó a mano. Nunca lanza. */
export async function writeTodayDiary({ keepEdited }: { keepEdited: boolean }): Promise<void> {
  const journal = useJournalStore.getState();
  const today = toDateKey();
  if (journal.writing) return;
  if (keepEdited && journal.diary[today]?.edited) return;

  journal.setWriting(true);
  try {
    const { apiKey, model, aiConsent } = useSettingsStore.getState();
    const draft = await generateDiary(coachInputNow(), today, journal.goals[today], {
      apiKey: remoteKey(apiKey, aiConsent),
      model,
    });
    useJournalStore.getState().setDiaryGenerated(today, draft.text, draft.source);
  } finally {
    useJournalStore.getState().setWriting(false);
  }
}

/**
 * Se llama justo después de guardar el check-out: escribe el diario del día y, salvo que la pantalla
 * del coach ya vaya a analizar (`runCoach: false`), corre el análisis del coach sin esperar al usuario.
 */
export async function closeDay({ runCoach }: { runCoach: boolean }): Promise<void> {
  await Promise.allSettled([writeTodayDiary({ keepEdited: true }), runCoach ? runCoachNow() : Promise.resolve()]);
}

import { toDateKey } from '@/shared/lib/date';
import { useCheckinStore } from '@/features/checkin';
import { applyToRoutine, buildCoachInput, runCoachNow, useCoachStore, type Adjustment } from '@/features/coach';
import { generateDiary, planGoal, useJournalStore } from '@/features/journal';
import { useRoutineStore } from '@/features/routine';
import { useSettingsStore } from '@/features/settings';

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

/** Guarda el objetivo de hoy y, si `adapt`, pide a la IA cómo encaja con la mini-rutina. Nunca lanza. */
export async function setTodayGoal(text: string, adapt: boolean): Promise<void> {
  const journal = useJournalStore.getState();
  const today = toDateKey();
  journal.setGoal(today, text);
  if (!adapt || journal.planning) return;

  journal.setPlanning(true);
  try {
    const { apiKey, model } = useSettingsStore.getState();
    const plan = await planGoal(text, coachInputNow(), useRoutineStore.getState().tasks, { apiKey, model });
    // Si mientras tanto cambió el objetivo, este plan ya no corresponde.
    if (useJournalStore.getState().goals[today]?.text === text.trim()) {
      useJournalStore.getState().setGoalPlan(today, plan);
    }
  } finally {
    useJournalStore.getState().setPlanning(false);
  }
}

/** Aplica una adaptación del objetivo como tarea de un solo día (no toca la rutina de fondo). */
export function applyGoalAdjustment(adjustment: Adjustment): void {
  const today = toDateKey();
  applyToRoutine(adjustment, { oneDayDate: today });
  useJournalStore.getState().resolveGoalAdjustment(today, adjustment.id, 'applied');
}

/** Redacta el diario de hoy. Con `keepEdited` no pisa lo que el usuario ya editó a mano. Nunca lanza. */
export async function writeTodayDiary({ keepEdited }: { keepEdited: boolean }): Promise<void> {
  const journal = useJournalStore.getState();
  const today = toDateKey();
  if (journal.writing) return;
  if (keepEdited && journal.diary[today]?.edited) return;

  journal.setWriting(true);
  try {
    const { apiKey, model } = useSettingsStore.getState();
    const draft = await generateDiary(coachInputNow(), today, journal.goals[today], { apiKey, model });
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

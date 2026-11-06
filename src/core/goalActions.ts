import { monthKeyOf, toDateKey } from '@/shared/lib/date';
import { runGoalReview, useGoalsStore, type GoalKind, type GoalReviewResult } from '@/features/goals';
import { useSettingsStore } from '@/features/settings';

/** Composición de la capa de app: junta las metas con los ajustes de IA. */

/**
 * Revisa una meta del mes o de la semana (viabilidad, medible; la semana se reduce si es grande).
 * Con la semana, la meta del mes viaja como contexto interno. Nunca lanza.
 */
export function reviewGoal(kind: GoalKind, text: string): Promise<GoalReviewResult> {
  const { apiKey, model, aiConsent } = useSettingsStore.getState();
  const monthGoal =
    kind === 'week' ? useGoalsStore.getState().months[monthKeyOf(toDateKey())]?.text : undefined;
  return runGoalReview({ kind, text, monthGoal }, { apiKey, model, consent: aiConsent });
}

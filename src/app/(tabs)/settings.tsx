import { mondayOf, monthKeyOf } from '@/shared/lib/date';
import { useToday } from '@/shared/hooks/useToday';
import { GoalSetupSheet, GoalsCard, useGoalSetup, useGoalsStore } from '@/features/goals';
import { SettingsScreen, needsConsentPrompt, useSettingsStore } from '@/features/settings';
import { reviewGoal } from '@/core/goalActions';
import { resetAllData } from '@/core/resetAll';

export default function SettingsRoute() {
  const today = useToday();
  // Sin aviso automático: aquí las metas solo se editan a mano.
  const setup = useGoalSetup(today, null);

  const monthGoal = useGoalsStore((s) => s.months[monthKeyOf(today)]);
  const weekGoal = useGoalsStore((s) => s.weeks[mondayOf(today)]);
  const apiKey = useSettingsStore((s) => s.apiKey);
  const aiConsent = useSettingsStore((s) => s.aiConsent);
  const setAiConsent = useSettingsStore((s) => s.setAiConsent);

  return (
    <>
      <SettingsScreen onResetAll={resetAllData} extra={<GoalsCard today={today} onEdit={setup.openFor} />} />
      <GoalSetupSheet
        kind={setup.open}
        initial={setup.open === 'month' ? monthGoal?.text : weekGoal?.text}
        askConsent={needsConsentPrompt(apiKey, aiConsent)}
        onConsent={(granted) => setAiConsent(granted ? 'granted' : 'denied')}
        onReview={reviewGoal}
        onSave={setup.save}
        onClose={setup.close}
      />
    </>
  );
}

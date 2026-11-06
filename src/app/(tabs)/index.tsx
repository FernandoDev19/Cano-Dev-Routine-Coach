import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mondayOf, monthKeyOf } from '@/shared/lib/date';
import { useToday } from '@/shared/hooks/useToday';
import { usePendingQuestionCount } from '@/features/coach';
import {
  GoalSetupSheet,
  RestDayCard,
  SetupChip,
  TollCard,
  resolveDayContext,
  useGoalSetup,
  useGoalsStore,
} from '@/features/goals';
import { CheckoutBanner } from '@/features/journal';
import { TodayScreen } from '@/features/routine';
import { needsConsentPrompt, useSettingsStore } from '@/features/settings';
import { reviewGoal } from '@/core/goalActions';
import { payToll, submitToll } from '@/core/tollActions';

export default function TodayRoute() {
  const router = useRouter();
  const pending = usePendingQuestionCount();
  const today = useToday();

  const monthGoal = useGoalsStore((s) => s.months[monthKeyOf(today)]);
  const weekGoal = useGoalsStore((s) => s.weeks[mondayOf(today)]);
  const apiKey = useSettingsStore((s) => s.apiKey);
  const aiConsent = useSettingsStore((s) => s.aiConsent);
  const setAiConsent = useSettingsStore((s) => s.setAiConsent);

  const { mode, setup } = resolveDayContext(today, monthGoal, weekGoal);
  const goalSetup = useGoalSetup(today, setup);
  const askConsent = needsConsentPrompt(apiKey, aiConsent);
  const onConsent = (granted: boolean) => setAiConsent(granted ? 'granted' : 'denied');

  return (
    <>
      <TodayScreen
        onOpenCheckin={() => router.push('/checkin')}
        top={
          mode === 'rest' ? (
            <RestDayCard />
          ) : (
            <>
              <TollCard
                dateKey={today}
                askConsent={askConsent}
                onConsent={onConsent}
                onSubmit={(draft) => {
                  submitToll(draft).catch(() => {});
                }}
                onPay={payToll}
              />
              {setup && goalSetup.open === null ? (
                <SetupChip kind={setup} onPress={() => goalSetup.openFor(setup)} />
              ) : null}
            </>
          )
        }
        banner={
          <>
            <CheckoutBanner onPress={() => router.push('/checkin')} />
            {pending > 0 ? (
              <Pressable
                onPress={() => router.navigate('/coach')}
                className="mb-4 flex-row items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3"
              >
                <Ionicons name="chatbubble-ellipses" size={16} color="#fbbf24" />
                <Text className="flex-1 text-xs text-amber-200">
                  El coach tiene {pending} pregunta{pending === 1 ? '' : 's'} para ti sobre tu día.
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#fbbf24" />
              </Pressable>
            ) : null}
          </>
        }
      />
      <GoalSetupSheet
        kind={goalSetup.open}
        initial={goalSetup.open === 'month' ? monthGoal?.text : weekGoal?.text}
        askConsent={askConsent}
        onConsent={onConsent}
        onReview={reviewGoal}
        onSave={goalSetup.save}
        onClose={goalSetup.close}
      />
    </>
  );
}

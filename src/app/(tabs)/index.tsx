import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mondayOf, monthKeyOf } from '@/shared/lib/date';
import { useToday } from '@/shared/hooks/useToday';
import { usePendingQuestionCount } from '@/features/coach';
import { RestDayCard, TollCard, resolveDayContext, useGoalsStore } from '@/features/goals';
import { CheckoutBanner } from '@/features/journal';
import { TodayScreen } from '@/features/routine';
import { needsConsentPrompt, useSettingsStore } from '@/features/settings';
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

  const { mode } = resolveDayContext(today, monthGoal, weekGoal);

  return (
    <TodayScreen
      onOpenCheckin={() => router.push('/checkin')}
      top={
        mode === 'rest' ? (
          <RestDayCard />
        ) : (
          <TollCard
            dateKey={today}
            askConsent={needsConsentPrompt(apiKey, aiConsent)}
            onConsent={(granted) => setAiConsent(granted ? 'granted' : 'denied')}
            onSubmit={(draft) => {
              submitToll(draft).catch(() => {});
            }}
            onPay={payToll}
          />
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
  );
}

import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePendingQuestionCount } from '@/features/coach';
import { CheckoutBanner, DailyGoalCard } from '@/features/journal';
import { TodayScreen } from '@/features/routine';
import { applyGoalAdjustment, setTodayGoal } from '@/core/journalActions';

export default function TodayRoute() {
  const router = useRouter();
  const pending = usePendingQuestionCount();

  return (
    <TodayScreen
      onOpenCheckin={() => router.push('/checkin')}
      banner={
        <>
          <DailyGoalCard
            onSetGoal={(text, adapt) => {
              setTodayGoal(text, adapt).catch(() => {});
            }}
            onApply={applyGoalAdjustment}
          />
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

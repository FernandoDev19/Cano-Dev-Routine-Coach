import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, SectionTitle } from '@/shared/ui/primitives';
import { useToday } from '@/shared/hooks/useToday';
import { AdjustmentCard, describeAdjustment, type Adjustment } from '@/features/coach';
import { useRoutineStore } from '@/features/routine';
import { useJournalHydrated } from '../hooks';
import { useJournalStore } from '../store';
import { GoalSheet } from './GoalSheet';

type Props = {
  /** Guarda el objetivo y, si `adapt`, pide a la IA el plan del día. Lo implementa la capa de app. */
  onSetGoal: (text: string, adapt: boolean) => void;
  onApply: (adjustment: Adjustment) => void;
};

/** "Objetivo de hoy": se abre solo la primera vez que entras cada día. */
export function DailyGoalCard({ onSetGoal, onApply }: Props) {
  const today = useToday();
  const hydrated = useJournalHydrated();
  const goal = useJournalStore((s) => s.goals[today]);
  const planning = useJournalStore((s) => s.planning);
  const lastPrompt = useJournalStore((s) => s.lastGoalPromptDate);
  const { markGoalPrompted, setGoalAchieved, resolveGoalAdjustment } = useJournalStore.getState();
  const tasks = useRoutineStore((s) => s.tasks);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hydrated || lastPrompt === today) return;
    markGoalPrompted(today);
    if (!goal) setOpen(true);
  }, [hydrated, lastPrompt, today, goal, markGoalPrompted]);

  const sheet = (
    <GoalSheet
      visible={open}
      initial={goal?.text}
      onClose={() => setOpen(false)}
      onSubmit={(text, adapt) => {
        setOpen(false);
        onSetGoal(text, adapt);
      }}
    />
  );

  if (!goal) {
    return (
      <>
        <Pressable
          onPress={() => setOpen(true)}
          className="mb-4 flex-row items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3"
        >
          <Ionicons name="flag" size={16} color="#34d399" />
          <Text className="flex-1 text-xs text-emerald-200">Define tu objetivo de hoy y adapto tu mini-rutina.</Text>
          <Ionicons name="chevron-forward" size={14} color="#34d399" />
        </Pressable>
        {sheet}
      </>
    );
  }

  const plan = goal.plan;

  return (
    <>
      <Card className="mb-4 border-emerald-500/20">
        <View className="mb-2 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <SectionTitle icon="flag">Objetivo de hoy</SectionTitle>
          </View>
          <Pressable onPress={() => setOpen(true)} hitSlop={8}>
            <Text className="text-xs font-semibold text-emerald-300">Cambiar</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setGoalAchieved(today, !goal.achieved)}
          className="flex-row items-start gap-2.5"
        >
          <Ionicons
            name={goal.achieved ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={goal.achieved ? '#34d399' : '#64748b'}
          />
          <Text className={`flex-1 text-sm leading-5 ${goal.achieved ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
            {goal.text}
          </Text>
        </Pressable>

        {planning ? (
          <Text className="mt-3 text-xs text-slate-400">Adaptando tu día…</Text>
        ) : plan ? (
          <View className="mt-3 gap-2">
            <Text className="text-xs leading-5 text-slate-300">{plan.message}</Text>
            {plan.fallbackNote ? <Text className="text-[11px] text-amber-300">{plan.fallbackNote}</Text> : null}
            {plan.adjustments.map((a) => (
              <AdjustmentCard
                key={a.id}
                adjustment={a}
                description={`${describeAdjustment(a, tasks)} (solo hoy)`}
                onApply={() => onApply(a)}
                onDismiss={() => resolveGoalAdjustment(today, a.id, 'dismissed')}
              />
            ))}
          </View>
        ) : (
          <View className="mt-3 flex-row">
            <Button label="Adaptar mi día" icon="sparkles" variant="ghost" small onPress={() => onSetGoal(goal.text, true)} />
          </View>
        )}
      </Card>
      {sheet}
    </>
  );
}

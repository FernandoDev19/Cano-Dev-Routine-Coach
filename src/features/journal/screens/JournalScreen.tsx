import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/shared/ui/Screen';
import { Sheet } from '@/shared/ui/Sheet';
import { Button, Card, EmptyHint } from '@/shared/ui/primitives';
import { formatLongDate } from '@/shared/lib/date';
import { useToday } from '@/shared/hooks/useToday';
import { useCheckinStore } from '@/features/checkin';
import { useJournalStore } from '../store';

type Props = {
  /** Pide a la IA (re)escribir el diario de hoy. Lo implementa la capa de app. */
  onGenerateToday: () => void;
  onOpenCheckout: () => void;
};

const SOURCE_LABEL = { gemini: 'Escrito por la IA', local: 'Borrador automático', manual: 'Escrito por ti' } as const;

export function JournalScreen({ onGenerateToday, onOpenCheckout }: Props) {
  const today = useToday();
  const goals = useJournalStore((s) => s.goals);
  const diary = useJournalStore((s) => s.diary);
  const writing = useJournalStore((s) => s.writing);
  const editDiary = useJournalStore((s) => s.editDiary);
  const checkedOutToday = useCheckinStore((s) => !!s.checkins[today]);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  // Hoy siempre aparece primero (aunque aún no haya nada); luego los días con objetivo o diario.
  const keys = useMemo(() => {
    const all = new Set([...Object.keys(goals), ...Object.keys(diary)]);
    all.delete(today);
    return [today, ...[...all].sort().reverse()];
  }, [goals, diary, today]);

  const openEdit = (key: string) => {
    setDraft(diary[key]?.text ?? '');
    setEditingKey(key);
  };

  const regenerate = () => {
    const run = () => onGenerateToday();
    if (diary[today]?.edited) {
      Alert.alert('¿Reescribir tu diario de hoy?', 'Perderás los cambios que hiciste a mano.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reescribir', style: 'destructive', onPress: run },
      ]);
    } else {
      run();
    }
  };

  return (
    <Screen title="Diario" subtitle="La historia de tus días, escrita por ti y tu coach">
      {keys.map((key) => {
        const entry = diary[key];
        const goal = goals[key];
        const isToday = key === today;

        if (!entry && !goal && !isToday) return null;

        return (
          <Card key={key} className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="flex-1 pr-2 text-sm font-bold capitalize text-slate-50">
                {isToday ? 'Hoy · ' : ''}
                {formatLongDate(key)}
              </Text>
              {entry ? (
                <Pressable onPress={() => openEdit(key)} hitSlop={8} className="flex-row items-center gap-1">
                  <Ionicons name="create-outline" size={14} color="#34d399" />
                  <Text className="text-xs font-semibold text-emerald-300">Editar</Text>
                </Pressable>
              ) : null}
            </View>

            {goal ? (
              <View className="mb-3 flex-row items-start gap-2 rounded-lg bg-slate-800/60 p-2.5">
                <Ionicons
                  name={goal.achieved ? 'checkmark-circle' : 'flag-outline'}
                  size={16}
                  color={goal.achieved ? '#34d399' : '#94a3b8'}
                />
                <Text className="flex-1 text-xs text-slate-300">
                  Objetivo: {goal.text}
                  {goal.achieved ? ' · logrado' : ''}
                </Text>
              </View>
            ) : null}

            {entry ? (
              <>
                <Text className="text-sm leading-6 text-slate-100">{entry.text}</Text>
                <Text className="mt-2 text-[11px] text-slate-500">
                  {entry.edited ? 'Editado por ti' : SOURCE_LABEL[entry.source]}
                </Text>
              </>
            ) : isToday ? (
              <Text className="text-xs leading-5 text-slate-400">
                {checkedOutToday
                  ? 'Tu diario de hoy aún no está escrito.'
                  : 'Tu diario de hoy se escribe cuando haces el check-out del día.'}
              </Text>
            ) : (
              <Text className="text-xs text-slate-500">Ese día no hiciste check-out, así que no hay diario.</Text>
            )}

            {isToday ? (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {!checkedOutToday ? (
                  <Button label="Hacer check-out" icon="moon-outline" small onPress={onOpenCheckout} />
                ) : null}
                <Button
                  label={entry ? 'Reescribir con IA' : 'Escribir borrador ahora'}
                  icon="sparkles"
                  variant="ghost"
                  small
                  loading={writing}
                  onPress={regenerate}
                />
              </View>
            ) : null}
          </Card>
        );
      })}

      {keys.length === 1 && !diary[today] && !goals[today] ? (
        <EmptyHint>Cada noche, al cerrar el día, aquí queda tu historia.</EmptyHint>
      ) : null}

      <Sheet visible={!!editingKey} title="Editar diario" onClose={() => setEditingKey(null)}>
        {editingKey ? (
          <Text className="mb-2 text-xs capitalize text-slate-400">{formatLongDate(editingKey)}</Text>
        ) : null}
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          textAlignVertical="top"
          maxLength={4000}
          className="mb-4 min-h-[200px] rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm leading-6 text-slate-100"
        />
        <Button
          label="Guardar cambios"
          icon="checkmark"
          disabled={!draft.trim()}
          onPress={() => {
            if (editingKey) editDiary(editingKey, draft);
            setEditingKey(null);
          }}
        />
      </Sheet>
    </Screen>
  );
}

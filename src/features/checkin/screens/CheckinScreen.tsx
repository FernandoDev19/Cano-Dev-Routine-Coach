import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { Button, Card, SectionTitle } from '@/shared/ui/primitives';
import { useToday } from '@/shared/hooks/useToday';
import { useCheckinStore } from '../store';

const ENERGY_LEVELS = [
  { value: 1, emoji: '😴', label: 'Agotado' },
  { value: 2, emoji: '😕', label: 'Bajo' },
  { value: 3, emoji: '🙂', label: 'Normal' },
  { value: 4, emoji: '😄', label: 'Bien' },
  { value: 5, emoji: '🔥', label: 'A tope' },
];

type Props = {
  /** La capa de app decide qué hacer después (cerrar, abrir el coach, etc.). */
  onDone: (opts: { analyze: boolean }) => void;
};

export function CheckinScreen({ onDone }: Props) {
  const today = useToday();
  const existing = useCheckinStore((s) => s.checkins[today]);
  const save = useCheckinStore((s) => s.save);

  const [energy, setEnergy] = useState(existing?.energy ?? 3);
  const [note, setNote] = useState(existing?.note ?? '');

  const submit = (analyze: boolean) => {
    save(today, energy, note);
    onDone({ analyze });
  };

  return (
    <Screen title="Check-out del día" subtitle="Cierra tu día: de aquí sale tu diario y el análisis del coach">
      <Card className="mb-4">
        <SectionTitle icon="battery-half" hint="¿Cómo estuvo tu energía o ánimo hoy?">
          Energía
        </SectionTitle>
        <View className="flex-row justify-between">
          {ENERGY_LEVELS.map((l) => {
            const on = energy === l.value;
            return (
              <Pressable
                key={l.value}
                onPress={() => setEnergy(l.value)}
                className={`w-[18%] items-center rounded-xl border py-3 ${
                  on ? 'border-emerald-500/60 bg-emerald-500/15' : 'border-slate-700 bg-slate-800'
                }`}
              >
                <Text className="text-2xl">{l.emoji}</Text>
                <Text className={`mt-1 text-[10px] font-medium ${on ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {l.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card className="mb-5">
        <SectionTitle icon="chatbubble-ellipses-outline" hint="¿Qué te dio flojera o te distrajo hoy?">
          Obstáculos
        </SectionTitle>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Ej: Me quedé viendo videos en la cama y me dio pereza abrir Docker…"
          placeholderTextColor="#64748b"
          textAlignVertical="top"
          className="min-h-[96px] rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
        />
      </Card>

      <View className="gap-3">
        <Button label="Cerrar el día y ver al coach" icon="sparkles" onPress={() => submit(true)} />
        <Button label="Cerrar el día" variant="ghost" onPress={() => submit(false)} />
      </View>
    </Screen>
  );
}

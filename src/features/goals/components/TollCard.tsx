import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, SectionTitle } from '@/shared/ui/primitives';
import { ConsentSheet } from '@/features/settings';
import { tollStreak } from '../lib/streak';
import { useGoalsStore } from '../store';

type Props = {
  dateKey: string;
  /** true si falta decidir el consentimiento y hay API key (lo calcula la capa de app). */
  askConsent: boolean;
  onConsent: (granted: boolean) => void;
  /** Convierte el borrador en el peaje del día. Lo implementa la capa de app. */
  onSubmit: (draft: string) => void;
  onPay: () => void;
};

function StreakBadge({ days }: { days: number }) {
  if (days <= 0) return null;
  return (
    <View className="mb-2 flex-row items-center gap-1.5">
      <Ionicons name="flame" size={16} color="#f59e0b" />
      <Text className="text-xs font-semibold text-amber-300">
        {days} {days === 1 ? 'día hábil seguido' : 'días hábiles seguidos'}
      </Text>
    </View>
  );
}

/** El peaje del día: borrador → "Mínimo Ridículo" → pagado. No muestra la meta del mes ni de la semana. */
export function TollCard({ dateKey, askConsent, onConsent, onSubmit, onPay }: Props) {
  const toll = useGoalsStore((s) => s.tolls[dateKey]);
  const generating = useGoalsStore((s) => s.generating);
  const streak = useGoalsStore((s) => tollStreak(s.tolls, dateKey));

  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  const send = (text: string) => {
    setEditing(false);
    setDraft('');
    onSubmit(text);
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || generating) return;
    if (askConsent) {
      setConsentOpen(true);
      return;
    }
    send(text);
  };

  const consentSheet = (
    <ConsentSheet
      visible={consentOpen}
      onDismiss={() => {
        setConsentOpen(false);
        send(draft.trim());
      }}
      onChoose={(granted) => {
        onConsent(granted);
        setConsentOpen(false);
        send(draft.trim());
      }}
    />
  );

  if (toll?.status === 'paid') {
    return (
      <Card className="mb-4 border-emerald-500/40 bg-emerald-500/10">
        <View className="flex-row items-center gap-2">
          <Ionicons name="checkmark-circle" size={22} color="#34d399" />
          <Text className="text-base font-bold text-emerald-300">Peaje pagado</Text>
        </View>
        <View className="mt-1">
          <StreakBadge days={streak} />
        </View>
        <Text className="mt-2 text-sm leading-5 text-slate-300 line-through">{toll.toll}</Text>
        <Text className="mt-3 text-sm leading-5 text-slate-100">
          Ya cumpliste. El resto del día es tiempo muerto, libre de culpa: juega, descansa, desconéctate.
        </Text>
      </Card>
    );
  }

  if (toll && !editing) {
    const biological = toll.level === 'biological';
    return (
      <Card className={`mb-4 ${biological ? 'border-amber-500/30' : 'border-emerald-500/30'}`}>
        <StreakBadge days={streak} />
        <SectionTitle
          icon={biological ? 'heart' : 'flag'}
          hint={biological ? 'Hoy basta con esto para no romper la racha.' : 'Menos de 15 minutos. Solo esto.'}
        >
          {biological ? 'Mínimo biológico' : 'Tu peaje de hoy'}
        </SectionTitle>
        <Text className="mb-4 text-base font-semibold leading-6 text-slate-50">{toll.toll}</Text>
        {toll.fallbackNote ? <Text className="mb-3 text-[11px] text-amber-300">{toll.fallbackNote}</Text> : null}
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Button label="Ya lo hice" icon="checkmark" onPress={onPay} />
          </View>
          <Button
            label="Cambiar"
            variant="ghost"
            onPress={() => {
              setDraft(toll.draft);
              setEditing(true);
            }}
          />
        </View>
        {consentSheet}
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-emerald-500/30">
      <StreakBadge days={streak} />
      <SectionTitle icon="flag" hint="Escríbelo como te salga. Yo lo convierto en algo que puedas hacer ya.">
        ¿Qué quieres lograr hoy?
      </SectionTitle>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Ej: buscar formas de ganar plata"
        placeholderTextColor="#64748b"
        multiline
        maxLength={300}
        editable={!generating}
        className="mb-3 min-h-[72px] rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
        textAlignVertical="top"
      />
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <Button
            label="Armar mi peaje"
            icon="sparkles"
            loading={generating}
            disabled={!draft.trim()}
            onPress={submit}
          />
        </View>
        {editing ? <Button label="Cancelar" variant="ghost" onPress={() => setEditing(false)} /> : null}
      </View>
      {consentSheet}
    </Card>
  );
}

import { Text, View } from 'react-native';
import { mondayOf, monthKeyOf } from '@/shared/lib/date';
import { Button, Card, SectionTitle } from '@/shared/ui/primitives';
import { useGoalsStore } from '../store';
import type { GoalKind } from '../types';

type Props = {
  today: string;
  onEdit: (kind: GoalKind) => void;
};

/** Metas vigentes del mes y de la semana. Se ven aquí (Ajustes) y no en Hoy, para no saturar. */
export function GoalsCard({ today, onEdit }: Props) {
  const month = useGoalsStore((s) => s.months[monthKeyOf(today)]);
  const week = useGoalsStore((s) => s.weeks[mondayOf(today)]);

  const row = (kind: GoalKind, label: string, text: string | undefined) => (
    <View className="mb-3 flex-row items-start justify-between gap-3">
      <View className="flex-1">
        <Text className="text-[11px] font-medium text-slate-400">{label}</Text>
        <Text className={`mt-0.5 text-sm leading-5 ${text ? 'text-slate-100' : 'text-slate-500'}`}>
          {text ?? 'Sin definir'}
        </Text>
      </View>
      <Button label={text ? 'Editar' : 'Definir'} variant="ghost" small onPress={() => onEdit(kind)} />
    </View>
  );

  return (
    <Card className="mb-4">
      <SectionTitle icon="flag" hint="El mes propone, la semana filtra y el día ejecuta.">
        Metas
      </SectionTitle>
      {row('month', 'Este mes', month?.text)}
      {row('week', 'Esta semana', week?.text)}
    </Card>
  );
}

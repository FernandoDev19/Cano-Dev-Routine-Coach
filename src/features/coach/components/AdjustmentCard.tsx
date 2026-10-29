import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/shared/ui/primitives';
import { ADJUSTMENT_ICON } from '../lib/describe';
import type { Adjustment } from '../types';

type Props = {
  adjustment: Adjustment;
  description: string;
  onApply: () => void;
  onDismiss: () => void;
};

export function AdjustmentCard({ adjustment, description, onApply, onDismiss }: Props) {
  const pending = adjustment.status === 'pending';
  const applied = adjustment.status === 'applied';

  return (
    <View
      className={`rounded-xl border p-3.5 ${
        applied ? 'border-emerald-500/30 bg-emerald-950/30' : 'border-slate-800 bg-slate-900'
      } ${adjustment.status === 'dismissed' ? 'opacity-50' : ''}`}
    >
      <View className="mb-1 flex-row gap-2">
        <Ionicons name={ADJUSTMENT_ICON[adjustment.kind]} size={16} color={applied ? '#34d399' : '#fbbf24'} />
        <Text className="flex-1 text-sm font-medium text-slate-100">{description}</Text>
      </View>
      {adjustment.reason ? <Text className="mb-2 ml-6 text-xs text-slate-400">{adjustment.reason}</Text> : null}

      {pending ? (
        <View className="mt-1 flex-row justify-end gap-2">
          <Button label="Descartar" variant="ghost" small onPress={onDismiss} />
          <Button label="Aplicar" icon="checkmark" small onPress={onApply} />
        </View>
      ) : (
        <Text className={`ml-6 text-[11px] font-semibold ${applied ? 'text-emerald-400' : 'text-slate-500'}`}>
          {applied ? 'Aplicado a tu rutina' : 'Descartado'}
        </Text>
      )}
    </View>
  );
}

import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shiftHHmm } from '@/shared/lib/date';

type Props = {
  value: string; // "HH:mm"
  onChange: (next: string) => void;
  step?: number; // minutos
};

/** Selector de hora con botones − / + (sin dependencias nativas). */
export function TimeStepper({ value, onChange, step = 30 }: Props) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        onPress={() => onChange(shiftHHmm(value, -step))}
        className="h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800"
      >
        <Ionicons name="remove" size={16} color="#e2e8f0" />
      </Pressable>
      <Text className="w-14 text-center text-base font-bold text-emerald-300">{value}</Text>
      <Pressable
        onPress={() => onChange(shiftHHmm(value, step))}
        className="h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800"
      >
        <Ionicons name="add" size={16} color="#e2e8f0" />
      </Pressable>
    </View>
  );
}

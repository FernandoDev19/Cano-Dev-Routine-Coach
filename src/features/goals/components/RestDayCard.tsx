import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/shared/ui/primitives';

/** Sábado y domingo: sin peaje. El descanso es sagrado. */
export function RestDayCard() {
  return (
    <Card className="mb-4 border-cyan-500/30 bg-cyan-500/10">
      <View className="flex-row items-center gap-2">
        <Ionicons name="moon" size={20} color="#22d3ee" />
        <Text className="text-base font-bold text-cyan-200">Fin de semana</Text>
      </View>
      <Text className="mt-2 text-sm leading-5 text-slate-200">
        Hoy no hay peaje. Descansa, juega, recocha: es sagrado y no se negocia.
      </Text>
    </Card>
  );
}

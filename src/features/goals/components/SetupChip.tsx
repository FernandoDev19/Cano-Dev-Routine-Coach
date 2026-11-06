import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GoalKind } from '../types';

const LABEL: Record<GoalKind, string> = {
  month: 'Falta tu meta del mes. Define una (30 segundos).',
  week: 'Falta tu meta de la semana. Define una (30 segundos).',
};

/** Aviso discreto y no bloqueante: el peaje del día siempre va primero. */
export function SetupChip({ kind, onPress }: { kind: GoalKind; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 flex-row items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 p-3"
    >
      <Ionicons name="flag-outline" size={16} color="#94a3b8" />
      <Text className="flex-1 text-xs text-slate-300">{LABEL[kind]}</Text>
      <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
    </Pressable>
  );
}

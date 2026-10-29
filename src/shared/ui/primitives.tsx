import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <View className={`rounded-2xl border border-slate-800 bg-slate-900 p-4 ${className}`}>{children}</View>
  );
}

export function SectionTitle({
  icon,
  children,
  hint,
}: {
  icon?: IconName;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <View className="mb-3">
      <View className="flex-row items-center gap-2">
        {icon ? <Ionicons name={icon} size={16} color="#34d399" /> : null}
        <Text className="text-base font-semibold text-slate-100">{children}</Text>
      </View>
      {hint ? <Text className="mt-0.5 text-xs text-slate-400">{hint}</Text> : null}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'ghost' | 'danger' | 'warn';
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
};

const VARIANTS = {
  primary: { box: 'bg-emerald-500', text: 'text-slate-950', icon: '#020617' },
  warn: { box: 'bg-amber-500', text: 'text-slate-950', icon: '#020617' },
  ghost: { box: 'border border-slate-700 bg-slate-800', text: 'text-slate-200', icon: '#e2e8f0' },
  danger: { box: 'border border-rose-500/40 bg-rose-500/10', text: 'text-rose-300', icon: '#fda4af' },
} as const;

export function Button({ label, onPress, icon, variant = 'primary', loading, disabled, small }: ButtonProps) {
  const v = VARIANTS[variant];
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      className={`flex-row items-center justify-center gap-2 rounded-xl ${small ? 'px-3 py-2' : 'px-4 py-3'} ${v.box} ${off ? 'opacity-50' : 'active:opacity-80'}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.icon} />
      ) : icon ? (
        <Ionicons name={icon} size={small ? 14 : 16} color={v.icon} />
      ) : null}
      <Text className={`font-semibold ${small ? 'text-xs' : 'text-sm'} ${v.text}`}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${
        selected ? 'border-emerald-500/60 bg-emerald-500/15' : 'border-slate-700 bg-slate-800'
      }`}
    >
      {icon ? <Ionicons name={icon} size={12} color={selected ? '#34d399' : '#94a3b8'} /> : null}
      <Text className={`text-xs font-medium ${selected ? 'text-emerald-300' : 'text-slate-300'}`}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color = 'bg-emerald-400' }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
      <View className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </View>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <Text className="py-3 text-center text-xs text-slate-500">{children}</Text>;
}

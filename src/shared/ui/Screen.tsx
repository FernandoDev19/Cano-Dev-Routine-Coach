import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, title, subtitle, right, scroll = true }: Props) {
  const header = title ? (
    <View className="mb-4 flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-2xl font-extrabold text-slate-50">{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-xs capitalize text-slate-400">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  ) : null;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-950">
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10 pt-3"
          keyboardShouldPersistTaps="handled"
        >
          {header}
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-4 pt-3">
          {header}
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

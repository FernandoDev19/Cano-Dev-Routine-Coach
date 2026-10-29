import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Modal tipo "bottom sheet" simple, sin dependencias nativas extra. */
export function Sheet({ visible, title, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-slate-950/70" onPress={onClose} />
        <View className="max-h-[88%] rounded-t-3xl border border-slate-700 bg-slate-900 px-5 pb-8 pt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="flex-1 pr-3 text-base font-bold text-slate-50">{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text className="text-sm text-slate-400">Cerrar</Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

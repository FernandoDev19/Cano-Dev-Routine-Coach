import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button } from '@/shared/ui/primitives';
import { Sheet } from '@/shared/ui/Sheet';

type Props = {
  visible: boolean;
  initial?: string;
  onClose: () => void;
  /** `adapt`: pedirle a la IA que adapte la mini-rutina de hoy a este objetivo. */
  onSubmit: (text: string, adapt: boolean) => void;
};

export function GoalSheet({ visible, initial, onClose, onSubmit }: Props) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (visible) setText(initial ?? '');
  }, [visible, initial]);

  const clean = text.trim();

  return (
    <Sheet visible={visible} title="¿Cuál es tu objetivo de hoy?" onClose={onClose}>
      <Text className="mb-3 text-xs text-slate-400">
        Una sola cosa que, si la logras, hará que el día valga la pena. Puedo adaptar tu mini-rutina para ayudarte a llegar.
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Ej: Dejar corriendo el pipeline de CI en el proyecto nuevo"
        placeholderTextColor="#64748b"
        multiline
        autoFocus
        textAlignVertical="top"
        maxLength={160}
        className="mb-4 min-h-[84px] rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
      />
      <View className="gap-3">
        <Button
          label="Guardar y adaptar mi día"
          icon="sparkles"
          disabled={!clean}
          onPress={() => onSubmit(clean, true)}
        />
        <Button label="Solo guardar" variant="ghost" disabled={!clean} onPress={() => onSubmit(clean, false)} />
      </View>
    </Sheet>
  );
}

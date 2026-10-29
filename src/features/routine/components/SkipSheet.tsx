import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Chip } from '@/shared/ui/primitives';
import { Sheet } from '@/shared/ui/Sheet';
import { OTHER_REASON, SKIP_REASONS } from '../constants';

type Props = {
  visible: boolean;
  taskTitle: string;
  onClose: () => void;
  onConfirm: (reason: string, why: string) => void;
};

export function SkipSheet({ visible, taskTitle, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState<string>(SKIP_REASONS[0]);
  const [custom, setCustom] = useState('');
  const [why, setWhy] = useState('');

  useEffect(() => {
    if (visible) {
      setReason(SKIP_REASONS[0]);
      setCustom('');
      setWhy('');
    }
  }, [visible]);

  const submit = () => {
    const finalReason = reason === OTHER_REASON ? custom.trim() || 'Sin motivo especificado' : reason;
    onConfirm(finalReason, why);
  };

  return (
    <Sheet visible={visible} title="¿Qué pasó con esta tarea?" onClose={onClose}>
      <Text className="mb-1 text-sm font-medium text-slate-200">{taskTitle}</Text>
      <Text className="mb-4 text-xs text-slate-400">
        No pasa nada por omitirla. Decir el motivo le sirve al coach para quitarte ese obstáculo.
      </Text>

      <View className="mb-4 flex-row flex-wrap gap-2">
        {[...SKIP_REASONS, OTHER_REASON].map((r) => (
          <Chip key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
        ))}
      </View>

      {reason === OTHER_REASON ? (
        <TextInput
          value={custom}
          onChangeText={setCustom}
          placeholder="Escribe tu motivo…"
          placeholderTextColor="#64748b"
          className="mb-3 rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
        />
      ) : null}

      <Text className="mb-1 text-xs font-medium text-slate-300">Cuéntame más (opcional)</Text>
      <TextInput
        value={why}
        onChangeText={setWhy}
        placeholder="¿Qué pasó exactamente? ¿Qué lo habría hecho más fácil?"
        placeholderTextColor="#64748b"
        multiline
        className="mb-5 min-h-[64px] rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
        textAlignVertical="top"
      />

      <Button label="Registrar y continuar" variant="warn" icon="checkmark-circle" onPress={submit} />
    </Sheet>
  );
}

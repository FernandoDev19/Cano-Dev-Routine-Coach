import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Chip } from '@/shared/ui/primitives';
import { Sheet } from '@/shared/ui/Sheet';
import { ARCHIVE_REASONS, OTHER_REASON } from '../constants';

type Props = {
  visible: boolean;
  taskTitle: string;
  onClose: () => void;
  onConfirm: (reason: string, note: string) => void;
};

/** Pregunta por qué se quita una tarea: el coach lo usa para entender qué no te sirve. */
export function ArchiveSheet({ visible, taskTitle, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState<string>(ARCHIVE_REASONS[0]);
  const [custom, setCustom] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setReason(ARCHIVE_REASONS[0]);
      setCustom('');
      setNote('');
    }
  }, [visible]);

  const submit = () => {
    const finalReason = reason === OTHER_REASON ? custom.trim() || 'Sin motivo especificado' : reason;
    onConfirm(finalReason, note);
  };

  return (
    <Sheet visible={visible} title="¿Por qué la quitas?" onClose={onClose}>
      <Text className="mb-1 text-sm font-medium text-slate-200">{taskTitle}</Text>
      <Text className="mb-4 text-xs text-slate-400">
        Quitar una tarea es una decisión válida. Tu motivo ayuda al coach a no volver a proponerte algo parecido.
      </Text>

      <View className="mb-4 flex-row flex-wrap gap-2">
        {[...ARCHIVE_REASONS, OTHER_REASON].map((r) => (
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
        value={note}
        onChangeText={setNote}
        placeholder="¿Qué la hacía difícil o poco útil?"
        placeholderTextColor="#64748b"
        multiline
        textAlignVertical="top"
        className="mb-5 min-h-[64px] rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
      />

      <Button label="Quitar de mi rutina" variant="danger" icon="trash-outline" onPress={submit} />
    </Sheet>
  );
}

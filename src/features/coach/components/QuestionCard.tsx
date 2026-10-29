import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/shared/ui/primitives';

type Props = {
  text: string;
  onSubmit: (answer: string) => void;
};

export function QuestionCard({ text, onSubmit }: Props) {
  const [answer, setAnswer] = useState('');

  return (
    <View className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5">
      <View className="mb-2 flex-row gap-2">
        <Ionicons name="help-circle" size={16} color="#22d3ee" />
        <Text className="flex-1 text-sm leading-5 text-slate-100">{text}</Text>
      </View>
      <TextInput
        value={answer}
        onChangeText={setAnswer}
        placeholder="Tu respuesta, sin filtro…"
        placeholderTextColor="#64748b"
        multiline
        textAlignVertical="top"
        className="mb-2 min-h-[56px] rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-100"
      />
      <View className="items-end">
        <Button
          label="Responder"
          small
          icon="send"
          disabled={!answer.trim()}
          onPress={() => {
            onSubmit(answer);
            setAnswer('');
          }}
        />
      </View>
    </View>
  );
}

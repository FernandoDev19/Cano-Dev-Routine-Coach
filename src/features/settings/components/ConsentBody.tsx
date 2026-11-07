import { Text, View } from 'react-native';
import { Button } from '@/shared/ui/primitives';

type Props = {
  onChoose: (granted: boolean) => void;
  /** Si se pasa, aparece "Ahora no": resuelve esta vez en el teléfono y vuelve a preguntar después. */
  onLater?: () => void;
};

/** Contenido de la pregunta de consentimiento (se usa en una hoja propia o dentro de otra). */
export function ConsentBody({ onChoose, onLater }: Props) {
  return (
    <View>
      <Text className="mb-3 text-sm leading-5 text-slate-300">
        Para armar tu peaje, revisar tus metas, escribir tu diario y analizar tu rutina puedo mandar a Gemini
        (Google), con tu propia API key, lo que escribas y tu actividad: metas, tareas, check-outs y notas.
      </Text>
      <Text className="mb-3 text-sm leading-5 text-slate-300">
        En el peaje, si cuentas que estás enfermo o desmotivado, eso se resuelve en el teléfono y no sale.
      </Text>
      <Text className="mb-5 text-xs leading-5 text-slate-500">
        Si dices que no, todo se resuelve en tu teléfono sin conexión. Puedes cambiarlo cuando quieras en Ajustes.
      </Text>
      <View className="gap-3">
        <Button label="Permitir" icon="shield-checkmark" onPress={() => onChoose(true)} />
        <Button label="Solo en mi teléfono" icon="phone-portrait" variant="ghost" onPress={() => onChoose(false)} />
        {onLater ? <Button label="Ahora no" variant="ghost" onPress={onLater} /> : null}
      </View>
    </View>
  );
}

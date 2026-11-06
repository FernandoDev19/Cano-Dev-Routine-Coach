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
        Para armar tu peaje y revisar tus metas puedo mandar a Gemini (Google), con tu propia API key, lo que escribas
        aquí. Para el peaje y la revisión de la semana también viaja tu meta del mes o de la semana como contexto.
        Nada más.
      </Text>
      <Text className="mb-3 text-sm leading-5 text-slate-300">
        Si cuentas que estás enfermo o desmotivado, eso nunca sale del teléfono: en esos días el peaje se arma
        localmente.
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

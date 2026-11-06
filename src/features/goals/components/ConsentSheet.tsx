import { Text, View } from 'react-native';
import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/primitives';

type Props = {
  visible: boolean;
  /** Cerrar sin decidir: esta vez se resuelve en el teléfono y se vuelve a preguntar la próxima. */
  onDismiss: () => void;
  onChoose: (granted: boolean) => void;
};

/** Pregunta explícita de la primera vez: ¿puede el texto del usuario salir hacia Gemini? */
export function ConsentSheet({ visible, onDismiss, onChoose }: Props) {
  return (
    <Sheet visible={visible} title="¿Dejo que Gemini te ayude con el peaje?" onClose={onDismiss}>
      <Text className="mb-3 text-sm leading-5 text-slate-300">
        Para armar tu peaje puedo mandar a Gemini (Google), con tu propia API key, lo que escribas aquí y, si la
        tienes, tu meta de la semana. Nada más.
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
      </View>
    </Sheet>
  );
}

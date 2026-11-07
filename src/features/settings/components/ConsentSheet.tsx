import { Sheet } from '@/shared/ui/Sheet';
import { ConsentBody } from './ConsentBody';

type Props = {
  visible: boolean;
  /** Cerrar sin decidir: esta vez se resuelve en el teléfono y se vuelve a preguntar la próxima. */
  onDismiss: () => void;
  onChoose: (granted: boolean) => void;
};

/** Pregunta explícita de la primera vez: ¿puede el texto del usuario salir hacia Gemini? */
export function ConsentSheet({ visible, onDismiss, onChoose }: Props) {
  return (
    <Sheet visible={visible} title="¿Dejo que Gemini te ayude?" onClose={onDismiss}>
      <ConsentBody onChoose={onChoose} />
    </Sheet>
  );
}

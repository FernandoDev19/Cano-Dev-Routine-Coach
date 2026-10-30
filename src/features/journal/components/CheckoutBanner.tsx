import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCheckoutDue } from '../hooks';

/** Recordatorio dentro de la app: ya pasó la hora del check-out y hoy no lo has hecho. */
export function CheckoutBanner({ onPress }: { onPress: () => void }) {
  const due = useCheckoutDue();
  if (!due) return null;

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 flex-row items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-3"
    >
      <Ionicons name="moon" size={16} color="#a5b4fc" />
      <Text className="flex-1 text-xs text-indigo-200">
        Cierra tu día: haz el check-out y escribo tu diario de hoy.
      </Text>
      <Ionicons name="chevron-forward" size={14} color="#a5b4fc" />
    </Pressable>
  );
}

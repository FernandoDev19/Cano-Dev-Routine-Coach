import { useLocalSearchParams } from 'expo-router';
import { CoachScreen } from '@/features/coach';

export default function CoachRoute() {
  const { run } = useLocalSearchParams<{ run?: string }>();
  return <CoachScreen autoRunKey={run} />;
}

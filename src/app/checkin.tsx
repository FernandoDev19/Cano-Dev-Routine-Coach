import { useRouter } from 'expo-router';
import { CheckinScreen } from '@/features/checkin';

export default function CheckinRoute() {
  const router = useRouter();

  return (
    <CheckinScreen
      onDone={({ analyze }) => {
        if (router.canDismiss()) router.dismiss();
        // `run` cambia en cada envío para que el coach vuelva a analizar.
        if (analyze) router.navigate({ pathname: '/coach', params: { run: String(Date.now()) } });
      }}
    />
  );
}

import { useRouter } from 'expo-router';
import { CheckinScreen } from '@/features/checkin';
import { closeDay } from '@/core/journalActions';

export default function CheckinRoute() {
  const router = useRouter();

  return (
    <CheckinScreen
      onDone={({ analyze }) => {
        // Escribe el diario (y, si no vamos al coach, también lo analiza) sin bloquear al usuario.
        closeDay({ runCoach: !analyze }).catch(() => {
          /* best-effort: el usuario puede reintentar desde el Diario o el Coach */
        });
        if (router.canDismiss()) router.dismiss();
        // `run` cambia en cada envío para que el coach vuelva a analizar.
        if (analyze) router.navigate({ pathname: '/coach', params: { run: String(Date.now()) } });
      }}
    />
  );
}

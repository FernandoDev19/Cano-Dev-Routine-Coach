import { useEffect, useState } from 'react';
import { formatHHmm } from '@/shared/lib/date';
import { useToday } from '@/shared/hooks/useToday';
import { useCheckinStore } from '@/features/checkin';
import { useNotificationPrefs } from '@/features/notifications';
import { useJournalStore } from './store';

/** true cuando el store del diario ya leyó lo guardado (para no actuar con el estado inicial vacío). */
export function useJournalHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useJournalStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useJournalStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useJournalStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}

function nowHHmm(): string {
  const d = new Date();
  return formatHHmm(d.getHours(), d.getMinutes());
}

/** true cuando ya pasó la hora del check-in nocturno y hoy todavía no se hizo. */
export function useCheckoutDue(): boolean {
  const today = useToday();
  const eveningTime = useNotificationPrefs((s) => s.eveningTime);
  const hasCheckin = useCheckinStore((s) => !!s.checkins[today]);
  const [now, setNow] = useState(nowHHmm);

  useEffect(() => {
    const timer = setInterval(() => setNow(nowHHmm()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return !hasCheckin && now >= eveningTime;
}

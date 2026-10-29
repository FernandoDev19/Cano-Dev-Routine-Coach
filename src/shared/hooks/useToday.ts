import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { toDateKey } from '@/shared/lib/date';

/** Fecha de hoy (YYYY-MM-DD) que se refresca al volver a la app o pasada la medianoche. */
export function useToday(): string {
  const [today, setToday] = useState(() => toDateKey());

  useEffect(() => {
    const refresh = () => setToday(toDateKey());
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    const timer = setInterval(refresh, 60_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);

  return today;
}

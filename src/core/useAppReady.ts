import { useEffect, useState } from 'react';
import { useCheckinStore } from '@/features/checkin';
import { useCoachStore } from '@/features/coach';
import { useNotificationPrefs } from '@/features/notifications';
import { useRoutineStore } from '@/features/routine';
import { useSettingsStore } from '@/features/settings';

const persistedStores = [useRoutineStore, useCheckinStore, useCoachStore, useNotificationPrefs, useSettingsStore];

/** true cuando todos los stores persistidos terminaron de hidratarse y la API key está cargada. */
export function useAppReady(): boolean {
  const [hydrated, setHydrated] = useState(() => persistedStores.every((s) => s.persist.hasHydrated()));
  const keyLoaded = useSettingsStore((s) => s.keyLoaded);

  useEffect(() => {
    const check = () => setHydrated(persistedStores.every((s) => s.persist.hasHydrated()));
    const unsubs = persistedStores.map((s) => s.persist.onFinishHydration(check));
    check();
    useSettingsStore.getState().loadApiKey();
    return () => unsubs.forEach((u) => u());
  }, []);

  return hydrated && keyLoaded;
}

import { useRef, useState, type ReactNode } from 'react';
import { ConsentSheet } from '../components/ConsentSheet';
import { needsConsentPrompt } from '../lib/consent';
import { useSettingsStore } from '../store';

/**
 * Portero para acciones explícitas que pueden mandar texto a Gemini (analizar, escribir el diario).
 * Si falta decidir el consentimiento y hay API key, pregunta primero; después ejecuta la acción.
 * Cerrar la pregunta sin decidir no manda nada: la acción corre y resuelve en el teléfono.
 */
export function useConsentGate(): { gate: (run: () => void) => void; sheet: ReactNode } {
  const [open, setOpen] = useState(false);
  const pending = useRef<(() => void) | null>(null);

  const finish = () => {
    setOpen(false);
    const run = pending.current;
    pending.current = null;
    run?.();
  };

  const gate = (run: () => void) => {
    const { apiKey, aiConsent } = useSettingsStore.getState();
    if (needsConsentPrompt(apiKey, aiConsent)) {
      pending.current = run;
      setOpen(true);
    } else {
      run();
    }
  };

  const sheet = (
    <ConsentSheet
      visible={open}
      onDismiss={finish}
      onChoose={(granted) => {
        useSettingsStore.getState().setAiConsent(granted ? 'granted' : 'denied');
        finish();
      }}
    />
  );

  return { gate, sheet };
}

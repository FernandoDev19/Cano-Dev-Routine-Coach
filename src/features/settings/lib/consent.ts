/** Decisión del usuario sobre enviar sus textos a Gemini. `unknown` = aún no se le ha preguntado. */
export type AiConsent = 'unknown' | 'granted' | 'denied';

/** Solo se manda texto del usuario a Gemini si hay clave propia Y consentimiento explícito. */
export function remoteAllowed(apiKey: string, consent: AiConsent): boolean {
  return apiKey.length > 0 && consent === 'granted';
}

/** Preguntar tiene sentido solo si hay clave (si no, nada saldría del teléfono) y falta decidir. */
export function needsConsentPrompt(apiKey: string, consent: AiConsent): boolean {
  return apiKey.length > 0 && consent === 'unknown';
}

/**
 * La API key que se le puede pasar a un servicio de IA: la real solo con consentimiento explícito;
 * si no, vacía, y el servicio resuelve en el teléfono (todos tratan la clave vacía como "sin IA").
 */
export function remoteKey(apiKey: string, consent: AiConsent): string {
  return remoteAllowed(apiKey, consent) ? apiKey : '';
}

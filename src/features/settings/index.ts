export { SettingsScreen } from './screens/SettingsScreen';
export { useSettingsStore, DEFAULT_MODEL } from './store';
export { needsConsentPrompt, remoteAllowed, remoteKey } from './lib/consent';
export type { AiConsent } from './lib/consent';
export { ConsentBody } from './components/ConsentBody';
export { ConsentSheet } from './components/ConsentSheet';
export { useConsentGate } from './hooks/useConsentGate';

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@/shared/lib/storage';

const KEY_NAME = 'gemini_api_key';
export const DEFAULT_MODEL = 'gemini-3-flash-preview';

async function readKey(): Promise<string> {
  try {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(KEY_NAME) ?? '';
    return (await SecureStore.getItemAsync(KEY_NAME)) ?? '';
  } catch {
    return '';
  }
}

async function writeKey(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (value) globalThis.localStorage?.setItem(KEY_NAME, value);
    else globalThis.localStorage?.removeItem(KEY_NAME);
    return;
  }
  if (value) await SecureStore.setItemAsync(KEY_NAME, value);
  else await SecureStore.deleteItemAsync(KEY_NAME);
}

type SettingsState = {
  model: string;
  /** Solo en memoria: la clave vive en SecureStore, nunca en AsyncStorage. */
  apiKey: string;
  keyLoaded: boolean;
  setModel: (model: string) => void;
  loadApiKey: () => Promise<void>;
  saveApiKey: (key: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      model: DEFAULT_MODEL,
      apiKey: '',
      keyLoaded: false,
      setModel: (model) => set({ model: model.trim() || DEFAULT_MODEL }),
      loadApiKey: async () => {
        const key = await readKey();
        set({ apiKey: key, keyLoaded: true });
      },
      saveApiKey: async (key) => {
        const clean = key.trim();
        await writeKey(clean);
        set({ apiKey: clean });
      },
      clearApiKey: async () => {
        await writeKey('');
        set({ apiKey: '' });
      },
    }),
    {
      name: 'settings-v1',
      storage: zustandStorage,
      partialize: (s) => ({ model: s.model }),
    },
  ),
);

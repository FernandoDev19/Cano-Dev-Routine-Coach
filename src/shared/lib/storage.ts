import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Storage JSON para los stores persistidos de zustand. */
export const zustandStorage = createJSONStorage(() => AsyncStorage);

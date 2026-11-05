import { cleanString } from '@/features/coach';
import type { TollBody, TollLevel } from '../types';

const LEVELS: TollLevel[] = ['minimum', 'biological'];

/**
 * La salida del modelo es input no confiable: se valida forma y tamaño antes de que
 * llegue a la pantalla o al store. Devuelve null si no hay un peaje utilizable.
 */
export function sanitizeToll(raw: unknown): TollBody | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;

  const toll = cleanString(r.toll, 200);
  if (!toll) return null;

  const level = LEVELS.find((l) => l === r.level);
  if (!level) return null;

  return { toll, level, aligned: typeof r.aligned === 'boolean' ? r.aligned : null };
}

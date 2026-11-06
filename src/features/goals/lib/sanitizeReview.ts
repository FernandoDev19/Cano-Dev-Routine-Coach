import { cleanString } from '@/features/coach';
import type { GoalReviewBody, ReviewVerdict } from '../types';

const VERDICTS: ReviewVerdict[] = ['ok', 'reduced', 'unclear'];

/** La respuesta del modelo es input no confiable: se valida forma y tamaño. null si no sirve. */
export function sanitizeReview(raw: unknown, original: string): GoalReviewBody | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;

  const verdict = VERDICTS.find((v) => v === r.verdict);
  const note = cleanString(r.note, 200);
  if (!verdict || !note) return null;

  const proposed = cleanString(r.text, 200);
  if (verdict === 'reduced') {
    // Una "reducción" sin texto nuevo, o idéntica a lo que escribió, no es una reducción.
    if (!proposed) return null;
    if (proposed.trim() === original.trim()) return { verdict: 'ok', text: original.trim(), note };
    return { verdict, text: proposed, note };
  }
  return { verdict, text: original.trim(), note };
}

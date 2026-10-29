import { uid } from '@/shared/lib/id';
import type { Task } from '@/features/routine';
import type { CoachInput } from '../lib/context';
import { localAnalysis } from '../lib/localCoach';
import { sanitizeAnalysis } from '../lib/sanitize';
import type { Analysis, AnalysisBody } from '../types';
import { buildPrompt, generateJson } from './gemini';

type Config = { apiKey: string; model: string };

function finalize(body: AnalysisBody, source: Analysis['source'], fallbackNote?: string): Analysis {
  return {
    ...body,
    id: uid(),
    createdAt: Date.now(),
    source,
    fallbackNote,
    adjustments: body.adjustments.map((a) => ({ ...a, id: uid(), status: 'pending' as const })),
  };
}

/** Gemini si hay API key y responde bien; si no, motor local. Nunca lanza. */
export async function runAnalysis(input: CoachInput, tasks: Task[], { apiKey, model }: Config): Promise<Analysis> {
  if (!apiKey) return finalize(localAnalysis(input), 'local');

  try {
    const raw = await generateJson(apiKey, model, buildPrompt(input));
    const body = sanitizeAnalysis(raw, tasks);
    if (!body) throw new Error('formato inesperado');
    // Si el modelo no devolvió nudge, usa el del motor local para no dejar la notificación vacía.
    if (!body.nudge) body.nudge = localAnalysis(input).nudge;
    return finalize(body, 'gemini');
  } catch (e) {
    const why = e instanceof Error ? e.message : 'error desconocido';
    return finalize(localAnalysis(input), 'local', `Gemini no respondió (${why}); usé el motor local.`);
  }
}

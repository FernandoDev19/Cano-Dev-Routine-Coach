import { formatLongDate } from '@/shared/lib/date';
import { cleanString, generateJson, type CoachInput } from '@/features/coach';
import { localDiary } from '../lib/localDiary';
import type { DayGoal } from '../types';

type Config = { apiKey: string; model: string };
export type DiaryDraft = { text: string; source: 'gemini' | 'local'; fallbackNote?: string };

function buildPrompt(input: CoachInput, dateKey: string, goal?: DayGoal): string {
  const data = {
    objetivoDeHoy: goal ? { texto: goal.text, logrado: goal.achieved } : null,
    tareas: input.todayEntries.map((e) => ({
      titulo: e.title,
      estado: e.status,
      lugar: e.place,
      lugarPlaneado: e.plannedPlace,
      motivoOmision: e.reason,
      porQue: e.why,
    })),
    energia: input.energyToday ?? null,
    notaDelUsuario: input.noteToday ?? null,
    racha: input.stats.streak,
  };

  return `Escribe la entrada de diario de hoy (${formatLongDate(dateKey)}) POR el usuario, en primera persona ("yo"), en español natural y cercano, como si él mismo la escribiera al cerrar el día.

Reglas:
- Usa solo los datos dados; no inventes hechos, emociones ni eventos que no aparezcan. Si hay poco, escribe poco.
- 2 a 3 párrafos cortos (máx. ~900 caracteres en total). Sin listas ni títulos.
- Incluye: cómo fue el día en general, qué logró (y dónde lo hizo si cambió de lugar), qué omitió y por qué con empatía (sin regaños), su objetivo del día si lo hubo, y una intención suave para mañana.
- Si la nota del usuario sugiere malestar serio, refléjalo con cuidado y sin dramatizar.

Responde SOLO con JSON: { "text": string }

Datos:
${JSON.stringify(data)}`;
}

/** Gemini si hay API key y responde bien; si no, redacción local. Nunca lanza. */
export async function generateDiary(
  input: CoachInput,
  dateKey: string,
  goal: DayGoal | undefined,
  { apiKey, model }: Config,
): Promise<DiaryDraft> {
  if (!apiKey) return { text: localDiary(input, dateKey, goal), source: 'local' };
  try {
    const raw = await generateJson(apiKey, model, buildPrompt(input, dateKey, goal));
    const text = cleanString(typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>).text : undefined, 2000);
    if (!text) throw new Error('formato inesperado');
    return { text, source: 'gemini' };
  } catch (e) {
    const why = e instanceof Error ? e.message : 'error desconocido';
    return {
      text: localDiary(input, dateKey, goal),
      source: 'local',
      fallbackNote: `Gemini no respondió (${why}); lo redacté con el motor local.`,
    };
  }
}

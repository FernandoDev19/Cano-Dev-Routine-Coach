import { uid } from '@/shared/lib/id';
import { cleanString, generateJson, sanitizeAdjustments, type CoachInput } from '@/features/coach';
import type { Task } from '@/features/routine';
import type { GoalPlan } from '../types';

type Config = { apiKey: string; model: string };

function buildPrompt(goal: string, input: CoachInput): string {
  return `Eres un coach de productividad: directo, cálido y concreto, en español, tono cercano. Hablas en segunda persona ("tú").

El usuario acaba de decir su OBJETIVO DE HOY. Dime cómo encaja con su mini-rutina de hoy y, solo si de verdad hace falta, propón tareas EXTRA pequeñas solo para hoy que lo acerquen al objetivo.

Reglas:
- Usa solo los datos dados; no inventes hechos.
- "message": 2 frases máximo. Dile por dónde empezar y qué tareas de la rutina de hoy ya aportan al objetivo. Si su energía reciente es baja, sé realista y propón menos.
- "adjustments": 0 a 2 elementos, todos con kind "add" (tarea nueva solo para hoy, de 5–20 minutos). No propongas lo que ya está en "tasks". No propongas nada parecido a lo de "archived" (lo quitó a propósito).
- No hagas diagnósticos médicos ni psicológicos.

Formato exacto de salida (JSON):
{
  "message": string,
  "adjustments": [
    { "kind": "add", "newTitle": string, "category": "devops" | "job" | "health" | "mindset", "newPlace": "home" | "outside", "reason": string }
  ]
}

Objetivo de hoy: ${JSON.stringify(goal)}

Datos:
${JSON.stringify({
  tasksToday: input.tasks.map((t) => ({ title: t.title, category: t.category, place: t.place })),
  streak: input.stats.streak,
  energy: input.stats.energy,
  archived: input.archived,
})}`;
}

function toPlan(
  message: string,
  adjustments: ReturnType<typeof sanitizeAdjustments>,
  source: GoalPlan['source'],
  fallbackNote?: string,
): GoalPlan {
  return {
    message,
    source,
    fallbackNote,
    // Solo "add" y sin recordatorio: son tareas de un solo día, no cambian la rutina de fondo.
    adjustments: adjustments
      .filter((a) => a.kind === 'add')
      .slice(0, 2)
      .map((a) => ({ ...a, newReminder: undefined, id: uid(), status: 'pending' as const })),
  };
}

function localPlan(goal: string, input: CoachInput): GoalPlan {
  const n = input.tasks.length;
  const short = goal.length > 60 ? `${goal.slice(0, 57)}…` : goal;
  const message =
    n > 0
      ? `Objetivo anotado: «${short}». Tienes ${n} tarea${n === 1 ? '' : 's'} en tu mini-rutina de hoy; haz primero un paso pequeño del objetivo y deja el resto para después.`
      : `Objetivo anotado: «${short}». Hoy no tienes tareas en tu mini-rutina; un primer paso pequeño ya cuenta.`;
  return toPlan(
    message,
    [{ kind: 'add', newTitle: `Primer paso (10 min): ${short}`, category: 'job', newPlace: 'home', reason: 'Un arranque corto baja la fricción.' }],
    'local',
  );
}

/** Gemini si hay API key y responde bien; si no, motor local. Nunca lanza. */
export async function planGoal(goal: string, input: CoachInput, tasks: Task[], { apiKey, model }: Config): Promise<GoalPlan> {
  if (!apiKey) return localPlan(goal, input);
  try {
    const raw = await generateJson(apiKey, model, buildPrompt(goal, input));
    const r = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
    const message = cleanString(r.message, 400);
    if (!message) throw new Error('formato inesperado');
    return toPlan(message, sanitizeAdjustments(r.adjustments, tasks, 2), 'gemini');
  } catch (e) {
    const why = e instanceof Error ? e.message : 'error desconocido';
    return { ...localPlan(goal, input), fallbackNote: `Gemini no respondió (${why}); usé el motor local.` };
  }
}

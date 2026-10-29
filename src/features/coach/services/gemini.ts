import type { CoachInput } from '../lib/context';

const TIMEOUT_MS = 30_000;

export function buildPrompt(input: CoachInput): string {
  return `Eres un coach de productividad y DevOps: directo, empático y motivador, en español, tono cercano (mentor sin rodeos, puedes usar un toque costeño amigable). Hablas en segunda persona ("tú").

Te paso los datos reales del usuario (JSON). Analízalos y responde SOLO con un JSON válido.

Qué debes hacer:
1. Diagnosticar en 2 frases qué lo frenó o qué le está funcionando (reconocimiento realista, sin regaños).
2. Detectar patrones: tareas que evita, motivos repetidos, diferencia entre hacer las cosas en casa ("home") o en la calle ("outside"), relación con la energía.
3. Hacer 1–2 preguntas concretas del "por qué" sobre lo que NO entiendes de sus datos (no repitas preguntas ya respondidas en "answers").
4. Proponer hasta 3 ajustes concretos a la rutina, pequeños y realistas.

Reglas:
- Usa solo los datos dados; no inventes hechos. Si hay pocos datos, dilo.
- En "adjustments", "taskId" debe ser uno de los ids de "tasks" (excepto para kind "add").
- Tareas chicas: prefiere versiones de 5–15 minutos antes que agregar carga.
- No hagas diagnósticos médicos ni psicológicos. Si el texto del usuario sugiere malestar serio o desesperanza, sugiere con calidez hablar con alguien de confianza o un profesional.

Formato exacto de salida (JSON):
{
  "diagnosis": string,
  "patterns": string[],            // máx 3
  "tips": string[],                // exactamente 2, accionables
  "nudge": string,                 // máx 100 caracteres, para la notificación de mañana
  "questions": string[],           // máx 2
  "adjustments": [
    {
      "kind": "shrink" | "move_outside" | "move_home" | "reschedule" | "add" | "archive",
      "taskId": string | null,
      "newTitle": string | null,       // obligatorio en shrink y add
      "newReminder": "HH:mm" | null,   // obligatorio en reschedule
      "category": "devops" | "job" | "health" | "mindset" | null,  // para add
      "newPlace": "home" | "outside" | null,                       // para add
      "reason": string
    }
  ]
}

Datos:
${JSON.stringify(input)}`;
}

/** Llama a Gemini y devuelve el JSON ya parseado (sin validar). */
export async function generateJson(apiKey: string, model: string, prompt: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
        }),
        signal: controller.signal,
      },
    );

    if (!res.ok) {
      throw new Error(res.status === 400 || res.status === 403 ? 'API key o modelo inválido' : `HTTP ${res.status}`);
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
    if (!text) throw new Error('respuesta vacía');

    return JSON.parse(text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, ''));
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw new Error('tiempo de espera agotado');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

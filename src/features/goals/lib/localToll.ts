import type { TollBody, TollInput } from '../types';

type Topic = 'health' | 'job' | 'devops' | 'code' | 'generic';

/** Enfermedad, fiebre o desmotivación declaradas: el peaje baja al mínimo biológico. */
const LOW_STATE_RE =
  /enferm|fiebre|gripa|gripe|malestar|mareo|dolor de|migra[nñ]|v[oó]mit|desmotiv|sin ganas|no tengo ganas|sin energ|agotad|deprim|fatal|no puedo m[aá]s/i;

const VAGUE_RE =
  /\b(avanzar|adelantar|mejorar|buscar (?:formas?|maneras?|opciones)|ver (?:qu[eé]|c[oó]mo)|trabajar en|ponerme al d[ií]a|organizar|hacer algo|ser productivo|estudiar)\b/i;

const CONCRETE_VERB_RE =
  /\b(enviar|mandar|escribir|redactar|abrir|crear|leer|subir|llamar|pagar|corregir|arreglar|ejecutar|probar|instalar|configurar|aplicar|caminar|salir|commit|hacer commit)\b/i;

const TOPIC_RES: [Exclude<Topic, 'generic'>, RegExp][] = [
  ['health', /caminar|caminata|salir|calle|ejercicio|correr|gym|salud|estirar/i],
  ['job', /hojas? de vida|\bcv\b|empleo|trabajo|plata|dinero|ingres|postul|entrevista|oferta|cliente|freelanc/i],
  ['devops', /docker|linux|devops|terminal|kubernetes|servidor|nube|\baws\b|curso|compose/i],
  ['code', /c[oó]digo|program|funci[oó]n|\bapp\b|proyecto|\bbug\b|commit|\brepo\b|script|\bapi\b/i],
];

const MINIMUM: Record<Topic, string> = {
  health: 'Sal a caminar hasta la esquina y vuelve (10 minutos).',
  job: 'Abre una plataforma de empleo y envía una sola hoja de vida.',
  devops: 'Abre la terminal y corre un solo comando de lo que estás aprendiendo.',
  code: 'Abre el archivo del proyecto y escribe una sola función o comentario.',
  generic: 'Abre lo que ibas a trabajar y haz solo el primer paso visible, con temporizador de 10 minutos.',
};

const BIOLOGICAL: Record<Topic, string> = {
  health: 'Ponte de pie, estírate y respira profundo durante 1 minuto.',
  job: 'Abre la plataforma de empleo y guarda una sola oferta. Nada más.',
  devops: 'Abre la terminal y escribe un solo comando. No hace falta ejecutarlo.',
  code: 'Abre el archivo del proyecto y lee una sola línea. Con eso basta.',
  generic: 'Abre lo que ibas a hacer y míralo durante 1 minuto. Nada más.',
};

function detectTopic(...texts: (string | undefined)[]): Topic {
  for (const text of texts) {
    if (!text) continue;
    const hit = TOPIC_RES.find(([, re]) => re.test(text));
    if (hit) return hit[0];
  }
  return 'generic';
}

function isSpecific(draft: string): boolean {
  if (VAGUE_RE.test(draft)) return false;
  const words = draft.trim().split(/\s+/).length;
  const anchored = /\d|\.\w{2,4}\b|«|"/.test(draft);
  return words >= 4 && (CONCRETE_VERB_RE.test(draft) || anchored);
}

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3),
  );
}

/** Alineación aproximada: comparten tema o alguna palabra significativa. null si no hay meta de referencia. */
export function goalAlignment(draft: string, reference?: string): boolean | null {
  if (!reference) return null;
  const dt = detectTopic(draft);
  const wt = detectTopic(reference);
  if (dt !== 'generic' && dt === wt) return true;
  const a = words(draft);
  for (const w of words(reference)) if (a.has(w)) return true;
  // Un borrador sin tema claro no se puede juzgar; uno con otro tema sí es otra cosa.
  return dt === 'generic' ? null : false;
}

/** true si el texto declara enfermedad, fiebre o desmotivación. */
export function isLowState(text: string): boolean {
  return LOW_STATE_RE.test(text);
}

/**
 * Analista sin internet. Mismo contrato que Gemini: desarma lo vago en un "Mínimo Ridículo"
 * y, si el usuario está mal, baja al mínimo biológico. Es determinista y no envía nada.
 */
export function localToll({ draft, weekGoal }: TollInput): TollBody {
  const clean = draft.trim();
  const aligned = goalAlignment(clean, weekGoal);
  const topic = detectTopic(clean, weekGoal);

  if (isLowState(clean)) {
    return { toll: BIOLOGICAL[topic], level: 'biological', aligned };
  }
  if (isSpecific(clean)) {
    const shown = clean.length > 120 ? `${clean.slice(0, 117)}…` : clean;
    return { toll: `«${shown}»: haz solo el primer paso, con temporizador de 10 minutos.`, level: 'minimum', aligned };
  }
  return { toll: MINIMUM[topic], level: 'minimum', aligned };
}

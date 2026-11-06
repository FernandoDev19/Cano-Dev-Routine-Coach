import { goalAlignment } from './localToll';
import type { GoalReviewBody, GoalReviewInput } from '../types';

const MAX = 200;

const VAGUE_RE =
  /\b(avanzar|adelantar|mejorar|ser mejor|ser productivo|ponerme al d[ií]a|organizarme|trabajar en|hacer cosas|buscar (?:formas?|maneras?|opciones))\b/i;

const CONCRETE_VERB_RE =
  /\b(enviar|mandar|escribir|redactar|publicar|entregar|lanzar|terminar|completar|cerrar|crear|subir|pagar|aplicar|configurar|desplegar|leer|aprobar|conseguir)\b/i;

const NUMBER_WORD_RE = /\b(un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/i;

/** Metas grandes sin un recorte que quepa en una semana. */
const BIG_RE =
  /\b(terminar|completar|finalizar|construir|desarrollar|lanzar|aprender|dominar)\b.*\b(app|aplicaci[oó]n|proyecto|curso|sistema|plataforma|todo|completo|entero|portafolio)\b/i;

/** Unidades de tiempo: un número seguido de una de ellas no cuenta como "cantidad de cosas". */
const TIME_UNIT_RE = /^(min|minutos?|horas?|h|d[ií]as?|semanas?|meses|%)$/i;

export function clip(text: string, max = MAX): string {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** Medible: tiene una cantidad, o un verbo concreto con objeto. */
export function isMeasurable(text: string): boolean {
  if (VAGUE_RE.test(text)) return false;
  if (/\d/.test(text) || NUMBER_WORD_RE.test(text)) return true;
  return CONCRETE_VERB_RE.test(text) && text.trim().split(/\s+/).length >= 3;
}

/** Trozos separados por coma, punto y coma o " y ": 3 o más = varias metas en una. */
function clauses(text: string): string[] {
  return text
    .split(/\s*(?:,|;|\sy\s)\s*/i)
    .map((c) => c.trim())
    .filter(Boolean);
}

/** Primer número que cuenta cosas (no minutos/horas/días); null si no hay. */
function firstCount(text: string): { value: number; start: number; end: number } | null {
  const re = /\d+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const after = text.slice(m.index + m[0].length).trim().split(/\s+/)[0] ?? '';
    if (TIME_UNIT_RE.test(after)) continue;
    return { value: Number(m[0]), start: m.index, end: m.index + m[0].length };
  }
  return null;
}

const DAILY_RE = /\b(diari[oa]s?|por d[ií]a|al d[ií]a|cada d[ií]a)\b/i;

/**
 * Revisor sin internet, determinista. Mismo contrato que Gemini.
 * Semana: tiene que caber en 5 días hábiles; si no, se reduce de forma drástica.
 * Mes: solo se valida que sea medible y una sola cosa; no se recorta por tamaño.
 */
export function localReview({ kind, text, monthGoal }: GoalReviewInput): GoalReviewBody {
  const clean = clip(text);
  const parts = clauses(clean);

  if (parts.length >= 3) {
    return {
      verdict: 'reduced',
      text: clip(parts[0]),
      note: 'Eran varias metas en una. Dejé solo la primera: una meta a la vez rinde más.',
    };
  }

  if (!isMeasurable(clean)) {
    return {
      verdict: 'unclear',
      text: clean,
      note:
        kind === 'week'
          ? 'Aún no se puede medir. ¿Cuántos o cuál entregable concreto tendrías al viernes?'
          : 'Aún no se puede medir. ¿Qué tendría que existir a fin de mes para decir "lo logré"?',
    };
  }

  if (kind === 'week') {
    const count = firstCount(clean);
    if (count && count.value > 5 && !DAILY_RE.test(clean)) {
      const reduced = `${clean.slice(0, count.start)}5${clean.slice(count.end)}`;
      return {
        verdict: 'reduced',
        text: clip(reduced),
        note: `${count.value} es mucho para 5 días hábiles. Lo dejé en 5: uno por día.`,
      };
    }
    if (!count && BIG_RE.test(clean)) {
      return {
        verdict: 'unclear',
        text: clean,
        note: 'Se ve grande para 5 días. Dime qué parte concreta cabe en la semana (un módulo, 5 envíos…).',
      };
    }
    if (goalAlignment(clean, monthGoal) === false) {
      return {
        verdict: 'unclear',
        text: clean,
        note: 'No veo cómo esto lleva a tu meta del mes. ¿Es de verdad el siguiente paso?',
      };
    }
  }

  return { verdict: 'ok', text: clean, note: kind === 'week' ? 'Cabe en 5 días hábiles.' : 'Se ve medible y viable.' };
}

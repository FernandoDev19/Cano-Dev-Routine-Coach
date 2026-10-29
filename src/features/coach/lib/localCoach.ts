import type { AnalysisBody } from '../types';
import type { CoachInput } from './context';

const pct = (v: number | null) => (v === null ? null : Math.round(v * 100));

/** Título sin paréntesis ni duraciones ("Docker 15 min (x)" → "Docker") para armar la versión corta. */
const baseTitle = (title: string) =>
  title
    .replace(/\(.*?\)/g, ' ')
    .replace(/\b\d+\s*(?:min(?:utos?)?|m)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim() || title;
const LOW_ENERGY_RE = /energ|flojera|cansad|pereza/i;
const OVERWHELM_RE = /abrum|complej|dif[ií]cil/i;
const HOME_RE = /encerrad|casa/i;
const DISTRACT_RE = /distra|redes|youtube|juego/i;

/**
 * Motor de reglas sin internet. Usa los mismos datos que Gemini y devuelve la misma forma,
 * así la app funciona igual (con menos matices) cuando no hay API key o falla la red.
 */
export function localAnalysis(input: CoachInput): AnalysisBody {
  const { stats, todaySummary, energyToday, tasks } = input;
  const patterns: string[] = [];
  const tips: string[] = [];
  const questions: string[] = [];
  const adjustments: AnalysisBody['adjustments'] = [];

  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const avoided = stats.tasks
    .filter((t) => t.done + t.skipped >= 2 && t.skipRate >= 0.5 && taskById.has(t.taskId))
    .sort((a, b) => b.skipRate - a.skipRate);
  const worst = avoided[0];
  const topReason = stats.reasons[0]?.reason;

  const home = stats.place.home;
  const outside = stats.place.outside;
  const enoughPlaceData = home.done + home.skipped >= 3 && outside.done + outside.skipped >= 3;
  const outsideBetter = enoughPlaceData && home.rate !== null && outside.rate !== null && outside.rate - home.rate >= 0.2;
  const lowEnergy = energyToday !== undefined && energyToday <= 2;

  // --- Patrones ---------------------------------------------------------------------------
  if (outsideBetter) {
    patterns.push(`En la calle completas ${pct(outside.rate)}% de tus tareas; en casa, ${pct(home.rate)}%. El cambio de ambiente te rinde.`);
  }
  if (worst) {
    patterns.push(`«${worst.title}» la has omitido ${worst.skipped} de ${worst.done + worst.skipped} veces.`);
  }
  if (topReason) {
    patterns.push(`Tu motivo más repetido: “${topReason}”.`);
  }
  const { avgOnGoodDays: good, avgOnBadDays: bad } = stats.energy;
  if (good !== null && bad !== null && good - bad >= 1) {
    patterns.push(`Tus días buenos coinciden con más energía (${good.toFixed(1)} vs ${bad.toFixed(1)}).`);
  }

  // --- Diagnóstico ------------------------------------------------------------------------
  let diagnosis: string;
  if (stats.totalEntries === 0 && todaySummary.done === 0 && todaySummary.skipped === 0) {
    diagnosis = 'Todavía no tengo datos tuyos. Marca o omite tus tareas de hoy (y dime por qué) y empiezo a encontrar patrones.';
  } else if (lowEnergy) {
    diagnosis = `Hoy tu energía estuvo en ${energyToday}/5. Cuando el cuerpo está bajo, el cerebro se escapa de lo que se ve grande; no es pereza pura. Toca bajar la vara, no la autoexigencia.`;
  } else if (todaySummary.total > 0 && todaySummary.pct >= 75) {
    diagnosis = `Hoy llevas ${todaySummary.pct}% de la rutina. Ya agarraste impulso: lo difícil ahora es mantenerlo, no arrancar.`;
  } else if (worst) {
    diagnosis = `Lo que más te frena es «${worst.title}»${worst.topReason ? `, casi siempre por “${worst.topReason.toLowerCase()}”` : ''}. Es un problema de fricción, no de capacidad.`;
  } else {
    diagnosis = `Vas ${todaySummary.done} de ${todaySummary.total} hoy. Con tareas chiquitas y constantes se construye la racha (${stats.streak} día(s) por ahora).`;
  }

  // --- Ajustes ----------------------------------------------------------------------------
  if (worst) {
    const t = taskById.get(worst.taskId);
    if (t) {
      const reason = worst.topReason ?? topReason ?? '';
      if (OVERWHELM_RE.test(reason) || LOW_ENERGY_RE.test(reason)) {
        const base = baseTitle(t.title);
        adjustments.push({
          kind: 'shrink',
          taskId: t.id,
          newTitle: `${base} (solo 5 min)`,
          reason: 'Una versión de 5 minutos baja la barrera de arranque; si quieres seguir, sigues.',
        });
      }
      if (LOW_ENERGY_RE.test(reason) && !t.reminder) {
        adjustments.push({
          kind: 'reschedule',
          taskId: t.id,
          newReminder: '09:30',
          reason: 'Hacerla temprano evita que la energía se gaste en otras cosas.',
        });
      }
      if ((HOME_RE.test(reason) || DISTRACT_RE.test(reason) || outsideBetter) && t.place === 'home') {
        adjustments.push({
          kind: 'move_outside',
          taskId: t.id,
          reason: 'Cambiar de lugar (café, parque, biblioteca) corta la distracción y te saca del encierro.',
        });
      }
      if (adjustments.length === 0) {
        adjustments.push({
          kind: 'shrink',
          taskId: t.id,
          newTitle: `${baseTitle(t.title)} (solo 5 min)`,
          reason: 'Si algo se omite más de la mitad de las veces, hay que hacerlo más pequeño.',
        });
      }
    }
  } else if (todaySummary.total >= 3 && todaySummary.pct === 100) {
    adjustments.push({
      kind: 'add',
      newTitle: 'Mini reto: levantar 2 servicios con Docker Compose (20 min)',
      category: 'devops',
      newPlace: 'home',
      reason: 'Completaste todo: es buen momento para subir un escalón.',
    });
  }

  // --- Consejos ---------------------------------------------------------------------------
  if (lowEnergy || (topReason && LOW_ENERGY_RE.test(topReason))) {
    tips.push('Regla de los 5 minutos: abre la terminal, corre un solo comando y ya. Arrancar es lo difícil.');
  }
  if (topReason && DISTRACT_RE.test(topReason)) {
    tips.push('Pon el celular en otro cuarto durante el bloque de estudio y usa un temporizador de 15 minutos.');
  }
  if (outsideBetter || (topReason && HOME_RE.test(topReason))) {
    tips.push('Haz la primera tarea del día fuera de casa: terraza, parque o café. Mover el cuerpo reinicia la cabeza.');
  }
  if (tips.length < 2) tips.push('Deja la próxima tarea lista de noche (archivo abierto, comando escrito) para que mañana solo toque ejecutar.');
  if (tips.length < 2) tips.push('Celebra lo hecho antes de mirar lo pendiente; la racha se alimenta de sentirse capaz.');

  // --- Preguntas --------------------------------------------------------------------------
  if (worst) {
    questions.push(`¿Qué es lo primero que sientes cuando toca «${worst.title}»: pereza, miedo a no entenderlo o falta de tiempo?`);
  }
  if (outsideBetter) {
    questions.push('Rindes más en la calle. ¿Qué lugar cercano (parque, café, biblioteca) te queda fácil esta semana?');
  }
  if (lowEnergy) {
    questions.push('¿Dormiste mal o fue más el ánimo? ¿Qué te daría un 10% más de energía mañana?');
  }

  // --- Empujón para mañana ----------------------------------------------------------------
  const nudge = worst
    ? `Hoy solo 5 min con «${baseTitle(worst.title)}». Abre, haz un paso y ya ganaste.`
    : 'Primero 10 min afuera y luego al código. Una cosa pequeña hoy cuenta.';

  return {
    diagnosis,
    patterns: patterns.slice(0, 3),
    tips: tips.slice(0, 2),
    nudge: nudge.slice(0, 120),
    questions: questions.slice(0, 2),
    adjustments: adjustments.slice(0, 3),
  };
}

import { HHMM_RE } from '@/shared/lib/date';
import type { Category, Place, Task } from '@/features/routine';
import type { AdjustmentKind, AnalysisBody } from '../types';

const KINDS: AdjustmentKind[] = ['shrink', 'move_outside', 'move_home', 'reschedule', 'add', 'archive'];
const CATEGORIES: Category[] = ['devops', 'job', 'health', 'mindset'];
const PLACES: Place[] = ['home', 'outside'];

function str(v: unknown, max: number): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined;
}

function strList(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((x) => str(x, maxLen) ?? []).slice(0, maxItems);
}

/**
 * La salida del modelo es input no confiable: validamos forma, ids y horas
 * antes de que algo pueda tocar la rutina del usuario.
 */
export function sanitizeAnalysis(raw: unknown, tasks: Task[]): AnalysisBody | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;

  const diagnosis = str(r.diagnosis, 600);
  if (!diagnosis) return null;

  const valid = new Set(tasks.filter((t) => !t.archivedAt).map((t) => t.id));
  const adjustments: AnalysisBody['adjustments'] = [];

  // Se validan todos y recién después se limita a 3: un ítem inválido no debe desplazar a los válidos.
  for (const item of Array.isArray(r.adjustments) ? r.adjustments : []) {
    if (adjustments.length >= 3) break;
    if (typeof item !== 'object' || item === null) continue;
    const a = item as Record<string, unknown>;
    const kind = KINDS.find((k) => k === a.kind);
    if (!kind) continue;

    const reason = str(a.reason, 240) ?? '';
    const taskId = typeof a.taskId === 'string' && valid.has(a.taskId) ? a.taskId : undefined;
    const newTitle = str(a.newTitle, 120);
    const newReminder = typeof a.newReminder === 'string' && HHMM_RE.test(a.newReminder) ? a.newReminder : undefined;
    const category = CATEGORIES.find((c) => c === a.category);
    const newPlace = PLACES.find((p) => p === a.newPlace);

    if (kind === 'add') {
      if (!newTitle) continue;
      adjustments.push({ kind, newTitle, category: category ?? 'devops', newPlace: newPlace ?? 'home', newReminder, reason });
      continue;
    }
    if (!taskId) continue;
    if (kind === 'shrink' && !newTitle) continue;
    if (kind === 'reschedule' && !newReminder) continue;
    adjustments.push({ kind, taskId, newTitle, newReminder, reason });
  }

  return {
    diagnosis,
    patterns: strList(r.patterns, 3, 240),
    tips: strList(r.tips, 2, 300),
    nudge: str(r.nudge, 120) ?? '',
    questions: strList(r.questions, 2, 240),
    adjustments,
  };
}

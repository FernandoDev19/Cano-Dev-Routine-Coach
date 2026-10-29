import type { Category, Place } from '@/features/routine';

export type AdjustmentKind = 'shrink' | 'move_outside' | 'move_home' | 'reschedule' | 'add' | 'archive';
export type AdjustmentStatus = 'pending' | 'applied' | 'dismissed';

/** Cambio concreto a la rutina que el coach propone y tú aceptas o descartas. */
export type Adjustment = {
  id: string;
  kind: AdjustmentKind;
  taskId?: string;
  newTitle?: string;
  newReminder?: string;
  newPlace?: Place;
  category?: Category;
  reason: string;
  status: AdjustmentStatus;
};

export type AnalysisBody = {
  diagnosis: string;
  patterns: string[];
  tips: string[];
  /** Frase corta para la notificación de mañana. */
  nudge: string;
  /** Preguntas abiertas del "¿por qué?" para que el usuario responda. */
  questions: string[];
  adjustments: Omit<Adjustment, 'id' | 'status'>[];
};

export type Analysis = Omit<AnalysisBody, 'adjustments'> & {
  id: string;
  createdAt: number;
  source: 'gemini' | 'local';
  adjustments: Adjustment[];
  /** Si Gemini falló y se usó el motor local, el motivo. */
  fallbackNote?: string;
};

/** Pregunta abierta generada por el coach y su respuesta. */
export type QA = {
  id: string;
  question: string;
  answer?: string;
  createdAt: number;
  answeredAt?: number;
};

export type DerivedQuestion = {
  key: string;
  kind: 'skip' | 'place';
  taskId: string;
  dateKey: string;
  text: string;
};

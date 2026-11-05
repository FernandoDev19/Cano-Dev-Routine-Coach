/** Meta macro del mes. Clave: "YYYY-MM". */
export type MonthGoal = {
  monthKey: string;
  text: string;
  createdAt: number;
  updatedAt: number;
};

/** Meta de la semana (lun–vie). Clave: el lunes de esa semana, "YYYY-MM-DD". */
export type WeekGoal = {
  weekKey: string;
  text: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * - `minimum`: "Mínimo Ridículo" (tarea concreta de menos de 15 min).
 * - `biological`: mínimo biológico (1–2 min) para días de enfermedad o desmotivación.
 */
export type TollLevel = 'minimum' | 'biological';
export type TollStatus = 'pending' | 'paid';

/** El "peaje" del día: borrador informal del usuario y su versión desarmada. */
export type DayToll = {
  dateKey: string;
  /** Lo que el usuario escribió, tal cual. */
  draft: string;
  /** Tarea concreta resultante. */
  toll: string;
  level: TollLevel;
  source: 'gemini' | 'local';
  status: TollStatus;
  createdAt: number;
  paidAt?: number;
};

export type NewDayToll = Pick<DayToll, 'dateKey' | 'draft' | 'toll' | 'level' | 'source'>;

/** Qué pantalla corresponde hoy. Fin de semana = descanso sagrado. */
export type DayMode = 'daily' | 'rest';

/** Paso previo no bloqueante que conviene resolver antes del peaje diario. */
export type SetupStep = 'month' | 'week' | null;

export type DayContext = {
  mode: DayMode;
  setup: SetupStep;
};

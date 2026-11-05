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
  /**
   * Comparación invisible con la meta semanal: `true` si el borrador es un paso lógico hacia ella,
   * `false` si no, `null` si no hay meta semanal o no se pudo saber. Nunca se muestra al usuario.
   */
  aligned: boolean | null;
  source: 'gemini' | 'local';
  status: TollStatus;
  createdAt: number;
  paidAt?: number;
};

export type NewDayToll = Pick<DayToll, 'dateKey' | 'draft' | 'toll' | 'level' | 'aligned' | 'source'>;

/** Lo que el analista recibe: el borrador y, solo como contexto interno, la meta de la semana. */
export type TollInput = {
  draft: string;
  weekGoal?: string;
};

/** Resultado del analista, venga de Gemini o del motor local. */
export type TollBody = {
  toll: string;
  level: TollLevel;
  aligned: boolean | null;
};

export type TollResult = TollBody & {
  source: DayToll['source'];
  /** Si Gemini falló y se usó el motor local, el motivo. */
  fallbackNote?: string;
};

/** Qué pantalla corresponde hoy. Fin de semana = descanso sagrado. */
export type DayMode = 'daily' | 'rest';

/** Paso previo no bloqueante que conviene resolver antes del peaje diario. */
export type SetupStep = 'month' | 'week' | null;

export type DayContext = {
  mode: DayMode;
  setup: SetupStep;
};

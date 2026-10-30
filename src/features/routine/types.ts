export type Category = 'devops' | 'job' | 'health' | 'mindset';
export type Place = 'home' | 'outside';

export type Task = {
  id: string;
  title: string;
  category: Category;
  /** Dónde la quieres hacer por defecto. */
  place: Place;
  /** Recordatorio diario "HH:mm" o null. */
  reminder: string | null;
  /** Días de la semana en que aplica (0 = domingo … 6 = sábado). Vacío o ausente = todos los días. */
  days?: number[];
  /** Duración estimada en minutos (opcional). */
  minutes?: number | null;
  /** Si viene, la tarea es solo de ese día ("YYYY-MM-DD"), p. ej. una adaptación por el objetivo del día. */
  date?: string;
  createdAt: number;
  archivedAt?: number;
  /** Motivo (chip o texto propio) por el que se quitó de la rutina. */
  archiveReason?: string;
  /** Detalle libre opcional de por qué se quitó. */
  archiveNote?: string;
};

export type NewTask = Pick<Task, 'title' | 'category' | 'place' | 'reminder' | 'days' | 'minutes' | 'date'>;
export type TaskPatch = Partial<NewTask>;

export type EntryStatus = 'done' | 'skipped';

export type Entry = {
  status: EntryStatus;
  /** Si está hecha: dónde la hiciste realmente. Si fue omitida: dónde estaba planeada. */
  place: Place;
  /** Motivo corto (chip) cuando se omite. */
  reason?: string;
  /** Respuesta libre al "¿por qué?" (omisión o cambio de lugar). */
  why?: string;
  at: number;
};

/** dateKey -> taskId -> Entry */
export type EntriesByDay = Record<string, Record<string, Entry>>;

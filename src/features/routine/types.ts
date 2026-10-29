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
  createdAt: number;
  archivedAt?: number;
};

export type NewTask = Pick<Task, 'title' | 'category' | 'place' | 'reminder'>;
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

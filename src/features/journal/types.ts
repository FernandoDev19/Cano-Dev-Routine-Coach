export type DayGoal = {
  text: string;
  achieved: boolean;
  at: number;
};

export type DiaryEntry = {
  dateKey: string;
  text: string;
  /** Quién lo redactó la última vez que no fue el usuario ('manual' = lo escribió él desde cero). */
  source: 'gemini' | 'local' | 'manual';
  /** true cuando el usuario lo editó a mano: no se sobrescribe sin confirmar. */
  edited: boolean;
  createdAt: number;
  updatedAt: number;
};

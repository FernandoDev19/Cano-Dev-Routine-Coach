import type { Category, NewTask, Place } from './types';

export const CATEGORY_LABEL: Record<Category, string> = {
  devops: 'DevOps y estudio',
  job: 'Búsqueda de empleo',
  health: 'Salud y calle',
  mindset: 'Mindset y hábitos',
};

export const PLACE_LABEL: Record<Place, string> = {
  home: 'Casa',
  outside: 'Calle',
};

export const SKIP_REASONS = [
  'Me dio flojera / falta de energía',
  'Estuve todo el día encerrado en casa',
  'Me abrumó lo complejo de la tarea',
  'Me distraje con redes/YouTube/juegos',
  'No tuve tiempo',
] as const;

export const OTHER_REASON = 'Otra razón';

/** Motivos para quitar una tarea de la rutina (el coach los usa para no volver a proponerla). */
export const ARCHIVE_REASONS = [
  'Ya la domino / ya es un hábito',
  'Es demasiado grande o complicada',
  'No me sirve para mi objetivo actual',
  'Me genera presión o ansiedad',
  'Ya no tengo tiempo para esto',
] as const;

/** Orden lunes → domingo; `value` sigue Date#getDay (0 = domingo). */
export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' },
] as const;

export const MINUTE_OPTIONS = [5, 10, 15, 30, 45, 60] as const;

export const DEFAULT_TASKS: NewTask[] = [
  { title: 'Práctica Docker/Linux (15 min)', category: 'devops', place: 'home', reminder: '10:00' },
  { title: 'Enviar 1 hoja de vida o contacto', category: 'job', place: 'home', reminder: '11:00' },
  { title: 'Caminata o vuelta a la manzana (10 min)', category: 'health', place: 'outside', reminder: '17:00' },
  { title: 'Escribir script/notas de lo aprendido', category: 'mindset', place: 'home', reminder: null },
];

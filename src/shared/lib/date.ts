export const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

/** Últimos `n` días terminando en `end` (inclusive), del más viejo al más nuevo. */
export function lastNDays(n: number, end: string = toDateKey()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
}

export function endOfDayMs(key: string): number {
  const d = fromDateKey(key);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function weekdayShort(key: string): string {
  return WEEKDAYS[fromDateKey(key).getDay()];
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const WEEKDAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** "miércoles, 28 de octubre" — sin depender de Intl (Hermes). */
export function formatLongDate(key: string = toDateKey()): string {
  const d = fromDateKey(key);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

export function parseHHmm(v: string): { hour: number; minute: number } | null {
  if (!HHMM_RE.test(v)) return null;
  const [hour, minute] = v.split(':').map(Number);
  return { hour, minute };
}

export function formatHHmm(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Suma minutos a un "HH:mm" con vuelta de 24 h. */
export function shiftHHmm(v: string, deltaMinutes: number): string {
  const p = parseHHmm(v) ?? { hour: 8, minute: 0 };
  const total = (((p.hour * 60 + p.minute + deltaMinutes) % 1440) + 1440) % 1440;
  return formatHHmm(Math.floor(total / 60), total % 60);
}

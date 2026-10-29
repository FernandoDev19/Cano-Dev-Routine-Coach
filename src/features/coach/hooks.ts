import { useMemo } from 'react';
import { useToday } from '@/shared/hooks/useToday';
import { useRoutineStore } from '@/features/routine';
import { deriveQuestions } from './lib/questions';
import { useCoachStore } from './store';

export function useDerivedQuestions() {
  const today = useToday();
  const tasks = useRoutineStore((s) => s.tasks);
  const entries = useRoutineStore((s) => s.entries);
  return useMemo(() => deriveQuestions(tasks, entries, today), [tasks, entries, today]);
}

/** Cuántas preguntas del coach esperan respuesta (para el badge de la pestaña). */
export function usePendingQuestionCount(): number {
  const derived = useDerivedQuestions();
  const qa = useCoachStore((s) => s.qa);
  return derived.length + qa.filter((q) => !q.answer).length;
}

export { RoutineScreen } from './screens/RoutineScreen';
export { useRoutineStore } from './store';
export { useActiveTasks, useTodayTasks } from './hooks';
export { computeStreak, isScheduledOn, summarizeDay, tasksForDay } from './lib/progress';
export type { DaySummary } from './lib/progress';
export { CATEGORY_LABEL, PLACE_LABEL } from './constants';
export type { Category, EntriesByDay, Entry, NewTask, Place, Task, TaskPatch } from './types';

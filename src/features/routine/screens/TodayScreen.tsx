import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/shared/ui/Screen';
import { Button, Card, EmptyHint, ProgressBar, SectionTitle } from '@/shared/ui/primitives';
import { formatLongDate } from '@/shared/lib/date';
import { useToday } from '@/shared/hooks/useToday';
import { ArchiveSheet } from '../components/ArchiveSheet';
import { SkipSheet } from '../components/SkipSheet';
import { TaskCard } from '../components/TaskCard';
import { TaskSheet } from '../components/TaskSheet';
import { useTodayTasks } from '../hooks';
import { computeStreak, summarizeDay } from '../lib/progress';
import { useRoutineStore } from '../store';
import type { Task } from '../types';

type Props = {
  onOpenCheckin: () => void;
  /** Lo primero que se ve al abrir Hoy (p. ej. el peaje diario). Lo inyecta la capa de app. */
  top?: ReactNode;
  /** Contenido extra (p. ej. aviso de preguntas del coach) que inyecta la capa de app. */
  banner?: ReactNode;
};

export function TodayScreen({ onOpenCheckin, top, banner }: Props) {
  const today = useToday();
  const tasks = useTodayTasks(today);
  const entries = useRoutineStore((s) => s.entries);
  const { addTask, updateTask, archiveTask, markDone, markSkipped, clearEntry, setEntryPlace } = useRoutineStore();

  const [editing, setEditing] = useState<Task | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [skipping, setSkipping] = useState<Task | undefined>();
  const [archiving, setArchiving] = useState<Task | undefined>();

  const todayEntries = entries[today];
  const summary = useMemo(() => summarizeDay(tasks, todayEntries, today), [tasks, todayEntries, today]);
  const streak = useMemo(() => computeStreak(entries, today), [entries, today]);

  const openNew = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setSheetOpen(true);
  };

  return (
    <Screen
      title="Hoy"
      subtitle={formatLongDate(today)}
      right={
        <Pressable
          onPress={onOpenCheckin}
          className="flex-row items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2"
        >
          <Ionicons name="moon-outline" size={14} color="#34d399" />
          <Text className="text-xs font-semibold text-emerald-300">Check-out</Text>
        </Pressable>
      }
    >
      {top}

      <View className="mb-4 flex-row gap-3">
        <Card className="flex-1">
          <Text className="text-[11px] font-medium text-slate-400">Momentum</Text>
          <Text className="my-1 text-2xl font-extrabold text-emerald-400">{summary.pct}%</Text>
          <ProgressBar value={summary.pct} />
        </Card>
        <Card className="flex-1">
          <Text className="text-[11px] font-medium text-slate-400">Racha</Text>
          <View className="my-1 flex-row items-center gap-1">
            <Text className="text-2xl font-extrabold text-amber-400">{streak}</Text>
            <Ionicons name="flame" size={20} color="#f59e0b" />
          </View>
          <Text className="text-[10px] text-slate-500">días seguidos</Text>
        </Card>
        <Card className="flex-1">
          <Text className="text-[11px] font-medium text-slate-400">Calle</Text>
          <Text className="my-1 text-2xl font-bold text-cyan-400">
            {summary.outsideDone}/{summary.outsidePlanned}
          </Text>
          <Text className="text-[10px] text-slate-500">tareas afuera</Text>
        </Card>
      </View>

      {banner}

      <Card className="mb-4">
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <SectionTitle icon="list" hint="Marca lo que hiciste y dónde lo hiciste">
              Mini-rutina de hoy
            </SectionTitle>
          </View>
          <Button label="Nueva" icon="add" variant="ghost" small onPress={openNew} />
        </View>

        <View className="gap-3">
          {tasks.length === 0 ? <EmptyHint>No hay tareas. ¡Añade una para empezar!</EmptyHint> : null}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              entry={todayEntries?.[task.id]}
              onDone={(place) => markDone(task.id, place, today)}
              onUndo={() => clearEntry(task.id, today)}
              onSkip={() => setSkipping(task)}
              onSetPlace={(place) => setEntryPlace(task.id, place, today)}
              onEdit={() => openEdit(task)}
            />
          ))}
        </View>
      </Card>

      <TaskSheet
        visible={sheetOpen}
        task={editing}
        onClose={() => setSheetOpen(false)}
        onSave={(value) => {
          if (editing) updateTask(editing.id, value);
          else addTask(value);
          setSheetOpen(false);
        }}
        onArchive={
          editing
            ? () => {
                const target = editing;
                setSheetOpen(false);
                // Espera a que se cierre la primera hoja para abrir la del motivo (evita choque de modales en iOS).
                setTimeout(() => setArchiving(target), 350);
              }
            : undefined
        }
      />

      <ArchiveSheet
        visible={!!archiving}
        taskTitle={archiving?.title ?? ''}
        onClose={() => setArchiving(undefined)}
        onConfirm={(reason, note) => {
          if (archiving) archiveTask(archiving.id, reason, note);
          setArchiving(undefined);
        }}
      />

      <SkipSheet
        visible={!!skipping}
        taskTitle={skipping?.title ?? ''}
        onClose={() => setSkipping(undefined)}
        onConfirm={(reason, why) => {
          if (skipping) markSkipped(skipping.id, reason, why, today);
          setSkipping(undefined);
        }}
      />
    </Screen>
  );
}

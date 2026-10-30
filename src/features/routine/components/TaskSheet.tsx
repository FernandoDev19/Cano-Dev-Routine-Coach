import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Button, Chip } from '@/shared/ui/primitives';
import { Sheet } from '@/shared/ui/Sheet';
import { TimeStepper } from '@/shared/ui/TimeStepper';
import { CATEGORY_LABEL, MINUTE_OPTIONS, PLACE_LABEL, WEEKDAY_OPTIONS } from '../constants';
import type { Category, NewTask, Place, Task } from '../types';

type Props = {
  visible: boolean;
  /** Si viene, es edición; si no, es una tarea nueva. */
  task?: Task;
  onClose: () => void;
  onSave: (value: NewTask) => void;
  onArchive?: () => void;
};

const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];
const PLACES: Place[] = ['home', 'outside'];

export function TaskSheet({ visible, task, onClose, onSave, onArchive }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('devops');
  const [place, setPlace] = useState<Place>('home');
  const [reminder, setReminder] = useState<string | null>(null);
  const [days, setDays] = useState<number[]>([]);
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? '');
    setCategory(task?.category ?? 'devops');
    setPlace(task?.place ?? 'home');
    setReminder(task?.reminder ?? null);
    setDays(task?.days ?? []);
    setMinutes(task?.minutes ?? null);
  }, [visible, task]);

  const toggleDay = (d: number) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const canSave = title.trim().length > 0;

  return (
    <Sheet visible={visible} title={task ? 'Editar tarea' : 'Nueva tarea o hábito'} onClose={onClose}>
      <Text className="mb-1 text-xs font-medium text-slate-300">Nombre</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Ej: Leer 10 min sobre Docker Compose"
        placeholderTextColor="#64748b"
        className="mb-4 rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
      />

      <Text className="mb-2 text-xs font-medium text-slate-300">Categoría</Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Chip key={c} label={CATEGORY_LABEL[c]} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>

      <Text className="mb-2 text-xs font-medium text-slate-300">¿Dónde quieres hacerla?</Text>
      <View className="mb-4 flex-row gap-2">
        {PLACES.map((p) => (
          <Chip
            key={p}
            label={PLACE_LABEL[p]}
            icon={p === 'home' ? 'home' : 'leaf'}
            selected={place === p}
            onPress={() => setPlace(p)}
          />
        ))}
      </View>

      <Text className="mb-1 text-xs font-medium text-slate-300">¿Qué días?</Text>
      <Text className="mb-2 text-[11px] text-slate-500">Sin seleccionar = todos los días.</Text>
      <View className="mb-4 flex-row gap-2">
        {WEEKDAY_OPTIONS.map((d) => (
          <Chip key={d.value} label={d.label} selected={days.includes(d.value)} onPress={() => toggleDay(d.value)} />
        ))}
      </View>

      <Text className="mb-2 text-xs font-medium text-slate-300">Duración estimada</Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {MINUTE_OPTIONS.map((m) => (
          <Chip
            key={m}
            label={`${m} min`}
            selected={minutes === m}
            onPress={() => setMinutes(minutes === m ? null : m)}
          />
        ))}
      </View>

      <Text className="mb-2 text-xs font-medium text-slate-300">Recordatorio</Text>
      <View className="mb-6 flex-row items-center justify-between">
        {reminder ? (
          <>
            <TimeStepper value={reminder} onChange={setReminder} />
            <Pressable onPress={() => setReminder(null)} hitSlop={8}>
              <Text className="text-xs text-rose-300">Quitar</Text>
            </Pressable>
          </>
        ) : (
          <Chip label="Activar recordatorio" icon="alarm-outline" onPress={() => setReminder('09:00')} />
        )}
      </View>

      <Button
        label={task ? 'Guardar cambios' : 'Añadir tarea'}
        icon="checkmark"
        disabled={!canSave}
        onPress={() =>
          onSave({
            title: title.trim(),
            category,
            place,
            reminder,
            // Todos los días (o ninguno marcado) se guarda como "sin restricción".
            days: days.length === 0 || days.length === 7 ? undefined : [...days].sort(),
            minutes,
            date: task?.date,
          })
        }
      />
      {task && onArchive ? (
        <View className="mt-3">
          <Button label="Quitar de mi rutina" variant="danger" icon="trash-outline" onPress={onArchive} />
        </View>
      ) : null}
    </Sheet>
  );
}

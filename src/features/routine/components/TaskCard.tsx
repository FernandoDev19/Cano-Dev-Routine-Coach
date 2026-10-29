import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PLACE_LABEL } from '../constants';
import type { Entry, Place, Task } from '../types';

type Props = {
  task: Task;
  entry?: Entry;
  onDone: (place: Place) => void;
  onUndo: () => void;
  onSkip: () => void;
  onSetPlace: (place: Place) => void;
  onEdit: () => void;
};

export function TaskCard({ task, entry, onDone, onUndo, onSkip, onSetPlace, onEdit }: Props) {
  const [draftPlace, setDraftPlace] = useState<Place>(task.place);
  useEffect(() => setDraftPlace(task.place), [task.place]);

  const done = entry?.status === 'done';
  const skipped = entry?.status === 'skipped';
  const place: Place = entry && done ? entry.place : draftPlace;
  const outside = place === 'outside';

  const togglePlace = () => {
    const next: Place = outside ? 'home' : 'outside';
    if (done) onSetPlace(next);
    else setDraftPlace(next);
  };

  const box = done
    ? 'border-emerald-500/30 bg-emerald-950/30'
    : skipped
      ? 'border-amber-500/30 bg-amber-950/20'
      : 'border-slate-800 bg-slate-900';

  return (
    <View className={`gap-3 rounded-xl border p-3.5 ${box}`}>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => (done ? onUndo() : onDone(place))}
          hitSlop={8}
          className={`h-7 w-7 items-center justify-center rounded-lg border ${
            done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
          }`}
        >
          {done ? <Ionicons name="checkmark" size={16} color="#020617" /> : null}
        </Pressable>

        <Pressable onPress={onEdit} className="flex-1">
          <Text className={`text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
            {task.title}
          </Text>
          {skipped ? (
            <Text className="mt-0.5 text-[11px] italic text-amber-400">
              Omitida: {entry?.reason}
              {entry?.why ? ` — ${entry.why}` : ''}
            </Text>
          ) : null}
          {done && entry && entry.place !== task.place ? (
            <Text className="mt-0.5 text-[11px] italic text-cyan-400">
              Planeada en {PLACE_LABEL[task.place].toLowerCase()}, la hiciste en {PLACE_LABEL[entry.place].toLowerCase()}
            </Text>
          ) : null}
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={togglePlace}
          className={`flex-row items-center gap-1.5 rounded-lg border px-2.5 py-1 ${
            outside ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-slate-700 bg-slate-800'
          }`}
        >
          <Ionicons name={outside ? 'leaf' : 'home'} size={12} color={outside ? '#22d3ee' : '#94a3b8'} />
          <Text className={`text-[11px] font-semibold ${outside ? 'text-cyan-300' : 'text-slate-400'}`}>
            {PLACE_LABEL[place]}
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-3">
          {task.reminder ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="alarm-outline" size={12} color="#64748b" />
              <Text className="text-[11px] text-slate-500">{task.reminder}</Text>
            </View>
          ) : null}
          {!done && !skipped ? (
            <Pressable onPress={onSkip} hitSlop={8} className="flex-row items-center gap-1">
              <Ionicons name="play-skip-forward" size={14} color="#fbbf24" />
              <Text className="text-[11px] font-medium text-amber-400">Omitir</Text>
            </Pressable>
          ) : null}
          {skipped ? (
            <Pressable onPress={onUndo} hitSlop={8}>
              <Text className="text-[11px] font-medium text-slate-400">Deshacer</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

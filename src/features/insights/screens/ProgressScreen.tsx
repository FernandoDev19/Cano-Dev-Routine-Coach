import { Text, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { Card, EmptyHint, ProgressBar, SectionTitle } from '@/shared/ui/primitives';
import { weekdayShort } from '@/shared/lib/date';
import { useToday } from '@/shared/hooks/useToday';
import { useStats } from '../hooks';

const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`);

export function ProgressScreen() {
  const today = useToday();
  const stats = useStats(14);
  const week = stats.days.slice(-7);
  const avoided = stats.tasks
    .filter((t) => t.skipped > 0)
    .sort((a, b) => b.skipRate - a.skipRate || b.skipped - a.skipped)
    .slice(0, 4);
  const maxReason = Math.max(1, ...stats.reasons.map((r) => r.count));

  return (
    <Screen title="Progreso" subtitle="Últimos 14 días">
      {stats.totalEntries === 0 ? (
        <Card>
          <EmptyHint>Aún no hay datos. Marca o omite tareas en “Hoy” y aquí aparecerán tus patrones.</EmptyHint>
        </Card>
      ) : null}

      <Card className="mb-4">
        <SectionTitle icon="stats-chart" hint="Porcentaje de tareas hechas por día">
          Consistencia de la semana
        </SectionTitle>
        <View className="h-32 flex-row items-end justify-between">
          {week.map((d) => (
            <View key={d.date} className="flex-1 items-center">
              <Text className="mb-1 text-[10px] text-slate-400">{d.total ? `${d.pct}` : '–'}</Text>
              <View className="h-20 w-5 justify-end overflow-hidden rounded-md bg-slate-800">
                <View
                  className={`w-full rounded-md ${d.date === today ? 'bg-emerald-400' : 'bg-emerald-600'}`}
                  style={{ height: `${d.pct}%` }}
                />
              </View>
              <Text className={`mt-1 text-[10px] ${d.date === today ? 'font-bold text-emerald-300' : 'text-slate-500'}`}>
                {d.date === today ? 'Hoy' : weekdayShort(d.date)}
              </Text>
            </View>
          ))}
        </View>
        <Text className="mt-3 text-xs text-slate-400">Racha actual: {stats.streak} día(s)</Text>
      </Card>

      <Card className="mb-4">
        <SectionTitle icon="navigate" hint="Cuánto completas según dónde lo hagas o lo tengas planeado">
          Casa vs. calle
        </SectionTitle>
        {(['home', 'outside'] as const).map((p) => {
          const s = stats.place[p];
          const label = p === 'home' ? 'En casa' : 'En la calle';
          return (
            <View key={p} className="mb-3">
              <View className="mb-1 flex-row justify-between">
                <Text className="text-xs font-medium text-slate-200">{label}</Text>
                <Text className="text-xs text-slate-400">
                  {pct(s.rate)} · {s.done} hechas / {s.skipped} omitidas
                </Text>
              </View>
              <ProgressBar value={(s.rate ?? 0) * 100} color={p === 'home' ? 'bg-slate-400' : 'bg-cyan-400'} />
            </View>
          );
        })}
      </Card>

      <Card className="mb-4">
        <SectionTitle icon="warning" hint="Lo que más estás esquivando">
          Tareas que evitas
        </SectionTitle>
        {avoided.length === 0 ? <EmptyHint>Nada evitado todavía. 👏</EmptyHint> : null}
        {avoided.map((t) => (
          <View key={t.taskId} className="mb-3">
            <View className="mb-1 flex-row justify-between">
              <Text className="flex-1 pr-2 text-xs font-medium text-slate-200" numberOfLines={1}>
                {t.title}
              </Text>
              <Text className="text-xs text-amber-400">{Math.round(t.skipRate * 100)}% omitida</Text>
            </View>
            <ProgressBar value={t.skipRate * 100} color="bg-amber-400" />
            {t.topReason ? <Text className="mt-1 text-[11px] italic text-slate-500">Motivo frecuente: {t.topReason}</Text> : null}
          </View>
        ))}
      </Card>

      <Card className="mb-4">
        <SectionTitle icon="help-circle" hint="Por qué omites tareas">
          Motivos
        </SectionTitle>
        {stats.reasons.length === 0 ? <EmptyHint>Sin omisiones registradas.</EmptyHint> : null}
        {stats.reasons.slice(0, 5).map((r) => (
          <View key={r.reason} className="mb-2.5">
            <View className="mb-1 flex-row justify-between">
              <Text className="flex-1 pr-2 text-xs text-slate-300" numberOfLines={1}>
                {r.reason}
              </Text>
              <Text className="text-xs text-slate-400">{r.count}×</Text>
            </View>
            <ProgressBar value={(r.count / maxReason) * 100} color="bg-rose-400" />
          </View>
        ))}
      </Card>

      <Card>
        <SectionTitle icon="battery-charging" hint="Del check-in diario">
          Energía
        </SectionTitle>
        <View className="flex-row justify-between">
          <Metric label="Promedio" value={stats.energy.avg} />
          <Metric label="Días buenos" value={stats.energy.avgOnGoodDays} />
          <Metric label="Días flojos" value={stats.energy.avgOnBadDays} />
        </View>
      </Card>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <View className="items-center">
      <Text className="text-xl font-extrabold text-emerald-300">{value === null ? '—' : value.toFixed(1)}</Text>
      <Text className="text-[11px] text-slate-400">{label}</Text>
    </View>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/shared/ui/Screen';
import { Button, Card, EmptyHint, SectionTitle } from '@/shared/ui/primitives';
import { useRoutineStore } from '@/features/routine';
import { useSettingsStore } from '@/features/settings';
import { AdjustmentCard } from '../components/AdjustmentCard';
import { QuestionCard } from '../components/QuestionCard';
import { useDerivedQuestions } from '../hooks';
import { describeAdjustment } from '../lib/describe';
import { applyAdjustment } from '../services/adjustments';
import { runCoachNow } from '../services/run';
import { useCoachStore } from '../store';

type Props = {
  /** Cambia de valor para disparar un análisis automático (p. ej. tras el check-in). */
  autoRunKey?: string;
};

function timeLabel(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function CoachScreen({ autoRunKey }: Props) {
  const tasks = useRoutineStore((s) => s.tasks);
  const setEntryWhy = useRoutineStore((s) => s.setEntryWhy);
  const apiKey = useSettingsStore((s) => s.apiKey);
  const { analysis, qa, resolveAdjustment, answerQa } = useCoachStore();
  const derived = useDerivedQuestions();
  const openQa = qa.filter((q) => !q.answer);

  const [loading, setLoading] = useState(false);

  const analyze = useCallback(async () => {
    setLoading(true);
    try {
      await runCoachNow();
    } finally {
      setLoading(false);
    }
  }, []);

  const lastRunKey = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (autoRunKey && lastRunKey.current !== autoRunKey) {
      lastRunKey.current = autoRunKey;
      analyze();
    }
  }, [autoRunKey, analyze]);

  const hasQuestions = derived.length + openQa.length > 0;

  return (
    <Screen
      title="Coach"
      subtitle="Analiza tus patrones y ajusta tu rutina"
      right={<Button label="Analizar" icon="sparkles" small loading={loading} onPress={analyze} />}
    >
      <Text className="-mt-2 mb-4 text-[11px] text-slate-500">
        {apiKey ? 'Motor: Gemini (con respaldo local si falla)' : 'Motor: reglas locales · agrega tu API key en Ajustes para usar Gemini'}
      </Text>

      {analysis?.fallbackNote ? (
        <View className="mb-4 flex-row gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
          <Ionicons name="alert-circle" size={16} color="#fbbf24" />
          <Text className="flex-1 text-xs text-amber-200">{analysis.fallbackNote}</Text>
        </View>
      ) : null}

      <Card className="mb-4 border-emerald-500/20">
        <SectionTitle icon="analytics">Análisis</SectionTitle>
        {analysis ? (
          <>
            <Text className="mb-3 text-sm leading-5 text-slate-100">{analysis.diagnosis}</Text>

            {analysis.patterns.length > 0 ? (
              <View className="mb-3 gap-1.5">
                <Text className="text-xs font-semibold text-slate-300">Patrones que veo</Text>
                {analysis.patterns.map((p) => (
                  <Text key={p} className="text-xs leading-5 text-slate-400">
                    • {p}
                  </Text>
                ))}
              </View>
            ) : null}

            {analysis.tips.length > 0 ? (
              <View className="mb-3 gap-1.5">
                <Text className="text-xs font-semibold text-slate-300">Para romper la inercia</Text>
                {analysis.tips.map((t) => (
                  <Text key={t} className="text-xs leading-5 text-slate-400">
                    • {t}
                  </Text>
                ))}
              </View>
            ) : null}

            {analysis.nudge ? (
              <View className="rounded-lg bg-slate-800 p-2.5">
                <Text className="text-[11px] text-slate-500">Aviso de mañana</Text>
                <Text className="text-xs italic text-slate-200">“{analysis.nudge}”</Text>
              </View>
            ) : null}

            <Text className="mt-3 text-[10px] text-slate-600">
              {analysis.source === 'gemini' ? 'Gemini' : 'Reglas locales'} · {timeLabel(analysis.createdAt)}
            </Text>
          </>
        ) : (
          <EmptyHint>
            Pulsa “Analizar” después de marcar tus tareas. El coach mira qué hiciste, qué evitas y dónde lo haces.
          </EmptyHint>
        )}
      </Card>

      {hasQuestions ? (
        <Card className="mb-4">
          <SectionTitle icon="chatbubbles" hint="Tus respuestas hacen el análisis más preciso">
            El coach quiere saber por qué
          </SectionTitle>
          <View className="gap-3">
            {derived.map((q) => (
              <QuestionCard key={q.key} text={q.text} onSubmit={(a) => setEntryWhy(q.taskId, a, q.dateKey)} />
            ))}
            {openQa.map((q) => (
              <QuestionCard key={q.id} text={q.question} onSubmit={(a) => answerQa(q.id, a)} />
            ))}
          </View>
        </Card>
      ) : null}

      {analysis && analysis.adjustments.length > 0 ? (
        <Card>
          <SectionTitle icon="options" hint="Cambios pequeños a tu rutina. Tú decides.">
            Ajustes sugeridos
          </SectionTitle>
          <View className="gap-3">
            {analysis.adjustments.map((a) => (
              <AdjustmentCard
                key={a.id}
                adjustment={a}
                description={describeAdjustment(a, tasks)}
                onApply={() => applyAdjustment(a)}
                onDismiss={() => resolveAdjustment(a.id, 'dismissed')}
              />
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

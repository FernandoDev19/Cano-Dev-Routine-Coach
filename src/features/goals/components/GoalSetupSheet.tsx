import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/primitives';
import type { GoalKind, GoalReviewResult } from '../types';
import { ConsentBody } from './ConsentBody';

type Stage = 'write' | 'consent' | 'reviewing' | 'result';

const TONES: Record<GoalReviewResult['verdict'], { box: string; text: string }> = {
  ok: { box: 'border-emerald-500/30 bg-emerald-500/10', text: 'text-emerald-200' },
  reduced: { box: 'border-cyan-500/30 bg-cyan-500/10', text: 'text-cyan-200' },
  unclear: { box: 'border-amber-500/30 bg-amber-500/10', text: 'text-amber-200' },
};

const COPY: Record<GoalKind, { title: string; hint: string; placeholder: string }> = {
  month: {
    title: 'Tu meta del mes',
    hint: 'Una sola cosa grande y medible. El mes propone; la semana la filtra y el día la ejecuta.',
    placeholder: 'Ej: conseguir trabajo remoto como desarrollador',
  },
  week: {
    title: 'Tu meta de la semana',
    hint: 'Un paso que quepa en 5 días hábiles. Sábado y domingo son sagrados: no cuentan.',
    placeholder: 'Ej: enviar 5 hojas de vida',
  },
};

type Props = {
  /** `null` = oculta. */
  kind: GoalKind | null;
  /** Meta ya guardada, para editarla. */
  initial?: string;
  askConsent: boolean;
  onConsent: (granted: boolean) => void;
  /** Revisa la meta (viabilidad, medible; la semana se reduce si es grande). No lanza. Lo implementa la capa de app. */
  onReview: (kind: GoalKind, text: string) => Promise<GoalReviewResult>;
  onSave: (kind: GoalKind, text: string) => void;
  onClose: () => void;
};

/** Hoja para definir la meta del mes o de la semana: escribir → revisar → guardar. */
export function GoalSetupSheet(props: Props) {
  // `key` reinicia el estado interno al cambiar de mes a semana.
  return props.kind ? <Inner key={props.kind} {...props} kind={props.kind} /> : null;
}

function Inner({ kind, initial, askConsent, onConsent, onReview, onSave, onClose }: Props & { kind: GoalKind }) {
  const copy = COPY[kind];
  const [stage, setStage] = useState<Stage>('write');
  const [draft, setDraft] = useState(initial ?? '');
  const [result, setResult] = useState<GoalReviewResult | null>(null);
  const [final, setFinal] = useState('');
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const review = async () => {
    const text = draft.trim();
    if (!text) return;
    setStage('reviewing');
    const r = await onReview(kind, text);
    if (!alive.current) return;
    setResult(r);
    setFinal(r.text);
    setStage('result');
  };

  const start = () => {
    if (!draft.trim()) return;
    if (askConsent) setStage('consent');
    else review();
  };

  return (
    <Sheet visible title={copy.title} onClose={onClose}>
      {stage === 'write' ? (
        <View>
          <Text className="mb-3 text-xs leading-5 text-slate-400">{copy.hint}</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={copy.placeholder}
            placeholderTextColor="#64748b"
            multiline
            maxLength={300}
            className="mb-4 min-h-[72px] rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
            textAlignVertical="top"
          />
          <Button label="Revisar" icon="sparkles" disabled={!draft.trim()} onPress={start} />
          <View className="mt-3">
            <Button label="Después" variant="ghost" onPress={onClose} />
          </View>
        </View>
      ) : null}

      {stage === 'consent' ? (
        <ConsentBody
          onChoose={(granted) => {
            onConsent(granted);
            review();
          }}
          onLater={review}
        />
      ) : null}

      {stage === 'reviewing' ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#34d399" />
          <Text className="mt-3 text-xs text-slate-400">Revisando tu meta…</Text>
        </View>
      ) : null}

      {stage === 'result' && result ? (
        <View>
          <View className={`mb-3 rounded-xl border p-3 ${TONES[result.verdict].box}`}>
            <Text className={`text-sm leading-5 ${TONES[result.verdict].text}`}>{result.note}</Text>
          </View>
          {result.fallbackNote ? <Text className="mb-3 text-[11px] text-amber-300">{result.fallbackNote}</Text> : null}

          <Text className="mb-1 text-xs font-medium text-slate-300">
            {result.verdict === 'reduced' ? 'Propuesta (puedes editarla)' : 'Tu meta'}
          </Text>
          <TextInput
            value={final}
            onChangeText={setFinal}
            multiline
            maxLength={300}
            className="mb-4 min-h-[72px] rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
            textAlignVertical="top"
          />

          <View className="gap-3">
            <Button
              label="Guardar"
              icon="checkmark"
              disabled={!final.trim()}
              onPress={() => onSave(kind, final.trim())}
            />
            {result.verdict === 'reduced' && draft.trim() !== final.trim() ? (
              <Button label="Usar la mía" variant="ghost" onPress={() => onSave(kind, draft.trim())} />
            ) : null}
            <Button label="Volver" variant="ghost" onPress={() => setStage('write')} />
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}

import { useEffect, useState } from 'react';
import { Alert, Linking, Switch, Text, TextInput, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { Button, Card, SectionTitle } from '@/shared/ui/primitives';
import { TimeStepper } from '@/shared/ui/TimeStepper';
import { hasPermission, requestPermission, useNotificationPrefs } from '@/features/notifications';
import { DEFAULT_MODEL, useSettingsStore } from '../store';

type Props = {
  /** Lo inyecta la capa de app: borra los datos de todas las features. */
  onResetAll: () => void;
};

export function SettingsScreen({ onResetAll }: Props) {
  const { apiKey, model, saveApiKey, clearApiKey, setModel } = useSettingsStore();
  const prefs = useNotificationPrefs();

  const [keyDraft, setKeyDraft] = useState('');
  const [modelDraft, setModelDraft] = useState(model);
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    hasPermission().then(setGranted);
  }, [prefs.enabled]);

  const toggleMaster = async (next: boolean) => {
    if (!next) {
      prefs.set({ enabled: false });
      return;
    }
    const ok = await requestPermission();
    setGranted(ok);
    if (ok) {
      prefs.set({ enabled: true });
    } else {
      Alert.alert(
        'Notificaciones desactivadas',
        'Activa los permisos de notificaciones para esta app en los ajustes del sistema.',
        [
          { text: 'Ahora no', style: 'cancel' },
          { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  const confirmReset = () =>
    Alert.alert('¿Borrar todos los datos?', 'Se eliminan tareas, historial, check-ins y análisis del coach.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: onResetAll },
    ]);

  return (
    <Screen title="Ajustes">
      <Card className="mb-4">
        <SectionTitle icon="sparkles" hint="Sin API key el coach usa un motor de reglas local, sin internet.">
          Coach con Gemini
        </SectionTitle>

        <Text className="mb-1 text-xs font-medium text-slate-300">
          API key {apiKey ? '· guardada de forma segura ✓' : ''}
        </Text>
        <TextInput
          value={keyDraft}
          onChangeText={setKeyDraft}
          placeholder={apiKey ? '•••••••••••• (escribe para reemplazar)' : 'AIzaSy…'}
          placeholderTextColor="#64748b"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          className="mb-3 rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
        />

        <Text className="mb-1 text-xs font-medium text-slate-300">Modelo</Text>
        <TextInput
          value={modelDraft}
          onChangeText={setModelDraft}
          onEndEditing={() => setModel(modelDraft)}
          placeholder={DEFAULT_MODEL}
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
          className="mb-4 rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Guardar"
              icon="save"
              disabled={!keyDraft.trim() && modelDraft.trim() === model}
              onPress={async () => {
                setModel(modelDraft);
                if (keyDraft.trim()) await saveApiKey(keyDraft);
                setKeyDraft('');
              }}
            />
          </View>
          {apiKey ? (
            <View className="flex-1">
              <Button label="Borrar key" variant="danger" onPress={() => clearApiKey()} />
            </View>
          ) : null}
        </View>
      </Card>

      <Card className="mb-4">
        <SectionTitle icon="notifications" hint="Recordatorios locales: funcionan sin internet.">
          Notificaciones
        </SectionTitle>

        <Row label="Activar notificaciones">
          <Switch value={prefs.enabled} onValueChange={toggleMaster} trackColor={{ true: '#16a34a' }} />
        </Row>
        {granted === false && prefs.enabled ? (
          <Text className="mb-2 text-[11px] text-amber-400">
            El sistema tiene los permisos bloqueados; no llegarán avisos hasta que los actives.
          </Text>
        ) : null}

        {prefs.enabled ? (
          <>
            <Row label="Recordatorio de cada tarea">
              <Switch
                value={prefs.taskReminders}
                onValueChange={(v) => prefs.set({ taskReminders: v })}
                trackColor={{ true: '#16a34a' }}
              />
            </Row>

            <Row label="Empujón de la mañana">
              <Switch
                value={prefs.morningNudge}
                onValueChange={(v) => prefs.set({ morningNudge: v })}
                trackColor={{ true: '#16a34a' }}
              />
            </Row>
            {prefs.morningNudge ? (
              <View className="mb-3 items-end">
                <TimeStepper value={prefs.morningTime} onChange={(v) => prefs.set({ morningTime: v })} />
              </View>
            ) : null}

            <Row label="Check-in de la noche">
              <Switch
                value={prefs.eveningCheckin}
                onValueChange={(v) => prefs.set({ eveningCheckin: v })}
                trackColor={{ true: '#16a34a' }}
              />
            </Row>
            {prefs.eveningCheckin ? (
              <View className="items-end">
                <TimeStepper value={prefs.eveningTime} onChange={(v) => prefs.set({ eveningTime: v })} />
              </View>
            ) : null}
          </>
        ) : null}
      </Card>

      <Card>
        <SectionTitle icon="trash" hint="Todo se guarda solo en este dispositivo.">
          Datos
        </SectionTitle>
        <Button label="Borrar todos los datos" variant="danger" icon="trash-outline" onPress={confirmReset} />
      </Card>
    </Screen>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="flex-1 pr-3 text-sm text-slate-200">{label}</Text>
      {children}
    </View>
  );
}

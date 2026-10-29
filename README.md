# DevRoutine Coach

App móvil (Expo + React Native + NativeWind/Tailwind) con un coach de IA que analiza tu mini-rutina,
te pregunta **por qué** evitas ciertas tareas, compara lo que haces **en casa vs. en la calle**,
propone cambios concretos a tu rutina y te recuerda con notificaciones.

## Arrancar

```bash
npm install
npx expo start          # escanea el QR con Expo Go, o pulsa a / i
```

Chequeo de tipos: `npm run typecheck`.

> Las notificaciones **locales** funcionan en Expo Go. Para notificaciones push remotas
> (enviadas desde un servidor) necesitas un *development build* (`npx expo run:android` / `run:ios`).

## Qué hace

| Pestaña | Qué hay |
|---|---|
| **Hoy** | Mini-rutina: marca hecha / omitida, y **dónde** la hiciste (casa/calle). Momentum, racha y ratio calle. |
| **Coach** | Análisis (Gemini o motor local), preguntas del “¿por qué?”, y **ajustes** que puedes aplicar con un toque. |
| **Progreso** | Consistencia semanal, casa vs. calle, tareas que evitas, motivos, energía. |
| **Ajustes** | API key de Gemini (SecureStore), modelo, notificaciones y horas, borrar datos. |
| **Check-in** (modal) | Energía 1–5 + obstáculos del día; opcionalmente dispara el análisis. |

### Cómo responde a tu idea original

- **Analiza lo que haces y lo que evitas** → `insights/lib/stats.ts` calcula tasa de omisión por tarea, motivos, energía y rachas.
- **Pregunta por qué** → al omitir (motivo + detalle) y, después, el Coach genera preguntas desde tus datos
  (`coach/lib/questions.ts`): tareas omitidas sin explicar y tareas hechas en un lugar distinto al planeado.
  Gemini además hace 1–2 preguntas abiertas; tus respuestas vuelven al siguiente análisis.
- **Casa o no, y por qué** → cada entrada guarda el lugar real; si difiere del planeado, el coach pregunta.
- **Va cambiando tu rutina** → el análisis devuelve *ajustes estructurados* (achicar tarea, mover a la calle/casa,
  cambiar hora, añadir reto, quitar). Tú los aplicas o descartas; nada cambia solo.
- **Notificaciones** → recordatorio por tarea a su hora, empujón de la mañana (usa la frase del último análisis)
  y check-in de la noche. Se reprograman solas al cambiar tareas, horas o el análisis.

## Arquitectura (feature-based)

```
src/
  app/                  # Rutas de Expo Router: finas, solo componen features
  core/                 # Composición entre features (hidratación, sync de notificaciones, reset)
  shared/               # UI base, hooks y utilidades sin lógica de negocio
  features/
    routine/            # tareas, entradas diarias, racha, pantalla Hoy
    checkin/            # energía y obstáculos del día
    insights/           # estadísticas y pantalla Progreso
    coach/              # análisis (Gemini + reglas), preguntas, ajustes
    notifications/      # preferencias y programación de avisos locales
    settings/           # API key, modelo, pantalla Ajustes
```

Cada feature expone su API pública en `index.ts` y tiene `components/`, `screens/`, `lib/` (lógica pura),
`services/` (E/S) y su `store.ts` (zustand + AsyncStorage).

Dependencias entre features (sin ciclos):
`routine ← checkin ← insights ← coach`, `notifications → routine (tipos)`, `settings → notifications`,
`coach → settings`. Lo que une features que no deben conocerse (p. ej. Check-in → Coach) se hace en `app/` o `core/`
mediante props/callbacks.

## Gemini

- Sin API key: motor de reglas local (`coach/lib/localCoach.ts`), sin internet.
- Con API key: `coach/services/gemini.ts` pide JSON; la salida se **valida** (`coach/lib/sanitize.ts`):
  ids de tarea inexistentes, horas inválidas o acciones desconocidas se descartan. Si Gemini falla, se usa el motor local.
- El modelo por defecto es `gemini-3-flash-preview` (el del prototipo). Es editable en Ajustes por si cambia el nombre.
- La clave se guarda en `expo-secure-store` (Keychain/Keystore), nunca en AsyncStorage.
  Es apropiado para uso personal; si vas a distribuir la app, mueve la llamada a un backend propio para no
  exponer una clave en el dispositivo.
- Los datos de tu rutina (tareas, motivos, notas) se envían a Gemini cuando pulsas **Analizar** con una key configurada.

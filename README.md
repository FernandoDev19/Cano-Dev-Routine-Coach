# DevRoutine Coach

App móvil (Expo + React Native + NativeWind/Tailwind) para ejecutar sin fricción un sistema de metas
jerárquicas: **el mes propone, la semana filtra y el día ejecuta**. Un analista de IA actúa como "peaje diario
estricto": convierte tu borrador del día en un *Mínimo Ridículo* (menos de 15 minutos) y, una vez pagado,
el resto del día es tiempo libre sin culpa. Además: coach, diario con IA y una mini-rutina de apoyo.

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
| **Hoy** | **El peaje del día** (lun–vie): escribes un borrador informal y la IA lo convierte en una tarea concreta de <15 min (o en el *mínimo biológico* de 1–2 min si estás enfermo o desmotivado). Al pagarlo: "tiempo muerto libre de culpa". Sábado y domingo: descanso sagrado, sin peaje. No muestra la meta del mes ni de la semana. |
| **Diario** | Entrada del día escrita por la IA (o a mano) a partir de lo que hiciste. |
| **Rutina** | Mini-rutina de apoyo (secundaria): marca hecha / omitida y **dónde** la hiciste (casa/calle). Momentum, racha y ratio calle. |
| **Coach** | Análisis (Gemini o motor local), preguntas del “¿por qué?”, y **ajustes** que puedes aplicar con un toque. |
| **Progreso** | Consistencia semanal, casa vs. calle, tareas que evitas, motivos, energía. |
| **Ajustes** | Metas del mes y de la semana (ver y editar), API key de Gemini (SecureStore), modelo, permiso para enviar textos a Gemini, notificaciones y horas, borrar datos. |
| **Check-in** (modal) | Energía 1–5 + obstáculos del día; opcionalmente dispara el análisis. |

### Metas: el mes propone, la semana filtra, el día ejecuta

- **Mes**: una meta macro, validada por viabilidad (medible, una sola cosa). La hoja se abre sola una vez por mes.
- **Semana**: tiene que caber en **5 días hábiles**; si es grande, se reduce de forma drástica. Se abre sola una vez
  por semana (el lunes, o el primer día hábil en que entres). Se compara con la meta del mes.
- **Día**: el peaje. Se compara **de forma invisible** con la meta de la semana.
- Si no defines una meta, un aviso discreto en Hoy te lo recuerda, pero nunca bloquea el peaje.
- La **racha del peaje** cuenta días hábiles seguidos con el peaje pagado; los fines de semana no la rompen.

### Cómo responde a tu idea original

- **Analiza lo que haces y lo que evitas** → `insights/lib/stats.ts` calcula tasa de omisión por tarea, motivos, energía y rachas.
- **Pregunta por qué** → al omitir (motivo + detalle) y, después, el Coach genera preguntas desde tus datos
  (`coach/lib/questions.ts`): tareas omitidas sin explicar y tareas hechas en un lugar distinto al planeado.
  Gemini además hace 1–2 preguntas abiertas; tus respuestas vuelven al siguiente análisis.
- **Casa o no, y por qué** → cada entrada guarda el lugar real; si difiere del planeado, el coach pregunta.
- **Va cambiando tu rutina** → el análisis devuelve *ajustes estructurados* (achicar tarea, mover a la calle/casa,
  cambiar hora, añadir reto, quitar). Tú los aplicas o descartas; nada cambia solo.
- **Notificaciones** → recordatorio por tarea a su hora (abre la pestaña Rutina), aviso de la mañana **solo de lunes
  a viernes** (usa la frase del último análisis) y check-in de la noche. Se reprograman solas al cambiar tareas, horas o el análisis.

## Arquitectura (feature-based)

```
src/
  app/                  # Rutas de Expo Router: finas, solo componen features
  core/                 # Composición entre features (hidratación, sync de notificaciones, reset)
  shared/               # UI base, hooks y utilidades sin lógica de negocio
  features/
    goals/              # metas mes/semana, peaje diario, racha del peaje, pantalla de metas
    journal/            # diario con IA y objetivo del día (espejo del peaje)
    routine/            # tareas, entradas diarias, racha, pantalla Rutina
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
`coach → settings`, `goals → settings, coach`, `journal → settings, coach`. Lo que une features que no deben conocerse (p. ej. Check-in → Coach) se hace en `app/` o `core/`
mediante props/callbacks.

## Gemini

- Sin API key: motor de reglas local (`coach/lib/localCoach.ts`), sin internet.
- Con API key: `coach/services/gemini.ts` pide JSON; la salida se **valida** (`coach/lib/sanitize.ts`):
  ids de tarea inexistentes, horas inválidas o acciones desconocidas se descartan. Si Gemini falla, se usa el motor local.
- El modelo por defecto es `gemini-3-flash-preview` (el del prototipo). Es editable en Ajustes por si cambia el nombre.
- La clave se guarda en `expo-secure-store` (Keychain/Keystore), nunca en AsyncStorage.
  Es apropiado para uso personal; si vas a distribuir la app, mueve la llamada a un backend propio para no
  exponer una clave en el dispositivo.
- **Nada sale del teléfono sin tu permiso explícito.** La primera vez que una acción de IA pueda enviar texto
  (peaje, revisar metas, Analizar, escribir el diario) la app pregunta; puedes cambiarlo en Ajustes. Sin permiso,
  todo se resuelve con los motores locales. En el peaje, un borrador que declara enfermedad o desmotivación
  **nunca** se envía, aunque hayas dado permiso.
- Con permiso, se envían a Gemini tus textos (borradores, metas, notas) y tu actividad (tareas, motivos, check-outs).

# Guía para replicar el Wordle

Referencia completa para recrear este Wordle en cualquier otro proyecto estático (sin servidor).

---

## Estructura de archivos

```
wordle/
├── index.html          ← estructura y modales
├── style.css           ← estilos y animaciones
├── script.js           ← toda la lógica del juego
├── words.js            ← listas de palabras solución
├── dictionary-es.js    ← diccionario amplio español (validación de intentos)
├── dictionary-en.js    ← diccionario amplio inglés (validación de intentos)
└── phrases.js          ← frases para el modo "Frase del día"
```

---

## Modos de juego

| Modo | Descripción |
|------|-------------|
| **Palabra · Del día** | Una palabra fija por día (determinista según la fecha) |
| **Palabra · Libre** | Palabra aleatoria, se puede jugar infinitas veces |
| **Frase del día** | El jugador adivina letras para descubrir una frase completa |
| **⚔️ 1v1 Duelo** | Dos jugadores online, misma palabra, gana quien adivine primero |

---

## 1. HTML (`index.html`)

### Dependencias externas
```html
<!-- PeerJS solo para el modo 1v1. Si no lo necesitas, omítelo -->
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
```

### Estructura principal
```html
<body class="theme-wordle">
  <div class="app">

    <!-- Encabezado -->
    <header>
      <a class="back-link" href="../index.html">←</a>
      <h1 id="game-title">Wordle del día</h1>
      <button class="icon-btn" id="help-button">?</button>
      <button class="icon-btn" id="stats-button">📊</button>
    </header>

    <!-- Controles: tipo de juego, categoría, idioma, longitud, modo -->
    <div class="controls">
      <div class="seg game-seg" role="group">
        <button type="button" data-game="word">Palabra</button>
        <button type="button" data-game="phrase">Frase</button>
      </div>
      <div class="seg category-seg" role="group">
        <button type="button" data-category="general">General</button>
        <button type="button" data-category="romantic">💖 Romántico</button>
      </div>
      <div class="seg word-only" role="group">
        <button type="button" data-lang="es">Español</button>
        <button type="button" data-lang="en">English</button>
      </div>
      <select id="len-select" class="word-only">
        <option value="4">4 letras</option>
        <option value="5" selected>5 letras</option>
        <option value="6">6 letras</option>
        <option value="7">7 letras</option>
        <option value="8">8 letras</option>
      </select>
      <div class="seg word-only" role="group">
        <button type="button" data-mode="daily">Del día</button>
        <button type="button" data-mode="free">Libre</button>
        <button type="button" data-mode="duel">⚔️ 1v1</button>  <!-- opcional -->
      </div>
    </div>

    <!-- Insignia "Completada ✔" para modo diario -->
    <div class="badge" id="daily-badge" aria-live="polite"></div>

    <!-- Barra de estado del oponente (solo modo 1v1, oculta por defecto) -->
    <div id="opponent-bar" hidden aria-live="polite">
      <span>⚔️ Oponente:</span> <span id="opponent-status">esperando...</span>
    </div>

    <!-- Tablero modo palabra -->
    <div class="board-wrap" id="word-game">
      <div id="board" aria-label="Tablero de juego"></div>
    </div>

    <!-- Tablero modo frase -->
    <div class="phrase-game" id="phrase-game" hidden>
      <div class="phrase-puzzle" id="phrase-puzzle"></div>
      <div class="phrase-attempt-count" id="phrase-attempt-count"></div>
      <div class="phrase-attempts" id="phrase-attempts"></div>
    </div>

    <!-- Teclado virtual -->
    <div id="keyboard" aria-label="Teclado"></div>
  </div>

  <!-- Toast de mensajes -->
  <div id="toast" role="status" aria-live="polite"></div>

  <!-- Modal de selección de categoría (se muestra al abrir) -->
  <div id="category-modal" class="category-modal open" role="dialog" aria-modal="true">
    <div class="category-card">
      <span class="category-heart">💗</span>
      <h2 id="category-title">¿Qué quieres jugar?</h2>
      <p>Elige el modo y la categoría</p>
      <div class="category-options">
        <button type="button" data-game-choice="word" data-category-choice="romantic">
          <strong>💖 Palabra romántica</strong>
          <span>Wordle con palabras de amor</span>
        </button>
        <button type="button" data-game-choice="word" data-category-choice="general">
          <strong>🌎 Palabra general</strong>
          <span>Wordle como el juego original</span>
        </button>
        <button type="button" data-game-choice="phrase" data-category-choice="romantic">
          <strong>💌 Frase romántica</strong>
          <span>Descubre una frase de amor</span>
        </button>
        <button type="button" data-game-choice="phrase" data-category-choice="general">
          <strong>🧩 Frase general</strong>
          <span>Descubre la frase del día</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal genérico (estadísticas, ayuda, duelo, resultados) -->
  <div id="modal" role="dialog" aria-modal="true">
    <div class="modal-card">
      <button class="icon-btn" id="modal-close">✕</button>
      <div id="modal-content"></div>
    </div>
  </div>

  <!-- Scripts de datos, luego el juego -->
  <script src="words.js"></script>
  <script src="dictionary-es.js"></script>
  <script src="dictionary-en.js"></script>
  <script src="phrases.js"></script>
  <script src="script.js"></script>
</body>
```

---

## 2. Archivos de datos

### `words.js` — palabras solución
Expone `window.WORDLE_WORDS` con listas separadas por idioma. El juego filtra por longitud en tiempo de ejecución, así que todas las longitudes van en la misma lista.

```js
window.WORDLE_WORDS = {
  es: [
    // 4 letras
    "AMOR", "BESO", "CASA", "GATO", "LUNA",
    // 5 letras
    "ARBOL", "AVION", "BAILE", "BESOS", "BRISA",
    // 6 letras
    "ABRAZO", "AMORES", "BANANA",
    // 7 letras
    "AMISTAD", "BAILABA", "BALCONY",
    // 8 letras
    "AMORCITO", "AVENTURA",
    // Palabras románticas (separadas conceptualmente, pero en la misma lista)
    "QUERIDA", "NOVEDAD",
  ],
  en: [
    "LOVE", "KISS", "ROSE",
    "HEART", "ANGEL", "DREAM",
    "BEAUTY", "FLOWER",
  ]
};
```

> **Nota:** la categoría "romántico" usa esta lista; la categoría "general" usa el diccionario de frecuencias de `dictionary-es.js`.

### `dictionary-es.js` y `dictionary-en.js` — validación de intentos
Exponen objetos con dos listas: `solutions` (palabras que pueden ser respuesta en categoría general) y `accepted` (todas las palabras válidas para validar intentos del jugador).

```js
// Estructura esperada
window.WORDLE_GENERAL_ES = {
  solutions: ["ARBOL", "BARRO", "CAMPO", ...],  // ~2000 palabras comunes
  accepted:  ["AABBA", "ABADA", "ABAJO", ...]   // ~40000 palabras válidas
};
```

Puedes obtener listas de fuentes públicas:
- Español: [xavier-hernandez/spanish-wordlist](https://github.com/xavier-hernandez/spanish-wordlist) (GPL v3)
- Inglés: [dwyl/english-words](https://github.com/dwyl/english-words) (Unlicense)

### `phrases.js` — frases del día
```js
window.WORDLE_PHRASES = {
  romantic: [
    "ERES MI LUGAR FAVORITO",
    "CONTIGO TODO ES BONITO",
    // ...más frases (sin tildes, mayúsculas)
  ],
  general: [
    "LA VIDA ES UN VIAJE LARGO",
    "EL TIEMPO LO CURA TODO",
    // ...
  ]
};
```

Las frases deben ir en mayúsculas y sin tildes. Los espacios se conservan.

---

## 3. Lógica principal (`script.js`)

Todo el código va dentro de un IIFE para no contaminar el scope global:

```js
(() => {
  "use strict";
  // ... todo el código aquí
})();
```

### Constantes clave
```js
const MAX_GUESSES = 6;        // intentos en modo palabra
const PHRASE_MAX_GUESSES = 5; // intentos en modo frase
const PHRASE_WORD_LEN = 5;    // longitud de palabras para adivinar la frase
const MIN_LEN = 4;            // mínimo de letras configurables
const MAX_LEN = 8;            // máximo de letras configurables
const EPOCH = new Date(2026, 0, 1); // fecha de referencia para la palabra del día
```

### Estado del juego (`state`)
```js
const state = {
  lang: "es",        // "es" | "en"
  game: "word",      // "word" | "phrase"
  category: "general", // "general" | "romantic"
  len: 5,            // longitud de la palabra (4–8)
  mode: "daily",     // "daily" | "free" | "duel"
  target: "",        // palabra/frase objetivo (siempre en mayúsculas sin tilde)
  guesses: [],       // palabras ya evaluadas
  current: "",       // palabra en construcción (fila activa)
  finished: false,
  won: false,
  revealing: false,  // true durante la animación de volteo
  countdownTimer: null
};
```

### Algoritmo de evaluación de un intento
```js
function evaluateGuess(guess, target) {
  const result = new Array(guess.length).fill("absent");
  const remaining = {};

  // Primero: marcar correctas
  for (let i = 0; i < target.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
    } else {
      remaining[target[i]] = (remaining[target[i]] || 0) + 1;
    }
  }
  // Luego: marcar presentes (sin contar las ya correctas)
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "correct") continue;
    if (remaining[guess[i]] > 0) {
      result[i] = "present";
      remaining[guess[i]]--;
    }
  }
  return result; // array de "correct" | "present" | "absent"
}
```

### Palabra del día (determinista)
La palabra del día se elige con una semilla derivada de la fecha y los parámetros del juego, usando el hash `mulberry32`:

```js
const EPOCH = new Date(2026, 0, 1);

function dayNumber() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - EPOCH) / 86400000);
}

function hashSeed(seed) {
  let a = seed >>> 0;
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let z = Math.imul(a ^ (a >>> 15), 1 | a);
  z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
  return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
}

function dailyWord(lang, len) {
  const list = wordList(lang, len); // lista filtrada por longitud
  const langOffset   = lang === "es" ? 0 : 7919;
  const catOffset    = state.category === "romantic" ? 15401 : 0;
  const seed = dayNumber() * 131 + len * 977 + langOffset + catOffset;
  return list[Math.floor(hashSeed(seed) * list.length)];
}
```

> Cada combinación de (fecha + idioma + categoría + longitud) produce una palabra distinta y reproducible. Cambia `EPOCH` para reiniciar el ciclo de palabras.

### Normalización de palabras
Elimina tildes y convierte a mayúsculas (preservando la Ñ):
```js
function normalizeWord(raw) {
  return String(raw)
    .trim()
    .toUpperCase()
    .replaceAll("Ñ", " ")      // proteger la Ñ
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quitar tildes
    .replaceAll(" ", "Ñ");      // restaurar la Ñ
}
```

### Teclado virtual
Se construye dinámicamente desde arrays de filas:
```js
const KEY_ROWS = {
  es: ["QWERTYUIOP", "ASDFGHJKLÑ", "↵ZXCVBNM⌫"],
  en: ["QWERTYUIOP", "ASDFGHJKL",  "↵ZXCVBNM⌫"]
};
```
- `↵` → tecla ENTER (clase `key-wide`, `dataset.key = "Enter"`)
- `⌫` → tecla Borrar (clase `key-wide`, `dataset.key = "Backspace"`)

### Persistencia (`localStorage`)
| Clave | Contenido |
|-------|-----------|
| `wordleConfig` | `{ lang, len, category, game }` |
| `wordleDaily` | Progreso por combinación `game:category:lang:len` |
| `wordleStats` | Estadísticas (jugadas, victorias, rachas, distribución) |

---

## 4. CSS — Variables y layout

### Variables de color (modo claro)
```css
:root {
  --bg:         #fff0f5;
  --bg-card:    #ffffff;
  --text:       #4a2c3b;
  --text-soft:  #9b7185;
  --pink:       #ff5c8a;
  --pink-dark:  #e04674;
  --correct:    #67b46b;  /* verde  — letra en posición correcta */
  --present:    #e6b53c;  /* amarillo — letra presente, posición incorrecta */
  --absent:     #a5919b;  /* gris   — letra ausente */
  --tile-border:#e8c9d6;
  --key-bg:     #f6dce6;
  --board-gap:  6px;
  --tile-size:  52px;
}
```

Para modo oscuro se pueden sobreescribir estas variables en `@media (prefers-color-scheme: dark)` o con una clase `.dark` en el `body`.

### Layout general
```
body
└── .app  (flex column, 100dvh, max-width 560px, centrado)
    ├── header
    ├── .controls
    ├── .badge
    ├── #opponent-bar  (solo duelo 1v1)
    ├── .board-wrap > #board   (modo palabra)
    ├── .phrase-game           (modo frase)
    └── #keyboard
```

### Animaciones CSS clave
```css
/* Pop al escribir una letra */
@keyframes pop {
  50% { transform: scale(1.12); }
}

/* Volteo al evaluar un intento */
@keyframes flip {
  0%   { transform: rotateX(0); }
  50%  { transform: rotateX(90deg); }
  100% { transform: rotateX(0); }
}

/* Rebote al ganar */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  40%      { transform: translateY(-14px); }
  70%      { transform: translateY(4px); }
}

/* Sacudida al intentar una palabra inválida */
@keyframes shake {
  10%, 50%, 90% { transform: translateX(-5px); }
  30%, 70%      { transform: translateX(5px); }
}
```

### Clases de estado del tablero
| Clase | Significado |
|-------|-------------|
| `.tile.filled` | Tile con letra escrita (borde rosa) |
| `.tile.flip` | Animación de volteo activa |
| `.tile.correct` | Fondo verde |
| `.tile.present` | Fondo amarillo |
| `.tile.absent` | Fondo gris |
| `.tile.bounce` | Animación de rebote (victoria) |
| `.row.shake` | Sacudida (intento inválido) |

Las mismas clases (`.correct`, `.present`, `.absent`) se aplican a las teclas del teclado.

---

## 5. Modo 1v1 Duelo (PeerJS)

### Cómo funciona
- Usa **WebRTC peer-to-peer** vía [PeerJS](https://peerjs.com/) — sin servidor propio.
- El **host** genera un código de 6 caracteres y espera conexión.
- El **guest** ingresa el código y se conecta.
- El host envía la palabra aleatoria al guest.
- Ambos juegan en paralelo; el progreso se sincroniza en tiempo real.
- Gana quien **adivine primero**, o quien tenga **menos intentos** si ambos adivinan.

### Mensajes intercambiados
```js
// Host → Guest: iniciar partida
{ type: "start", word: "ARBOL", lang: "es", len: 5 }

// Cualquiera → otro: notificación de intento
{ type: "progress", attempts: 3 }

// Cualquiera → otro: partida terminada
{ type: "done", won: true, attempts: 4 }

// Host → Guest: iniciar revancha
{ type: "rematch", word: "CIELO", lang: "es", len: 5 }
```

### Estructura del objeto `duel`
```js
const duel = {
  active: false,
  isHost: false,
  peer: null,       // instancia de Peer (PeerJS)
  conn: null,       // instancia de DataConnection
  opponentAttempts: 0,
  opponentFinished: false,
  opponentWon: false,
  started: false
};
```

### Flujo del host
```js
const peer = new Peer(code, { debug: 0 });
peer.on("connection", conn => {
  setupDuelConnection(conn);
  conn.on("open", () => {
    const word = randomWord(lang, len);
    conn.send({ type: "start", word, lang, len });
    startDuelGame(word, lang, len);
  });
});
```

### Flujo del guest
```js
const peer = new Peer({ debug: 0 });
peer.on("open", () => {
  const conn = peer.connect(hostCode, { reliable: true });
  setupDuelConnection(conn);
  // El juego inicia cuando llega el mensaje { type: "start" }
});
```

---

## 6. Personalización rápida

### Cambiar colores del tema
Sobreescribe las variables CSS en `:root` o en una clase del `body`.

### Cambiar la fecha de referencia (EPOCH)
```js
const EPOCH = new Date(2026, 0, 1); // año, mes (0=enero), día
```
Cambiar esto hace que el ciclo de palabras del día reinicie desde esa fecha.

### Cambiar el número máximo de intentos
```js
const MAX_GUESSES = 6;        // modo palabra
const PHRASE_MAX_GUESSES = 5; // modo frase
```

### Agregar una categoría nueva
1. Añadir un botón `data-category="nueva"` en el HTML.
2. Añadir entradas en `TEXTS` para los textos de esa categoría.
3. Ajustar la función `wordList` para que use la lista correcta.
4. Añadir un offset único en `dailyWord` para que no colisione con otras categorías.

### Quitar el modo Frase
- Eliminar el bloque `#phrase-game` del HTML.
- Eliminar el botón `data-game="phrase"` y el bloque `.game-seg`.
- Eliminar las funciones `submitPhraseGuess`, `paintPhraseGame`, etc. de `script.js`.
- Eliminar `phrases.js` del HTML.

### Quitar el modo 1v1
- Eliminar `<script src="peerjs.min.js">` del HTML.
- Eliminar el botón `data-mode="duel"` del HTML.
- Eliminar el `<div id="opponent-bar">` del HTML.
- Eliminar el bloque `/* ---------- duelo 1v1 ---------- */` de `script.js`.
- En `setMode`, quitar la rama `if (mode === "duel")`.
- En `submitGuess`, revertir el timeout a la versión sin `state.mode === "duel"`.
- En `startGame`, quitar la rama `else if (state.mode === "duel")`.

---

## 7. Checklist para un proyecto nuevo

- [ ] Copiar los 8 archivos listados en "Estructura de archivos"
- [ ] Ajustar la ruta del enlace "← Volver" en el `<header>`
- [ ] Cambiar `EPOCH` si quieres un ciclo de palabras propio
- [ ] Editar `words.js` con tus propias palabras solución
- [ ] Editar `phrases.js` con tus propias frases (si usas ese modo)
- [ ] Obtener diccionarios públicos para `dictionary-es.js` / `dictionary-en.js` (ver `WORDLIST_LICENSE.md`)
- [ ] Ajustar los colores en las variables CSS
- [ ] Cambiar la clase del `body` (`theme-wordle`) si tienes un `dark.css` global con temas
- [ ] Probar en móvil (el layout usa `100dvh` y `safe-area-inset`)
- [ ] Verificar que el modo 1v1 funciona con conexión a internet (PeerJS necesita acceso a su servidor de señalización en `peerjs.com`)

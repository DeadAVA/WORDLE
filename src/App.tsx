import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language, GameMode, GameType, ModalKind } from './types';
import { useGame } from './hooks/useGame';
import { useDuel } from './hooks/useDuel';
import { normalizeWord } from './utils/gameLogic';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';
import { PhraseGame } from './components/PhraseGame';
import { Toast, useToast } from './components/Toast';
import { Modal } from './components/modals/Modal';
import { HelpModal } from './components/modals/HelpModal';
import { StatsModal } from './components/modals/StatsModal';
import { DuelModal } from './components/modals/DuelModal';
import { ResultModal } from './components/modals/ResultModal';

export default function App() {
  const game = useGame();
  const duelHook = useDuel();
  const { messages, showToast } = useToast();
  const [modal, setModal] = useState<ModalKind>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openResult = useCallback(() => setModal('result'), []);

  // Register toast and result handlers once
  useEffect(() => {
    game.setToastHandler((msg: string) => {
      showToast(msg);
      // Shake current row
      setShakeRow(game.state.guesses.length);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = setTimeout(() => setShakeRow(null), 600);
    });
    game.setResultHandler(openResult);
  });

  // Start game on mount
  useEffect(() => {
    game.startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (modal) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === 'Enter') {
        handleSubmit();
        return;
      }
      if (e.key === 'Backspace') {
        game.deleteLetter();
        return;
      }
      const letter = normalizeWord(e.key);
      if (/^[A-ZÑÁÉÍÓÚ]$/.test(letter)) {
        game.typeLetter(letter);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleSubmit = useCallback(() => {
    game.submitGuess({
      onDuelProgress: duelHook.duel.active ? (attempts: number) => {
        duelHook.sendProgress(attempts);
      } : undefined,
    });
  }, [game, duelHook]);

  const handleKey = useCallback((key: string) => {
    if (key === 'Enter') { handleSubmit(); return; }
    if (key === 'Backspace') { game.deleteLetter(); return; }
    game.typeLetter(key);
  }, [game, handleSubmit]);

  const handleStart = useCallback(() => {
    if (game.state.mode === 'duel' || pendingMode === 'duel') {
      setModal('duel');
      return;
    }
    game.startGame({
      lang: game.state.lang,
      len: game.state.len,
      mode: game.state.mode,
      gameType: game.state.gameType,
    });
    setModal(null);
  }, [game, pendingMode]);

  const handleModeChange = useCallback((m: GameMode) => {
    game.setMode(m);
    setPendingMode(m);
    if (m === 'duel') setModal('duel');
  }, [game]);

  const handleDuelCreate = useCallback(async () => {
    try {
      await duelHook.createRoom(
        game.state.lang,
        game.state.len,
        (word, _lang, _len) => {
          game.startGame({ target: word, mode: 'duel', lang: game.state.lang, len: game.state.len, gameType: 'word' });
          setModal(null);
        },
        (attempts) => showToast(`⚔️ ${game.state.lang === 'es' ? `Oponente: ${attempts} intento(s)` : `Opponent: ${attempts} attempt(s)`}`),
        (won, _attempts) => {
          duelHook.sendDone(game.state.won, game.state.guesses.length);
          showToast(won
            ? (game.state.lang === 'es' ? '⚔️ ¡Tu oponente lo adivinó!' : '⚔️ Opponent solved it!')
            : (game.state.lang === 'es' ? '⚔️ Tu oponente no lo adivinó' : '⚔️ Opponent failed'));
        },
        showToast,
      );
    } catch {
      showToast(game.state.lang === 'es' ? 'Error al crear la sala' : 'Error creating room');
    }
  }, [duelHook, game, showToast]);

  const handleDuelJoin = useCallback(async (code: string) => {
    try {
      await duelHook.joinRoom(
        code,
        (word, _lang, _len) => {
          game.startGame({ target: word, mode: 'duel', lang: game.state.lang, len: game.state.len, gameType: 'word' });
          setModal(null);
        },
        (attempts) => showToast(`⚔️ ${game.state.lang === 'es' ? `Oponente: ${attempts} intento(s)` : `Opponent: ${attempts} attempt(s)`}`),
        (won, _attempts) => {
          duelHook.sendDone(game.state.won, game.state.guesses.length);
          showToast(won
            ? (game.state.lang === 'es' ? '⚔️ ¡Tu oponente lo adivinó!' : '⚔️ Opponent solved it!')
            : (game.state.lang === 'es' ? '⚔️ Tu oponente no lo adivinó' : '⚔️ Opponent failed'));
        },
        showToast,
      );
    } catch {
      showToast(game.state.lang === 'es' ? 'Error al unirse a la sala' : 'Error joining room');
    }
  }, [duelHook, game, showToast]);

  const handleRematch = useCallback(() => {
    duelHook.requestRematch(game.state.lang, game.state.len, (word, _lang, _len) => {
      game.startGame({ target: word, mode: 'duel', lang: game.state.lang, len: game.state.len, gameType: 'word' });
      setModal(null);
    });
  }, [duelHook, game]);

  const { state } = game;
  const isPhrase = state.gameType === 'phrase';

  const title = isPhrase
    ? (state.lang === 'es' ? 'Frase del día' : 'Phrase of the day')
    : state.mode === 'daily'
    ? (state.lang === 'es' ? 'Wordle del día' : 'Daily Wordle')
    : state.mode === 'duel'
    ? '⚔️ Wordle 1v1'
    : (state.lang === 'es' ? 'Wordle Libre' : 'Free Wordle');

  const opponentBar = duelHook.duel.active && (
    <div className="opponent-bar" aria-live="polite">
      ⚔️ {state.lang === 'es' ? 'Oponente:' : 'Opponent:'}
      {' '}
      <span>
        {duelHook.duel.opponentFinished
          ? (duelHook.duel.opponentWon
            ? (state.lang === 'es' ? '✓ Adivinó' : '✓ Solved')
            : (state.lang === 'es' ? '✗ Falló' : '✗ Failed'))
          : duelHook.duel.started
          ? (state.lang === 'es' ? `Intento ${duelHook.duel.opponentAttempts}` : `Attempt ${duelHook.duel.opponentAttempts}`)
          : (state.lang === 'es' ? 'esperando…' : 'waiting…')}
      </span>
    </div>
  );

  const dailyBadge = state.mode === 'daily' && state.finished && state.gameType === 'word' && (
    <div className="daily-badge" aria-live="polite">
      {state.won
        ? (state.lang === 'es' ? 'Completada ✔' : 'Completed ✔')
        : (state.lang === 'es' ? 'Jugada hoy ✔' : 'Played today ✔')}
    </div>
  );

  return (
    <div className="app">
      <Header
        title={title}
        onHelp={() => setModal('help')}
        onStats={() => setModal('stats')}
      />

      <Controls
        lang={state.lang}
        len={state.len}
        mode={state.mode}
        gameType={state.gameType}
        onLang={(l: Language) => game.setLang(l)}
        onLen={(n: number) => game.setLen(n)}
        onMode={handleModeChange}
        onGameType={(t: GameType) => game.setGameType(t)}
        onStart={handleStart}
        disabled={state.revealing}
      />

      {dailyBadge}
      {opponentBar}

      {isPhrase ? (
        <PhraseGame
          phrase={state.target}
          revealedLetters={game.revealedLetters}
          guessedWords={state.guesses}
          current={state.current}
          lang={state.lang}
          finished={state.finished}
          won={state.won}
        />
      ) : (
        <Board
          guesses={state.guesses}
          evaluations={state.evaluations}
          current={state.current}
          len={state.len}
          revealing={state.revealing}
          shakeRow={shakeRow}
          won={state.won}
        />
      )}

      <Keyboard
        lang={state.lang}
        letterMap={game.letterMap}
        onKey={handleKey}
        disabled={state.finished || state.revealing}
      />

      <Toast messages={messages} />

      {/* Help modal */}
      <Modal open={modal === 'help'} onClose={() => setModal(null)}>
        <HelpModal lang={state.lang} />
      </Modal>

      {/* Stats modal */}
      <Modal open={modal === 'stats'} onClose={() => setModal(null)}>
        <StatsModal lang={state.lang} len={state.len} gameType={state.gameType} />
      </Modal>

      {/* Duel modal */}
      <Modal open={modal === 'duel'} onClose={() => { setModal(null); setPendingMode(null); }}>
        <DuelModal
          lang={state.lang}
          len={state.len}
          duel={duelHook.duel}
          onCreateRoom={handleDuelCreate}
          onJoinRoom={handleDuelJoin}
          onClose={() => { setModal(null); setPendingMode(null); }}
        />
      </Modal>

      {/* Result modal */}
      <Modal open={modal === 'result'} onClose={() => setModal(null)}>
        <ResultModal
          won={state.won}
          target={state.target}
          attempts={state.guesses.length}
          lang={state.lang}
          mode={state.mode}
          duel={duelHook.duel}
          onNewGame={() => {
            setModal(null);
            game.startGame({ mode: 'free', lang: state.lang, len: state.len, gameType: state.gameType });
          }}
          onRematch={duelHook.duel.isHost ? handleRematch : undefined}
          onStats={() => setModal('stats')}
        />
      </Modal>
    </div>
  );
}
